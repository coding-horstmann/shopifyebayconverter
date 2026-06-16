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
    Marke: "Kunstgalerie Niklas",
    Produktart: "Poster",
    Material: "200 g/m² Papier",
    Rahmung: "Ungerahmt",
    Herstellungsart: "Kunstdruck",
  };

  const AMAZON_CUSTOM_HEADERS = [
    "item_sku",
    "parent_sku",
    "parent_child",
    "relationship_type",
    "variation_theme",
    "product_type",
    "item_name",
    "brand_name",
    "manufacturer",
    "external_product_id",
    "external_product_id_type",
    "product_description",
    "bullet_point1",
    "bullet_point2",
    "bullet_point3",
    "bullet_point4",
    "bullet_point5",
    "standard_price",
    "quantity",
    "condition_type",
    "batteries_required",
    "batteries_included",
    "contains_battery_or_cell",
    "main_image_url",
    "other_image_url1",
    "other_image_url2",
    "other_image_url3",
    "other_image_url4",
    "other_image_url5",
    "size_name",
    "color_name",
    "material_type",
    "style_name",
    "theme",
    "artist",
    "era",
    "country_of_origin",
    "update_delete",
    "product_tax_code",
    "merchant_shipping_group_name",
  ];

  const AMAZON_DE_MARKETPLACE = "A1PA6795UKMFR9";
  const AMAZON_DE_LANGUAGE = "de_DE";
  const amazonAttr = {
    action: "::record_action",
    sku: "contribution_sku#1.value",
    productType: "product_type#1.value",
    parentage: `parentage_level[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    parentSku: `child_parent_sku_relationship[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.parent_sku`,
    variationTheme: "variation_theme#1.name",
    itemName: `item_name[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    titleDifferentiation: `title_differentiation[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    brand: `brand[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    productIdType: "amzn1.volt.ca.product_id_type",
    productIdValue: "amzn1.volt.ca.product_id_value",
    browseNode1: `recommended_browse_nodes[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    packageLevel: `package_level[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    modelNumber: `model_number[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    modelName: `model_name[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    manufacturer: `manufacturer[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    mainProductImage: `main_product_image_locator[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage1: `other_product_image_locator_1[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage2: `other_product_image_locator_2[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage3: `other_product_image_locator_3[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage4: `other_product_image_locator_4[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage5: `other_product_image_locator_5[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage6: `other_product_image_locator_6[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage7: `other_product_image_locator_7[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    otherProductImage8: `other_product_image_locator_8[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.media_location`,
    productDescription: `product_description[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    bullet1: `bullet_point[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    bullet2: `bullet_point[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#2.value`,
    bullet3: `bullet_point[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#3.value`,
    bullet4: `bullet_point[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#4.value`,
    bullet5: `bullet_point[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#5.value`,
    specialFeature1: `special_feature[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    specialFeature2: `special_feature[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#2.value`,
    specialFeature3: `special_feature[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#3.value`,
    specialFeature4: `special_feature[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#4.value`,
    specialFeature5: `special_feature[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#5.value`,
    style: `style[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    ageRange: `age_range_description[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    material1: `material[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    material2: `material[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#2.value`,
    numberOfItems: `number_of_items[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    itemPackageQuantity: `item_package_quantity[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    subjectCharacter: `subject_character[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    color: `color[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    colorFamily1: `color_family[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    colorFamily2: `color_family[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#2.value`,
    colorFamily3: `color_family[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#3.value`,
    colorFamily4: `color_family[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#4.value`,
    colorFamily5: `color_family[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#5.value`,
    size: `size[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    theme: `theme[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    paperSizeValue: `paper_size[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    paperSizeUnit: `paper_size[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.unit`,
    printMediaType: `print_media_type[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    paperFinish: `paper_finish[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    orientation: `orientation[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    finishType: `finish_type[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    unitCountValue: `unit_count[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    unitCountType: `unit_count[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.type[language_tag=${AMAZON_DE_LANGUAGE}].value`,
    roomType: `room_type[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    indoorOutdoorUsage: `indoor_outdoor_usage[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    itemLength: `item_length_width[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.length.value`,
    itemLengthUnit: `item_length_width[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.length.unit`,
    itemWidth: `item_length_width[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.width.value`,
    itemWidthUnit: `item_length_width[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.width.unit`,
    wallArtForm: `wall_art_form[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    baseMaterial: `base_material[marketplace_id=${AMAZON_DE_MARKETPLACE}][language_tag=${AMAZON_DE_LANGUAGE}]#1.value`,
    isFramed: `is_framed[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    isOriginalArtwork: `is_original_artwork[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    conditionType: `condition_type[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    listPrice: `list_price[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value_with_tax`,
    taxCode: "product_tax_code#1.value",
    fulfillmentChannel: "fulfillment_availability#1.fulfillment_channel_code",
    quantity: "fulfillment_availability#1.quantity",
    leadTime: "fulfillment_availability#1.lead_time_to_ship_max_days",
    price: `purchasable_offer[marketplace_id=${AMAZON_DE_MARKETPLACE}][audience=ALL]#1.our_price#1.schedule#1.value_with_tax`,
    countryOfOrigin: `country_of_origin[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    dsaResponsiblePartyAddress: `dsa_responsible_party_address[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    gpsrSafetyAttestation: `gpsr_safety_attestation[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    gpsrManufacturerEmail: `gpsr_manufacturer_reference[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.gpsr_manufacturer_email_address`,
    batteriesRequired: `batteries_required[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    batteriesIncluded: `batteries_included[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    batteryLifePercentage: `supplemental_condition_information[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.battery_life_percentage`,
    containsBatteryOrCell: `contains_battery_or_cell[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
    hasMultipleBatteryPoweredComponents: `has_multiple_battery_powered_components[marketplace_id=${AMAZON_DE_MARKETPLACE}]#1.value`,
  };

  const AMAZON_WALL_ART_HEADERS = [
    amazonAttr.sku,
    amazonAttr.action,
    amazonAttr.productType,
    amazonAttr.parentage,
    amazonAttr.parentSku,
    amazonAttr.variationTheme,
    amazonAttr.itemName,
    amazonAttr.titleDifferentiation,
    amazonAttr.brand,
    amazonAttr.productIdType,
    amazonAttr.productIdValue,
    amazonAttr.browseNode1,
    amazonAttr.packageLevel,
    amazonAttr.modelNumber,
    amazonAttr.modelName,
    amazonAttr.manufacturer,
    amazonAttr.mainProductImage,
    amazonAttr.otherProductImage1,
    amazonAttr.otherProductImage2,
    amazonAttr.otherProductImage3,
    amazonAttr.otherProductImage4,
    amazonAttr.otherProductImage5,
    amazonAttr.otherProductImage6,
    amazonAttr.otherProductImage7,
    amazonAttr.otherProductImage8,
    amazonAttr.productDescription,
    amazonAttr.bullet1,
    amazonAttr.bullet2,
    amazonAttr.bullet3,
    amazonAttr.bullet4,
    amazonAttr.bullet5,
    amazonAttr.specialFeature1,
    amazonAttr.specialFeature2,
    amazonAttr.specialFeature3,
    amazonAttr.specialFeature4,
    amazonAttr.specialFeature5,
    amazonAttr.style,
    amazonAttr.ageRange,
    amazonAttr.material1,
    amazonAttr.material2,
    amazonAttr.numberOfItems,
    amazonAttr.itemPackageQuantity,
    amazonAttr.subjectCharacter,
    amazonAttr.color,
    amazonAttr.colorFamily1,
    amazonAttr.colorFamily2,
    amazonAttr.colorFamily3,
    amazonAttr.colorFamily4,
    amazonAttr.colorFamily5,
    amazonAttr.size,
    amazonAttr.theme,
    amazonAttr.paperSizeValue,
    amazonAttr.paperSizeUnit,
    amazonAttr.printMediaType,
    amazonAttr.paperFinish,
    amazonAttr.orientation,
    amazonAttr.finishType,
    amazonAttr.unitCountValue,
    amazonAttr.unitCountType,
    amazonAttr.roomType,
    amazonAttr.indoorOutdoorUsage,
    amazonAttr.itemLength,
    amazonAttr.itemLengthUnit,
    amazonAttr.itemWidth,
    amazonAttr.itemWidthUnit,
    amazonAttr.wallArtForm,
    amazonAttr.baseMaterial,
    amazonAttr.isFramed,
    amazonAttr.isOriginalArtwork,
    amazonAttr.conditionType,
    amazonAttr.listPrice,
    amazonAttr.taxCode,
    amazonAttr.fulfillmentChannel,
    amazonAttr.quantity,
    amazonAttr.leadTime,
    amazonAttr.price,
    amazonAttr.countryOfOrigin,
    amazonAttr.dsaResponsiblePartyAddress,
    amazonAttr.gpsrSafetyAttestation,
    amazonAttr.gpsrManufacturerEmail,
    amazonAttr.batteryLifePercentage,
    amazonAttr.batteriesRequired,
    amazonAttr.batteriesIncluded,
    amazonAttr.containsBatteryOrCell,
    amazonAttr.hasMultipleBatteryPoweredComponents,
  ];

  const DEFAULT_LISTING_TEMPLATE = {
    enabled: true,
    shopName: "",
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
    contactHeading: "",
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
    const candidates = [",", ";", "\t"];
    const sample = String(text || "").slice(0, 200000);
    const scores = candidates.map((delimiter) => {
      const rows = parseCsvRows(sample, delimiter)
        .filter((row) => row.some((cell) => String(cell || "").trim()))
        .slice(0, 12);
      const counts = rows.map((row) => row.length).filter((count) => count > 1);
      const maxColumns = counts.length ? Math.max(...counts) : 0;
      const consistency = counts.filter((count) => count === maxColumns).length;
      return {
        delimiter,
        score: maxColumns * 100 + consistency * 10 + counts.length,
      };
    });
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

  function normalizeCsvCell(value) {
    if (value == null) {
      return "";
    }
    return String(value).replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
  }

  function objectsToCsv(headers, rows, delimiter, infoRows) {
    const lines = [];
    (infoRows || []).forEach((line) => lines.push(line));
    lines.push(headers.map((header) => csvEscape(header, delimiter)).join(delimiter));
    rows.forEach((row) => {
      lines.push(headers.map((header) => csvEscape(normalizeCsvCell(row[header]), delimiter)).join(delimiter));
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

  function formatTitleDimension(value) {
    return String(value || "")
      .replace(",", ".")
      .replace(/\.0+\b/g, "")
      .trim();
  }

  function extractTitleCmSize(value) {
    const match = String(value || "").match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/i);
    if (!match) {
      return "";
    }
    return `${formatTitleDimension(match[1])}x${formatTitleDimension(match[2])} cm`;
  }

  function normalizedTitleSize(value) {
    return asciiFold(value)
      .toLowerCase()
      .replace(/×/g, "x")
      .replace(/\s+/g, "");
  }

  function titleAlreadyContainsSize(title, size) {
    return Boolean(size) && normalizedTitleSize(title).includes(normalizedTitleSize(size));
  }

  function buildListingTitle(baseTitle, suffix, maxLength, middleParts) {
    const cleanBase = cleanTitle(baseTitle, 500);
    const middle = unique(middleParts || [])
      .map((part) => cleanTitle(part, 80))
      .filter((part) => part && !titleAlreadyContainsSize(cleanBase, part))
      .map((part) => ` - ${part}`)
      .join("");
    const cleanSuffix = cleanTitle(suffix, maxLength).replace(/^[\s,;:|/-]+/g, "").trim();
    const baseWithMiddle = `${cleanBase}${middle}`;
    if (!cleanSuffix) {
      if (baseWithMiddle.length <= maxLength) {
        return baseWithMiddle;
      }
      if (middle && middle.length < maxLength) {
        const baseLimit = maxLength - middle.length;
        const trimmedBase = cleanBase.slice(0, baseLimit).trim().replace(/[\s,;:|/-]+$/g, "");
        return cleanTitle(`${trimmedBase}${middle}`, maxLength);
      }
      return cleanTitle(baseWithMiddle, maxLength);
    }
    if (baseWithMiddle.toLowerCase().endsWith(cleanSuffix.toLowerCase())) {
      return cleanTitle(baseWithMiddle, maxLength);
    }

    const suffixPart = ` ${cleanSuffix}`;
    const combined = `${baseWithMiddle}${suffixPart}`;
    if (combined.length <= maxLength) {
      return combined;
    }
    if (suffixPart.length >= maxLength) {
      return cleanTitle(combined, maxLength);
    }

    if (middle && middle.length + suffixPart.length < maxLength) {
      const baseLimit = maxLength - middle.length - suffixPart.length;
      const trimmedBase = cleanBase.slice(0, baseLimit).trim().replace(/[\s,;:|/-]+$/g, "");
      return cleanTitle(`${trimmedBase}${middle}${suffixPart}`, maxLength);
    }

    const baseLimit = maxLength - suffixPart.length;
    const trimmedBase = cleanBase.slice(0, baseLimit).trim().replace(/[\s,;:|/-]+$/g, "");
    return cleanTitle(`${trimmedBase}${suffixPart}`, maxLength);
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

  function toParagraphText(html) {
    return stripScripts(html)
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
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

  function cleanAmazonText(value, maxLength) {
    const clean = String(value || "")
      .replace(/\t/g, " ")
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return maxLength && clean.length > maxLength ? clean.slice(0, maxLength).trim() : clean;
  }

  function cleanAmazonDescriptionText(value, maxLength) {
    const clean = String(value || "")
      .replace(/\t/g, " ")
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return maxLength && clean.length > maxLength ? clean.slice(0, maxLength).trim() : clean;
  }

  function cleanAmazonEmail(value) {
    return cleanAmazonText(value, 254);
  }

  function amazonBooleanValue(value) {
    const normalized = String(value == null ? "" : value).trim().toLowerCase();
    if (!normalized) {
      return "";
    }
    if (["1", "true", "yes", "ja", "y"].includes(normalized)) {
      return "Ja";
    }
    if (["0", "false", "no", "nein", "n"].includes(normalized)) {
      return "Nein";
    }
    return cleanAmazonText(value, 20);
  }

  function amazonGpsrManufacturerEmail(config) {
    return cleanAmazonEmail(config.amazonGpsrManufacturerEmail || (config.manufacturer && config.manufacturer.email) || "");
  }

  function amazonGpsrResponsiblePartyEmail(config) {
    return cleanAmazonEmail(config.amazonGpsrResponsiblePartyEmail || (config.responsiblePerson && config.responsiblePerson.email) || "");
  }

  function amazonSizeName(value, fallback) {
    return cleanAmazonText(value || fallback || "Standard", 80);
  }

  function amazonParentSku(product) {
    return makeSku(`${product.handle}-parent`);
  }

  function amazonShortSkuBase(product) {
    const slug = slugPart(product.handle || product.title || "poster")
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase();
    return `AO-${slug || "POSTER"}-${shortHash(product.handle || product.title).toUpperCase()}`.slice(0, 24);
  }

  function amazonWallArtParentSku(product) {
    return `${amazonShortSkuBase(product)}-P`.slice(0, 32);
  }

  function amazonVariantCode(value, fallbackIndex) {
    const raw = String(value || "").trim();
    const sizeMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);
    if (sizeMatch) {
      return `${formatTitleDimension(sizeMatch[1])}X${formatTitleDimension(sizeMatch[2])}`.replace(/[^A-Z0-9]+/gi, "").slice(0, 12);
    }
    const slug = slugPart(raw).replace(/-/g, "").toUpperCase().slice(0, 12);
    return slug || `V${fallbackIndex + 1}`;
  }

  function amazonWallArtVariantSku(product, variant, index) {
    return `${amazonShortSkuBase(product)}-${amazonVariantCode(variant && variant.option1Value, index)}`.slice(0, 40);
  }

  function parseCmDimensions(value) {
    const match = String(value || "").match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/i);
    if (!match) {
      return { length: "", width: "" };
    }
    const first = Number.parseFloat(String(match[1]).replace(",", "."));
    const second = Number.parseFloat(String(match[2]).replace(",", "."));
    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      return { length: "", width: "" };
    }
    return {
      length: String(Math.max(first, second)).replace(".", ","),
      width: String(Math.min(first, second)).replace(".", ","),
    };
  }

  function amazonPosterSize(product, variant) {
    const raw = (variant && variant.option1Value) || extractTitleCmSize(product.title);
    return raw ? cleanAmazonText(raw, 80) : "";
  }

  function amazonDimensionsFor(product, variant) {
    const size = amazonPosterSize(product, variant);
    return parseCmDimensions(size || product.title);
  }

  function numericPriceValue(value) {
    const price = Number.parseFloat(String(value || "").replace(",", "."));
    return Number.isFinite(price) ? price : Number.MAX_SAFE_INTEGER;
  }

  function variantArea(product, variant) {
    const dimensions = amazonDimensionsFor(product, variant);
    const length = Number.parseFloat(String(dimensions.length || "").replace(",", "."));
    const width = Number.parseFloat(String(dimensions.width || "").replace(",", "."));
    return Number.isFinite(length) && Number.isFinite(width) ? length * width : Number.MAX_SAFE_INTEGER;
  }

  function orderAmazonVariants(product, variants, config) {
    if (String(config.amazonVariantOrder || "price-asc") === "shopify") {
      return variants.slice();
    }
    return variants
      .map((variant, index) => ({ variant, index }))
      .sort((left, right) => {
        const priceDiff = numericPriceValue(left.variant && left.variant.price) - numericPriceValue(right.variant && right.variant.price);
        if (priceDiff !== 0) {
          return priceDiff;
        }
        const areaDiff = variantArea(product, left.variant) - variantArea(product, right.variant);
        return areaDiff || left.index - right.index;
      })
      .map((entry) => entry.variant);
  }

  function normalizeAmazonCondition(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized || normalized === "new_new" || normalized === "new" || normalized === "1000") {
      return "Neu";
    }
    if (normalized.includes("gebraucht") || normalized === "used") {
      return "Gebraucht";
    }
    return cleanAmazonText(value, 40);
  }

  function appendAmazonTitleSuffix(title, suffix, maxLength) {
    const clean = cleanAmazonText(title, maxLength || 200);
    const add = cleanAmazonText(suffix, 80);
    if (!add) {
      return clean;
    }
    const existingWords = new Set(
      clean
        .toLowerCase()
        .split(/[^a-z0-9äöüß]+/i)
        .filter(Boolean),
    );
    const missingWords = add
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word && !existingWords.has(word.toLowerCase()));
    if (!missingWords.length) {
      return clean;
    }
    return cleanAmazonText(`${clean} ${missingWords.join(" ")}`, maxLength || 200);
  }

  function stripLeadingAmazonBrand(title, brand, config) {
    if (config.amazonStripBrandFromTitle === false) {
      return title;
    }
    const cleanTitleValue = String(title || "").trim();
    const cleanBrand = String(brand || "").trim();
    if (!cleanTitleValue || !cleanBrand) {
      return cleanTitleValue;
    }
    const escapedBrand = cleanBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return cleanTitleValue.replace(new RegExp(`^${escapedBrand}\\s*[-–—:|]*\\s*`, "i"), "").trim();
  }

  function amazonWallArtTitle(product, variant, config) {
    const suffix = config.amazonTitleSuffix == null ? "Poster Wandkunst" : config.amazonTitleSuffix;
    const brand = cleanAmazonText(config.amazonBrand || product.vendor || "Atelier Orlo", 80);
    const size = amazonPosterSize(product, variant);
    const baseTitle = stripLeadingAmazonBrand(product.title, brand, config);
    const titleWithSize = size && !titleAlreadyContainsSize(baseTitle, size) ? `${baseTitle} - ${size}` : baseTitle;
    return appendAmazonTitleSuffix(titleWithSize, suffix, 200);
  }

  function amazonTheme(tags) {
    return cleanAmazonText(tags.Thema || tags.Motiv || "Vintage Poster", 120);
  }

  function normalizeAmazonColor(value) {
    const raw = String(value || "")
      .replace(/\b\d+\b/g, "")
      .replace(/[;|/]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) {
      return "Mehrfarbig";
    }
    const colorMap = [
      [/beige|creme|sand/i, "Beige"],
      [/gelb|yellow|gold/i, "Gelb"],
      [/blau|blue|navy|tuerkis|türkis/i, "Blau"],
      [/rot|red|burgund|wein/i, "Rot"],
      [/gruen|grün|green/i, "Grün"],
      [/rosa|pink|rose/i, "Rosa"],
      [/orange/i, "Orange"],
      [/braun|brown/i, "Braun"],
      [/schwarz|black/i, "Schwarz"],
      [/weiss|weiß|white/i, "Weiß"],
      [/grau|gray|grey|silber/i, "Grau"],
      [/lila|violett|purple/i, "Lila"],
      [/mehrfarbig|multi|bunt/i, "Mehrfarbig"],
    ];
    const matches = [];
    colorMap.forEach(([pattern, label]) => {
      if (pattern.test(raw) && !matches.includes(label)) {
        matches.push(label);
      }
    });
    if (matches.length) {
      return matches.slice(0, 3).join("; ");
    }
    return cleanAmazonText(
      raw
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" "),
      80,
    );
  }

  function amazonColor(tags) {
    return normalizeAmazonColor(tags.Farbe || tags.Farbfamilie || "Mehrfarbig");
  }

  function amazonColorFamilies(tags) {
    return amazonColor(tags)
      .split(";")
      .map((part) => cleanAmazonText(part, 40))
      .filter(Boolean)
      .slice(0, 3);
  }

  function amazonStyle(tags) {
    return cleanAmazonText(tags.Kunststil || tags.Stil || "Retro Vintage", 120);
  }

  function amazonOriginCountry(config) {
    return cleanAmazonText(config.amazonCountryOfOrigin || "Deutschland", 80);
  }

  function amazonBrowseNodeValue(config) {
    const raw = cleanAmazonText(config.amazonBrowseNode || "Poster & Kunstdrucke (372854011)", 120);
    if (raw === "372854011") {
      return "Poster & Kunstdrucke (372854011)";
    }
    return raw;
  }

  function normalizeAmazonVariationTheme(value) {
    const raw = String(value || "").trim();
    const ascii = raw
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();
    if (!raw || /gr.sse/i.test(raw) || ascii === "grosse" || ascii === "groesse" || ascii === "size") {
      return "GR\u00d6SSE";
    }
    return cleanAmazonText(raw, 80);
  }

  function amazonVariationTheme(config, hasVariants) {
    if (!hasVariants) {
      return "";
    }
    return normalizeAmazonVariationTheme(config.amazonVariationTheme);
  }

  function amazonProductIdType(config) {
    const raw = String(config.amazonProductIdType || "").trim();
    if (!raw || /gtin-freistellung|keine produktkennung|ohne produktkennung/i.test(raw)) {
      return "GTIN-Freistellung";
    }
    return cleanAmazonText(raw, 80);
  }

  function amazonWallArtRow(headers, values) {
    return amazonRow(headers, values);
  }

  function titleWithoutAmazonSuffix(product, config) {
    const brand = cleanAmazonText(config.amazonBrand || product.vendor || "Atelier Orlo", 80);
    return stripLeadingAmazonBrand(product.title, brand, config);
  }

  function amazonBrandName(product, config) {
    const mode = String(config.amazonBrandMode || "none").toLowerCase();
    if (config.amazonNoBrand === true || ["none", "no-brand", "generic", "ohne-marke"].includes(mode)) {
      return "Generic";
    }
    return cleanAmazonText(config.amazonBrand || product.vendor || "Atelier Orlo", 50);
  }

  function amazonWallArtRowsForProduct(product, config) {
    const sourceVariants = product.variants.length ? product.variants : [{ sku: product.handle, price: product.firstPrice, option1Value: "" }];
    const variants = orderAmazonVariants(product, sourceVariants, config);
    const hasVariants = config.amazonUseVariations !== false && variants.length > 1;
    const parentSku = amazonWallArtParentSku(product);
    const images = buildProductImages(product, config).slice(0, Math.min(9, Number(config.maxImages || 9)));
    const bullets = amazonBullets(product, config);
    const tags = product.tags || {};
    const brand = amazonBrandName(product, config);
    const manufacturer = cleanAmazonText(config.amazonManufacturer || product.vendor || "Atelier Orlo", 80);
    const colorFamilies = amazonColorFamilies(tags);
    const common = {
      [amazonAttr.action]: "Vollständiges Update",
      [amazonAttr.productType]: "WALL_ART",
      [amazonAttr.variationTheme]: amazonVariationTheme(config, hasVariants),
      [amazonAttr.brand]: brand,
      [amazonAttr.productIdType]: amazonProductIdType(config),
      [amazonAttr.productIdValue]: "",
      [amazonAttr.browseNode1]: amazonBrowseNodeValue(config),
      [amazonAttr.packageLevel]: "Einheit",
      [amazonAttr.manufacturer]: manufacturer,
      [amazonAttr.mainProductImage]: images[0] || "",
      [amazonAttr.otherProductImage1]: images[1] || "",
      [amazonAttr.otherProductImage2]: images[2] || "",
      [amazonAttr.otherProductImage3]: images[3] || "",
      [amazonAttr.otherProductImage4]: images[4] || "",
      [amazonAttr.otherProductImage5]: images[5] || "",
      [amazonAttr.otherProductImage6]: images[6] || "",
      [amazonAttr.otherProductImage7]: images[7] || "",
      [amazonAttr.otherProductImage8]: images[8] || "",
      [amazonAttr.productDescription]: amazonProductDescription(product, config),
      [amazonAttr.bullet1]: bullets[0],
      [amazonAttr.bullet2]: bullets[1],
      [amazonAttr.bullet3]: bullets[2],
      [amazonAttr.bullet4]: bullets[3],
      [amazonAttr.bullet5]: bullets[4],
      [amazonAttr.specialFeature1]: "FSC-zertifiziertes Premiumpapier",
      [amazonAttr.specialFeature2]: "200 g/m² Papiergewicht",
      [amazonAttr.specialFeature3]: "Matte Oberfläche",
      [amazonAttr.specialFeature4]: "Hochauflösender Druck",
      [amazonAttr.specialFeature5]: tags.Epoche ? `Reproduktion eines historischen Originals: ${tags.Epoche}` : "Historische Reproduktion",
      [amazonAttr.style]: amazonStyle(tags),
      [amazonAttr.ageRange]: "Erwachsener",
      [amazonAttr.material1]: "Papier",
      [amazonAttr.material2]: cleanAmazonText(tags.Materialinfo || "FSC-Premiumpapier", 80),
      [amazonAttr.numberOfItems]: "1",
      [amazonAttr.itemPackageQuantity]: "1",
      [amazonAttr.subjectCharacter]: cleanAmazonText(tags["Künstler"] || tags.Thema || "Vintage Motiv", 120),
      [amazonAttr.color]: amazonColor(tags),
      [amazonAttr.colorFamily1]: colorFamilies[0] || "",
      [amazonAttr.colorFamily2]: colorFamilies[1] || "",
      [amazonAttr.colorFamily3]: colorFamilies[2] || "",
      [amazonAttr.colorFamily4]: colorFamilies[3] || "",
      [amazonAttr.colorFamily5]: colorFamilies[4] || "",
      [amazonAttr.theme]: amazonTheme(tags),
      [amazonAttr.printMediaType]: "Normales Papier",
      [amazonAttr.paperFinish]: "Matt",
      [amazonAttr.orientation]: cleanAmazonText(tags.Ausrichtung || "Vertikal", 80),
      [amazonAttr.finishType]: cleanAmazonText(tags.Finish || "Matt", 80),
      [amazonAttr.unitCountValue]: "1",
      [amazonAttr.unitCountType]: "Stück",
      [amazonAttr.roomType]: "Wohnzimmer",
      [amazonAttr.indoorOutdoorUsage]: "Innenbereich",
      [amazonAttr.wallArtForm]: "Poster",
      [amazonAttr.baseMaterial]: "Papier",
      [amazonAttr.isFramed]: "Nein",
      [amazonAttr.isOriginalArtwork]: "Nein",
      [amazonAttr.conditionType]: normalizeAmazonCondition(config.amazonConditionType),
      [amazonAttr.taxCode]: config.amazonProductTaxCode || "A_GEN_STANDARD",
      [amazonAttr.fulfillmentChannel]: config.amazonFulfillmentChannel || "DEFAULT",
      [amazonAttr.leadTime]: config.amazonLeadTimeDays || "3",
      [amazonAttr.countryOfOrigin]: amazonOriginCountry(config),
      [amazonAttr.batteryLifePercentage]: "Ohne Batterie",
      [amazonAttr.batteriesRequired]: "Nein",
      [amazonAttr.batteriesIncluded]: "Nein",
      [amazonAttr.containsBatteryOrCell]: "",
      [amazonAttr.hasMultipleBatteryPoweredComponents]: "",
    };

    const rowForVariant = (variant, index, parentage) => {
      const size = amazonPosterSize(product, variant) || (parentage === "Kind" || !parentage ? "Standard" : "");
      const dimensions = amazonDimensionsFor(product, variant);
      const price = formatPrice((variant && variant.price) || product.firstPrice, config);
      return {
        ...common,
        [amazonAttr.sku]: parentage === "Eltern" ? parentSku : hasVariants ? amazonWallArtVariantSku(product, variant, index) : amazonWallArtVariantSku(product, variant, 0),
        [amazonAttr.parentage]: parentage || "",
        [amazonAttr.parentSku]: parentage === "Kind" ? parentSku : "",
        [amazonAttr.itemName]: amazonWallArtTitle(product, variant, config),
        [amazonAttr.titleDifferentiation]: "",
        [amazonAttr.modelNumber]: parentage === "Eltern" ? parentSku : amazonWallArtVariantSku(product, variant, index),
        [amazonAttr.modelName]: titleWithoutAmazonSuffix(product, config),
        [amazonAttr.size]: parentage === "Eltern" ? "" : size,
        [amazonAttr.paperSizeValue]: parentage === "Eltern" ? "" : size.replace(/\s*cm$/i, ""),
        [amazonAttr.paperSizeUnit]: parentage === "Eltern" ? "" : "Zentimeter",
        [amazonAttr.itemLength]: parentage === "Eltern" ? "" : dimensions.length,
        [amazonAttr.itemLengthUnit]: parentage === "Eltern" || !dimensions.length ? "" : "Zentimeter",
        [amazonAttr.itemWidth]: parentage === "Eltern" ? "" : dimensions.width,
        [amazonAttr.itemWidthUnit]: parentage === "Eltern" || !dimensions.width ? "" : "Zentimeter",
        [amazonAttr.listPrice]: parentage === "Eltern" ? "" : price,
        [amazonAttr.price]: parentage === "Eltern" ? "" : price,
        [amazonAttr.quantity]: parentage === "Eltern" ? "" : config.quantity,
        [amazonAttr.fulfillmentChannel]: parentage === "Eltern" ? "" : config.amazonFulfillmentChannel || "DEFAULT",
        [amazonAttr.leadTime]: parentage === "Eltern" ? "" : config.amazonLeadTimeDays || "3",
        [amazonAttr.gpsrManufacturerEmail]: amazonGpsrManufacturerEmail(config),
        [amazonAttr.dsaResponsiblePartyAddress]: amazonGpsrResponsiblePartyEmail(config),
        [amazonAttr.gpsrSafetyAttestation]: amazonBooleanValue(config.amazonGpsrSafetyAttestation),
      };
    };

    if (!hasVariants) {
      return [rowForVariant(variants[0], 0, "")];
    }
    return [rowForVariant(null, 0, "Eltern"), ...variants.map((variant, index) => rowForVariant(variant, index, "Kind"))];
  }

  function amazonBullets(product, config) {
    const tags = product.tags || {};
    const material = tags.Materialinfo || tags.Material || "Mattes 200 g/m² Papier";
    const artist = tags["Künstler"] ? `Motiv/Künstler: ${tags["Künstler"]}.` : "Kuratiertes Vintage-Postermotiv.";
    const theme = tags.Thema ? `Thema: ${tags.Thema}.` : "Dekorative Wandkunst für Wohnräume, Büro und Galerie-Wände.";
    const sizeText = "Mehrere Größenvarianten verfügbar, passend für kleine und große Wandflächen.";
    const frameText = tags.Rahmung || tags.Rahmenstil ? `Ungerahmt geliefert: ${tags.Rahmung || tags.Rahmenstil}.` : "Ungerahmt geliefert; Rahmen und Dekoration sind nicht enthalten.";
    const printText = `Hochwertiger Kunstdruck auf ${material}.`;
    return [printText, artist, theme, sizeText, frameText].map((bullet) => cleanAmazonText(bullet, config.amazonBulletLength || 500));
  }

  function amazonProductDescription(product, config) {
    const tags = product.tags || {};
    const shopifyText = toParagraphText(product.description);
    const material = tags.Materialinfo || tags.Material || "mattes 200 g/m² Papier";
    const artist = tags["Künstler"] ? `Motiv und Künstler: ${tags["Künstler"]}.` : "";
    const theme = tags.Thema ? `Thema: ${tags.Thema}.` : "";
    const style = amazonStyle(tags) ? `Stil: ${amazonStyle(tags)}.` : "";
    const reproduction = tags.Epoche ? `Historische Reproduktion eines Motivs aus der Epoche ${tags.Epoche}.` : "Moderne Reproduktion eines historischen Vintage-Motivs.";
    const frame = tags.Rahmung || tags.Rahmenstil ? `Rahmung: ${tags.Rahmung || tags.Rahmenstil}.` : "Lieferung ohne Rahmen.";
    const fallback = "Moderne Reproduktion eines ausgewählten Vintage-Poster-Motivs. Gedruckt auf mattem Papier. Rahmen und Dekoration sind nicht enthalten.";
    const details = [
      "Produktdetails:",
      `Hochwertiger Kunstdruck auf ${material}.`,
      reproduction,
      artist,
      theme,
      style,
      frame,
      "Rahmen, Möbel und Dekoration auf Produktfotos sind nicht im Lieferumfang enthalten.",
    ].filter(Boolean);
    const text = [shopifyText || fallback, details.join("\n")].filter(Boolean).join("\n\n");
    return cleanAmazonDescriptionText(text, config.amazonDescriptionLength || 1900);
  }

  function amazonRow(headers, values) {
    const row = {};
    headers.forEach((header) => {
      row[header] = values[header] == null ? "" : values[header];
    });
    return row;
  }

  function amazonRowsForProduct(product, config) {
    const sourceVariants = product.variants.length ? product.variants : [{ sku: product.handle, price: product.firstPrice, option1Value: "" }];
    const variants = orderAmazonVariants(product, sourceVariants, config);
    const hasVariants = config.amazonUseVariations !== false && variants.length > 1;
    const parentSku = amazonParentSku(product);
    const images = buildProductImages(product, config).slice(0, Number(config.maxImages || 8));
    const bullets = amazonBullets(product, config);
    const tags = product.tags || {};
    const brand = amazonBrandName(product, config);
    const productType = cleanAmazonText(config.amazonProductType || "wall_art", 80);
    const condition = cleanAmazonText(config.amazonConditionType || "new_new", 40);
    const taxCode = cleanAmazonText(config.amazonProductTaxCode || "A_GEN_STANDARD", 40);
    const shippingGroup = cleanAmazonText(config.amazonShippingGroup || "", 80);
    const title = cleanAmazonText(product.title, 200);
    const description = amazonProductDescription(product, config);
    const base = {
      product_type: productType,
      item_name: title,
      brand_name: brand,
      manufacturer: cleanAmazonText(config.amazonManufacturer || brand, 80),
      product_description: description,
      bullet_point1: bullets[0],
      bullet_point2: bullets[1],
      bullet_point3: bullets[2],
      bullet_point4: bullets[3],
      bullet_point5: bullets[4],
      condition_type: condition,
      batteries_required: "Nein",
      batteries_included: "Nein",
      contains_battery_or_cell: "",
      main_image_url: images[0] || "",
      other_image_url1: images[1] || "",
      other_image_url2: images[2] || "",
      other_image_url3: images[3] || "",
      other_image_url4: images[4] || "",
      other_image_url5: images[5] || "",
      color_name: cleanAmazonText(tags.Farbe || "", 80),
      material_type: cleanAmazonText(tags.Material || "Papier", 80),
      style_name: cleanAmazonText(tags.Kunststil || tags.Stil || "Vintage", 80),
      theme: cleanAmazonText(tags.Thema || "", 120),
      artist: cleanAmazonText(tags["Künstler"] || "", 120),
      era: cleanAmazonText(tags.Epoche || "", 80),
      country_of_origin: cleanAmazonText(tags.Herkunft || "", 80),
      update_delete: "Update",
      product_tax_code: taxCode,
      merchant_shipping_group_name: shippingGroup,
    };

    if (!hasVariants) {
      const variant = variants[0];
      return [
        {
          ...base,
          item_sku: variant.sku || makeSku(product.handle),
          parent_child: "",
          relationship_type: "",
          variation_theme: "",
          standard_price: formatPrice(variant.price || product.firstPrice, config),
          quantity: config.quantity,
          size_name: amazonSizeName(variant.option1Value, ""),
        },
      ];
    }

    const rows = [
      {
        ...base,
        item_sku: parentSku,
        parent_child: "parent",
        relationship_type: "",
        variation_theme: "Size",
        standard_price: "",
        quantity: "",
        size_name: "",
      },
    ];

    variants.forEach((variant) => {
      rows.push({
        ...base,
        item_sku: variant.sku || makeSku(`${product.handle}-${variant.option1Value || "default"}`),
        parent_sku: parentSku,
        parent_child: "child",
        relationship_type: "variation",
        variation_theme: "Size",
        standard_price: formatPrice(variant.price || product.firstPrice, config),
        quantity: config.quantity,
        size_name: amazonSizeName(variant.option1Value, "Standard"),
      });
    });
    return rows;
  }

  function convertAmazonCustom(shopifyText, options) {
    const config = {
      quantity: 3,
      maxImages: 8,
      priceMultiplier: 1,
      priceAdd: 0,
      roundTo: 0,
      amazonBrandMode: "none",
      amazonBrand: "Atelier Orlo",
      amazonManufacturer: "Gelato",
      amazonProductType: "WALL_ART",
      amazonConditionType: "Neu",
      amazonProductIdType: "GTIN-Freistellung",
      amazonTitleSuffix: "Poster Wandkunst",
      amazonBrowseNode: "372854011",
      amazonProductTaxCode: "A_GEN_STANDARD",
      amazonShippingGroup: "",
      amazonCountryOfOrigin: "Deutschland",
      amazonFulfillmentChannel: "DEFAULT",
      amazonLeadTimeDays: "3",
      amazonUseVariations: true,
      amazonVariantOrder: "price-asc",
      amazonGpsrManufacturerEmail: "",
      amazonGpsrResponsiblePartyEmail: "",
      amazonGpsrSafetyAttestation: "",
      extraImageUrls: "",
      productExtraImageUrls: "",
      extraImagesPosition: "after-main",
      ...options,
    };
    const analysis = analyzeShopify(shopifyText);
    const headers = AMAZON_WALL_ART_HEADERS.slice();
    const rows = [];
    let productsWithVariants = 0;
    let usedImages = 0;

    analysis.products.forEach((product) => {
      if (product.variants.length > 1) {
        productsWithVariants += 1;
      }
      usedImages += buildProductImages(product, config).slice(0, Number(config.maxImages || 8)).length;
      amazonWallArtRowsForProduct(product, config).forEach((row) => rows.push(amazonWallArtRow(headers, row)));
    });

    return {
      tsv: objectsToCsv(headers, rows, "\t", []),
      headers,
      rows,
      warnings: [
        "Fuer Varianten nutze bevorzugt die Amazon-Vorlage-XLSM. Der Nicht-Amazon-Datei-Upload kann Parent/Child-Varianten ignorieren und einzelne Entwuerfe erzeugen.",
        "Bei GTIN-Freistellung wird der Produkt-ID-Typ gesetzt und die Produkt-ID bleibt leer; das entspricht dem Haken Dieses Produkt hat keine Produktkennung.",
        "Eine Variantenfamilie braucht technisch Parent- und Child-Zeilen: 3 Produkte mit je 3 Groessen ergeben 12 Tabellenzeilen, aber 3 Produktfamilien.",
      ],
      analysis,
      summary: {
        products: analysis.productCount,
        sourceRows: analysis.rowCount,
        outputRows: rows.length,
        productsWithVariants,
        usedImages,
      },
    };
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
    const iconBoxStart = `<span style="display:flex;width:64px;height:64px;align-items:flex-end;justify-content:center;margin:0 auto 18px;">`;
    const icon = safeIcon
      ? `${iconBoxStart}<img src="${escapeHtml(safeIcon)}" alt="" style="display:block;width:54px;height:54px;object-fit:contain;"></span>`
      : `${iconBoxStart}<span style="display:flex;width:54px;height:54px;border:1px solid #d9cdbf;border-radius:50%;align-items:center;justify-content:center;color:#1f4638;font-size:18px;font-weight:bold;">${String(fallbackIndex || "").padStart(2, "0")}</span></span>`;
    return `<div style="display:inline-block;width:18%;min-width:150px;height:242px;min-height:242px;box-sizing:border-box;vertical-align:top;margin:0 .6% 12px;border:1px solid #eee4d8;background:#f7f1ea;padding:22px 14px;border-radius:8px;text-align:center;">${icon}<strong style="display:block;font-size:20px;color:#20201d;margin-bottom:10px;font-family:Georgia,serif;font-weight:400;">${escapeHtml(title)}</strong><span style="display:block;color:#514b44;line-height:1.6;font-size:15px;">${escapeHtml(text)}</span></div>`;
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
          `<img class="orlo-slide orlo-slide-${index + 1}" src="${escapeHtml(url)}" alt="${escapeHtml(title)} ${index + 1}" style="grid-area:1/1;display:block;max-width:100%;width:auto;height:auto;max-height:720px;margin:0 auto;border:1px solid #e6ddd1;border-radius:8px;box-sizing:border-box;opacity:${index === 0 ? "1" : "0"};animation:orloFade ${duration}s infinite;animation-delay:${index * 4}s;">`,
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
      `<div class="orlo-hero" style="display:grid;grid-template-columns:1fr;align-items:start;justify-items:center;width:100%;max-width:900px;margin:0 auto;background:transparent;box-sizing:border-box;">${slides}</div>`,
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
    const heading = String(template.contactHeading || template.shopName || "").trim();
    const text = formalizeGermanAddress(template.contactText || DEFAULT_LISTING_TEMPLATE.contactText);
    const image = imageUrl
      ? `<div style="display:inline-block;width:42%;min-width:260px;vertical-align:middle;text-align:center;box-sizing:border-box;padding:0 0 0 28px;"><img src="${escapeHtml(imageUrl)}" alt="" style="display:block;max-width:430px;max-height:322px;width:auto;height:auto;margin:0 auto;background:transparent;"></div>`
      : "";
    const button = buttonUrl
      ? `<a href="${escapeHtml(buttonUrl)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:14px;padding:12px 20px;background:${accent};color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;font-size:15px;">${escapeHtml(template.contactButtonLabel || DEFAULT_LISTING_TEMPLATE.contactButtonLabel)}</a>`
      : "";
    const textWidth = imageUrl ? "52%" : "100%";

    const headingBlock = heading
      ? `<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${primary};font-weight:bold;margin-bottom:10px;">${escapeHtml(heading)}</div>`
      : "";

    return `<div style="width:96%;max-width:100%;margin:28px auto 0;padding:20px 26px 0;border:1px solid #e6ddd1;background:#fbfaf7;text-align:center;box-sizing:border-box;"><div style="max-width:1120px;margin:0 auto;text-align:left;"><div style="display:inline-block;width:${textWidth};max-width:540px;min-width:280px;vertical-align:middle;text-align:left;box-sizing:border-box;padding:0 28px 20px 0;">${headingBlock}<p style="margin:0;color:#4b463f;font-size:17px;line-height:1.65;">${escapeHtml(text)}</p>${button}</div>${image}</div></div>`;
  }

  function renderListingTemplate(product, config, details) {
    const template = { ...DEFAULT_LISTING_TEMPLATE, ...(config.listingTemplate || {}) };
    const primary = cleanColor(template.primaryColor, DEFAULT_LISTING_TEMPLATE.primaryColor);
    const accent = cleanColor(template.accentColor, DEFAULT_LISTING_TEMPLATE.accentColor);
    const background = cleanColor(template.backgroundColor, DEFAULT_LISTING_TEMPLATE.backgroundColor);
    const title = cleanTitle(details && details.title ? details.title : product.title, 120);
    const shopName = String(template.shopName || "").trim();
    const description =
      formalizeGermanAddress(sanitizeInlineHtml(product.description)) ||
      `<p>${escapeHtml(formalizeGermanAddress(toPlainText(product.description)))}</p>`;
    const topDescription = description || (template.intro ? `<p>${escapeHtml(template.intro)}</p>` : "");
    const suffix = String(config.descriptionSuffix || "").trim();
    const images = details && details.images ? details.images : buildProductImages(product, config);
    const gallery = renderPhotoGallery(images, title, template);
    const logoUrl = normalizeUrl(template.logoUrl);
    const logoBlock = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(shopName)}" style="display:block;max-width:213px;max-height:100px;width:auto;height:auto;margin:0 auto;">`
      : shopName
        ? `<div style="font-size:20px;font-weight:bold;color:${primary};letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(shopName)}</div>`
        : "";
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
      logoBlock
        ? `<div style="border-bottom:1px solid #e6ddd1;padding-bottom:18px;margin-bottom:22px;text-align:center;">${logoBlock}</div>`
        : "",
      gallery,
      `<div style="padding-top:4px;max-width:1120px;margin:0 auto 28px;">`,
      shopName
        ? `<div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${primary};font-weight:bold;margin-bottom:10px;">${escapeHtml(shopName)}</div>`
        : "",
      `<h1 style="margin:0 0 14px;font-size:28px;line-height:1.22;color:#20201d;font-family:Georgia,serif;font-weight:400;">${escapeHtml(title)}</h1>`,
      `<p style="margin:0 0 16px;color:#5a534b;font-size:16px;line-height:1.6;">${escapeHtml(template.headline)}</p>`,
      `<div style="width:68px;height:3px;background:${accent};margin:0 0 22px;"></div>`,
      topDescription
        ? `<div style="margin:0 0 20px;color:#39342f;font-size:16px;line-height:1.75;">${topDescription}</div>`
        : "",
      singleVariantBlock,
      `</div>`,
      `<div style="margin:44px 0 28px;text-align:center;">${highlightBlocks}</div>`,
      `<div style="border-top:1px solid #e6ddd1;padding-top:26px;margin-top:8px;">`,
      `<div style="margin-top:24px;">`,
      noteBlock,
      suffixBlock,
      `</div>`,
      `</div>`,
      `<div style="max-width:1120px;margin:26px auto 0;padding-top:16px;border-top:1px solid #e6ddd1;color:#6b6258;font-size:13px;box-sizing:border-box;">${escapeHtml(template.footerText)}</div>`,
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

  function taxonomyValueId(value) {
    const match = String(value || "").match(/TaxonomyValue\/(\d+)/i);
    return match ? match[1] : "";
  }

  function parseMetafieldList(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch (error) {
      // Not JSON; fall back to the separators used in the Shopify exports.
    }
    return raw
      .split(/[|;]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function normalizeSpecificText(target, value) {
    const label = cleanSpecificLabel(target).toLowerCase();
    const raw = String(value || "").trim();
    if (!raw || /^gid:\/\/shopify\//i.test(raw)) {
      return "";
    }
    if (label === "authentizität" || label === "authentizitaet") {
      if (/reproduktion/i.test(raw)) {
        return "Reproduktion";
      }
    }
    if (label === "material" && /papier|paper/i.test(raw)) {
      return "Papier";
    }
    return raw.replace(/\s*&\s*/g, " und ");
  }

  function applySpecificIfPresent(tags, target, value) {
    const normalized = normalizeSpecificText(target, value);
    if (normalized && !tags[target]) {
      tags[target] = normalized;
    }
  }

  function applyFirstTextMetafield(records, tags, sources, target) {
    for (const source of sources) {
      const value = firstValue(records, source);
      if (value) {
        applySpecificIfPresent(tags, target, value);
        if (tags[target]) {
          return;
        }
      }
    }
  }

  function applyFirstListMetafield(records, tags, sources, target) {
    for (const source of sources) {
      const values = parseMetafieldList(firstValue(records, source))
        .map((value) => normalizeSpecificText(target, value))
        .filter(Boolean);
      if (values.length && !tags[target]) {
        tags[target] = unique(values).join("; ");
        return;
      }
    }
  }

  function applyKnownTaxonomyMetafields(records, tags) {
    const materialId =
      taxonomyValueId(firstValue(records, "taxonomy.material_id (product.metafields.taxonomy.material_id)")) ||
      taxonomyValueId(firstValue(records, "Material (product.metafields.shopify.material)"));
    if (materialId === "548" && !tags.Material) {
      tags.Material = "Papier";
    }

    const authenticityId =
      taxonomyValueId(firstValue(records, "taxonomy.authenticity_id (product.metafields.taxonomy.authenticity_id)")) ||
      taxonomyValueId(firstValue(records, "Authentizität des Kunstwerks (product.metafields.shopify.artwork-authenticity)")) ||
      taxonomyValueId(firstValue(records, "authenticity_id (product.metafields.taxonomy_backup.authenticity_id)"));
    if (authenticityId === "26299" && !tags["Authentizität"]) {
      tags["Authentizität"] = "Reproduktion";
    }
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
      const rawValue = firstValue(records, source);
      applySpecificIfPresent(tags, target, /^gid:\/\/shopify/i.test(rawValue) ? "" : humanizeValue(rawValue));
    });

    applyFirstTextMetafield(
      records,
      tags,
      [
        "material_info (product.metafields.taxonomy_backup.material_info)",
        "taxonomy.material_text (product.metafields.taxonomy.material_text)",
      ],
      "Materialinfo",
    );
    applyFirstTextMetafield(records, tags, ["authenticity_id (product.metafields.taxonomy_backup.authenticity_id)"], "Authentizität");
    applyFirstTextMetafield(records, tags, ["art_style_id (product.metafields.taxonomy_backup.art_style_id)"], "Stil");
    applyFirstTextMetafield(records, tags, ["theme_id (product.metafields.taxonomy_backup.theme_id)"], "Thema");
    applyFirstListMetafield(records, tags, ["filter_epoch (product.metafields.custom.filter_epoch)"], "Epoche");
    applyFirstListMetafield(records, tags, ["filter_artist (product.metafields.custom.filter_artist)"], "Künstler");
    applyFirstListMetafield(records, tags, ["filter_origin (product.metafields.custom.filter_origin)"], "Herkunft");
    applyFirstListMetafield(records, tags, ["filter_styles (product.metafields.custom.filter_styles)"], "Stil");
    applyFirstListMetafield(records, tags, ["filter_themes (product.metafields.custom.filter_themes)"], "Thema");
    applyKnownTaxonomyMetafields(records, tags);
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
      const images = unique(
        records
          .map((row, recordIndex) => ({
            src: normalizeUrl(row["Image Src"]),
            position: Number.parseInt(row["Image Position"], 10),
            recordIndex,
          }))
          .filter((image) => image.src)
          .sort((a, b) => {
            const aPos = Number.isFinite(a.position) ? a.position : Number.MAX_SAFE_INTEGER;
            const bPos = Number.isFinite(b.position) ? b.position : Number.MAX_SAFE_INTEGER;
            return aPos - bPos || a.recordIndex - b.recordIndex;
          })
          .map((image) => image.src),
      ).slice(0, 24);
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
      if (label === "material" && /papier|paper/i.test(raw)) {
        return "Papier";
      }
      if ((label === "authentizität" || label === "authentizitaet") && /reproduktion/i.test(raw)) {
        return "Reproduktion";
      }
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
      const requestedAction = String(config.actionValue || "").trim();
      return /^Draft$/i.test(requestedAction) ? "VerifyAdd" : requestedAction;
    }

    const header = String(actionHeader || "");
    if (/^\*?Action/i.test(header) || /Version=/i.test(header)) {
      return config.verifyOnly ? "VerifyAdd" : "Add";
    }
    return "VerifyAdd";
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
      titleSuffix: "",
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
    const requestedActionValue = String(config.actionValue || "").trim();
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
    if (/^Draft$/i.test(requestedActionValue)) {
      warnings.push("Draft wird für Varianten nicht mehr exportiert, weil eBay diese Datei nicht zuverlässig als Vorlage erkennt. Der Export wurde stattdessen als VerifyAdd-Prüfdatei erzeugt.");
    }
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
      const singleVariantTitleSize = extractTitleCmSize(singleVariantValue);
      const listingTitle = buildListingTitle(product.title, config.titleSuffix, 80, singleVariantTitleSize ? [singleVariantTitleSize] : []);
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
          const flatTitle = buildListingTitle(`${product.title} - ${optionValue}`, config.titleSuffix, 80);
          setIfHeader(flat, actionHeader, actionValue);
          setIfHeader(flat, skuHeader, variant.sku);
          setIfHeader(flat, productNameHeader, flatTitle);
          setIfHeader(flat, categoryHeader, config.categoryId);
          setIfHeader(flat, titleHeader, flatTitle);
          setIfHeader(flat, upcHeader, config.upcValue);
          setIfHeader(flat, priceHeader, formatPrice(variant.price, config));
          setIfHeader(flat, quantityHeader, config.quantity);
          setIfHeader(flat, photosHeader, photos);
          setIfHeader(flat, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
          setIfHeader(
            flat,
            descriptionHeader,
            buildDescription(product, config, {
              title: flatTitle,
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
      setIfHeader(parent, productNameHeader, listingTitle);
      setIfHeader(parent, categoryHeader, config.categoryId);
      setIfHeader(parent, titleHeader, listingTitle);
      setIfHeader(parent, upcHeader, hasVariants ? "" : config.upcValue);
      setIfHeader(parent, photosHeader, photos);
      setIfHeader(parent, conditionHeader, conditionValueFor(conditionHeader, config.conditionId));
      setIfHeader(
        parent,
        descriptionHeader,
        buildDescription(product, config, {
          title: listingTitle,
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
    convertAmazonCustom,
    detectDelimiter,
    parseCsvRows,
    parseEbayTemplate,
    parseShopify,
  };
});
