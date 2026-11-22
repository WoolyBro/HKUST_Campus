# Accuracy and limitations

**HKUST Voxel Campus is an unofficial, stylised illustration. It must not be used for navigation,
accessibility or route planning, safety, emergency or operational decisions.** Use the official
HKUST Campus Map, HKUST Path Advisor and on-site signage for those.

## Coverage

The model covers a 1280 m × 1408 m area: the HKUST Clear Water Bay campus from the entrance on
Clear Water Bay Road, through the Academic Building, the Lee Shau Kee Campus, the student halls
and the staff quarters, down the hillside to the sports grounds and the Port Shelter seafront —
plus the neighbouring villages and housing along Clear Water Bay Road, the wooded hillside and
the sea (about 22 % of the area). Other HKUST sites are outside it.

## What is data-driven

| Aspect                                                                                     | Source                                                        | Notes                                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where buildings, roads, paths, stairs, bridges, water, woodland, pitches and car parks are | OpenStreetMap (**snapshot 2026-07-24**)                       | Volunteer-mapped; completeness varies. Rasterised to a 1 m block grid, so edges move by up to ~0.7 m. Anything built or re-mapped after the snapshot is missing |
| Terrain shape                                                                              | Lands Department 5 m DTM                                      | Published accuracy ±5 m. Can include tree canopy and elevated roads. Resampled bicubically to 1 m, lightly smoothed, then rounded to 1 m block steps            |
| HKUST building names                                                                       | Official HKUST Campus Map (PDF), transcribed by hand          | 40 of the 48 names matched to a footprint by name; they land on 36 buildings because some official names share one footprint                                    |
| Other building names                                                                       | OpenStreetMap (134), else Lands Department Building data (15) | 311 buildings that neither source names carry a descriptive label built from their nearest street — not a real name. 30 have no label at all                    |
| Building heights, podium / tower split                                                     | Lands Department Building data (top − base level)             | Used for 470 of 526 footprints; matched to OSM footprints by overlap                                                                                            |
| Bus stations, the Piazza, artworks                                                         | OSM nodes                                                     | Points, not shapes                                                                                                                                              |

## Student guide

The 🎓 Student guide adds walking tours, and every campus building's inspector shows what a student
needs: facts with their sources, the places mapped inside it, what is near it, and accessibility as
mapped.

| Information   | Source                                                                                                                                                | Campus buildings |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Facts         | Wikidata (built, architect, style, heritage — only items that are buildings, matched by name within 80 m); Antiquities and Monuments Office; OSM tags | 0                |
| Mapped inside | OSM places located inside the footprint                                                                                                               | 10               |
| Nearby        | nearest station, stops with routes, library, cafés, food, bike share                                                                                  | 53               |
| Accessibility | OSM `wheelchair` and mapped entrances                                                                                                                 | 3                |

- **Transit:** official stops and routes from the Transport Department's GTFS feed (DATA.GOV.HK): 13 bus / minibus stops and 13 routes in the modelled area. The MTR is not in that feed; stations come from OpenStreetMap.
- **Heritage:** declared monuments from the Antiquities and Monuments Office (0 in the modelled area), matched to one building each by name or position.
- **Places:** 55 guide places appear as you zoom in: transit 13, food 16, cafés 4, libraries 1, safety 0, shops 4, and others. They are filterable under Layers and searchable ("coffee", "study", a route number). OpenStreetMap coverage varies, so a place missing from the map is not necessarily missing on the ground; opening hours are as mapped.
- **Distances:** "Nearby" distances are straight lines from the footprint, and walking times assume 80 m/min with a 30 % detour allowance.

| Tour                                             | Stops | Route  |
| ------------------------------------------------ | ----- | ------ |
| HKUST essentials: from the North Gate to the sea | 11    | 2.9 km |

**Tours:**

- **Routing:** routes are computed on the block grid (A*) along mapped footpaths, plazas and sidewalks. Crossing roads and open ground costs extra, and steep unmapped steps are heavily penalised. A walker may pass through a building that is a stop.
- **Stop texts:** short summaries written for this project from the facts in the inspector.
- **Not directions:** tours are illustrative and say nothing about step-free access. Facts that disagree between sources are shown side by side.

## What is interpreted or invented

- **Official names are attached by name, not by position.** The official map is a schematic PDF
  with no coordinates. A name reaches a building only when OpenStreetMap or the Lands Department
  data carries the same name (or a listed alias) for that footprint. A wrong name in either of
  those sources, or a slip in my transcription, would carry straight through.
- **The Academic Building is one megastructure.** It is modelled as a single exterior shell from
  its mapped outline, with wing heights from Lands Department data. Its atrium, lecture-theatre
  blocks, lift towers, internal concourses and numbered lifts are not modelled.
- **Terrain grading.** Roads and paths are levelled along their real centre-lines, pitches and
  ponds are flattened, building plots are terraced, and ground under bridges is interpolated.
  The real campus steps down the hill through podiums, lifts and covered walkways that are far
  more intricate than this.
- **Architecture.** Façades, window rhythm, floor bands, parapets, roof plant, entrances and
  canopies are procedural (Tier B) or hand-styled (Tier A). Tier B colours are palette guesses
  (white tile for academic buildings, red-brick bases for halls) — not a survey, and mostly not
  checked against photographs.
- **Heights.** 470 of 526 footprints (55 of the 57 Tier A/B buildings) take their height from
  Lands Department building data. Each official polygon is matched to an OSM footprint by
  overlap, so a height can be wrong where the datasets disagree, and slopes make "height above
  base" ambiguous. The remaining buildings use OSM `building:levels` (20), a typical value for
  the building type (20) or a 7 m placeholder (16).
- **Floor counts** shown in the inspector come from OSM where tagged; otherwise they are derived
  from the height and are approximate.
- **Built-up ground.** Flat, unmapped ground between off-campus buildings is drawn as paved
  ground. That is an inference from the context, not mapped data.
- **Vegetation.** Woodland follows OSM `natural=wood` polygons where mapped. Unmapped, unbuilt
  ground is also treated as woodland, because the aerial-photo audit showed the hillside is
  almost continuous canopy; mapped lawns, gardens and pitches stay open. Individual trees are
  decorative. No tree is placed on a building, road, court, plaza or water (tested).
- **Street furniture.** Lamps are spaced by rule along campus roads.
- **Zones.** The official map has no zones; it only labels the Lee Shau Kee Campus. Academic
  Core, Student Halls & Apartments, Staff Quarters and Sports & Waterfront are project
  groupings, and every zone's extent is simply the area nearest its buildings.
- **Red Bird sundial and the Piazza.** The sundial is a point in OpenStreetMap; its three red
  blades and round plinth are my interpretation of an official photograph. The roundabout island
  it stands on is paved and kept free of trees (manual override, checked against the aerial
  photograph). The two arcs of small planter trees on the Piazza are generated by rule: their
  number and positions are approximate.
- **Covered footbridges.** The Bridge Link and the Fong Shu Chuen Promenade are given a width of
  6 m and a generic roof by manual override; OpenStreetMap records neither.

## Building tiers — never mixed up

| Tier                         | Count | Meaning                                                                                                                                                                                                                                          |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A — landmark model           | 2     | Real footprint + bespoke block model: the Academic Building and the Shaw Auditorium                                                                                                                                                              |
| B — detailed footprint model | 55    | On-campus building: real footprint, official height where available, procedural façade with a palette hint                                                                                                                                       |
| C — context model            | 469   | Mostly off-campus buildings: real footprint, official height and podium / tower shape where available, **generic façade that is not specific to the building**. 16 with no height data, tiny footprints or under construction stay plain massing |

A Tier C building's geometry is always labelled _stylised / approximate_ and is never reported as
verified geometry, even when its height is official (enforced by a unit test).

On the two Tier A models: the Academic Building's white-tile grid of square windows over a dark
recessed base follows an official photograph of the Piazza front; it is applied uniformly to the
whole building, which is a simplification. The Shaw Auditorium's oval plan and the concentric
white rings of its roof were checked from above against the aerial photograph; its side
elevation follows published descriptions and **was not checked against a ground-level photograph**.

## Geometry confidence

| Class                  | Count | Rule                                                                                                                                                           |
| ---------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verified geometry      | 36    | Officially named building whose OSM footprint is confirmed by a Lands Department building polygon covering at least half of it                                 |
| Inferred geometry      | 21    | Other Tier A/B buildings: an OSM footprint without that cross-check, or without an official HKUST name (most staff-quarters blocks, plant rooms, the car park) |
| Stylised / approximate | 469   | Tier C                                                                                                                                                         |

"Verified" here means _two independent mapping sources agree on where the building is and the
name matches the official map_. It does not mean the block model's shape, façade or height has
been surveyed. The overlay uses a pattern (solid / diagonal stripes / checker) and a text legend
as well as colour.

## Height hierarchy

1. **Verified** — Lands Department building data (top minus base level of the overlapping official polygon).
2. **OSM `height`**, else **OSM `building:levels`** × floor height (3.5 m; 3.1 m residential).
3. **Reference estimate** — a floor count recorded in `data/manual-overrides.json` (none in this release).
4. **Category heuristic** — a typical floor count for the building type.
5. **Placeholder** — 7 m.

The inspector shows the source and confidence for every building.

## Validation performed

- **Landmark coordinates** (`tests/landmarks.test.ts`): eight buildings — Shaw Auditorium, Lee
  Shau Kee Business Building, Cheng Yu Tung Building, Martin Ka Shing Lee Innovation Building,
  the Institute for Advanced Study / Lo Ka Chung Building, Wong Check She Research Center,
  Tsang Shiu Tim Sports Center and Staff Quarters Tower 3 — are checked against the centroid of
  the Lands Department polygon that carries the same name. Each centroid falls on or within
  15 m of the modelled footprint. This compares two independent datasets (OpenStreetMap and
  Lands Department) through the project's projection; HKUST publishes no coordinates to test
  against.
- **Relative layout and relief**: the sports centre east of the Academic Building, the Lee Shau
  Kee Campus to the south, the President's Lodge at the north end; the Academic Building's base
  above 90 m, the sports centre below 25 m, the Water Sports Center on the waterfront.
- **Grounding**: every major building reaches the terrain and rises above it.
- **Trees** never stand on buildings, roads, courts, plazas or water.

## Audit against aerial photographs (2026-11-11)

The whole campus (the boundary plus a 40 m margin) was compared, in twelve 300 m squares, with
Lands Department aerial photographs: the photograph on one side, a top-down render of the built
model on the other, on the same grid (`scripts/audit/`). The photographs are a private
reference and are not shipped. Map outlines from OpenStreetMap and the Lands Department were
drawn over the photographs to check registration.

**What matched:** building positions and outlines, roads, the running track, pitches, tennis
courts, the outdoor pool, car parks, the coastline and pier, the Shaw Auditorium's oval, and the
construction areas in the south-west (bare earth in the photographs too).

**What was wrong and has been corrected** (each recorded in `data/manual-overrides.json`):

| Problem found                                                                                                                                                      | Correction                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Red Bird sundial stood on a grass island among trees. In reality the island and the roundabout are part of the paved Piazza and the sundial stands in the open | Island, carriageway and kerb paved like the Piazza; no tree within 20 m (tested); sundial given a round plinth; small planter trees added on the Piazza in two arcs |
| Unmapped ground was drawn as open grass with scattered trees. In reality nearly all of it is wooded hillside                                                       | Default for unmapped, unbuilt ground changed to near-continuous woodland (about 23,000 → 28,900 trees)                                                              |
| One OpenStreetMap polygon, "LG7 Lawn Area", also covers the staff quarters and wooded slopes, so all of it was drawn as open lawn                                  | Treated as woodland except for the one plot that really is open lawn (outline estimated by eye, approximate)                                                        |
| The Bridge Link and the Fong Shu Chuen Promenade were thin open decks hidden by trees. In reality they are wide roofed footbridges                                 | Width set to 6 m, generic roof added, trees kept clear                                                                                                              |
| The Shaw Auditorium roof was a plain dome                                                                                                                          | Concentric white rings, as seen from above                                                                                                                          |

**What still differs and was left alone:**

- The Academic Building's roofscape. The real building is a dense mosaic of blocks, courtyards,
  glazed atrium roofs and plant; the model is one shell with stepped flat roofs.
- Roof colours and roof equipment everywhere are generic.
- The lawn mapped next to the Lee Shau Kee Campus car park is open in the photographs; the model
  scatters a few ornamental trees on it (the rule for mapped parks).
- The photographs' date is unknown. Where they disagree with the July 2026 OpenStreetMap
  snapshot about construction works, the model follows OpenStreetMap.
- Off-campus buildings, villages and housing were **not** audited.
- The audit is my reading of photographs at about 0.5 m per pixel, in plan view only. It cannot
  check façades, heights or anything under tree canopy.

## Not done

- No field survey, and no audit of anything outside the campus boundary.
- No building-by-building façade or height verification.
- **Eight names on the official map have no matching building footprint.** Seven are missing
  from the model: HKUST Medical Education and Research Complex, S H Ho Sports Hall, S H Ho Tower,
  UniLodge, Fok Ying Tung Sports Center, Indoor Swimming Pool and HKUST AI Supercomputing Center.
  Some are new or under construction and absent from the July 2026 OpenStreetMap snapshot;
  others may be in the data unnamed or under a different name, in which case their footprint is
  modelled but not labelled with the official name. The eighth, the Daniel & Mayce Yu Research
  Building, is mapped in OpenStreetMap as a construction site: it appears as a marker at the
  centre of that site, with no building.
- Construction sites mapped in OpenStreetMap are drawn as bare earth, including the large one
  west of the Lee Shau Kee Business Building.
- Official names that share a footprint with another (Jockey Club Tower with Hall VI, the
  Distinguished Guest Lodge with the President's Lodge, the Ocean Research Facility with the
  sports centre) are searchable aliases of that building, not separate models.
- Interiors, the Academic Building's atrium and concourses, lifts, escalators, podium levels and
  building passages are not modelled.
