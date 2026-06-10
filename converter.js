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

  const DEFAULT_LISTING_TEMPLATE = {
    enabled: true,
    shopName: "Atelier Orlo",
    headline: "Ausgewählte Vintage-Plakatkunst als hochwertiger Kunstdruck",
    intro:
      "Ein ruhiges, kuratiertes Wandbild für Räume mit Charakter. Gedruckt auf mattem Premiumpapier und sorgfältig als Print-on-Demand produziert.",
    primaryColor: "#1f4638",
    accentColor: "#b87333",
    backgroundColor: "#fbfaf7",
    highlight1Title: "Premiumdruck",
    highlight1Text: "Mattes 200 g/m² Papier mit feiner, wertiger Haptik.",
    highlight2Title: "Kuratiertes Motiv",
    highlight2Text: "Sorgfältig ausgewählte historische Plakatkunst.",
    highlight3Title: "Ohne Rahmen",
    highlight3Text: "Geliefert wird der Kunstdruck ohne Rahmen und Dekoration.",
    qualityTitle: "Material und Druck",
    qualityText:
      "Gedruckt auf FSC-Premiumpapier oder gleichwertigem Papier mit matter Oberfläche. Die Farben wirken klar, ruhig und wohnlich.",
    shippingTitle: "Produktion und Versand",
    shippingText:
      "Jeder Kunstdruck wird nach Bestellung produziert und sicher verpackt verschickt. Die Lieferzeit kann je nach Zielland leicht variieren.",
    noteTitle: "Hinweis",
    noteText:
      "Farben können je nach Bildschirm leicht abweichen. Rahmen, Passepartout und Dekoration sind nicht Teil des Angebots.",
    footerText: "Atelier Orlo - Vintage Poster, Plakatkunst und Kunstdrucke für besondere Räume.",
  };

  const FIELD_ALIASES = {
    action: [/^\*?Action\b/i, /^\*?Action\(/i],
    sku: [/^Custom label/i, /^CustomLabel$/i, /^SKU$/i],
    productName: [/^\*?ProductName$/i, /^Product Name$/i],
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

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sanitizeInlineHtml(html) {
    return stripScripts(html)
      .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/\s(?:class|id|onclick|onload|onerror|style|data-[a-z0-9-]+)="[^"]*"/gi, "")
      .replace(/\s(?:class|id|onclick|onload|onerror|style|data-[a-z0-9-]+)='[^']*'/gi, "")
      .replace(/<(?!\/?(p|br|strong|b|em|i|ul|ol|li|h2|h3|h4)\b)[^>]+>/gi, "")
      .trim();
  }

  function toPlainText(html) {
    return stripScripts(html)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanColor(value, fallback) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
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

  function renderFact(label, value) {
    if (!value) {
      return "";
    }
    return `<div style="border-top:1px solid #e7e1d8;padding:10px 0;"><span style="display:block;color:#6b6258;font-size:12px;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(label)}</span><strong style="display:block;color:#20201d;font-size:15px;margin-top:2px;">${escapeHtml(value)}</strong></div>`;
  }

  function renderHighlight(title, text) {
    if (!title && !text) {
      return "";
    }
    return `<div style="border:1px solid #e6ddd1;background:#fff;padding:16px;border-radius:8px;"><strong style="display:block;font-size:16px;color:#20201d;margin-bottom:6px;">${escapeHtml(title)}</strong><span style="display:block;color:#514b44;line-height:1.55;font-size:14px;">${escapeHtml(text)}</span></div>`;
  }

  function cleanSpecificLabel(label) {
    return String(label || "")
      .replace(/^C:/i, "")
      .trim();
  }

  function pushFact(facts, seen, label, value) {
    const cleanLabel = cleanSpecificLabel(label);
    const cleanValue = String(value || "").trim();
    const key = cleanLabel.toLowerCase();
    if (!cleanLabel || !cleanValue || seen.has(key)) {
      return;
    }
    seen.add(key);
    facts.push([cleanLabel, cleanValue]);
  }

  function buildTemplateFacts(product, config, details) {
    const facts = [];
    const seen = new Set();
    const specifics = makeSpecifics(product, config);
    const preferredOrder = [
      "Produktart",
      "Material",
      "Materialinfo",
      "Rahmung",
      "Rahmenstil",
      "Kunststil",
      "Stil",
      "Thema",
      "Künstler",
      "Epoche",
      "Authentizität",
      "Finish",
      "Ausrichtung",
      "Farbe",
      "Herstellungsart",
      "Marke",
      "Zustand",
    ];

    if (details && details.optionValue) {
      pushFact(facts, seen, config.variationTraitName || product.option1Name || "Größe", details.optionValue);
    }
    if (details && details.price) {
      pushFact(facts, seen, "Preis", `${details.price} EUR`);
    }

    preferredOrder.forEach((preferred) => {
      const match = Object.entries(specifics).find(([key]) => cleanSpecificLabel(key).toLowerCase() === preferred.toLowerCase());
      if (match) {
        pushFact(facts, seen, match[0], match[1]);
      }
    });

    Object.entries(specifics).forEach(([label, value]) => pushFact(facts, seen, label, value));
    return facts;
  }

  function renderListingTemplate(product, config, details) {
    const template = { ...DEFAULT_LISTING_TEMPLATE, ...(config.listingTemplate || {}) };
    const primary = cleanColor(template.primaryColor, DEFAULT_LISTING_TEMPLATE.primaryColor);
    const accent = cleanColor(template.accentColor, DEFAULT_LISTING_TEMPLATE.accentColor);
    const background = cleanColor(template.backgroundColor, DEFAULT_LISTING_TEMPLATE.backgroundColor);
    const title = cleanTitle(details && details.title ? details.title : product.title, 120);
    const description = sanitizeInlineHtml(product.description) || `<p>${escapeHtml(toPlainText(product.description))}</p>`;
    const mainImage = template.showHeroImage === false ? "" : product.images[0] || "";
    const suffix = String(config.descriptionSuffix || "").trim();
    const facts = buildTemplateFacts(product, config, details).map(([label, value]) => renderFact(label, value)).join("");

    const imageBlock = mainImage
      ? `<div style="margin:0 0 22px;"><img src="${escapeHtml(mainImage)}" alt="${escapeHtml(title)}" style="display:block;width:100%;max-width:760px;height:auto;border-radius:10px;border:1px solid #e6ddd1;margin:0 auto;"></div>`
      : "";

    const suffixBlock = suffix
      ? `<div style="margin-top:22px;padding:16px;border-left:4px solid ${accent};background:#fff7ef;color:#4b4038;line-height:1.6;">${escapeHtml(suffix).replace(/\n/g, "<br>")}</div>`
      : "";

    return [
      `<div style="max-width:860px;margin:0 auto;background:${background};color:#20201d;font-family:Arial,Helvetica,sans-serif;line-height:1.55;">`,
      `<div style="padding:28px 24px 24px;border:1px solid #e6ddd1;border-radius:12px;background:#fff;">`,
      `<div style="border-bottom:3px solid ${accent};padding-bottom:16px;margin-bottom:22px;">`,
      `<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${primary};font-weight:bold;">${escapeHtml(template.shopName)}</div>`,
      `<h1 style="margin:8px 0 8px;font-size:28px;line-height:1.2;color:#20201d;">${escapeHtml(title)}</h1>`,
      `<p style="margin:0;color:#5a534b;font-size:16px;">${escapeHtml(template.headline)}</p>`,
      `</div>`,
      imageBlock,
      `<div style="display:block;margin-bottom:22px;padding:18px;background:${background};border-radius:10px;border:1px solid #e6ddd1;">`,
      `<p style="margin:0;color:#39342f;font-size:16px;">${escapeHtml(template.intro)}</p>`,
      `</div>`,
      `<div style="margin-bottom:24px;color:#39342f;font-size:16px;">${description}</div>`,
      `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0;">`,
      renderHighlight(template.highlight1Title, template.highlight1Text),
      renderHighlight(template.highlight2Title, template.highlight2Text),
      renderHighlight(template.highlight3Title, template.highlight3Text),
      `</div>`,
      `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,280px);gap:22px;margin-top:24px;">`,
      `<div>`,
      `<h2 style="margin:0 0 10px;font-size:20px;color:${primary};">${escapeHtml(template.qualityTitle)}</h2>`,
      `<p style="margin:0 0 18px;color:#4b463f;">${escapeHtml(template.qualityText)}</p>`,
      `<h2 style="margin:0 0 10px;font-size:20px;color:${primary};">${escapeHtml(template.shippingTitle)}</h2>`,
      `<p style="margin:0 0 18px;color:#4b463f;">${escapeHtml(template.shippingText)}</p>`,
      `<h2 style="margin:0 0 10px;font-size:20px;color:${primary};">${escapeHtml(template.noteTitle)}</h2>`,
      `<p style="margin:0;color:#4b463f;">${escapeHtml(template.noteText)}</p>`,
      suffixBlock,
      `</div>`,
      `<div style="background:#fff;border:1px solid #e6ddd1;border-radius:10px;padding:14px 16px;height:max-content;">`,
      `<h3 style="margin:0 0 8px;font-size:17px;color:#20201d;">Details</h3>`,
      facts || renderFact("Produktart", "Kunstdruck"),
      `</div>`,
      `</div>`,
      `<div style="margin-top:26px;padding-top:16px;border-top:1px solid #e6ddd1;color:#6b6258;font-size:13px;">${escapeHtml(template.footerText)}</div>`,
      `</div>`,
      `</div>`,
    ].join("");
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

  function humanizeValue(value) {
    return String(value || "")
      .replace(/^gid:\/\/shopify\/TaxonomyValue\//i, "")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function applyShopifyMetafields(records, tags) {
    const fieldMap = [
      ["Kunststil (product.metafields.shopify.art-style)", "Kunststil"],
      ["Authentizität des Kunstwerks (product.metafields.shopify.artwork-authenticity)", "Authentizität"],
      ["Farbe (product.metafields.shopify.color-pattern)", "Farbe"],
      ["Finish (product.metafields.shopify.finish)", "Finish"],
      ["Rahmenstil (product.metafields.shopify.frame-style)", "Rahmenstil"],
      ["Material (product.metafields.shopify.material)", "Material"],
      ["Ausrichtung (product.metafields.shopify.orientation)", "Ausrichtung"],
      ["material_info (product.metafields.taxonomy_backup.material_info)", "Materialinfo"],
      ["Google Shopping / MPN", "MPN"],
      ["Google Shopping / Condition", "Zustand"],
    ];

    fieldMap.forEach(([source, target]) => {
      const value = humanizeValue(firstValue(records, source));
      if (value && !tags[target]) {
        tags[target] = value;
      }
    });
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
      applyShopifyMetafields(records, tags);

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

  function findExactHeader(headers, names) {
    return headers.find((header) => names.some((name) => header.toLowerCase() === name.toLowerCase())) || null;
  }

  function setIfPresent(headers, row, names, value) {
    const header = findExactHeader(headers, names);
    if (header && (row[header] == null || row[header] === "")) {
      row[header] = value == null ? "" : value;
    }
  }

  function conditionValueFor(header, value) {
    const raw = String(value || "").trim();
    if (/^\*?Condition\s*ID$/i.test(String(header || "")) && /^NEW$/i.test(raw)) {
      return "1000";
    }
    return raw;
  }

  function applyTemplateDefaults(headers, row, config) {
    setIfPresent(headers, row, ["*Duration", "Duration"], config.duration || "GTC");
    setIfPresent(headers, row, ["ImmediatePayRequired"], config.immediatePayRequired || "1");
    setIfPresent(headers, row, ["*Location", "Location"], config.location || "Deutschland");
    setIfPresent(headers, row, ["GalleryType"], config.galleryType || "Gallery");
    setIfPresent(headers, row, ["DispatchTimeMax"], config.dispatchTimeMax || "3");
    setIfPresent(headers, row, ["ReturnsAcceptedOption"], config.returnsAcceptedOption || "ReturnsAccepted");
    setIfPresent(headers, row, ["ReturnsWithinOption"], config.returnsWithinOption || "Days_30");
    setIfPresent(headers, row, ["ShippingCostPaidByOption"], config.shippingCostPaidByOption || "Buyer");
    setIfPresent(headers, row, ["Product:Brand"], config.brand || "Atelier Orlo");
    setIfPresent(headers, row, ["Product:MPN"], config.mpn || "Nicht zutreffend");
    setIfPresent(headers, row, ["Product:EAN"], config.ean || "Nicht zutreffend");
    setIfPresent(headers, row, ["Product:UPC"], config.upcValue || "Nicht zutreffend");
    setIfPresent(headers, row, ["Product:IncludePreFilledItemInformation"], "0");
    setIfPresent(headers, row, ["Product:IncludeStockPhotoURL"], "0");
    setIfPresent(headers, row, ["Product:ReturnSearchResultsOnDuplicates"], "0");
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

  function pickActionValue(actionHeader, config) {
    if (config.actionValue) {
      return config.actionValue;
    }

    const header = String(actionHeader || "");
    if (/^\*Action/i.test(header) || /Version=941/i.test(header)) {
      return config.verifyOnly ? "VerifyAdd" : "Add";
    }
    return "Draft";
  }

  function defaultRelationshipDetailsHeader(actionHeader) {
    const header = String(actionHeader || "");
    return /^\*Action/i.test(header) || /Version=941/i.test(header) ? "RelationshipDetails" : "Relationship details";
  }

  function buildDescription(product, config, details) {
    const template = { ...DEFAULT_LISTING_TEMPLATE, ...(config.listingTemplate || {}) };
    if (template.enabled !== false) {
      return renderListingTemplate(product, config, details || {});
    }

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
      conditionId: "1000",
      format: "FixedPrice",
      quantity: 10,
      maxImages: 5,
      listingMode: "variants",
      variationTraitName: "Größe",
      verifyOnly: false,
      actionValue: "",
      upcValue: "",
      priceMultiplier: 1,
      priceAdd: 0,
      roundTo: 0,
      selectedTagKeys: [],
      tagKeyMap: {},
      globalSpecifics: DEFAULT_GLOBAL_SPECIFICS,
      descriptionSuffix: "",
      listingTemplate: DEFAULT_LISTING_TEMPLATE,
      includeSpecifics: true,
      prefixItemSpecifics: true,
      ...options,
    };
    config.listingTemplate = { ...DEFAULT_LISTING_TEMPLATE, ...((options && options.listingTemplate) || {}) };

    const analysis = analyzeShopify(shopifyText);
    const template = parseEbayTemplate(config.templateText);
    const headers = template.headers.slice();

    const actionHeader = findHeader(headers, "action") || ensureHeader(headers, DEFAULT_HEADERS[0]);
    const skuHeader = findHeader(headers, "sku") || ensureHeader(headers, "Custom label (SKU)");
    const productNameHeader = findHeader(headers, "productName");
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
      findHeader(headers, "relationshipDetails") || ensureHeader(headers, defaultRelationshipDetailsHeader(actionHeader));
    const actionValue = pickActionValue(actionHeader, config);

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
          setIfHeader(flat, actionHeader, actionValue);
          setIfHeader(flat, skuHeader, variant.sku);
          setIfHeader(flat, productNameHeader, variant.sku);
          setIfHeader(flat, categoryHeader, config.categoryId);
          setIfHeader(flat, titleHeader, cleanTitle(`${product.title} - ${optionValue}`, 80));
          setIfHeader(flat, upcHeader, config.upcValue);
          setIfHeader(flat, priceHeader, formatPrice(variant.price, config));
          setIfHeader(flat, quantityHeader, config.quantity);
          setIfHeader(flat, photosHeader, photos);
          setIfHeader(flat, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
          setIfHeader(
            flat,
            descriptionHeader,
            buildDescription(product, config, {
              title: `${product.title} - ${optionValue}`,
              optionValue,
              price: formatPrice(variant.price, config),
            }),
          );
          setIfHeader(flat, formatHeader, config.format);
          applyTemplateDefaults(headers, flat, config);
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

      setIfHeader(parent, actionHeader, actionValue);
      setIfHeader(parent, skuHeader, makeSku(product.handle));
      setIfHeader(parent, productNameHeader, makeSku(product.handle));
      setIfHeader(parent, categoryHeader, config.categoryId);
      setIfHeader(parent, titleHeader, cleanTitle(product.title, 80));
      setIfHeader(parent, upcHeader, config.upcValue);
      setIfHeader(parent, photosHeader, photos);
      setIfHeader(parent, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
      setIfHeader(
        parent,
        descriptionHeader,
        buildDescription(product, config, {
          title: product.title,
          price: hasVariants ? "" : formatPrice(variants[0].price, config),
        }),
      );
      setIfHeader(parent, formatHeader, config.format);
      applyTemplateDefaults(headers, parent, config);

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
          const variantImage = variant.image || product.images[0] || "";
          setIfHeader(child, skuHeader, variant.sku);
          setIfHeader(child, priceHeader, formatPrice(variant.price, config));
          setIfHeader(child, quantityHeader, config.quantity);
          setIfHeader(child, upcHeader, config.upcValue);
          setIfHeader(child, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
          setIfHeader(child, relationshipHeader, "Variation");
          setIfHeader(child, relationshipDetailsHeader, `${traitName}=${optionValue}`);
          if (variantImage) {
            setIfHeader(child, photosHeader, `${optionValue}=${variantImage}`);
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
    DEFAULT_LISTING_TEMPLATE,
    analyzeShopify,
    convert,
    detectDelimiter,
    parseCsvRows,
    parseEbayTemplate,
    parseShopify,
  };
});
