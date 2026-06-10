# Atelier Orlo eBay Converter

Lokales und Vercel-taugliches Tool für Shopify-Exports von Atelier Orlo. Ziel ist eine eBay-CSV, die Produktdaten, Fotos, Artikelmerkmale, Preise und Größenvarianten aus Shopify möglichst vollständig übernimmt.

## Browser

Öffne die App im Browser und wähle:

1. Shopify-CSV bei `Shopify CSV` laden.
2. Optional eine eBay-SMP/File-Exchange-Vorlage bei `eBay Vorlage` laden.
3. `Category ID`, Bestand je Größe, Artikelzustand, Bilderzahl und Listing-Modus setzen.
4. Zusatzfotos global oder produkt-spezifisch per Shopify-Handle ergänzen und die Position festlegen.
5. Im Bereich `Listing-Design` Logo, globale Texte, Farben und Icon-Blöcke für alle eBay-Beschreibungen pflegen.
6. Herstellerdaten und optionale internationale Versandspalten setzen.
7. Automatische Merkmale aktivieren, deaktivieren oder auf eBay-Spaltennamen umbenennen.
8. Zuerst `Nur 5 Produkte exportieren` testen, danach die komplette CSV herunterladen.

## eBay-Varianten

Wichtig: Varianten bitte bei eBay als Seller-Hub-Reports `Create new listings` / `Add` Upload testen, nicht als reinen Draft-Upload. Der Draft-Import kann Parent-Zeilen als Entwürfe anlegen und Child-Zeilen als eigene fehlerhafte Entwürfe behandeln. Genau dann entstehen sichtbare Listings ohne Varianten.

Der Standard ist `1 Listing mit Größenvarianten`. Der Converter gruppiert Shopify-Zeilen nach `Handle` und erzeugt:

- eine Parent-Zeile pro Shopify-Produkt mit Titel, Beschreibung, Kategorie, Fotos und allgemeinen Artikelmerkmalen
- darunter Child-Zeilen mit `Relationship=Variation`, `RelationshipDetails=Groesse=...`, `P:UPC=Does not apply`, Preis, Menge und SKU

Die Spalte wird konsequent als `RelationshipDetails` ohne Leerzeichen geschrieben. Variantenwerte werden eBay-sicher normalisiert, also z. B. `30x45 cm / 12x18″` zu `30x45cm`. eBay dokumentiert, dass in `RelationshipDetails` keine Leerzeichen zwischen Merkmalen und Werten stehen dürfen.

Der Flat-Modus bleibt nur als Fallback erhalten und erzeugt bewusst ein eigenes eBay-Angebot pro Größe.

## Fotos

Der Converter übernimmt standardmäßig bis zu 8 Bilder pro Parent-Listing und schreibt sie in `PicURL` bzw. `Item photo URL`, getrennt mit `|`. Damit landen die Produktfotos direkt in der eBay-Datei, sofern eBay die Bild-URLs abrufen kann.

Zusatzfotos können global für alle Produkte oder produkt-spezifisch ergänzt werden:

```text
shopify-handle=https://bild-1.jpg|https://bild-2.jpg
```

Die Zusatzfotos können vor allen Shopify-Bildern, nach dem Hauptbild oder am Ende einsortiert werden.

## Artikelmerkmale

Strukturierte Shopify-Tags wie `Künstler: ...`, `Epoche: ...` und Shopify-Metafelder wie Material, Finish, Rahmenstil, Ausrichtung und Kunststil werden als auswählbare eBay-Artikelmerkmale erkannt. Eigene globale Merkmale werden auf alle Listings angewendet.

Die Artikelmerkmale werden als echte eBay-Merkmale geschrieben. Die HTML-Beschreibung wiederholt sie nicht mehr als eigene Produktdetailbox, damit eBay-Artikelmerkmale und Verkäuferbeschreibung nicht doppelt wirken.

## HTML-Beschreibung

Die Beschreibung nutzt ein mobiles Ein-Spalten-Template mit Logo, CSS-Bildkarussell, Thumbnail-Vorschau mit echtem Bildverhältnis und fünf Icon-/Trust-Blöcken. Das funktioniert ohne JavaScript. Falls eBay einzelne CSS-Animationen entfernt, bleibt das erste Bild sichtbar und alle Bilder stehen weiterhin als Links/Thumbnails sowie in der eBay-Fotospalte.

Für Logos und Icons sind öffentlich abrufbare HTTPS-URLs am zuverlässigsten. Datei-Uploads im Dashboard werden als Data-URL eingebettet, können aber je nach eBay-HTML-Filter weniger robust sein.

## Hersteller und EU-Versand

Herstellerdaten werden als GPSR-kompatible Spalten ergänzt, z. B. `Manufacturer Name`, `Manufacturer AddressLine1`, `Manufacturer City`, `Manufacturer Country`, `Manufacturer PostalCode`, `Manufacturer StateOrProvince`, `Manufacturer Phone`, `Manufacturer Email` und `Manufacturer ContactUrl`.

Optional können internationale Versandspalten ergänzt werden: `IntlShippingService-1:Option`, `IntlShippingService-1:Cost`, `IntlShippingService-1:Priority` und `IntlShippingService-1:Locations`. Der Versandservice-Code muss zu deinem eBay-Konto bzw. deiner Vorlage passen.

## Kommandozeile

```powershell
node .\cli.js `
  --shopify "C:\Users\HP\Downloads\products_export.csv" `
  --template "C:\Users\HP\Downloads\SMPBaseTemplate.csv" `
  --out ".\out\atelier-orlo-ebay-variants.csv" `
  --category 28009 `
  --quantity 3 `
  --max-images 8
```

Mit `--sample 5` wird nur ein Testexport für die ersten fünf Produkte gebaut.
Mit `--verify-only` nutzt die SMP-Datei `VerifyAdd` statt `Add`, damit eBay die Datei erst prüft.
Mit `--listing-mode flat` wird der alte Einzel-Listing-Modus erzwungen.
Mit `--extra-images` werden globale Zusatzbilder ergänzt.
Mit `--product-extra-images` werden Zusatzbilder produkt-spezifisch nach Shopify-Handle ergänzt.
Mit `--no-c-prefix` werden Merkmale ohne `C:` geschrieben, wenn eine eBay-Kategorievorlage exakt diese Spalten verwendet.

## Passwortschutz

Auf Vercel schützt `APP_PASSWORD` die App über eine Login-Seite. Der Standard-Benutzername ist `atelier`; optional kann er über `APP_USERNAME` geändert werden.

## Hinweis

Amazon-Export ist noch nicht umgesetzt. Der aktuelle Fokus ist eBay, weil die eBay-Variantenstruktur zuerst zuverlässig funktionieren muss.
