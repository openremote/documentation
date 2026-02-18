---
sidebar_position: 4
---

# Geocoding

OpenRemote includes geocoding support that allows you to search for addresses and locations directly on the map. When enabled, a search box appears in the top-left corner of the [Map](./manager-ui.md#map) page. As you type, results are fetched from the configured [Nominatim](https://nominatim.org/) service (OpenStreetMap's geocoding service) and displayed as suggestions. Selecting a result pans the map to that location.

Geocoding provides two capabilities:
- **Forward geocoding** — search by address or place name to find coordinates
- **Reverse geocoding** — look up an address from coordinates

## Configuring the geocode URL

The geocoding service URL is configured per realm in `mapsettings.json`. You can set the `geocodeUrl` property in the `options` section for each realm:

```json
{
  "options": {
    "default": {
      "center": [4.483118, 51.915767],
      "bounds": [4.24, 51.89, 4.51, 51.99],
      "zoom": 15,
      "minZoom": 0,
      "maxZoom": 19,
      "boxZoom": false,
      "geocodeUrl": "https://nominatim.openstreetmap.org"
    }
  }
}
```

The `mapsettings.json` file is loaded by the manager from the first available location in this order:

1. Persisted storage: `{storage_dir}/manager/mapsettings.json`
2. Environment variable: `OR_MAP_SETTINGS_PATH`
3. Docker volume: `/opt/map/mapsettings.json`
4. Default: `manager/src/map/mapsettings.json`

For more details on map configuration, see [Working on maps](../../developer-guide/working-on-maps.md).

### Choosing a geocoding service

The `geocodeUrl` must point to a Nominatim-compatible API. You can use one of the following:

| Service | Description |
| :------ | :---------- |
| **Public Nominatim** | `https://nominatim.openstreetmap.org` — free, but subject to the [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/) (max 1 request/second, no heavy usage) |
| **Self-hosted Nominatim** | Run your own instance for higher throughput and no rate limits. See [setting up a self-hosted instance](#setting-up-a-self-hosted-nominatim-instance) below |
| **Other compatible services** | Any service that implements the Nominatim `/search` and `/reverse` endpoints with GeoJSON output support |

:::warning

The public Nominatim service has strict rate limits. For production deployments with multiple users, you should run a [self-hosted instance](#setting-up-a-self-hosted-nominatim-instance) or use another compatible service.

:::

### Disabling geocoding

To disable geocoding for a realm, either remove the `geocodeUrl` property from that realm's configuration in `mapsettings.json`, or set it to an empty string.

:::note

The geocoding search box only appears when both the `showGeoCodingControl` property on the map component is `true` **and** a valid `geocodeUrl` is present in the realm's map settings. In the Manager app, `showGeoCodingControl` is enabled by default. If you are building custom components, see [Working on maps — Geocoding](../../developer-guide/working-on-maps.md#geocoding) for how to enable it.

:::

## Setting up a self-hosted Nominatim instance

For production deployments or cases where the public Nominatim instance is insufficient, you can run your own Nominatim server. The easiest way is to use the [mediagis/nominatim](https://github.com/mediagis/nominatim-docker) Docker image.

### 1. Add Nominatim to your Docker Compose

```yaml
services:
  nominatim:
    image: mediagis/nominatim:4.4
    environment:
      PBF_URL: https://download.geofabrik.de/europe/netherlands-latest.osm.pbf
      REPLICATION_URL: https://download.geofabrik.de/europe/netherlands-updates/
    volumes:
      - nominatim-data:/var/lib/postgresql/14/main
    ports:
      - "8088:8080"

volumes:
  nominatim-data:
```

### 2. Point `geocodeUrl` to your instance

Update `mapsettings.json` to use your self-hosted Nominatim:

```json
{
  "options": {
    "default": {
      "geocodeUrl": "http://nominatim:8080"
    }
  }
}
```

### 3. Choose your map data

You can download OpenStreetMap extracts from [Geofabrik](https://download.geofabrik.de/) in PBF format. Choose the region that covers your deployment area. Some examples:

- Netherlands: `https://download.geofabrik.de/europe/netherlands-latest.osm.pbf`
- Europe: `https://download.geofabrik.de/europe-latest.osm.pbf`
- North America: `https://download.geofabrik.de/north-america-latest.osm.pbf`

:::note

Importing data requires significant resources depending on the region size. A country-level extract typically needs 8-16 GB RAM during import and 2-4 GB at runtime. The full planet (~70GB PBF) requires 64+ GB RAM for import. For most deployments, a country or region extract is sufficient.

:::

<details>
<summary>Resource requirements by data size</summary>

| Data size | RAM (import) | RAM (runtime) | Disk |
| :-------- | :----------- | :------------ | :--- |
| City/small region | 2 GB | 1 GB | 5-10 GB |
| Country | 8-16 GB | 2-4 GB | 20-100 GB |
| Continent | 32-64 GB | 8-16 GB | 200-500 GB |
| Full planet | 64+ GB | 16-32 GB | 1+ TB |

</details>

For more information on self-hosting Nominatim, see the [Nominatim installation guide](https://nominatim.org/release-docs/latest/admin/Installation/).

## See Also

- [Map](./manager-ui.md#map)
- [Appearance — Map Settings](./appearance.md#map-settings)
- [Working on maps](../../developer-guide/working-on-maps.md)
- [Working on maps — Geocoding](../../developer-guide/working-on-maps.md#geocoding)
- [Custom deployment — Map](../deploying/custom-deployment.md#map-deploymentmap)
