---
sidebar_position: 6
---

# Working on maps

## Vector maps (Mapbox GL)

The manager has built in support for `Mapbox GL` and can serve vector tile data. Tiles can be configured from the appearance page or through a custom deployment. Please ensure to check the following:

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

## Raster maps (Mapbox JS)
If you are working on raster maps (Mapbox JS) then you will need to have the `map` Docker container running, this container serves the raster map tiles from the vector map data.

The container can be started by using the `dev-map.yml` profile (see [here](docker-compose-profiles.md)) or you can add a `map` service to an existing custom project profile (copy the `dev-map.yml` as a template).

The manager acts as a reverse proxy for the `map` service and in order to configure the manager to serve raster tiles you need to set the following environment variables:

```shell
MAP_TILESERVER_HOST=localhost
MAP_TILESERVER_PORT=8082
MAP_TILESERVER_REQUEST_TIMEOUT=10000
```

:::note

By default `MAP_TILESERVER_HOST` is `null` which means the reverse proxy is disabled

:::

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
