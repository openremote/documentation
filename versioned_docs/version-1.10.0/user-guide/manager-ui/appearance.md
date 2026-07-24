---
sidebar_position: 3
---

# Appearance Page

## Map Settings

If you want to adjust the map styling. You can change the map under Map Settings. Here you have the following options:

| Method                   | Description                                                                                                                                                                                                                                                                           | When to use?                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Style JSON URL           | Override the default map settings with a `style.json` URL (e.g. `https://api.example.com/maps/streets/style.json?key=your_key`) from a Map/Tile provider that supports MapLibre (see [providers](https://github.com/maplibre/awesome-maplibre?tab=readme-ov-file#maptile-providers)). | If you want to configure a different map quickly.                                           |
| Import Style Settings    | After configuring a Style JSON URL you can import it to include the layers allowing you to adjust the map styling. You may optionally configure a Tile server URL (to see more of a map).                                                                                             | If you want to be able to edit the map styling in OpenRemote, but also use an external map. |
| Realm Map Styling        | You can add GeoJSON based points, lines and shapes from GeoJSON files. For creating GeoJSON files, you can use e.g. https://geojson.io/. For searching existing GeoJSON map layers, you can use https://overpass-turbo.eu/.                                                           | If you want to add map layers per realm.                                                    |
| Upload Custom `.mbtiles` | The uploaded map will be used instead of the default (see [working on maps](../../developer-guide/working-on-maps#uploading-mbtiles) for more).                                                                                                                                       | If you happen to have an `.mbtiles` file and  want to view a different part of the world.   |
| Custom Deployment        | Configure the map through [custom deployments](../deploying/custom-deployment.md#map-deploymentmap).                                                                                                                                                                                  | If you want full control over the configurations on the server (advanced usage).            |

:::note
OpenRemote picks how to render the map based on the configurations set in the following order: 1) `Style JSON URL` 2) `Import Style Settings` & `Realm Map Styling` 3) `Upload Custom .mbtiles` 4) `Custom Deployment`.
:::

:::warning
Not all Map/Tile providers are fully supported, please check the provider supports MapLibre (see [maplibre providers](https://github.com/maplibre/awesome-maplibre?tab=readme-ov-file#maptile-providers)).
:::

The following tile servers have been tested.

| Provider                                | Supported                                                                                                                                                                        | Not Supported   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [Maptiler](https://maptiler.com)        | Most standard maps can be imported                                                                                                                                               |                 |
| [Carto](https://carto.com/)             | Basemaps                                                                                                                                                                         |                 |
| [Mapbox](https://mapbox.com/)           | Tested [Classic Mapbox styles](https://docs.mapbox.com/api/maps/styles/#classic-mapbox-styles) using `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=pk.ey...` | Import settings |
| [OpenFreeMap](https://openfreemap.org/) | All maps can be imported                                                                                                                                                         |                 |
