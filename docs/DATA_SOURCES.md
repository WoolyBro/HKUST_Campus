# Data sources and licences

All sources were identified and their terms checked on **2026-11-10**, before any modelling.
The machine-readable version of this page is
[`data/source-manifest.json`](../data/source-manifest.json), which the site's
_About → Sources & licences_ panel reads directly.

## 1. OpenStreetMap (via the Overpass API)

|             |                                                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL         | <https://www.openstreetmap.org/>                                                                                                                                                                                                                                 |
| Licence     | Open Database License (ODbL) 1.0 — <https://www.openstreetmap.org/copyright>                                                                                                                                                                                     |
| Accessed    | 2026-11-10. **The Overpass mirror that answered served a snapshot dated 2026-07-24T11:04Z**, so edits made to OpenStreetMap after that date are not in this release                                                                                              |
| Used for    | The HKUST campus boundary polygon (way 40664120, `amenity=university`); building footprints and tags; roads, footpaths, steps, bridges; water, coastline, woodland, grass, gardens; pitches, car parks, squares; entrances, bus stations, artworks, named points |
| How         | One reproducible query by `scripts/fetch-osm.ts`, limited to the study-area polygon and to the feature keys the model needs. Raw response, query text, endpoint and timestamps are cached in `data/raw/`                                                         |
| Attribution | "© OpenStreetMap contributors" — shown permanently in the site footer                                                                                                                                                                                            |
| Published?  | Yes, as derived block data (rasterised, meshed). Derived databases remain under ODbL                                                                                                                                                                             |

The website never contacts Overpass. No OSM raster tiles are downloaded.

## 2. Lands Department, HKSAR Government — Digital Terrain Model (5 m)

|             |                                                                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL         | <https://data.gov.hk/en-data/dataset/hk-landsd-openmap-5m-grid-dtm> (file `Whole_HK_DTM_5m.zip`)                                                                                              |
| Licence     | DATA.GOV.HK Terms and Conditions of Use — <https://data.gov.hk/en/terms-and-conditions>                                                                                                       |
| Accessed    | 2026-11-10                                                                                                                                                                                    |
| Used for    | Terrain elevation: a 274 × 300 cell crop, resampled to the 1 m project grid                                                                                                                   |
| Attribution | "Terrain: Digital Terrain Model © The Government of the Hong Kong SAR (Lands Department), from DATA.GOV.HK" — shown in the footer and Sources panel                                           |
| Published?  | Yes, as derived block heights. The terms allow free commercial and non-commercial reproduction and distribution provided the source is identified and the Government's ownership acknowledged |

Notes from the publisher: accuracy ±5 m; the surface includes non-ground information such as
elevated roads and bridges, and vegetation height where land is covered by vegetation.

## 3. Lands Department, HKSAR Government — Building dataset

|             |                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL         | <https://data.gov.hk/en-data/dataset/hk-landsd-openmap-landsd-building> (CSDI dataset `landsd_rcd_1637211194312_35158`, WFS)                                                                                                                                                                                                                |
| Licence     | DATA.GOV.HK Terms and Conditions of Use — <https://data.gov.hk/en/terms-and-conditions>                                                                                                                                                                                                                                                     |
| Accessed    | 2026-11-10                                                                                                                                                                                                                                                                                                                                  |
| Used for    | 904 building polygons in the study area: building names (English / Chinese), base and top heights, podium / tower type. They supply building heights and the podium / tower split, name buildings OpenStreetMap leaves unnamed, and give an independent polygon to cross-check each OSM footprint. Footprints still come from OpenStreetMap |
| How         | One paged WFS request by `scripts/fetch-landsd-buildings.ts`; raw response cached in `data/raw/`, a slim copy kept in `data/processed/landsd-buildings.geojson`                                                                                                                                                                             |
| Attribution | "Building data © The Government of the Hong Kong SAR (Lands Department), from DATA.GOV.HK" — shown in the footer and Sources panel                                                                                                                                                                                                          |
| Published?  | Yes, as derived block heights and names, and as the slim processed copy, with attribution                                                                                                                                                                                                                                                   |

The official polygons are matched to OSM footprints by raster overlap, so a value can be
mis-assigned where the two datasets disagree.

## 4. The Hong Kong University of Science and Technology — official Campus Map (PDF)

|             |                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| URL         | <https://publish.ust.hk/univ/maps/Campus_Map_Color.pdf>                                                                                                                                                                                                            |
| Rights      | © The Hong Kong University of Science and Technology. **No open licence.**                                                                                                                                                                                         |
| Accessed    | 2026-11-10                                                                                                                                                                                                                                                         |
| Used for    | Authoritative naming only: 48 building names (English / Chinese) and three place names                                                                                                                                                                             |
| How         | **Transcribed by hand** into [`data/curated/official-hkust.json`](../data/curated/official-hkust.json). `scripts/fetch-official.ts` caches the PDF in `data/raw/` (git-ignored) with its SHA-256 and date as evidence, and converts the curated list for the build |
| Attribution | "Building names: official HKUST Campus Map (© The Hong Kong University of Science and Technology)"                                                                                                                                                                 |
| Published?  | Only the factual names, with attribution. The PDF and its artwork are **not** redistributed                                                                                                                                                                        |

**Restrictions stated before use:**

- This is not open data. The project uses it as a factual reference for an unofficial,
  non-commercial educational model. Obtain HKUST's permission before any commercial use, and
  remove the derived names if HKUST objects.
- The map is a **schematic drawing without coordinates**. Nothing is positioned or shaped from
  it; every position in the model comes from OpenStreetMap.
- Because the names were typed in by hand from the PDF, transcription errors are possible.
- The map does not divide the campus into zones (it only labels the Lee Shau Kee Campus). The
  five zones in [`data/campus-zones.json`](../data/campus-zones.json) are a project grouping.

## 5. HKUST Path Advisor — building list

<https://pathadvisor.ust.hk/> (© HKUST, no open licence). Used only for three building
abbreviations — `CYT`, `LSK`, `IAS` — shown in search and the inspector. Path Advisor's indoor
floor plans and room data are **not** used.

## 6. Official HKUST photographs (private reference only)

Photographs on the official HKUST website were viewed to understand the Academic Building's
Piazza façade and the Red Bird sundial. **Nothing from them is shipped** — no image, crop, trace
or texture. Most other buildings were not checked against photographs at all.

## 7. Lands Department — Hong Kong Imagery Map API (private audit reference)

|            |                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| URL        | <https://portal.csdi.gov.hk/csdi-webpage/apidoc/ImageryMapAPI>                                                                                                                                   |
| Rights     | © The Government of the Hong Kong SAR. **Not open data** ("Aerial Photograph from Lands Department")                                                                                             |
| Accessed   | 2026-11-11                                                                                                                                                                                       |
| Used for   | A visual audit only: 89 aerial-photo tiles of the campus (64 at zoom 18, 25 close-ups of the Piazza at zoom 20) were placed next to a top-down render of the model to see where the two disagree |
| How        | `scripts/audit/fetch-reference-imagery.ts` caches the tiles in `data/raw/imagery/`; `scripts/audit/compare.ts` writes side-by-side sheets to `data/raw/audit/`. Both folders are git-ignored     |
| Published? | **No.** No tile, crop, trace or texture is shipped. What is published are the hand-written corrections in `data/manual-overrides.json` that looking at the photographs led to                    |

The service does not state when the photographs were taken, so they may be older or newer than
the OpenStreetMap snapshot. Imagery is never draped over the model and nothing is traced
automatically from it. One correction (the open lawn inside the "LG7 Lawn Area" polygon) uses an
outline estimated by eye from the photograph; it is marked approximate.

## 8. Typeface

Pixelify Sans (SIL Open Font License 1.1), self-hosted through `@fontsource/pixelify-sans`.

## Student-guide sources

| Source                                                                                                                                      | Licence                                 | Used for                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| OpenStreetMap supplementary extract (shops, emergency points, healthcare, offices) — `scripts/fetch-osm-extra.ts`                           | ODbL 1.0                                | Guide places, merged with the main extract                          |
| Transport Department, Public transport GTFS (<https://data.gov.hk/en-data/dataset/hk-td-tis_11-pt-headway-en>) — `scripts/fetch-transit.ts` | DATA.GOV.HK Terms and Conditions of Use | Stops and routes (13 stops, 13 routes)                              |
| Antiquities and Monuments Office, Declared Monuments (CSDI portal WFS) — `scripts/fetch-hk-monuments.ts`                                    | DATA.GOV.HK Terms and Conditions of Use | Heritage status of 0 monuments in the area                          |
| Wikidata — `scripts/fetch-guide-facts.ts`                                                                                                   | CC0 1.0                                 | Built, architect, style and heritage of buildings (structures only) |
| Curated tours — `data/curated/tours.json`                                                                                                   | written for this project                | Tour stops and short stop texts                                     |

## Deliberately not used

- Google Maps / Google Earth, Bing Maps, Apple Maps, Mapbox imagery — not used in any form.
- Minecraft / Mojang textures, sounds, logos, fonts, UI or game files — none. All block textures
  are original and procedural.

## Software

Vite, React, TypeScript, three.js, React Three Fiber, Zustand, Tailwind CSS, fflate (runtime);
Turf.js, proj4, osmtogeojson, tsx, Vitest, Playwright, ESLint, Prettier (build and test). All are
permissively licensed open-source packages.
