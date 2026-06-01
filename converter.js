(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EbayConverter = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const DEFAULT_INFO_ROWS = [
    "#INFO;Version=0.0.2;Template= eBay-draft-listings-template_DE;;;;;;;",
    "#INFO Action und Category ID sind erforderliche Felder. 1) Stellen Sie Action auf Draft ein. 2) Die Kategorie-ID für Ihre Angebote finden Sie hier: https://pages.ebay.com/sellerinformation/news/categorychanges.html;;;;;;;;;",
    "#INFO Nachdem Sie Ihren Entwurf erfolgreich im Berichte-Tab Ihres Verkäufer-Cockpit Pro heruntergeladen haben; können Sie die Entwürfe hier zu aktiven Angeboten vervollständigen: https://www.ebay.de/sh/lst/drafts;;;;;;;;;",
    "#INFO;;;;;;;;;;",
  ];

  const DEFAULT_HEADERS = [
    "Action(SiteID=Germany|Country=DE|Currency=EUR|Version=1193|CC=UTF-8)",
    "Custom label (SKU)",
    "Category ID",
    "Title",
    "UPC",
    "Price",
    "Quantity",
    "Item photo URL",
    "Condition ID",
    "Description",
    "Format",
    "Relationship",
    "Relationship details",
  ];

  const DEFAULT_GLOBAL_SPECIFICS = {
    Marke: "Atelier Orlo",
    Produktart: "Poster",
    Material: "200 g/m² Papier",
    Rahmung: "Ungerahmt",
    Herstellungsart: "Kunstdruck",
  };

  const FIELD_ALIASES = {
    action: [/^Action\b/i],
    sku: [/^Custom label/i, /^CustomLabel$/i, /^SKU$/i],
    category: [/^Category ID$/i, /^\*?Category$/i],
    title: [/^\*?Title$/i],
    upc: [/^UPC$/i, /^P:UPC$/i, /^Product:UPC$/i],
    price: [/^Price$/i, /^\*?StartPrice$/i, /^Start Price$/i],
    quantity: [/^\*?Quantity$/i],
    photos: [/^Item photo URL$/i, /^PicURL$/i],
    condition: [/^Condition ID$/i, /^\*?ConditionID$/i],
    description: [/^\*?Description$/i],
    format: [/^\*?Format$/i],
    relationship: [/^Relationship$/i],
    relationshipDetails: [/^RelationshipDetails$/i, /^Relationship details$/i, /^Relationship detail$/i],
  };

  function stripBom(text) {
    return text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  }

  function parseCsvRows(text, delimiter) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const input = stripBom(String(text || ""));

    for (let i = 0; i < input.length; i += 1) {
      const char = input[i];
      const next = input[i + 1];

      if (quoted) {
        if (char === '"' && next === '"') {
          cell += '"';
          i += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          cell += char;
        }
        continue;
      }

      if (char === '"') {
        quoted = true;
      } else if (char === delimiter) {
        row.push(cell);
        cell = "";
      } else if (char === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (char === "\r") {
        if (next === "\n") {
          continue;
        }
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }

  function countDelimiter(line, delimiter) {
    let count = 0;
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];
      if (quoted) {
        if (char === '"' && next === '"') {
          i += 1;
        } else if (char === '"') {
          quoted = false;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === delimiter) {
        count += 1;
      }
    }
    return count;
  }

  function detectDelimiter(text) {
    const lines = String(text || "").split(/\r?\n/).filter(Boolean).slice(0, 12);
    const candidates = [",", ";", "\t"];
    const scores = candidates.map((delimiter) => ({
      delimiter,
      score: lines.reduce((sum, line) => sum + countDelimiter(line, delimiter), 0),
    }));
    scores.sort((a, b) => b.score - a.score);
    return scores[0].score > 0 ? scores[0].delimiter : ",";
  }

  function rowsToObjects(rows, headerIndex) {
    const headers = (rows[headerIndex] || []).map((header) => header.trim());
    const dataRows = rows.slice(headerIndex + 1).filter((row) => row.some((cell) => cell.trim()));
    return {
      headers,
      rows: dataRows.map((row) => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index] == null ? "" : row[index];
        });
        return record;
      }),
    };
  }

  function parseShopify(text) {
    const delimiter = detectDelimiter(text);
    const rows = parseCsvRows(text, delimiter);
    const parsed = rowsToObjects(rows, 0);
    return { ...parsed, delimiter };
  }

  function parseEbayTemplate(text) {
    if (!text) {
      return {
        delimiter: ";",
        infoRows: DEFAULT_INFO_ROWS.slice(),
        headers: DEFAULT_HEADERS.slice(),
      };
    }

    const delimiter = detectDelimiter(text);
    const rows = parseCsvRows(text, delimiter);
    let headerIndex = rows.findIndex((row) => {
      const first = (row[0] || "").trim();
      return first && !first.startsWith("#INFO");
    });

    if (headerIndex < 0) {
      headerIndex = 0;
    }

    const infoRows = rows.slice(0, headerIndex).map((row) => row.join(delimiter));
    const headers = (rows[headerIndex] || []).map((header) => header.trim()).filter(Boolean);

    return {
      delimiter,
      infoRows: infoRows.length ? infoRows : DEFAULT_INFO_ROWS.slice(),
      headers: headers.length ? headers : DEFAULT_HEADERS.slice(),
    };
  }

  function csvEscape(value, delimiter) {
    const stringValue = value == null ? "" : String(value);
    if (
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r") ||
      stringValue.includes(delimiter)
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  function objectsToCsv(headers, rows, delimiter, infoRows) {
    const lines = [];
    (infoRows || []).forEach((line) => lines.push(line));
    lines.push(headers.map((header) => csvEscape(header, delimiter)).join(delimiter));
    rows.forEach((row) => {
      lines.push(headers.map((header) => csvEscape(row[header], delimiter)).join(delimiter));
    });
    return `\ufeff${lines.join("\r\n")}\r\n`;
  }

  function firstValue(records, key) {
    for (const record of records) {
      const value = (record[key] || "").trim();
      if (value) {
        return value;
      }
    }
    return "";
  }

  function unique(values) {
    const seen = new Set();
    const output = [];
    values.forEach((value) => {
      const trimmed = String(value || "").trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        output.push(trimmed);
      }
    });
    return output;
  }

  function normalizeUrl(value) {
    return String(value || "").trim().replace(/\s/g, "%20");
  }

  function slugPart(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .toLowerCase();
  }

  function shortHash(value) {
    let hash = 0;
    const input = String(value || "");
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36).slice(0, 7);
  }

  function makeSku(value, fallback) {
    const raw = String(value || fallback || "sku")
      .trim()
      .replace(/\s+/g, "-");
    if (raw.length <= 50) {
      return raw;
    }
    return `${raw.slice(0, 42).replace(/-+$/g, "")}-${shortHash(raw)}`.slice(0, 50);
  }

  function cleanTitle(value, maxLength) {
    const compact = String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return compact.length > maxLength ? compact.slice(0, maxLength).trim() : compact;
  }

  function stripScripts(html) {
    return String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .trim();
  }

  function formatPrice(raw, config) {
    const multiplier = Number(config.priceMultiplier || 1);
    const add = Number(config.priceAdd || 0);
    const roundTo = Number(config.roundTo || 0);
    const normalized = String(raw || "").replace(",", ".");
    const base = Number.parseFloat(normalized);
    if (!Number.isFinite(base)) {
      return "";
    }
    let price = base * multiplier + add;
    if (roundTo > 0) {
      price = Math.ceil(price / roundTo) * roundTo;
    }
    return price.toFixed(2);
  }

  function parseTags(rawTags) {
    const result = {};
    const plain = [];
    String(rawTags || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((tag) => {
        const index = tag.indexOf(":");
        if (index > 0) {
          const key = tag.slice(0, index).trim();
          const value = tag.slice(index + 1).trim();
          if (key && value) {
            if (!result[key]) {
              result[key] = [];
            }
            result[key].push(value);
          }
        } else if (tag.toLowerCase() !== "orlo") {
          plain.push(tag);
        }
      });

    Object.keys(result).forEach((key) => {
      result[key] = unique(result[key]).join("; ");
    });

    if (plain.length) {
      result.Tags = unique(plain).join("; ");
    }
    return result;
  }

  function groupShopifyProducts(shopifyRows) {
    const groups = new Map();
    shopifyRows.forEach((row, index) => {
      const handle = (row.Handle || "").trim() || `row-${index + 1}`;
      if (!groups.has(handle)) {
        groups.set(handle, []);
      }
      groups.get(handle).push(row);
    });

    return Array.from(groups.entries()).map(([handle, records]) => {
      const option1Name = firstValue(records, "Option1 Name") || "Größe";
      const tags = parseTags(firstValue(records, "Tags"));
      const materialText = firstValue(records, "taxonomy.material_text (product.metafields.taxonomy.material_text)");
      const images = unique(records.map((row) => normalizeUrl(row["Image Src"]))).slice(0, 24);
      const variants = [];
      const seenVariants = new Set();

      records.forEach((row) => {
        const option1Value = (row["Option1 Value"] || "").trim();
        const option2Value = (row["Option2 Value"] || "").trim();
        const option3Value = (row["Option3 Value"] || "").trim();
        const price = (row["Variant Price"] || "").trim();
        const sku = (row["Variant SKU"] || "").trim();

        if (!option1Value && !sku && !price) {
          return;
        }

        const key = [option1Value, option2Value, option3Value, sku, price].join("||");
        if (seenVariants.has(key)) {
          return;
        }
        seenVariants.add(key);

        variants.push({
          sku: sku ? makeSku(sku) : makeSku(`${handle}-${slugPart(option1Value || "default")}`),
          option1Value,
          option2Value,
          option3Value,
          price,
          image: normalizeUrl(row["Variant Image"]),
        });
      });

      if (materialText && !tags.Material) {
        tags.Material = materialText;
      }

      return {
        handle,
        title: firstValue(records, "Title"),
        description: firstValue(records, "Body (HTML)"),
        productCategory: firstValue(records, "Product Category"),
        type: firstValue(records, "Type"),
        vendor: firstValue(records, "Vendor"),
        tags,
        option1Name,
        images,
        variants,
        firstPrice: firstValue(records, "Variant Price"),
      };
    });
  }

  function analyzeShopify(text) {
    const parsed = parseShopify(text);
    const products = groupShopifyProducts(parsed.rows);
    const specificKeys = new Set();
    products.forEach((product) => {
      Object.keys(product.tags).forEach((key) => specificKeys.add(key));
    });

    const totalVariants = products.reduce((sum, product) => sum + Math.max(product.variants.length, 1), 0);
    const totalImages = products.reduce((sum, product) => sum + product.images.length, 0);

    return {
      headers: parsed.headers,
      rowCount: parsed.rows.length,
      productCount: products.length,
      totalVariants,
      totalImages,
      specificKeys: Array.from(specificKeys).sort((a, b) => a.localeCompare(b, "de")),
      products,
    };
  }

  function findHeader(headers, alias) {
    const patterns = FIELD_ALIASES[alias] || [];
    return headers.find((header) => patterns.some((pattern) => pattern.test(header))) || null;
  }

  function ensureHeader(headers, header) {
    if (!headers.includes(header)) {
      headers.push(header);
    }
    return header;
  }

  function mergeSpecificHeaders(headers, keys) {
    keys.forEach((key) => {
      if (key && !headers.includes(key)) {
        headers.push(key);
      }
    });
  }

  function createEmptyRow(headers) {
    const row = {};
    headers.forEach((header) => {
      row[header] = "";
    });
    return row;
  }

  function setIfHeader(row, header, value) {
    if (header) {
      row[header] = value == null ? "" : value;
    }
  }

  function makeSpecifics(product, config) {
    const output = {};
    const selectedTagKeys = config.selectedTagKeys || [];
    const tagKeyMap = config.tagKeyMap || {};
    const globalSpecifics = config.globalSpecifics || {};
    const prefixItemSpecifics = config.prefixItemSpecifics !== false;
    const normalizeKey = (key) => {
      const clean = String(key || "").trim();
      if (!prefixItemSpecifics || !clean || /^C:/i.test(clean)) {
        return clean;
      }
      return `C:${clean}`;
    };

    Object.entries(globalSpecifics).forEach(([key, value]) => {
      if (key && value) {
        output[normalizeKey(key)] = value;
      }
    });

    selectedTagKeys.forEach((key) => {
      const value = product.tags[key];
      const outputKey = normalizeKey(tagKeyMap[key] || key);
      if (value) {
        output[outputKey] = value;
      }
    });

    return output;
  }

  function buildVariationSummary(product, traitName) {
    const values = unique(product.variants.map((variant) => variant.option1Value).filter(Boolean));
    if (!values.length) {
      return "";
    }
    return `${traitName}=${values.join(";")}`;
  }

  function buildDescription(product, config) {
    const description = stripScripts(product.description);
    const suffix = String(config.descriptionSuffix || "").trim();
    if (description && suffix) {
      return `${description}\n\n${suffix}`;
    }
    return description || suffix;
  }

  function convert(shopifyText, options) {
    const config = {
      templateText: "",
      categoryId: "",
      conditionId: "NEW",
      format: "FixedPrice",
      quantity: 10,
      maxImages: 5,
      listingMode: "flat",
      variationTraitName: "Größe",
      upcValue: "",
      priceMultiplier: 1,
      priceAdd: 0,
      roundTo: 0,
      selectedTagKeys: [],
      tagKeyMap: {},
      globalSpecifics: DEFAULT_GLOBAL_SPECIFICS,
      descriptionSuffix: "",
      includeSpecifics: true,
      prefixItemSpecifics: true,
      ...options,
    };

    const analysis = analyzeShopify(shopifyText);
    const template = parseEbayTemplate(config.templateText);
    const headers = template.headers.slice();

    const actionHeader = findHeader(headers, "action") || ensureHeader(headers, DEFAULT_HEADERS[0]);
    const skuHeader = findHeader(headers, "sku") || ensureHeader(headers, "Custom label (SKU)");
    const categoryHeader = findHeader(headers, "category") || ensureHeader(headers, "Category ID");
    const titleHeader = findHeader(headers, "title") || ensureHeader(headers, "Title");
    const upcHeader = findHeader(headers, "upc") || ensureHeader(headers, "UPC");
    const priceHeader = findHeader(headers, "price") || ensureHeader(headers, "Price");
    const quantityHeader = findHeader(headers, "quantity") || ensureHeader(headers, "Quantity");
    const photosHeader = findHeader(headers, "photos") || ensureHeader(headers, "Item photo URL");
    const conditionHeader = findHeader(headers, "condition") || ensureHeader(headers, "Condition ID");
    const descriptionHeader = findHeader(headers, "description") || ensureHeader(headers, "Description");
    const formatHeader = findHeader(headers, "format") || ensureHeader(headers, "Format");
    const relationshipHeader = findHeader(headers, "relationship") || ensureHeader(headers, "Relationship");
    const relationshipDetailsHeader =
      findHeader(headers, "relationshipDetails") || ensureHeader(headers, "Relationship details");

    const addSpecificPrefix = (key) => {
      const clean = String(key || "").trim();
      if (!config.prefixItemSpecifics || !clean || /^C:/i.test(clean)) {
        return clean;
      }
      return `C:${clean}`;
    };
    const globalKeys = Object.keys(config.globalSpecifics || {})
      .filter((key) => config.globalSpecifics[key])
      .map(addSpecificPrefix);
    const mappedTagKeys = (config.selectedTagKeys || []).map((key) => addSpecificPrefix(config.tagKeyMap[key] || key));
    const selectedKeys = config.includeSpecifics ? [...globalKeys, ...mappedTagKeys] : [];
    mergeSpecificHeaders(headers, unique(selectedKeys));

    const rows = [];
    const warnings = [];
    let productsWithVariants = 0;
    let productsWithoutImages = 0;
    let usedImages = 0;

    analysis.products.forEach((product) => {
      const variants = product.variants.length ? product.variants : [{ sku: product.handle, price: product.firstPrice }];
      const hasVariants = config.listingMode === "variants" && variants.length > 1;
      const traitName = config.variationTraitName || product.option1Name || "Größe";
      const photoUrls = product.images.slice(0, Number(config.maxImages || 5));
      const photos = photoUrls.join("|");
      const specifics = config.includeSpecifics ? makeSpecifics(product, config) : {};
      const parent = createEmptyRow(headers);

      if (hasVariants) {
        productsWithVariants += 1;
      }
      if (!photoUrls.length) {
        productsWithoutImages += 1;
        warnings.push(`${product.handle}: kein Shopify-Bild gefunden.`);
      }
      usedImages += photoUrls.length;

      if (config.listingMode === "flat" && variants.length > 1) {
        variants.forEach((variant) => {
          const flat = createEmptyRow(headers);
          const optionValue = variant.option1Value || "Standard";
          setIfHeader(flat, actionHeader, "Draft");
          setIfHeader(flat, skuHeader, variant.sku);
          setIfHeader(flat, categoryHeader, config.categoryId);
          setIfHeader(flat, titleHeader, cleanTitle(`${product.title} - ${optionValue}`, 80));
          setIfHeader(flat, upcHeader, config.upcValue);
          setIfHeader(flat, priceHeader, formatPrice(variant.price, config));
          setIfHeader(flat, quantityHeader, config.quantity);
          setIfHeader(flat, photosHeader, photos);
          setIfHeader(flat, conditionHeader, config.conditionId);
          setIfHeader(flat, descriptionHeader, buildDescription(product, config));
          setIfHeader(flat, formatHeader, config.format);
          Object.entries({ ...specifics, [addSpecificPrefix(traitName)]: optionValue }).forEach(([key, value]) => {
            const headerKey = addSpecificPrefix(key);
            if (!headers.includes(headerKey)) {
              headers.push(headerKey);
              rows.forEach((row) => {
                row[headerKey] = "";
              });
              flat[headerKey] = "";
            }
            flat[headerKey] = value;
          });
          rows.push(flat);
        });
        return;
      }

      setIfHeader(parent, actionHeader, "Draft");
      setIfHeader(parent, skuHeader, makeSku(product.handle));
      setIfHeader(parent, categoryHeader, config.categoryId);
      setIfHeader(parent, titleHeader, cleanTitle(product.title, 80));
      setIfHeader(parent, upcHeader, config.upcValue);
      setIfHeader(parent, photosHeader, photos);
      setIfHeader(parent, conditionHeader, config.conditionId);
      setIfHeader(parent, descriptionHeader, buildDescription(product, config));
      setIfHeader(parent, formatHeader, config.format);

      if (hasVariants) {
        setIfHeader(parent, relationshipDetailsHeader, buildVariationSummary(product, traitName));
      } else {
        setIfHeader(parent, priceHeader, formatPrice(variants[0].price, config));
        setIfHeader(parent, quantityHeader, config.quantity);
      }

      Object.entries(specifics).forEach(([key, value]) => {
        if (headers.includes(key)) {
          parent[key] = value;
        }
      });

      rows.push(parent);

      if (hasVariants) {
        variants.forEach((variant) => {
          const child = createEmptyRow(headers);
          const optionValue = variant.option1Value || "Standard";
          setIfHeader(child, skuHeader, variant.sku);
          setIfHeader(child, priceHeader, formatPrice(variant.price, config));
          setIfHeader(child, quantityHeader, config.quantity);
          setIfHeader(child, upcHeader, config.upcValue);
          setIfHeader(child, relationshipHeader, "Variation");
          setIfHeader(child, relationshipDetailsHeader, `${traitName}=${optionValue}`);
          if (variant.image) {
            setIfHeader(child, photosHeader, `${optionValue}=${variant.image}`);
          }
          rows.push(child);
        });
      }
    });

    if (!config.categoryId) {
      warnings.unshift("Category ID ist leer. eBay akzeptiert den Upload erst mit einer passenden Kategorie-ID.");
    }

    const csv = objectsToCsv(headers, rows, template.delimiter, template.infoRows);

    return {
      csv,
      headers,
      rows,
      warnings,
      analysis,
      summary: {
        products: analysis.productCount,
        sourceRows: analysis.rowCount,
        outputRows: rows.length,
        productsWithVariants,
        productsWithoutImages,
        usedImages,
        selectedSpecifics: unique(selectedKeys),
      },
    };
  }

  return {
    DEFAULT_GLOBAL_SPECIFICS,
    DEFAULT_HEADERS,
    analyzeShopify,
    convert,
    detectDelimiter,
    parseCsvRows,
    parseEbayTemplate,
    parseShopify,
  };
});
