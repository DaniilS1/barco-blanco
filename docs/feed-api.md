# Product Feed API

XML-Feed aller Produkte aus Sanity unter `GET /api/feed.xml` im Format **`yml_catalog`** (YML / „shops.dtd" – Standard für ukrainische Marktplätze & Preisvergleiche).

## Endpunkt

| | |
|---|---|
| **URL** | `GET /api/feed.xml` |
| **Response** | `application/xml; charset=utf-8` |

## Query-Parameter

| Parameter | Werte | Beschreibung |
|-----------|--------|--------------|
| `download` | `1` oder `true` | Antwort wird als Datei angeboten (`Content-Disposition: attachment; filename="feed.xml"`). |

**Beispiele:**

- Im Browser anzeigen: `https://barco-blanco.ua/api/feed.xml`
- Als Datei herunterladen: `https://barco-blanco.ua/api/feed.xml?download=1`

## XML-Struktur

```xml
<?xml version="1.0" encoding="utf-8"?>
<yml_catalog date="2026-09-04 10:00">
  <shop>
    <name>Barco Blanco</name>
    <company>Barco Blanco</company>
    <url>https://barco-blanco.ua</url>
    <currencies>
      <currency id="UAH" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Дзеркала</category>
      <!-- ... -->
    </categories>
    <offers>
      <offer id="{sanity _id}" available="true">
        <url>https://barco-blanco.ua/productDetails/{slug}</url>
        <price>2499.90</price>
        <currencyId>UAH</currencyId>
        <categoryId>1</categoryId>
        <picture>https://cdn.sanity.io/.../a.jpg</picture>
        <picture>https://cdn.sanity.io/.../b.jpg</picture>
        <vendor>Barco Blanco</vendor>
        <stock_quantity>1</stock_quantity>
        <name>Produktname</name>
        <description><![CDATA[Beschreibung/Details]]></description>
        <vendorCode>{slug}</vendorCode>
        <param name="Ширина (см)">80</param>
        <param name="Висота (см)">120</param>
        <param name="Глибина (см)">45</param>
      </offer>
    </offers>
  </shop>
</yml_catalog>
```

## Feld-Mapping (Sanity → Feed)

| Feed-Element | Quelle | Anmerkung |
|---|---|---|
| `offer@id` | `_id` | Sanity-Dokument-ID |
| `offer@available` | `isAvailable` | `true` / `false` |
| `url` | `slug` | `{Basis-URL}/productDetails/{slug}` |
| `price` | `price` | 2 Nachkommastellen |
| `currencyId` | fest | `UAH` |
| `categoryId` | `category` | feste ID-Zuordnung, siehe unten |
| `picture` | `image[].asset.url` | alle Bilder, ohne Resize |
| `vendor` | fest | `Barco Blanco` (kein Markenfeld im Schema) |
| `stock_quantity` | `isAvailable` | abgeleitet: `true` → `1`, `false` → `0` (keine echte Lagerzahl) |
| `name` | `name` | |
| `description` | `details` | als CDATA |
| `vendorCode` | `slug` | Platzhalter, solange es kein SKU-Feld gibt |
| `param` | `width` / `height` / `depth` | nur Maße (cm), nur wenn > 0 |

### Kategorie-IDs

Feste Zuordnung in `route.ts` (`CATEGORY_MAP`). Nur tatsächlich verwendete Kategorien landen in `<categories>`.

| Slug | ID | Titel |
|---|---|---|
| `dzerkala` | 1 | Дзеркала |
| `shafy` | 2 | Шафи |
| `tumby` | 3 | Тумби |
| `vologostiike` | 4 | Вологостійке |
| `penaly` | 5 | Пенали |

## Offene Punkte / spätere Erweiterungen

- **`vendorCode`** – aktuell `slug`. Sobald es echte Artikelnummern gibt: SKU-Feld in Sanity ergänzen und hier mappen.
- **`stock_quantity`** – aktuell nur 0/1 aus dem Boolean. Für echte Bestände ein Zahlenfeld `stock` im Schema ergänzen.
- **`param`** – aktuell nur Abmessungen. Weitere Attribute (Material, Farbe, Montageart …) existieren im Schema noch nicht.

## Caching

- **Revalidierung:** 1 Stunde (`revalidate = 3600`)
- **Header:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

Daten kommen aus Sanity (GROQ); Entwürfe werden nicht einbezogen.

## Basis-URL für Links

Produkt-URLs nutzen (in dieser Reihenfolge):

1. `NEXT_PUBLIC_SITE_URL` (z. B. `https://barco-blanco.ua`)
2. `https://${VERCEL_URL}` (auf Vercel gesetzt)
3. Origin der Anfrage
4. Fallback: `NEXT_PUBLIC_APP_URL`, dann `http://localhost:3000`

Für stabile Links in Produktion `NEXT_PUBLIC_SITE_URL` in der Umgebung setzen.

## Fehler

Bei Fehlern (z. B. Sanity nicht erreichbar) antwortet die API mit **500** und JSON:

```json
{ "error": "Failed to generate product feed" }
```

## Implementierung

- Route: [`app/api/feed.xml/route.ts`](../app/api/feed.xml/route.ts)
- Daten: Sanity `productQuery` in `sanity/lib/queries/productQueries.ts`
