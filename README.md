# Atelier Orlo eBay Converter

Lokales Tool für Shopify-Exports von Atelier Orlo.

## Browser

Öffne `index.html` im Browser und wähle:

1. Shopify-CSV exportieren und bei `Shopify CSV` laden.
2. Optional die eBay-Draft-Vorlage bei `eBay Vorlage` laden.
3. `Category ID`, Menge, Zustand, Listing-Modus und globale Merkmale setzen.
4. Automatische Merkmale aktivieren, deaktivieren oder auf den eBay-Spaltennamen umbenennen.
5. `CSV herunterladen` oder zuerst `Nur 5 Produkte exportieren`.

Der Converter gruppiert Shopify-Zeilen nach `Handle`, übernimmt bis zu 5 Produktfotos pro Listing,
baut Größenvarianten aus `Option1 Value` und konvertiert strukturierte Shopify-Tags wie
`Künstler: Edward Penfield` in eBay-Merkmale. Eigene Merkmale werden standardmäßig als
`C:Merkmal` geschrieben, weil eBay freie Merkmalsspalten sonst oft ignoriert.

## Kommandozeile

```powershell
node .\cli.js `
  --shopify "C:\Users\HP\Downloads\products_export_1.csv" `
  --template "C:\Users\HP\Downloads\eBay-draft-listing-template-Jun-1-2026-19-26-4.csv" `
  --out ".\out\atelier-orlo-ebay-drafts.csv" `
  --category 12345
```

Mit `--sample 5` wird nur ein Testexport für die ersten fünf Produkte gebaut.
Der Standard ist `--listing-mode flat`: ein eigenes Draft-Listing pro Größe mit eigenem Preis.
Mit `--listing-mode variants` wird die experimentelle Variantenstruktur exportiert.
Mit `--no-c-prefix` werden Merkmale ohne `C:` geschrieben, wenn du eine eBay-Kategorievorlage mit exakt diesen Spalten verwendest.

## Hinweise

- Die moderne eBay-Draft-Vorlage nutzt `Item photo URL`; mehrere Fotos stehen in einer Zelle und
  werden mit `|` getrennt.
- Für die alte SMP/File-Exchange-Vorlage ist meist nur ein Bild pro Angebot zuverlässig.
- Die eBay-Kategorie-ID sollte vor dem Upload bewusst gesetzt werden.
