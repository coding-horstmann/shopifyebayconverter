# Atelier Orlo eBay Converter

Lokales und Vercel-taugliches Tool für Shopify-Exports von Atelier Orlo. Ziel ist eine eBay-CSV, die Produktdaten, Fotos, Artikelmerkmale, Preise und Größenvarianten aus Shopify möglichst vollständig übernimmt.

## Browser

Öffne die App im Browser und wähle:

1. Shopify-CSV bei `Shopify CSV` laden.
2. Optional eine eBay-SMP/File-Exchange-Vorlage bei `eBay Vorlage` laden. Ohne Vorlage nutzt der Converter jetzt ebenfalls eine SMP-kompatible Header-Zeile, nicht mehr die eBay-Draft-Vorlage.
3. Für bestehende aktive Angebote optional die eBay-Ergebnisdatei oder einen Active-Listings-Export mit `ItemID` bei `eBay Ergebnisdatei / aktive Angebote` laden.
4. `Category ID`, Bestand je Größe, Artikelzustand, MwSt., Bilderzahl, Listing-Modus und eBay Upload-Aktion setzen.
4. Zusatzfotos global oder produkt-spezifisch per Shopify-Handle ergänzen und die Position festlegen.
5. Im Bereich `Listing-Design` Logo, globale Texte, Farben und Icon-Blöcke für alle eBay-Beschreibungen pflegen.
6. Herstellerdaten, eBay-Rahmenbedingungen und optionale internationale Versandspalten setzen.
7. Automatische Merkmale aktivieren, deaktivieren oder auf eBay-Spaltennamen umbenennen.
8. Zuerst im Standardmodus `Nur prüfen - keine Angebote erstellen` testen, danach nur bewusst auf `Aktiv veröffentlichen` oder `Bestehende aktive Angebote bearbeiten` umstellen.

## eBay-Varianten

Wichtig: Der Standardexport nutzt `VerifyAdd`. eBay prüft damit die Datei, erstellt aber keine aktiven Angebote. `Add` veröffentlicht direkt aktive Angebote. `Draft` ist im Dashboard auswählbar, war bei eBay-Varianten im bisherigen Test aber unzuverlässiger als `VerifyAdd`.

Für bereits veröffentlichte Angebote kann der Converter `Revise` schreiben. Dafür braucht er eine Datei mit den eBay-`ItemID`s, am einfachsten die eBay-Ergebnisdatei des erfolgreichen Uploads. Bei Varianten steht `Revise` und `ItemID` nur auf der Parent-Zeile; die Child-Zeilen bleiben in `Action` und `ItemID` leer.

Der Standard ist `1 Listing mit Größenvarianten`. Der Converter gruppiert Shopify-Zeilen nach `Handle` und erzeugt:

- eine Parent-Zeile pro Shopify-Produkt mit Titel, Beschreibung, Kategorie, Fotos und allgemeinen Artikelmerkmalen
- darunter Child-Zeilen mit `Relationship=Variation`, `RelationshipDetails=Groesse=...`, `P:UPC=Does not apply`, Preis, Menge, SKU und `ConditionID`

Die `Action=Add` steht nur auf der Parent-Zeile. Die Child-Zeilen bleiben in der Action-Spalte leer, damit eBay sie als Varianten des Parent-Listings und nicht als eigene Listings verarbeitet.

Die Spalte wird konsequent als `RelationshipDetails` ohne Leerzeichen geschrieben. Variantenwerte werden eBay-sicher normalisiert, also z. B. `30x45 cm / 12x18″` zu `30x45cm`. eBay dokumentiert, dass in `RelationshipDetails` keine Leerzeichen zwischen Merkmalen und Werten stehen dürfen.

Der Flat-Modus bleibt nur als Fallback erhalten und erzeugt bewusst ein eigenes eBay-Angebot pro Größe.

Wenn eine eBay-Vorlage hochgeladen wird, bleibt deren erste Zeile unverändert die erste Zeile im Export. Ohne Vorlage nutzt der Converter die SMPBase-kompatible Zeile `*Action(SiteID=Germany|Country=DE|Currency=EUR|Version=941)` als erste Zeile.

Wenn ein Shopify-Produkt nur eine Variante hat, erzeugt der Converter kein künstliches eBay-Variantenlisting. Die Größe wird dann als normales Artikelmerkmal, z. B. `C:Größe`, und in der HTML-Beschreibung ausgegeben.

## Fotos

Der Converter übernimmt standardmäßig bis zu 8 Bilder pro Parent-Listing und schreibt sie in `PicURL` bzw. `Item photo URL`, getrennt mit `|`. Damit landen die Produktfotos direkt in der eBay-Datei, sofern eBay die Bild-URLs abrufen kann.

Zusatzfotos können global für alle Produkte oder produkt-spezifisch ergänzt werden:

```text
shopify-handle=https://bild-1.jpg|https://bild-2.jpg
```

Die Zusatzfotos können vor allen Shopify-Bildern, nach dem Hauptbild oder am Ende einsortiert werden.

## Artikelmerkmale

Strukturierte Shopify-Tags wie `Künstler: ...`, `Epoche: ...` und Shopify-Metafelder wie Material, Finish, Rahmenstil, Ausrichtung und Kunststil werden als auswählbare eBay-Artikelmerkmale erkannt. Eigene globale Merkmale werden auf alle Listings angewendet.

Die Artikelmerkmale werden als echte eBay-Merkmale geschrieben. Die HTML-Beschreibung wiederholt sie nicht mehr als eigene Produktdetailbox, damit eBay-Artikelmerkmale und Verkäuferbeschreibung nicht doppelt wirken. Werte wie `papier` und `reproduktion` werden im Export zu `Papier` und `Reproduktion` normalisiert.

Die MwSt. wird standardmäßig als `VATPercent=19` geschrieben.

## HTML-Beschreibung

Die Beschreibung nutzt ein mobiles Ein-Spalten-Template mit Logo, CSS-Bildkarussell, Thumbnail-Vorschau mit echtem Bildverhältnis und fünf Icon-/Trust-Blöcken. Das funktioniert ohne JavaScript. Beim Klick auf ein Vorschaubild wird die CSS-Rotation gestoppt und das gewählte Bild fixiert, sofern eBay die dafür nötigen HTML-Controls nicht entfernt. Falls eBay einzelne CSS-Animationen entfernt, bleibt das erste Bild sichtbar und alle Bilder stehen weiterhin als Thumbnails sowie in der eBay-Fotospalte.

Die Shopify-Beschreibung steht im Template direkt oben unter Titel und Headline. Der frühere generische Intro-Satz wird nicht mehr ausgegeben.

Für Logos und Icons sind öffentlich abrufbare HTTPS-URLs am zuverlässigsten. Datei-Uploads im Dashboard werden als Data-URL eingebettet, können aber je nach eBay-HTML-Filter weniger robust sein.

## Hersteller und EU-Versand

Herstellerdaten werden als GPSR-kompatible Spalten ergänzt, z. B. `Manufacturer Name`, `Manufacturer AddressLine1`, `Manufacturer City`, `Manufacturer Country`, `Manufacturer PostalCode`, `Manufacturer StateOrProvince`, `Manufacturer Phone`, `Manufacturer Email` und `Manufacturer ContactUrl`. Der Converter schreibt diese eBay-Spalten nur, wenn mindestens Name, Straße, Ort, PLZ und Land vollständig ausgefüllt sind. Unvollständige Herstellerdaten werden nicht als eBay-GPSR-Spalten exportiert, weil eBay sonst den gesamten Upload ablehnt. Zusätzlich erscheinen ausgefüllte Herstellerdaten unten in der HTML-Beschreibung in einem aufklappbaren Bereich.

`Manufacturer Country` und `ResponsiblePerson Country` werden als zweistellige ISO-Codes geschrieben. Gängige Eingaben wie `NOR`, `Norwegen` oder `Norway` werden zu `NO`; `Deutschland` wird zu `DE`. Wenn der Hersteller außerhalb EU/Nordirland sitzt, z. B. Gelato ASA in Norwegen, kann eBay zusätzlich eine `ResponsiblePerson` in EU/Nordirland verlangen. Dafür gibt es im Dashboard den Block `EU-verantwortliche Person`; bei vollständiger Eingabe exportiert der Converter u. a. `ResponsiblePerson CompanyName`, `ResponsiblePerson Country`, `ResponsiblePerson Email` und `ResponsiblePerson Types=EUResponsiblePerson`.

Artikelmerkmale werden auf eBay-taugliche Längen begrenzt. Wenn Shopify mehrere Werte wie `Humor und Karikatur; Literatur und Bücher; Zeitschriften und Cover` liefert und eBay die Gesamtlänge ablehnt, behält der Converter so viele Werte wie möglich innerhalb der 65-Zeichen-Grenze.

Versand-, Rücknahme- und Zahlungsbedingungen können über die Felder `Versandprofil`, `Rücknahmeprofil` und `Zahlungsprofil` gesetzt werden. Der Wert muss exakt dem Namen der eBay Business Policy entsprechen, z. B. `Kostenloser Versand`. eBay erkennt diese Namen nur, wenn die jeweiligen Policies im Verkäuferkonto existieren.

Optional können internationale Versandspalten ergänzt werden: `IntlShippingService-1:Option`, `IntlShippingService-1:Cost`, `IntlShippingService-1:Priority` und `IntlShippingService-1:Locations`. Der Versandservice-Code muss zu deinem eBay-Konto bzw. deiner Vorlage passen.

## Kommandozeile

```powershell
node .\cli.js `
  --shopify "C:\Users\HP\Downloads\products_export.csv" `
  --template "C:\Users\HP\Downloads\SMPBaseTemplate.csv" `
  --out ".\out\atelier-orlo-ebay-variants.csv" `
  --category 28009 `
  --quantity 3 `
  --vat-percent 19 `
  --action VerifyAdd `
  --shipping-profile "Kostenloser Versand" `
  --return-profile "30 Tage Rueckgabe" `
  --max-images 8
```

Mit `--sample 5` wird nur ein Testexport für die ersten fünf Produkte gebaut.
Standard ist `--action VerifyAdd`, damit eBay die Datei erst prüft. Mit `--publish` oder `--action Add` werden aktive Angebote veröffentlicht. Mit `--draft` oder `--action Draft` wird `Draft` geschrieben.
Mit `--revise --item-id-map "eBay-Ergebnisdatei.csv"` wird eine Revise-Datei für bestehende aktive Angebote erzeugt.
Mit `--listing-mode flat` wird der alte Einzel-Listing-Modus erzwungen.
Mit `--extra-images` werden globale Zusatzbilder ergänzt.
Mit `--product-extra-images` werden Zusatzbilder produkt-spezifisch nach Shopify-Handle ergänzt.
Mit `--no-c-prefix` werden Merkmale ohne `C:` geschrieben, wenn eine eBay-Kategorievorlage exakt diese Spalten verwendet.

## Passwortschutz

Auf Vercel schützt `APP_PASSWORD` die App über eine Login-Seite. Der Standard-Benutzername ist `atelier`; optional kann er über `APP_USERNAME` geändert werden.

## Hinweis

Amazon-Export ist noch nicht umgesetzt. Der aktuelle Fokus ist eBay, weil die eBay-Variantenstruktur zuerst zuverlässig funktionieren muss.
