const Busboy = require("busboy");
const { fillAmazonTemplateBuffer } = require("../amazon-template.js");

function parseMultipart(request) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: request.headers });
    const fields = {};
    const files = {};

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("limit", () => reject(new Error(`Datei zu groß: ${info.filename || name}`)));
      file.on("end", () => {
        files[name] = {
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks),
        };
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ fields, files }));
    request.pipe(busboy);
  });
}

function safeFilename(value) {
  return String(value || "atelier-orlo-amazon-wall-art-template-filled.xlsm")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.statusCode = 405;
    response.setHeader("Allow", "POST");
    response.end("Method not allowed");
    return;
  }

  try {
    const { fields, files } = await parseMultipart(request);
    const shopifyCsv = files.shopifyCsv;
    const amazonTemplate = files.amazonTemplate;
    if (!shopifyCsv || !shopifyCsv.buffer.length) {
      response.statusCode = 400;
      response.end("Shopify CSV fehlt.");
      return;
    }
    if (!amazonTemplate || !amazonTemplate.buffer.length) {
      response.statusCode = 400;
      response.end("Amazon XLSM-Vorlage fehlt.");
      return;
    }

    const config = fields.config ? JSON.parse(fields.config) : {};
    const shopifyText = shopifyCsv.buffer.toString("utf8");
    const filled = await fillAmazonTemplateBuffer(amazonTemplate.buffer, shopifyText, config);
    const filename = safeFilename(fields.filename || "atelier-orlo-amazon-wall-art-template-filled.xlsm");

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/vnd.ms-excel.sheet.macroEnabled.12");
    response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    response.setHeader("X-Orlo-Amazon-Rows", String(filled.result.rows.length));
    response.end(filled.buffer);
  } catch (error) {
    response.statusCode = 500;
    response.end(error && error.message ? error.message : "Amazon-Vorlage konnte nicht erzeugt werden.");
  }
};
