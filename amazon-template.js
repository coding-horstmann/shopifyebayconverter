const JSZip = require("jszip");
const converter = require("./converter.js");

function decodeXml(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeXml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sharedStringTextXml(value) {
  const text = String(value == null ? "" : value);
  const preserveSpace = /^\s|\s$|\r|\n| {2,}/.test(text) ? ' xml:space="preserve"' : "";
  return `<si><t${preserveSpace}>${escapeXml(text)}</t></si>`;
}

function attrValue(xml, name) {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(xml);
  return match ? decodeXml(match[1]) : "";
}

function columnName(index) {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function columnIndex(cellRef) {
  const letters = String(cellRef || "").match(/^[A-Z]+/i);
  if (!letters) {
    return -1;
  }
  return letters[0].toUpperCase().split("").reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function parseSharedStrings(xml) {
  if (!xml) {
    return [];
  }
  return Array.from(xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)).map((match) => {
    const textParts = Array.from(match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)).map((part) => decodeXml(part[1]));
    return textParts.join("");
  });
}

class SharedStringWriter {
  constructor(xml) {
    this.originalXml = xml || "";
    this.strings = parseSharedStrings(xml);
    this.indexByValue = new Map();
    this.addedXml = [];
    const countMatch = this.originalXml.match(/<sst\b([^>]*)>/);
    const count = countMatch ? Number(attrValue(countMatch[1], "count")) : NaN;
    this.count = Number.isFinite(count) && count > 0 ? count : this.strings.length;

    this.strings.forEach((value, index) => {
      if (!this.indexByValue.has(value)) {
        this.indexByValue.set(value, index);
      }
    });
  }

  index(value) {
    const text = String(value == null ? "" : value);
    this.count += 1;
    if (this.indexByValue.has(text)) {
      return this.indexByValue.get(text);
    }

    const index = this.strings.length;
    this.strings.push(text);
    this.indexByValue.set(text, index);
    this.addedXml.push(sharedStringTextXml(text));
    return index;
  }

  toXml() {
    if (!this.originalXml) {
      return [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${this.count}" uniqueCount="${this.strings.length}">`,
        this.strings.map(sharedStringTextXml).join(""),
        "</sst>",
      ].join("");
    }

    let xml = this.originalXml.replace(/<\/sst>\s*$/, `${this.addedXml.join("")}</sst>`);
    xml = xml.replace(/<sst\b([^>]*)>/, (match, attrs) => {
      let nextAttrs = attrs;
      if (/\bcount="/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bcount="[^"]*"/, `count="${this.count}"`);
      } else {
        nextAttrs += ` count="${this.count}"`;
      }
      if (/\buniqueCount="/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\buniqueCount="[^"]*"/, `uniqueCount="${this.strings.length}"`);
      } else {
        nextAttrs += ` uniqueCount="${this.strings.length}"`;
      }
      return `<sst${nextAttrs}>`;
    });
    return xml;
  }
}

function cellText(cellXml, sharedStrings) {
  const type = attrValue(cellXml, "t");
  const valueMatch = cellXml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
  if (type === "s" && valueMatch) {
    return sharedStrings[Number(valueMatch[1])] || "";
  }
  const inline = Array.from(cellXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)).map((match) => decodeXml(match[1])).join("");
  if (inline) {
    return inline;
  }
  return valueMatch ? decodeXml(valueMatch[1]) : "";
}

function workbookSheetPath(workbookXml, relsXml, sheetName) {
  const sheetRegex = /<sheet\b([^>]*)\/?>/g;
  const rels = {};
  Array.from(relsXml.matchAll(/<Relationship\b([^>]*)\/?>/g)).forEach((match) => {
    const id = attrValue(match[1], "Id");
    const target = attrValue(match[1], "Target");
    if (id && target) {
      rels[id] = target;
    }
  });

  for (const match of workbookXml.matchAll(sheetRegex)) {
    const attrs = match[1];
    const name = attrValue(attrs, "name");
    const rid = attrValue(attrs, "r:id");
    if (name === sheetName && rels[rid]) {
      const target = rels[rid].replace(/^\/+/, "");
      return target.startsWith("xl/") ? target : `xl/${target}`;
    }
  }
  return "";
}

function parseSheet(sheetXml, sharedStrings) {
  const rows = [];
  const rowRegex = /<row\b([^>]*)>([\s\S]*?)<\/row>/g;
  for (const rowMatch of sheetXml.matchAll(rowRegex)) {
    const rowNumber = Number(attrValue(rowMatch[1], "r"));
    const cells = [];
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const ref = attrValue(cellMatch[1], "r");
      cells.push({
        col: columnIndex(ref),
        ref,
        xml: cellMatch[0],
        value: cellText(cellMatch[0], sharedStrings),
      });
    }
    rows.push({
      rowNumber,
      xml: rowMatch[0],
      cells,
    });
  }
  return rows;
}

function findAttributeRow(rows) {
  const row = rows.find((candidate) => candidate.cells.some((cell) => cell.value === "contribution_sku#1.value"));
  if (!row) {
    throw new Error("Amazon-Vorlage nicht erkannt: Attributzeile mit contribution_sku#1.value fehlt.");
  }
  return row;
}

function normalizeMarketplaceAttribute(attr) {
  return String(attr || "").replace(/\[marketplace_id=[^\]]+\]/g, "");
}

function normalizedRowValues(row) {
  const values = new Map();
  Object.entries(row).forEach(([key, value]) => {
    const normalized = normalizeMarketplaceAttribute(key);
    if (!values.has(normalized)) {
      values.set(normalized, value);
    }
  });
  return values;
}

function valueForAttribute(row, normalizedRow, attr) {
  if (!attr) {
    return "";
  }
  if (Object.prototype.hasOwnProperty.call(row, attr)) {
    return row[attr];
  }
  if (attr === "record_action#1.value") {
    return row["::record_action"] || "";
  }
  const normalizedAttr = normalizeMarketplaceAttribute(attr);
  if (normalizedRow.has(normalizedAttr)) {
    return normalizedRow.get(normalizedAttr);
  }
  return "";
}

function isNumericAttribute(attr) {
  return [
    "fulfillment_availability#1.quantity",
    "fulfillment_availability#1.lead_time_to_ship_max_days",
    "list_price#1.value_with_tax",
    "purchasable_offer[audience=ALL]#1.our_price#1.schedule#1.value_with_tax",
    "number_of_items#1.value",
    "item_package_quantity#1.value",
    "unit_count#1.value",
    "item_length_width#1.length.value",
    "item_length_width#1.width.value",
  ].includes(normalizeMarketplaceAttribute(attr));
}

function buildCellXml(ref, attr, value, sharedStringWriter) {
  if (value == null || value === "") {
    return "";
  }
  if (isNumericAttribute(attr)) {
    const numberValue = Number(String(value).replace(",", "."));
    if (Number.isFinite(numberValue)) {
      return `<c r="${ref}"><v>${numberValue}</v></c>`;
    }
  }
  return `<c r="${ref}" t="s"><v>${sharedStringWriter.index(value)}</v></c>`;
}

function buildRowXml(rowNumber, row, attributesByColumn, maxColumn, sharedStringWriter) {
  const cells = [];
  const normalizedRow = normalizedRowValues(row);
  for (let col = 0; col <= maxColumn; col += 1) {
    const attr = attributesByColumn.get(col);
    const value = valueForAttribute(row, normalizedRow, attr);
    const cellXml = buildCellXml(`${columnName(col)}${rowNumber}`, attr, value, sharedStringWriter);
    if (cellXml) {
      cells.push(cellXml);
    }
  }
  return `<row r="${rowNumber}">${cells.join("")}</row>`;
}

function replaceSheetData(sheetXml, preservedRows, generatedRowsXml, maxColumn, maxRow) {
  const newSheetData = `<sheetData>${preservedRows.join("")}${generatedRowsXml.join("")}</sheetData>`;
  let next = sheetXml.replace(/<sheetData\b[^>]*>[\s\S]*?<\/sheetData>/, newSheetData);
  const dimension = `<dimension ref="A1:${columnName(maxColumn)}${maxRow}"/>`;
  if (/<dimension\b[^>]*\/>/.test(next)) {
    next = next.replace(/<dimension\b[^>]*\/>/, dimension);
  }
  return next;
}

async function fillAmazonTemplateBuffer(templateBuffer, shopifyText, options = {}) {
  const result = converter.convertAmazonCustom(shopifyText, options);
  const zip = await JSZip.loadAsync(templateBuffer);
  const workbookFile = zip.file("xl/workbook.xml");
  const workbookRelsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (!workbookFile || !workbookRelsFile) {
    throw new Error("Amazon-Vorlage nicht erkannt: workbook.xml fehlt.");
  }

  const workbookXml = await workbookFile.async("string");
  const relsXml = await workbookRelsFile.async("string");
  const sheetPath = workbookSheetPath(workbookXml, relsXml, "Vorlage");
  const sheetFile = sheetPath ? zip.file(sheetPath) : null;
  if (!sheetFile) {
    throw new Error("Amazon-Vorlage nicht erkannt: Blatt Vorlage fehlt.");
  }

  const sharedStringsFile = zip.file("xl/sharedStrings.xml");
  const sharedStringsXml = sharedStringsFile ? await sharedStringsFile.async("string") : "";
  const sharedStringWriter = new SharedStringWriter(sharedStringsXml);
  const sharedStrings = sharedStringWriter.strings;
  const sheetXml = await sheetFile.async("string");
  const rows = parseSheet(sheetXml, sharedStrings);
  const attributeRow = findAttributeRow(rows);
  const dataStartRow = attributeRow.rowNumber + 2;
  const attributesByColumn = new Map(attributeRow.cells.map((cell) => [cell.col, cell.value]));
  const maxColumn = Math.max(...attributeRow.cells.map((cell) => cell.col), 0);
  const preservedRows = rows.filter((row) => row.rowNumber < dataStartRow).map((row) => row.xml);
  const generatedRowsXml = result.rows.map((row, index) => buildRowXml(dataStartRow + index, row, attributesByColumn, maxColumn, sharedStringWriter));
  const maxRow = Math.max(dataStartRow + result.rows.length - 1, attributeRow.rowNumber + 1);

  zip.file(sheetPath, replaceSheetData(sheetXml, preservedRows, generatedRowsXml, maxColumn, maxRow));
  zip.file("xl/sharedStrings.xml", sharedStringWriter.toXml());
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return {
    buffer,
    result,
    sheetName: "Vorlage",
  };
}

module.exports = {
  fillAmazonTemplateBuffer,
};
