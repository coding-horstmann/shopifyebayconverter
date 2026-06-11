#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const converter = require("./converter.js");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  node cli.js --shopify products_export_1.csv --template ebay-template.csv --out ebay-variants-add.csv --category 12345",
    "",
    "Optional:",
    "  --quantity 3 --max-images 8 --condition 1000 --vat-percent 19 --shipping-profile \"Kostenloser Versand\" --return-profile \"30 Tage Rueckgabe\" --listing-mode variants --action VerifyAdd --publish --draft --revise --item-id-map ebay-result.csv --extra-images image1|image2 --product-extra-images handle=image1|image2 --extra-position after-main --no-c-prefix --price-multiplier 1 --price-add 0 --round-to 0",
    "  --sample 5",
  ].join("\n");
}

function takeSampleShopifyCsv(shopifyText, count) {
  const parsed = converter.parseShopify(shopifyText);
  const analysis = converter.analyzeShopify(shopifyText);
  const keepHandles = new Set(analysis.products.slice(0, count).map((product) => product.handle));
  const rows = parsed.rows.filter((row) => keepHandles.has(row.Handle));

  const escape = (value) => {
    const stringValue = String(value || "");
    if (/[",\r\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  return [
    parsed.headers.map(escape).join(","),
    ...rows.map((row) => parsed.headers.map((header) => escape(row[header])).join(",")),
  ].join("\r\n");
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.shopify || !args.out || args.help) {
    console.log(usage());
    process.exit(args.help ? 0 : 1);
  }

  const shopifyPath = path.resolve(args.shopify);
  const templatePath = args.template ? path.resolve(args.template) : "";
  const itemIdMapPath = args["item-id-map"] ? path.resolve(args["item-id-map"]) : "";
  const outPath = path.resolve(args.out);

  let shopifyText = fs.readFileSync(shopifyPath, "utf8");
  if (args.sample) {
    shopifyText = takeSampleShopifyCsv(shopifyText, Number(args.sample));
  }

  const templateText = templatePath && fs.existsSync(templatePath) ? fs.readFileSync(templatePath, "utf8") : "";
  const itemIdMapText = itemIdMapPath && fs.existsSync(itemIdMapPath) ? fs.readFileSync(itemIdMapPath, "utf8") : "";
  const analysis = converter.analyzeShopify(shopifyText);
  const actionValue = args.action || (args.publish ? "Add" : args.draft ? "Draft" : args.revise ? "Revise" : "VerifyAdd");
  const result = converter.convert(shopifyText, {
    templateText,
    itemIdMapText,
    categoryId: args.category || "",
    conditionId: args.condition || "1000",
    quantity: Number(args.quantity || 3),
    maxImages: Number(args["max-images"] || 8),
    listingMode: args["listing-mode"] || "variants",
    verifyOnly: actionValue === "VerifyAdd",
    actionValue,
    extraImageUrls: args["extra-images"] || "",
    productExtraImageUrls: args["product-extra-images"] || "",
    extraImagesPosition: args["extra-position"] || "after-main",
    variationTraitName: args["variation-name"] || "Größe",
    priceMultiplier: Number(args["price-multiplier"] || 1),
    priceAdd: Number(args["price-add"] || 0),
    roundTo: Number(args["round-to"] || 0),
    vatPercent: args["vat-percent"] || "19",
    shippingProfileName: args["shipping-profile"] || "",
    returnProfileName: args["return-profile"] || "",
    paymentProfileName: args["payment-profile"] || "",
    selectedTagKeys: analysis.specificKeys,
    globalSpecifics: converter.DEFAULT_GLOBAL_SPECIFICS,
    prefixItemSpecifics: !args["no-c-prefix"],
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, result.csv, "utf8");

  console.log(JSON.stringify({ outPath, summary: result.summary, warnings: result.warnings }, null, 2));
}

main();
