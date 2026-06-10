# Atelier Orlo eBay Converter

Lokales und Vercel-taugliches Tool für Shopify-Exports von Atelier Orlo. Ziel ist eine eBay-CSV, die Produktdaten, Fotos, Artikelmerkmale, Preise und Größenvarianten aus Shopify möglichst vollständig übernimmt.

## Browser

Öffne die App im Browser und wähle:

1. Shopify-CSV bei `Shopify CSV` laden.
2. Optional eine eBay-SMP/File-Exchange-Vorlage bei `eBay Vorlage` laden.
3. `Category ID`, Menge je Größe, Condition ID, Bilderzahl und Listing-Modus setzen.
4. Im Bereich `Listing-Design` globale Texte, Farben und Trust-Blöcke für alle eBay-Beschreibungen pflegen.
5. Automatische Merkmale aktivieren, deaktivieren oder auf eBay-Spaltennamen umbenennen.
6. Zuerst `Nur 5 Produkte exportieren` testen, danach die komplette CSV herunterladen.

## eBay-Varianten

Der Standard ist `1 Listing mit Größenvarianten`. Der Converter gruppiert Shopify-Zeilen nach `Handle` und erzeugt:

- eine Parent-Zeile pro Shopify-Produkt mit Titel, Beschreibung, Kategorie, Fotos und allgemeinen Artikelmerkmalen
- darunter Child-Zeilen mit `Relationship=Variation`, `RelationshipDetails=Größe=...`, Preis, Menge, SKU und Condition ID

Für die alte SMP/File-Exchange-Vorlage wird die Spalte `RelationshipDetails` ohne Leerzeichen ergänzt. Für moderne Seller-Hub-Vorlagen wird ein vorhandenes `Relationship details` weiterverwendet.

Der Flat-Modus bleibt nur als Fallback erhalten und erzeugt bewusst ein eigenes eBay-Angebot pro Größe.

## Fotos

Der Converter übernimmt standardmäßig bis zu 5 Shopify-Bilder pro Parent-Listing und schreibt sie in `PicURL` bzw. `Item photo URL`, getrennt mit `|`. Damit landen die Produktfotos direkt in der eBay-Datei, sofern eBay die Bild-URLs abrufen kann.

## Artikelmerkmale

Strukturierte Shopify-Tags wie `Künstler: ...`, `Epoche: ...` und Shopify-Metafelder wie Material, Finish, Rahmenstil, Ausrichtung und Kunststil werden als auswählbare eBay-Artikelmerkmale erkannt. Eigene globale Merkmale werden auf alle Listings angewendet.

Die HTML-Beschreibung wiederholt die ausgewählten Artikelmerkmale zusätzlich sichtbar in einer Detailbox. So stehen wichtige Informationen nicht nur als eBay-Suchmerkmale, sondern auch im Listingtext.

## Kommandozeile

```powershell
node .\cli.js `
  --shopify "C:\Users\HP\Downloads\products_export.csv" `
  --template "C:\Users\HP\Downloads\SMPBaseTemplate.csv" `
  --out ".\out\atelier-orlo-ebay-variants.csv" `
  --category 28009
```

Mit `--sample 5` wird nur ein Testexport für die ersten fünf Produkte gebaut.
Mit `--verify-only` nutzt die SMP-Datei `VerifyAdd` statt `Add`, damit eBay die Datei erst prüft.
Mit `--listing-mode flat` wird der alte Einzel-Listing-Modus erzwungen.
Mit `--no-c-prefix` werden Merkmale ohne `C:` geschrieben, wenn eine eBay-Kategorievorlage exakt diese Spalten verwendet.

## Passwortschutz

Auf Vercel schützt `APP_PASSWORD` die App über eine Login-Seite. Der Standard-Benutzername ist `atelier`; optional kann er über `APP_USERNAME` geändert werden.

## Hinweis

Amazon-Export ist noch nicht umgesetzt. Der aktuelle Fokus ist eBay, weil die eBay-Variantenstruktur zuerst zuverlässig funktionieren muss.
