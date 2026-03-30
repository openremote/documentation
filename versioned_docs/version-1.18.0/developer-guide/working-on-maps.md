---
sidebar_position: 6
---

# Working on maps

## MapLibre GL

The manager has built in support for `MapLibre GL` and can serve vector tile data. Tiles can be configured from the appearance page or through a custom deployment. Please ensure to check the following:

### Uploading MBTiles

The `*.mbtiles` file size must be equal or less than the specified tile upload limit. The default limit is 30MB, this can be increased with `OR_CUSTOM_MAP_SIZE_LIMIT`. The tiles should adhere to the [MBTiles specification](https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md).

```sh
OR_CUSTOM_MAP_SIZE_LIMIT: 1000000000 # 1GB
```

The `*.mbtiles` file is a SQLite database under the hood. OpenRemote validates that this contains the required metadata. In case something is missing in the metadata table (see [troubleshooting](#troubleshooting)).

### Custom Deployment

Make sure the deployment folder contains the following files:

* `map/mapsettings.json` - Contains settings related to the map tiles source data and also UI rendering settings (e.g. center point of map when first loaded)
* `map/mapdata.mbtiles` - Contains the vector map data (adding it here will override the demo map for Rotterdam, located in the manager folder `src/map`)

If you have the map data and/or settings in a different location then please ensure that the manager environment variables are set also:
```shell
MAP_TILES_PATH=../deployment/map/mapdata.mbtiles
MAP_SETTINGS_PATH=../deployment/map/mapsettings.json
```

### Troubleshooting

If the `*.mbtiles` have failed to upload, load- or display correctly please make sure to check all the required metadata fields are present.
```sh
sqlite3 -cmd "SELECT * FROM metadata;" example.mbtiles
```

Update or insert `bounds` into the metadata table.
```sh
sqlite3 -cmd "INSERT INTO metadata (name, value) VALUES ('bounds', '5.144469,51.245319,5.783558,51.647744') ON CONFLICT(name) DO UPDATE SET value = excluded.value;" example.mbtiles
```

<details>
    <summary>See required fields</summary>

```
name|eindhoven # Currently ignored
attribution|<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>
bounds|5.144469,51.245319,5.783558,51.647744
center|5.464014,51.446532,7
format|pbf # Currently ignored
maxzoom|14
minzoom|0
json|{...}
```

</details>

## Geocoding

The map component includes built-in geocoding support using [Nominatim](https://nominatim.org/) (OpenStreetMap's geocoding service) via the [`@maplibre/maplibre-gl-geocoder`](https://github.com/maplibre/maplibre-gl-geocoder) library. When enabled, a search box is shown on the map that supports both forward geocoding (address to coordinates) and reverse geocoding (coordinates to address).

For configuring the geocode URL and setting up a self-hosted Nominatim instance, see the user guide: [Geocoding](../user-guide/manager-ui/geocoding.md).

### Enabling geocoding in `or-map`

The `<or-map>` web component has a `showGeoCodingControl` boolean property (default: `false`) that controls whether the geocoding search box is rendered. In the Manager app (`ui/app/manager/src/pages/page-map.ts`), geocoding is enabled by default:

```html
<or-map id="map" class="or-map"
    showGeoCodingControl
    @or-map-geocoder-change="${(ev: OrMapGeocoderChangeEvent) => {
        this._setCenter(ev.detail.geocode);
    }}">
</or-map>
```

To enable geocoding in your own component:

```html
<or-map
    .showGeoCodingControl="${true}"
    @or-map-geocoder-change="${(ev) => {
        // ev.detail.geocode contains the selected result
        // ev.detail.geocode.geometry.coordinates = [lng, lat]
        // ev.detail.geocode.place_name = display name
        console.log('Selected:', ev.detail.geocode.place_name);
    }}">
</or-map>
```

:::note

The geocoding control only initializes when both `showGeoCodingControl` is `true` **and** a valid `geocodeUrl` is present in the realm's map settings (`mapsettings.json`). If no `geocodeUrl` is configured, the search box will not appear even if `showGeoCodingControl` is set.

:::

### How it works

The `MapWidget` class (`ui/component/or-map/src/mapwidget.ts`) handles the geocoding logic. It registers a `MaplibreGeocoder` control that sends requests to the Nominatim API:
- **Forward**: `{geocodeUrl}/search?q={query}&format=geojson&polygon_geojson=1&addressdetails=1`
- **Reverse**: `{geocodeUrl}/reverse?lat={lat}&lon={lon}&format=geojson&polygon_geojson=1&addressdetails=1`

The `geocodeUrl` is read from the realm's `ViewSettings`, which are loaded from `mapsettings.json` via `MapService`.

### `or-map-geocoder-change` event

When the user selects a geocoding result, the `or-map-geocoder-change` event is fired. The event detail contains:

```typescript
{
  geocode: {
    geometry: {
      coordinates: [lng, lat]  // longitude, latitude
    },
    place_name: string,        // display name of the result
    properties: object         // additional address details from Nominatim
  }
}
```

## Downloading maps and extracting smaller tilesets
We currently do not have our own pipeline for extracting/converting OSM data into vector tilesets but depend on the extracts offered on [openmaptiles.org](https://openmaptiles.com/downloads/). You can download the vector `mbtiles` file that contains the bounding box of interest.

From that mbtiles file you can extract smaller tilesets with the following procedure:

1. Rename the source tileset file `input.mbtiles`
2. Create Docker container with `node` and `python` with dir containing `input.mbtiles` volume mapped: `docker run -it --rm -v PATH_TO_INPUT_MBTILES_DIR:/mapdata nikolaik/python-nodejs:python3.8-nodejs12 bash`
3. Install tilelive converter:
    `npm install -g --unsafe @mapbox/mbtiles @mapbox/tilelive`
4. Select and copy boundary box coordinates of desired region (these are the BOUNDS used in the next command; they must be in format [W,S,E,N] e.g. `4.91, 51.27, 5.84, 51.77`):
    https://tools.geofabrik.de/calc/#tab=1 (use the coordinates in 'Simple Copy' and add the commas)
5. Extract the desired region (adjust the zoom levels as required and optionally add `--timeout=Nms` if the task times out): `tilelive-copy --minzoom=0 --maxzoom=14 --bounds="FILL_BOUNDS_HERE" /mapdata/input.mbtiles /mapdata/output.mbtiles`
6. Rename `output.mbtiles` into `mapdata.mbtiles`
