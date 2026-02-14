# Product Feed API (`/api/feed.xml`)

XML-Feed aller Produkte aus Sanity. Geeignet für Preisvergleiche, Marktplätze oder den direkten Download.

## Endpunkt

- **URL:** `GET /api/feed.xml`
- **Response:** `application/xml`

## Query-Parameter

| Parameter  | Werte        | Beschreibung |
|-----------|--------------|--------------|
| `download` | `1` oder `true` | Antwort wird als Datei angeboten (`Content-Disposition: attachment; filename="feed.xml"`). |

**Beispiele:**
- Im Browser anzeigen: `https://deine-domain.de/api/feed.xml`
- Als Datei herunterladen: `https://deine-domain.de/api/feed.xml?download=1`

## XML-Struktur

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <products>
    <product>
      <name>Produktname</name>
      <url>https://.../productDetails/slug</url>
      <price>123.45</price>
      <category>dzerkala</category>
      <availability>in stock</availability>
      <description>Beschreibungstext</description>
      <width>80</width>
      <height>120</height>
      <depth>45</depth>
      <isPopular>true</isPopular>
      <image>https://cdn.sanity.io/.../800x...</image>
      <images><url>...</url><url>...</url></images>
    </product>
    <!-- weitere Produkte -->
  </products>
</feed>
```

## Felder pro Produkt

| Element        | Inhalt |
|----------------|--------|
| `name`         | Produktname |
| `url`          | Absolute URL zur Produktseite |
| `price`        | Preis (Zahl) |
| `category`     | Kategorie-Slug (z. B. `dzerkala`, `shafy`, `tumby`) |
| `availability` | `in stock` oder `out of stock` |
| `description`  | Beschreibung/Details (kann leer sein) |
| `width`        | Breite in cm |
| `height`       | Höhe in cm |
| `depth`        | Tiefe in cm |
| `isPopular`    | `true` oder `false` |
| `image`        | URL des ersten Bildes (800px Breite) |
| `images`       | Alle Bild-URLs als `<url>`-Elemente |

## Caching

- **Revalidierung:** 1 Stunde (`revalidate = 3600`)
- **Header:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

Daten kommen aus Sanity (GROQ); Entwürfe werden nicht einbezogen.

## Basis-URL für Links

Produkt- und Bild-URLs nutzen nacheinander:

1. `NEXT_PUBLIC_SITE_URL` (z. B. `https://shop.example.com`)
2. `https://${VERCEL_URL}` (auf Vercel gesetzt)
3. Origin der Anfrage (`request.url`)

Für stabile Links in Produktion `NEXT_PUBLIC_SITE_URL` in der Umgebung setzen.

## Fehler

Bei Fehlern (z. B. Sanity nicht erreichbar) antwortet die API mit **500** und JSON: `{ "error": "Failed to generate product feed" }`.
