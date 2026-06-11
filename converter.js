(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EbayConverter = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const DEFAULT_INFO_ROWS = [];

  const DEFAULT_HEADERS = [
    "*Action(SiteID=Germany|Country=DE|Currency=EUR|Version=941)",
    "*ProductName",
    "SaleTemplateName",
    "*Category",
    "*Title",
    "Subtitle",
    "*Description",
    "*ConditionID",
    "PicURL",
    "*Quantity",
    "*Format",
    "*StartPrice",
    "BuyItNowPrice",
    "*Duration",
    "ImmediatePayRequired",
    "*Location",
    "GalleryType",
    "PayPalAccepted",
    "PayPalEmailAddress",
    "PaymentInstructions",
    "DomesticInsuranceOption",
    "DomesticInsuranceFee",
    "InternationalInsuranceOption",
    "InternationalInsuranceFee",
    "StoreCategory",
    "ShippingDiscountProfileID",
    "eBay Plus",
    "DomesticRateTable",
    "ShippingType",
    "ShippingService-1:Option",
    "ShippingService-1:Cost",
    "ShippingService-1:Priority",
    "ShippingService-2:Option",
    "ShippingService-2:Cost",
    "ShippingService-2:Priority",
    "DispatchTimeMax",
    "CustomLabel",
    "ReturnsAcceptedOption",
    "ReturnsWithinOption",
    "ShippingCostPaidByOption",
    "AdditionalDetails",
    "ShippingProfileName",
    "ReturnProfileName",
    "PaymentProfileName",
    "P:UPC",
    "Relationship",
    "RelationshipDetails",
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
    logoUrl: "",
    headline: "Ausgewählte Vintage-Plakatkunst als hochwertiger Kunstdruck",
    intro: "",
    primaryColor: "#1f4638",
    accentColor: "#b87333",
    backgroundColor: "#fbfaf7",
    highlight1IconUrl: "",
    highlight1Title: "Historische Reproduktion",
    highlight1Text: "Sorgfältig ausgewähltes Plakatmotiv nach alter Vorlage.",
    highlight2IconUrl: "",
    highlight2Title: "Mattes Papier",
    highlight2Text: "Gedruckt auf mattem 200 g/m² Papier mit ruhiger Oberfläche. FSC-zertifiziert oder gleichwertig.",
    highlight3IconUrl: "",
    highlight3Title: "30 Tage Widerrufsrecht",
    highlight3Text: "Sie können Ihr Poster nach Erhalt zurückgeben. Die Rücksendekosten tragen Sie.",
    highlight4IconUrl: "",
    highlight4Title: "Kostenloser Versand",
    highlight4Text: "Der Versand ist im Preis enthalten. Zustellung in der Regel innerhalb von 3 bis 5 Werktagen.",
    highlight5IconUrl: "",
    highlight5Title: "Ohne Rahmen",
    highlight5Text: "Alle Poster werden ungerahmt geliefert. So wählen Sie den Rahmen passend zu Ihrem Raum.",
    qualityTitle: "",
    qualityText: "",
    shippingTitle: "",
    shippingText: "",
    noteTitle: "Hinweis",
    noteText: "",
    contactEnabled: false,
    contactImageUrl: "",
    contactText:
      "Wenn Sie Fragen zu Motiv, Format oder Versand haben, schreiben Sie mir gern über eBay. Ich freue mich auf Ihre Nachricht und antworte zeitnah.",
    contactButtonLabel: "Nachricht über eBay senden",
    contactButtonUrl: "",
    footerText: "Atelier Orlo - Vintage Poster, Plakatkunst und Kunstdrucke.",
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

  function findObjectKey(record, patterns) {
    return Object.keys(record || {}).find((key) => patterns.some((pattern) => pattern.test(key))) || "";
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
        delimiter: ",",
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
      infoRows,
      headers: headers.length ? headers : DEFAULT_HEADERS.slice(),
    };
  }

  function parseItemIdMappings(text) {
    if (!text) {
      return {
        lineOrder: [],
        bySku: {},
        byTitle: {},
      };
    }

    const delimiter = detectDelimiter(text);
    const rows = parseCsvRows(text, delimiter);
    const headerIndex = rows.findIndex((row) =>
      row.some((cell) => /^(Line Number|ItemID|Item ID|SellerInventoryID|CustomLabel|Custom label|Title)$/i.test(String(cell || "").trim())),
    );
    if (headerIndex < 0) {
      return {
        lineOrder: [],
        bySku: {},
        byTitle: {},
      };
    }

    const parsed = rowsToObjects(rows, headerIndex);
    const entries = [];
    parsed.rows.forEach((record, index) => {
      const itemKey = findObjectKey(record, [/^ItemID$/i, /^Item ID$/i, /^eBay item number$/i, /^eBay item ID$/i]);
      const lineKey = findObjectKey(record, [/^Line Number$/i, /^Line$/i]);
      const skuKey = findObjectKey(record, [/^SellerInventoryID$/i, /^CustomLabel$/i, /^Custom label/i, /^Custom label \(SKU\)$/i, /^SKU$/i]);
      const titleKey = findObjectKey(record, [/^\*?Title$/i]);
      const itemId = String(record[itemKey] || "").trim();
      if (!itemId) {
        return;
      }
      entries.push({
        itemId,
        lineNumber: Number(record[lineKey]) || 0,
        sku: String(record[skuKey] || "").trim(),
        title: String(record[titleKey] || "").trim(),
        index,
      });
    });

    const sorted = entries
      .slice()
      .sort((left, right) => (left.lineNumber || 999999 + left.index) - (right.lineNumber || 999999 + right.index));
    const bySku = {};
    const byTitle = {};
    entries.forEach((entry) => {
      if (entry.sku && !bySku[entry.sku]) {
        bySku[entry.sku] = entry.itemId;
      }
      if (entry.title && !byTitle[entry.title]) {
        byTitle[entry.title] = entry.itemId;
      }
    });

    return {
      lineOrder: sorted.map((entry) => entry.itemId),
      bySku,
      byTitle,
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
    const url = String(value || "").trim();
    if (!url || /^data:/i.test(url) || !/^https?:\/\//i.test(url)) {
      return "";
    }
    return url.replace(/\s/g, "%20");
  }

  function hasEmbeddedImageData(value) {
    return /data:image\//i.test(String(value || ""));
  }

  function embeddedAssetWarning(config) {
    const template = { ...DEFAULT_LISTING_TEMPLATE, ...(config.listingTemplate || {}) };
    const values = [
      template.logoUrl,
      template.highlight1IconUrl,
      template.highlight2IconUrl,
      template.highlight3IconUrl,
      template.highlight4IconUrl,
      template.highlight5IconUrl,
      template.contactImageUrl,
      config.extraImageUrls,
      config.productExtraImageUrls,
    ];
    if (!values.some(hasEmbeddedImageData)) {
      return "";
    }
    return "Eingebettete Datei-Uploads/Data-URLs wurden nicht in die eBay-Beschreibung exportiert. eBay lehnt zu große Base64-Beschreibungen ab; nutze für Logo und Icons öffentliche HTTPS-URLs.";
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

  function asciiFold(value) {
    return String(value || "")
      .replace(/Ä/g, "Ae")
      .replace(/Ö/g, "Oe")
      .replace(/Ü/g, "Ue")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function relationshipSafeTrait(value) {
    const normalized = asciiFold(value || "Groesse")
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 40);
    return normalized || "Groesse";
  }

  function relationshipSafeValue(value, fallback) {
    const raw = String(value || fallback || "Standard").trim();
    const metric = raw.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/i);
    if (metric) {
      return `${metric[1].replace(",", ".")}x${metric[2].replace(",", ".")}cm`;
    }
    const normalized = asciiFold(raw)
      .replace(/[″“”"]/g, "in")
      .replace(/[’']/g, "")
      .replace(/\s*\/\s*/g, "-")
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9_.-]/g, "")
      .slice(0, 55);
    return normalized || "Standard";
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

  function formalizeGermanAddress(value) {
    return String(value || "")
      .replace(/\bDu erhältst\b/g, "Sie erhalten")
      .replace(/\bdu erhältst\b/g, "Sie erhalten")
      .replace(/\bDu bekommst\b/g, "Sie erhalten")
      .replace(/\bdu bekommst\b/g, "Sie erhalten")
      .replace(/\bDu kannst\b/g, "Sie können")
      .replace(/\bdu kannst\b/g, "Sie können")
      .replace(/\bDu\b/g, "Sie")
      .replace(/\bdu\b/g, "Sie")
      .replace(/\bDein\b/g, "Ihr")
      .replace(/\bdein\b/g, "Ihr")
      .replace(/\bDeine\b/g, "Ihre")
      .replace(/\bdeine\b/g, "Ihre")
      .replace(/\bDeinen\b/g, "Ihren")
      .replace(/\bdeinen\b/g, "Ihren")
      .replace(/\bDeinem\b/g, "Ihrem")
      .replace(/\bdeinem\b/g, "Ihrem")
      .replace(/\bDeiner\b/g, "Ihrer")
      .replace(/\bdeiner\b/g, "Ihrer")
      .replace(/\bDeines\b/g, "Ihres")
      .replace(/\bdeines\b/g, "Ihres")
      .replace(/\bDir\b/g, "Ihnen")
      .replace(/\bdir\b/g, "Ihnen")
      .replace(/\bDich\b/g, "Sie")
      .replace(/\bdich\b/g, "Sie")
      .replace(/\bwählst Sie\b/g, "wählen Sie")
      .replace(/\bträgst Sie\b/g, "tragen Sie");
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
    return `<div style="border:1px solid #e6ddd1;background:#fff;padding:12px 14px;border-radius:8px;"><span style="display:block;color:#6b6258;font-size:11px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px;">${escapeHtml(label)}</span><strong style="display:block;color:#20201d;font-size:14px;line-height:1.35;">${escapeHtml(value)}</strong></div>`;
  }

  function renderHighlight(title, text, iconUrl, fallbackIndex) {
    if (!title && !text) {
      return "";
    }
    const safeIcon = normalizeUrl(iconUrl);
    const icon = safeIcon
      ? `<img src="${escapeHtml(safeIcon)}" alt="" style="display:block;width:54px;height:54px;object-fit:contain;margin:0 auto 18px;">`
      : `<span style="display:flex;width:54px;height:54px;border:1px solid #d9cdbf;border-radius:50%;align-items:center;justify-content:center;margin:0 auto 18px;color:#1f4638;font-size:18px;font-weight:bold;">${String(fallbackIndex || "").padStart(2, "0")}</span>`;
    return `<div style="display:inline-block;width:18%;min-width:150px;box-sizing:border-box;vertical-align:top;margin:0 .6% 12px;border:1px solid #eee4d8;background:#f7f1ea;padding:22px 14px;border-radius:8px;text-align:center;min-height:220px;">${icon}<strong style="display:block;font-size:20px;color:#20201d;margin-bottom:10px;font-family:Georgia,serif;font-weight:400;">${escapeHtml(title)}</strong><span style="display:block;color:#514b44;line-height:1.6;font-size:15px;">${escapeHtml(text)}</span></div>`;
  }

  function parseUrlList(value) {
    return unique(
      String(value || "")
        .split(/[\n,]+/)
        .map((part) => normalizeUrl(part))
        .filter(Boolean),
    );
  }

  function parseProductExtraImages(value) {
    const map = {};
    String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const separator = line.includes("=") ? "=" : line.includes(":") ? ":" : "";
        if (!separator) {
          return;
        }
        const index = line.indexOf(separator);
        const key = line.slice(0, index).trim().toLowerCase();
        const urls = parseUrlList(line.slice(index + 1).replace(/\|/g, "\n"));
        if (key && urls.length) {
          map[key] = urls;
        }
      });
    return map;
  }

  function buildProductImages(product, config) {
    const shopifyImages = product.images || [];
    const productExtrasMap = parseProductExtraImages(config.productExtraImageUrls);
    const productExtras = productExtrasMap[String(product.handle || "").toLowerCase()] || [];
    const extras = unique([...parseUrlList(config.extraImageUrls), ...productExtras]);
    const position = config.extraImagesPosition || "after-main";
    const explicitPosition = Number.parseInt(config.extraImagesPositionIndex, 10);

    if (!extras.length) {
      return unique(shopifyImages);
    }
    if (Number.isFinite(explicitPosition) && explicitPosition > 0) {
      const insertIndex = Math.min(Math.max(explicitPosition - 1, 0), shopifyImages.length);
      return unique([...shopifyImages.slice(0, insertIndex), ...extras, ...shopifyImages.slice(insertIndex)]);
    }
    if (position === "before") {
      return unique([...extras, ...shopifyImages]);
    }
    if (position === "after-main") {
      return unique([shopifyImages[0], ...extras, ...shopifyImages.slice(1)]);
    }
    return unique([...shopifyImages, ...extras]);
  }

  function renderPhotoGallery(images, title, template) {
    const galleryImages = unique(images).slice(0, 12);
    if (!galleryImages.length || template.showHeroImage === false) {
      return "";
    }

    const total = galleryImages.length;
    const galleryId = `orlo-gallery-${shortHash(`${title}-${galleryImages.join("|")}`)}`;
    const duration = Math.max(total * 4, 8);
    const visibleEnd = Math.max(6, 100 / total - 2).toFixed(2);
    const fadeEnd = Math.max(8, 100 / total).toFixed(2);
    const inputs = galleryImages
      .map(
        (url, index) =>
          `<input id="${galleryId}-${index + 1}" name="${galleryId}" type="radio" style="display:none;" aria-label="${escapeHtml(title)} Bild ${index + 1} auswählen">`,
      )
      .join("");
    const slides = galleryImages
      .map(
        (url, index) =>
          `<img class="orlo-slide orlo-slide-${index + 1}" src="${escapeHtml(url)}" alt="${escapeHtml(title)} ${index + 1}" style="position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;opacity:${index === 0 ? "1" : "0"};animation:orloFade ${duration}s infinite;animation-delay:${index * 4}s;">`,
      )
      .join("");
    const thumbs = galleryImages
      .map(
        (url, index) =>
          `<label for="${galleryId}-${index + 1}" style="display:inline-block;vertical-align:top;border:1px solid #e6ddd1;border-radius:6px;background:#fff;padding:4px;margin:0 6px 8px 0;max-width:128px;cursor:pointer;"><img src="${escapeHtml(url)}" alt="${escapeHtml(title)} Vorschau ${index + 1}" style="display:block;max-width:118px;max-height:96px;width:auto;height:auto;object-fit:contain;border-radius:4px;"></label>`,
      )
      .join("");
    const pauseAllRules = galleryImages
      .map((_, index) => `#${galleryId}-${index + 1}:checked~.orlo-hero .orlo-slide`)
      .join(",");
    const selectedRules = galleryImages
      .map(
        (_, index) =>
          `#${galleryId}-${index + 1}:checked~.orlo-hero .orlo-slide-${index + 1}{opacity:1!important;animation:none!important;z-index:2;}`,
      )
      .join("");

    return [
      `<style>@keyframes orloFade{0%{opacity:1}${visibleEnd}%{opacity:1}${fadeEnd}%{opacity:0}100%{opacity:0}}${pauseAllRules}{opacity:0!important;animation:none!important;}${selectedRules}</style>`,
      `<div style="margin:0 0 24px;width:100%;box-sizing:border-box;">`,
      inputs,
      `<div class="orlo-hero" style="position:relative;width:100%;height:70vw;min-height:340px;max-height:720px;max-width:1120px;margin:0 auto;border:1px solid #e6ddd1;background:#fff;border-radius:8px;overflow:hidden;box-sizing:border-box;">${slides}</div>`,
      `<div class="orlo-thumbs" style="display:block;margin-top:12px;text-align:center;line-height:0;">${thumbs}</div>`,
      `</div>`,
    ].join("");
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

  function renderManufacturerDisclosure(config, primary) {
    const manufacturer = config.manufacturer || {};
    const rows = [
      ["Name", manufacturer.name],
      ["Land/Region", manufacturer.country],
      ["Straße und Hausnummer", manufacturer.addressLine1],
      ["Adresszusatz", manufacturer.addressLine2],
      ["Ort", manufacturer.city],
      ["PLZ", manufacturer.postalCode],
      ["Bundesland/Provinz", manufacturer.stateOrProvince],
      ["Telefon", manufacturer.phone],
      ["E-Mail", manufacturer.email],
      ["Kontakt-URL", manufacturer.contactUrl],
    ].filter(([, value]) => String(value || "").trim());

    if (!rows.length) {
      return "";
    }

    const content = rows
      .map(
        ([label, value]) =>
          `<div style="display:inline-block;width:48%;min-width:220px;box-sizing:border-box;margin:0 1% 10px 0;vertical-align:top;"><span style="display:block;color:#6b6258;font-size:12px;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(label)}</span><strong style="display:block;color:#20201d;font-size:14px;line-height:1.4;">${escapeHtml(value)}</strong></div>`,
      )
      .join("");

    return `<details style="margin-top:24px;border:1px solid #e6ddd1;background:#fbfaf7;border-radius:8px;padding:14px 16px;"><summary style="cursor:pointer;color:${primary};font-weight:bold;font-size:16px;">Produkthersteller</summary><div style="margin-top:14px;">${content}</div></details>`;
  }

  function renderContactBlock(template, primary, accent) {
    if (!template.contactEnabled) {
      return "";
    }
    const imageUrl = normalizeUrl(template.contactImageUrl);
    const buttonUrl = normalizeUrl(template.contactButtonUrl);
    const text = formalizeGermanAddress(template.contactText || DEFAULT_LISTING_TEMPLATE.contactText);
    const image = imageUrl
      ? `<img src="${escapeHtml(imageUrl)}" alt="" style="display:block;max-width:220px;max-height:160px;width:auto;height:auto;margin:0 auto 16px;background:transparent;">`
      : "";
    const button = buttonUrl
      ? `<a href="${escapeHtml(buttonUrl)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:14px;padding:12px 20px;background:${accent};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;font-size:15px;">${escapeHtml(template.contactButtonLabel || DEFAULT_LISTING_TEMPLATE.contactButtonLabel)}</a>`
      : "";

    return `<div style="margin-top:28px;padding:24px 18px;border:1px solid #e6ddd1;background:#fbfaf7;text-align:center;box-sizing:border-box;">${image}<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${primary};font-weight:bold;margin-bottom:8px;">Atelier Orlo</div><p style="max-width:620px;margin:0 auto;color:#4b463f;font-size:16px;line-height:1.65;">${escapeHtml(text)}</p>${button}</div>`;
  }

  function renderListingTemplate(product, config, details) {
    const template = { ...DEFAULT_LISTING_TEMPLATE, ...(config.listingTemplate || {}) };
    const primary = cleanColor(template.primaryColor, DEFAULT_LISTING_TEMPLATE.primaryColor);
    const accent = cleanColor(template.accentColor, DEFAULT_LISTING_TEMPLATE.accentColor);
    const background = cleanColor(template.backgroundColor, DEFAULT_LISTING_TEMPLATE.backgroundColor);
    const title = cleanTitle(details && details.title ? details.title : product.title, 120);
    const description =
      formalizeGermanAddress(sanitizeInlineHtml(product.description)) ||
      `<p>${escapeHtml(formalizeGermanAddress(toPlainText(product.description)))}</p>`;
    const topDescription = description || (template.intro ? `<p>${escapeHtml(template.intro)}</p>` : "");
    const suffix = String(config.descriptionSuffix || "").trim();
    const images = details && details.images ? details.images : buildProductImages(product, config);
    const gallery = renderPhotoGallery(images, title, template);
    const logoUrl = normalizeUrl(template.logoUrl);
    const logoBlock = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(template.shopName)}" style="display:block;max-width:170px;max-height:80px;height:auto;">`
      : `<div style="font-size:20px;font-weight:bold;color:${primary};letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(template.shopName)}</div>`;
    const highlightBlocks = [1, 2, 3, 4, 5]
      .map((index) =>
        renderHighlight(
          template[`highlight${index}Title`],
          template[`highlight${index}Text`],
          template[`highlight${index}IconUrl`],
          index,
        ),
      )
      .join("");

    const suffixBlock = suffix
      ? `<div style="margin-top:22px;padding:16px;border-left:4px solid ${accent};background:#fff7ef;color:#4b4038;line-height:1.6;">${escapeHtml(formalizeGermanAddress(suffix)).replace(/\n/g, "<br>")}</div>`
      : "";
    const optionLabel = cleanSpecificLabel(config.variationTraitName || product.option1Name || "Größe");
    const singleVariantBlock = details && details.optionValue
      ? `<div style="margin:0 0 22px;padding:13px 16px;border:1px solid #e6ddd1;background:#fbfaf7;border-radius:8px;box-sizing:border-box;text-align:center;"><span style="display:block;color:#6b6258;font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">${escapeHtml(optionLabel)}</span><strong style="display:block;color:#20201d;font-size:16px;line-height:1.4;">${escapeHtml(details.optionValue)}</strong></div>`
      : "";
    const noteBlock = String(template.noteText || "").trim()
      ? `<h2 style="margin:0 0 10px;font-size:20px;color:${primary};">${escapeHtml(template.noteTitle || "Hinweis")}</h2><p style="margin:0 0 18px;color:#4b463f;">${escapeHtml(formalizeGermanAddress(template.noteText))}</p>`
      : "";
    const contactBlock = renderContactBlock(template, primary, accent);

    return [
      `<div style="width:100%;max-width:none;margin:0;background:${background};color:#20201d;font-family:Arial,Helvetica,sans-serif;line-height:1.6;box-sizing:border-box;">`,
      `<div style="padding:18px;border:1px solid #e6ddd1;background:#fff;box-sizing:border-box;">`,
      `<div style="border-bottom:1px solid #e6ddd1;padding-bottom:16px;margin-bottom:22px;">`,
      logoBlock,
      `<div style="margin-top:12px;font-size:14px;color:#5a534b;">Schneller Versand nach Zahlungseingang<br>Kuratiertes Motiv, hochwertig gedruckt</div>`,
      `</div>`,
      gallery,
      `<div style="padding-top:4px;max-width:1120px;margin:0 auto 28px;">`,
      `<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${primary};font-weight:bold;margin-bottom:10px;">${escapeHtml(template.shopName)}</div>`,
      `<h1 style="margin:0 0 14px;font-size:28px;line-height:1.22;color:#20201d;font-family:Georgia,serif;font-weight:400;">${escapeHtml(title)}</h1>`,
      `<p style="margin:0 0 16px;color:#5a534b;font-size:16px;line-height:1.6;">${escapeHtml(template.headline)}</p>`,
      `<div style="width:68px;height:3px;background:${accent};margin:0 0 22px;"></div>`,
      topDescription
        ? `<div style="margin:0 0 20px;color:#39342f;font-size:16px;line-height:1.75;">${topDescription}</div>`
        : "",
      singleVariantBlock,
      `</div>`,
      `<div style="margin:26px 0 24px;text-align:center;">${highlightBlocks}</div>`,
      `<div style="border-top:1px solid #e6ddd1;padding-top:26px;margin-top:8px;">`,
      `<div style="margin-top:24px;">`,
      noteBlock,
      suffixBlock,
      `</div>`,
      `</div>`,
      `<div style="margin-top:26px;padding-top:16px;border-top:1px solid #e6ddd1;color:#6b6258;font-size:13px;">${escapeHtml(template.footerText)}</div>`,
      contactBlock,
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
    setIfPresent(headers, row, ["ShippingProfileName"], config.shippingProfileName || "");
    setIfPresent(headers, row, ["ReturnProfileName"], config.returnProfileName || "");
    setIfPresent(headers, row, ["PaymentProfileName"], config.paymentProfileName || "");
    setIfPresent(headers, row, ["Product:Brand"], config.brand || "Atelier Orlo");
    setIfPresent(headers, row, ["Product:MPN"], config.mpn || "Nicht zutreffend");
    setIfPresent(headers, row, ["Product:EAN"], config.ean || "Nicht zutreffend");
    setIfPresent(headers, row, ["Product:UPC"], config.upcValue || "Nicht zutreffend");
    setIfPresent(headers, row, ["Product:IncludePreFilledItemInformation"], "0");
    setIfPresent(headers, row, ["Product:IncludeStockPhotoURL"], "0");
    setIfPresent(headers, row, ["Product:ReturnSearchResultsOnDuplicates"], "0");
  }

  const COUNTRY_CODE_ALIASES = {
    DEUTSCHLAND: "DE",
    GERMANY: "DE",
    DEU: "DE",
    DE: "DE",
    SCHWEIZ: "CH",
    SWITZERLAND: "CH",
    CHE: "CH",
    CH: "CH",
    NORWEGEN: "NO",
    NORWAY: "NO",
    NOR: "NO",
    NO: "NO",
    "UNITED STATES": "US",
    USA: "US",
    US: "US",
    "UNITED KINGDOM": "GB",
    UK: "GB",
    GBR: "GB",
    GB: "GB",
    AUSTRIA: "AT",
    OSTERREICH: "AT",
    OESTERREICH: "AT",
    AUT: "AT",
    AT: "AT",
    FRANCE: "FR",
    FRANKREICH: "FR",
    FRA: "FR",
    FR: "FR",
    ITALY: "IT",
    ITALIEN: "IT",
    ITA: "IT",
    IT: "IT",
    SPAIN: "ES",
    SPANIEN: "ES",
    ESP: "ES",
    ES: "ES",
    NETHERLANDS: "NL",
    NIEDERLANDE: "NL",
    NLD: "NL",
    NL: "NL",
    POLAND: "PL",
    POLEN: "PL",
    POL: "PL",
    PL: "PL",
    SWEDEN: "SE",
    SCHWEDEN: "SE",
    SWE: "SE",
    SE: "SE",
    DENMARK: "DK",
    DAENEMARK: "DK",
    DNK: "DK",
    DK: "DK",
    BELGIUM: "BE",
    BELGIEN: "BE",
    BEL: "BE",
    BE: "BE",
    IRELAND: "IE",
    IRLAND: "IE",
    IRL: "IE",
    IE: "IE",
    FINLAND: "FI",
    FINNLAND: "FI",
    FIN: "FI",
    FI: "FI",
    PORTUGAL: "PT",
    PRT: "PT",
    PT: "PT",
    GREECE: "GR",
    GRIECHENLAND: "GR",
    GRC: "GR",
    GR: "GR",
    LUXEMBOURG: "LU",
    LUXEMBURG: "LU",
    LUX: "LU",
    LU: "LU",
    CZECHIA: "CZ",
    "CZECH REPUBLIC": "CZ",
    TSCHECHIEN: "CZ",
    CZE: "CZ",
    CZ: "CZ",
    SLOVAKIA: "SK",
    SLOWAKEI: "SK",
    SVK: "SK",
    SK: "SK",
    SLOVENIA: "SI",
    SLOWENIEN: "SI",
    SVN: "SI",
    SI: "SI",
    CROATIA: "HR",
    KROATIEN: "HR",
    HRV: "HR",
    HR: "HR",
    HUNGARY: "HU",
    UNGARN: "HU",
    HUN: "HU",
    HU: "HU",
    ROMANIA: "RO",
    RUMAENIEN: "RO",
    RUMANIEN: "RO",
    ROU: "RO",
    RO: "RO",
    BULGARIA: "BG",
    BULGARIEN: "BG",
    BGR: "BG",
    BG: "BG",
    ESTONIA: "EE",
    ESTLAND: "EE",
    EST: "EE",
    EE: "EE",
    LATVIA: "LV",
    LETTLAND: "LV",
    LVA: "LV",
    LV: "LV",
    LITHUANIA: "LT",
    LITAUEN: "LT",
    LTU: "LT",
    LT: "LT",
    MALTA: "MT",
    MLT: "MT",
    MT: "MT",
    CYPRUS: "CY",
    ZYPERN: "CY",
    CYP: "CY",
    CY: "CY",
  };

  const EU_OR_NI_COUNTRY_CODES = new Set([
    "AT",
    "BE",
    "BG",
    "CY",
    "CZ",
    "DE",
    "DK",
    "EE",
    "ES",
    "FI",
    "FR",
    "GR",
    "HR",
    "HU",
    "IE",
    "IT",
    "LT",
    "LU",
    "LV",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SE",
    "SI",
    "SK",
    "GB",
  ]);

  function normalizeCountryCode(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    const key = raw
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\./g, "")
      .replace(/\s+/g, " ");
    if (/^[A-Z]{2}$/.test(key)) {
      return key;
    }
    const mapped = COUNTRY_CODE_ALIASES[key] || "";
    return /^[A-Z]{2}$/.test(mapped) ? mapped : "";
  }

  function manufacturerEntries(config) {
    const manufacturer = config.manufacturer || {};
    if (!hasCompleteManufacturerAddress(manufacturer)) {
      return [];
    }
    return [
      ["Manufacturer Name", manufacturer.name],
      ["Manufacturer AddressLine1", manufacturer.addressLine1],
      ["Manufacturer AddressLine2", manufacturer.addressLine2],
      ["Manufacturer City", manufacturer.city],
      ["Manufacturer Country", normalizeCountryCode(manufacturer.country)],
      ["Manufacturer PostalCode", manufacturer.postalCode],
      ["Manufacturer StateOrProvince", manufacturer.stateOrProvince],
      ["Manufacturer Phone", manufacturer.phone],
      ["Manufacturer Email", manufacturer.email],
      ["Manufacturer ContactUrl", manufacturer.contactUrl],
    ].filter(([, value]) => String(value || "").trim());
  }

  function hasAnyManufacturerValue(manufacturer) {
    return Object.values(manufacturer || {}).some((value) => String(value || "").trim());
  }

  function hasCompleteManufacturerAddress(manufacturer) {
    const required = [
      manufacturer && manufacturer.name,
      manufacturer && manufacturer.addressLine1,
      manufacturer && manufacturer.city,
      manufacturer && manufacturer.postalCode,
      manufacturer && normalizeCountryCode(manufacturer.country),
    ];
    return required.every((value) => String(value || "").trim());
  }

  function manufacturerExportWarning(config) {
    const manufacturer = config.manufacturer || {};
    if (!hasAnyManufacturerValue(manufacturer) || hasCompleteManufacturerAddress(manufacturer)) {
      return "";
    }
    return "Herstellerdaten wurden nicht als eBay-GPSR-Spalten exportiert, weil Name, Straße, Ort, PLZ und Land nicht vollständig ausgefüllt sind. Das Land muss ein zweistelliger ISO-Code sein, z. B. DE oder NO. Sie erscheinen nur in der HTML-Beschreibung.";
  }

  function responsiblePersonEntries(config) {
    const responsiblePerson = config.responsiblePerson || {};
    if (!hasCompleteResponsiblePersonAddress(responsiblePerson)) {
      return [];
    }
    return [
      ["ResponsiblePerson CompanyName", responsiblePerson.name],
      ["ResponsiblePerson AddressLine1", responsiblePerson.addressLine1],
      ["ResponsiblePerson AddressLine2", responsiblePerson.addressLine2],
      ["ResponsiblePerson City", responsiblePerson.city],
      ["ResponsiblePerson Country", normalizeCountryCode(responsiblePerson.country)],
      ["ResponsiblePerson PostalCode", responsiblePerson.postalCode],
      ["ResponsiblePerson StateOrProvince", responsiblePerson.stateOrProvince],
      ["ResponsiblePerson Phone", responsiblePerson.phone],
      ["ResponsiblePerson Email", responsiblePerson.email],
      ["ResponsiblePerson ContactUrl", responsiblePerson.contactUrl],
      ["ResponsiblePerson Types", "EUResponsiblePerson"],
    ].filter(([, value]) => String(value || "").trim());
  }

  function hasAnyResponsiblePersonValue(responsiblePerson) {
    return Object.values(responsiblePerson || {}).some((value) => String(value || "").trim());
  }

  function hasCompleteResponsiblePersonAddress(responsiblePerson) {
    const required = [
      responsiblePerson && responsiblePerson.name,
      responsiblePerson && responsiblePerson.addressLine1,
      responsiblePerson && responsiblePerson.city,
      responsiblePerson && responsiblePerson.postalCode,
      responsiblePerson && normalizeCountryCode(responsiblePerson.country),
    ];
    return required.every((value) => String(value || "").trim());
  }

  function responsiblePersonExportWarning(config) {
    const responsiblePerson = config.responsiblePerson || {};
    if (!hasAnyResponsiblePersonValue(responsiblePerson) || hasCompleteResponsiblePersonAddress(responsiblePerson)) {
      return "";
    }
    return "EU-verantwortliche Person wurde nicht als eBay-GPSR-Spalten exportiert, weil Name, Straße, Ort, PLZ und Land nicht vollständig ausgefüllt sind. Das Land muss ein zweistelliger ISO-Code sein, z. B. DE.";
  }

  function gpsrResponsiblePersonRequiredWarning(config) {
    const manufacturerCountry = normalizeCountryCode(config.manufacturer && config.manufacturer.country);
    if (!manufacturerCountry || EU_OR_NI_COUNTRY_CODES.has(manufacturerCountry)) {
      return "";
    }
    if (hasCompleteResponsiblePersonAddress(config.responsiblePerson || {})) {
      return "";
    }
    return `Herstellerland ${manufacturerCountry} liegt nicht in EU/Nordirland. eBay kann deshalb zusätzlich eine EU-verantwortliche Person verlangen. Füllen Sie die Felder "EU-verantwortliche Person" aus, falls der Upload mit GPSR-Hinweis fehlschlägt.`;
  }

  function internationalShippingEntries(config) {
    if (!config.enableInternationalShipping) {
      return [];
    }
    return [
      ["ShippingType", config.shippingType || "Flat"],
      ["IntlShippingService-1:Option", config.internationalShippingService || ""],
      ["IntlShippingService-1:Cost", config.internationalShippingCost || "0"],
      ["IntlShippingService-1:Priority", "1"],
      ["IntlShippingService-1:Locations", config.internationalShippingLocations || "Europe"],
    ].filter(([, value]) => String(value || "").trim());
  }

  function vatEntries(config) {
    const vatPercent = String(config.vatPercent == null ? "" : config.vatPercent).trim();
    return vatPercent ? [["VATPercent", vatPercent]] : [];
  }

  function mergeOperationalHeaders(headers, config) {
    [
      ...vatEntries(config),
      ...manufacturerEntries(config),
      ...responsiblePersonEntries(config),
      ...internationalShippingEntries(config),
    ].forEach(([header]) => ensureHeader(headers, header));
  }

  function applyOperationalFields(row, config) {
    [
      ...vatEntries(config),
      ...manufacturerEntries(config),
      ...responsiblePersonEntries(config),
      ...internationalShippingEntries(config),
    ].forEach(([header, value]) => setIfHeader(row, header, value));
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
    const normalizeValue = (key, value) => {
      const label = cleanSpecificLabel(key).toLowerCase();
      const raw = String(value || "").trim();
      const lower = raw.toLowerCase();
      const replacements = {
        material: { papier: "Papier" },
        "authentizität": { reproduktion: "Reproduktion" },
        authentizitaet: { reproduktion: "Reproduktion" },
      };
      return limitSpecificValue((replacements[label] && replacements[label][lower]) || raw);
    };

    Object.entries(globalSpecifics).forEach(([key, value]) => {
      if (key && value) {
        output[normalizeKey(key)] = normalizeValue(key, value);
      }
    });

    selectedTagKeys.forEach((key) => {
      const value = product.tags[key];
      const outputKey = normalizeKey(tagKeyMap[key] || key);
      if (value) {
        output[outputKey] = normalizeValue(outputKey, value);
      }
    });

    return output;
  }

  function limitSpecificValue(value) {
    const maxLength = 65;
    const raw = String(value || "").trim();
    if (raw.length <= maxLength) {
      return raw;
    }

    const parts = raw
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      const kept = [];
      parts.forEach((part) => {
        const candidate = [...kept, part].join("; ");
        if (candidate.length <= maxLength) {
          kept.push(part);
        }
      });
      if (kept.length) {
        return kept.join("; ");
      }
    }

    return raw.slice(0, maxLength).replace(/[\s,;:-]+$/g, "");
  }

  function buildVariationSummary(product, traitName) {
    const safeTrait = relationshipSafeTrait(traitName);
    const values = unique(product.variants.map((variant, index) => relationshipSafeValue(variant.option1Value, `Option${index + 1}`)).filter(Boolean));
    if (!values.length) {
      return "";
    }
    return `${safeTrait}=${values.join(";")}`;
  }

  function buildVariationDetail(traitName, optionValue, index) {
    return `${relationshipSafeTrait(traitName)}=${relationshipSafeValue(optionValue, `Option${index + 1}`)}`;
  }

  function normalizeRelationshipDetailsHeader(headers) {
    const exact = headers.find((header) => /^RelationshipDetails$/i.test(header));
    if (exact) {
      return exact;
    }
    const spacedIndex = headers.findIndex((header) => /^Relationship details$/i.test(header) || /^Relationship detail$/i.test(header));
    if (spacedIndex >= 0) {
      headers[spacedIndex] = "RelationshipDetails";
      return "RelationshipDetails";
    }
    return ensureHeader(headers, "RelationshipDetails");
  }

  function normalizeVariantUpcHeader(headers) {
    const exact = headers.find((header) => /^P:UPC$/i.test(header));
    if (exact) {
      return exact;
    }
    const upcIndex = headers.findIndex((header) => /^UPC$/i.test(header) || /^Product:UPC$/i.test(header));
    if (upcIndex >= 0) {
      headers[upcIndex] = "P:UPC";
      return "P:UPC";
    }
    return ensureHeader(headers, "P:UPC");
  }

  function pickActionValue(actionHeader, config) {
    if (config.actionValue) {
      return config.actionValue;
    }

    const header = String(actionHeader || "");
    if (/^\*?Action/i.test(header) || /Version=/i.test(header)) {
      return config.verifyOnly ? "VerifyAdd" : "Add";
    }
    return "Draft";
  }

  function defaultRelationshipDetailsHeader(actionHeader) {
    return "RelationshipDetails";
  }

  function isReviseAction(actionValue) {
    return /^Revise/i.test(String(actionValue || "").trim());
  }

  function findReviseItemId(map, product, variants, parentIndex) {
    const ordered = map.lineOrder[parentIndex];
    if (ordered) {
      return ordered;
    }
    const handleSku = makeSku(product.handle);
    if (map.bySku[handleSku]) {
      return map.bySku[handleSku];
    }
    const firstVariantSku = variants && variants[0] && variants[0].sku;
    if (firstVariantSku && map.bySku[firstVariantSku]) {
      return map.bySku[firstVariantSku];
    }
    if (product.title && map.byTitle[product.title]) {
      return map.byTitle[product.title];
    }
    return "";
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
      quantity: 3,
      maxImages: 5,
      listingMode: "variants",
      variationTraitName: "Größe",
      verifyOnly: true,
      actionValue: "",
      extraImageUrls: "",
      productExtraImageUrls: "",
      extraImagesPosition: "after-main",
      extraImagesPositionIndex: "",
      itemIdMapText: "",
      upcValue: "",
      priceMultiplier: 1,
      priceAdd: 0,
      roundTo: 0,
      vatPercent: "19",
      shippingProfileName: "",
      returnProfileName: "",
      paymentProfileName: "",
      manufacturer: {},
      responsiblePerson: {},
      enableInternationalShipping: false,
      shippingType: "Flat",
      internationalShippingService: "",
      internationalShippingCost: "0",
      internationalShippingLocations: "Europe",
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
    const hasVariantMode = config.listingMode === "variants";
    const upcHeader = hasVariantMode ? normalizeVariantUpcHeader(headers) : findHeader(headers, "upc") || ensureHeader(headers, "UPC");
    const priceHeader = findHeader(headers, "price") || ensureHeader(headers, "Price");
    const quantityHeader = findHeader(headers, "quantity") || ensureHeader(headers, "Quantity");
    const photosHeader = findHeader(headers, "photos") || ensureHeader(headers, "Item photo URL");
    const conditionHeader = findHeader(headers, "condition") || ensureHeader(headers, "Condition ID");
    const descriptionHeader = findHeader(headers, "description") || ensureHeader(headers, "Description");
    const formatHeader = findHeader(headers, "format") || ensureHeader(headers, "Format");
    const relationshipHeader = findHeader(headers, "relationship") || ensureHeader(headers, "Relationship");
    const relationshipDetailsHeader = hasVariantMode
      ? normalizeRelationshipDetailsHeader(headers)
      : findHeader(headers, "relationshipDetails") || ensureHeader(headers, defaultRelationshipDetailsHeader(actionHeader));
    const actionValue = pickActionValue(actionHeader, config);
    const reviseMode = isReviseAction(actionValue);
    const itemIdHeader = reviseMode ? ensureHeader(headers, "ItemID") : findExactHeader(headers, ["ItemID", "Item ID"]);
    const itemIdMap = reviseMode ? parseItemIdMappings(config.itemIdMapText) : { lineOrder: [], bySku: {}, byTitle: {} };

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
    mergeOperationalHeaders(headers, config);

    const rows = [];
    const warnings = [];
    const manufacturerWarning = manufacturerExportWarning(config);
    if (manufacturerWarning) {
      warnings.push(manufacturerWarning);
    }
    const responsiblePersonWarning = responsiblePersonExportWarning(config);
    if (responsiblePersonWarning) {
      warnings.push(responsiblePersonWarning);
    }
    const gpsrResponsiblePersonWarning = gpsrResponsiblePersonRequiredWarning(config);
    if (gpsrResponsiblePersonWarning) {
      warnings.push(gpsrResponsiblePersonWarning);
    }
    const assetWarning = embeddedAssetWarning(config);
    if (assetWarning) {
      warnings.push(assetWarning);
    }
    let productsWithVariants = 0;
    let productsWithoutImages = 0;
    let usedImages = 0;
    let reviseParentIndex = 0;

    analysis.products.forEach((product) => {
      const variants = product.variants.length ? product.variants : [{ sku: product.handle, price: product.firstPrice }];
      const hasVariants = config.listingMode === "variants" && variants.length > 1;
      const traitName = config.variationTraitName || product.option1Name || "Größe";
      const singleVariantValue = !hasVariants && variants[0] && variants[0].option1Value ? variants[0].option1Value : "";
      const photoUrls = buildProductImages(product, config).slice(0, Number(config.maxImages || 5));
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
          setIfHeader(flat, productNameHeader, cleanTitle(`${product.title} - ${optionValue}`, 80));
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
              images: photoUrls,
            }),
          );
          setIfHeader(flat, formatHeader, config.format);
          applyTemplateDefaults(headers, flat, config);
          applyOperationalFields(flat, config);
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
      if (reviseMode) {
        const itemId = findReviseItemId(itemIdMap, product, variants, reviseParentIndex);
        if (itemId) {
          setIfHeader(parent, itemIdHeader, itemId);
        } else {
          warnings.push(`${product.handle}: keine ItemID für Revise gefunden. Lade die eBay-Ergebnisdatei oder einen Active-Listings-Export mit ItemID hoch.`);
        }
        reviseParentIndex += 1;
      }
      setIfHeader(parent, skuHeader, hasVariants ? "" : makeSku(product.handle));
      setIfHeader(parent, productNameHeader, cleanTitle(product.title, 80));
      setIfHeader(parent, categoryHeader, config.categoryId);
      setIfHeader(parent, titleHeader, cleanTitle(product.title, 80));
      setIfHeader(parent, upcHeader, hasVariants ? "" : config.upcValue);
      setIfHeader(parent, photosHeader, photos);
      setIfHeader(parent, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
      setIfHeader(
        parent,
        descriptionHeader,
        buildDescription(product, config, {
          title: product.title,
          price: hasVariants ? "" : formatPrice(variants[0].price, config),
          optionValue: singleVariantValue,
          images: photoUrls,
        }),
      );
      setIfHeader(parent, formatHeader, config.format);
      applyTemplateDefaults(headers, parent, config);
      applyOperationalFields(parent, config);

      if (hasVariants) {
        setIfHeader(parent, relationshipDetailsHeader, buildVariationSummary(product, traitName));
      } else {
        setIfHeader(parent, priceHeader, formatPrice(variants[0].price, config));
        setIfHeader(parent, quantityHeader, config.quantity);
        if (singleVariantValue) {
          const sizeHeader = addSpecificPrefix(traitName);
          if (!headers.includes(sizeHeader)) {
            headers.push(sizeHeader);
            rows.forEach((row) => {
              row[sizeHeader] = "";
            });
            parent[sizeHeader] = "";
          }
          parent[sizeHeader] = limitSpecificValue(singleVariantValue);
        }
      }

      Object.entries(specifics).forEach(([key, value]) => {
        if (headers.includes(key)) {
          parent[key] = value;
        }
      });

      rows.push(parent);

      if (hasVariants) {
        variants.forEach((variant, index) => {
          const child = createEmptyRow(headers);
          const optionValue = variant.option1Value || "Standard";
          setIfHeader(child, skuHeader, variant.sku);
          setIfHeader(child, priceHeader, formatPrice(variant.price, config));
          setIfHeader(child, quantityHeader, config.quantity);
          setIfHeader(child, upcHeader, config.upcValue || "Does not apply");
          setIfHeader(child, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
          setIfHeader(child, relationshipHeader, "Variation");
          setIfHeader(child, relationshipDetailsHeader, buildVariationDetail(traitName, optionValue, index));
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
