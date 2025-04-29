---
sidebar_position: 3
---

# Appearance Page

## Map Settings

If you want to adjust the map styling. You can change the map on the appearance page. Here you have the following options:

| Method                      | Description                                                                                                                                                                                                                                                                                                   | When to use?                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Style JSON URL              | Override the default map with a `style.json` URL (e.g. `https://api.example.com/maps/streets/style.json?key=your_key`) from a Map/Tile provider that supports MapLibre (see [providers](https://github.com/maplibre/awesome-maplibre?tab=readme-ov-file#maptile-providers))                                   | If you want to configure a different map quickly.                                                                     |
| Custom Server Configuration | Enable the "configure" checkbox and specify the TileJSON URL, Glyphs URL and Layers (from a [provider](https://github.com/maplibre/awesome-maplibre?tab=readme-ov-file#maptile-providers) that supports MapLibre). You may optionally configure a Tile server URL (to see more of a map) and/or a Sprite URL. | If you want to be able to edit the map styling in OpenRemote on the appearance page, but also use an external server. |
| Realm Map Styling           | You can add GeoJSON based points, lines and shapes from GeoJSON files. For creating GeoJSON files, you can use e.g. https://geojson.io/. For searching existing GeoJSON map layers, you can use https://overpass-turbo.eu/.                                                                                   | If you want to add map layers per realm.                                                                              |
| Upload Custom `.mbtiles`    | The uploaded map will be used instead of the default (see [working on maps](../../developer-guide/working-on-maps#uploading-mbtiles) for more).                                                                                                                                                               | If you happen to have an `.mbtiles` file and  want to view a different part of the world.                             |
| Custom Deployment           | Configure the map through [custom deployments](../deploying/custom-deployment.md#map-deploymentmap).                                                                                                                                                                                                          | If you want full control over the configurations on the server (advanced usage).                                      |

:::tip
If the Map/Tile provider provides a `style.json` file you can extract the options for the `Custom Server Configuration` from the JSON file.
:::

:::note
OpenRemote picks how to render the map based on the configurations set in the following order: 1) `Style JSON URL` 2) `Custom Server Configuration` 3) `Realm Map Styling` 4) `Upload Custom .mbtiles` 5) `Custom Deployment`.
:::

The following tile servers have been tested.

- [Maptiler](https://maptiler.com)
- [Carto](https://carto.com/)

:::warning
Not all Map/Tile providers are fully supported e.g. [Mapbox](https://www.mapbox.com/)
:::
