# GeoJSON Geofencing in OpenRemote Rules

This document describes how to use GeoJSON geofencing within OpenRemote Rules to create location-based triggers and actions. GeoJSON geofencing allows you to define complex geographical areas using the GeoJSON format and trigger rules based on whether an asset is located within or outside these areas.

This feature is great for setting complex geofences that go beyond simple circular or rectangular shapes, enabling more precise location-based automation. Think of the borders of a given country, state, or city, or any custom-defined area where assets need to remain in, or out of.

## Using GeoJSON Geofencing in OpenRemote

To use GeoJSON geofencing in OpenRemote, follow these steps:

1.  **Define your GeoJSON area:** Create a GeoJSON object representing the geographic area you want to use as a geofence. You can use online tools like [geojson.io](https://geojson.io/) to draw and export GeoJSON geometries.

2.  **Create or edit a rule:** In the OpenRemote console, navigate to the Rules page and create a new when-then rule, or edit an existing one.

3.  **Select an asset and attribute:** In the "when" section, select an asset and attribute that will be used to filter the rule execution.

4.  **Configure the GeoJSON Geofence:**

    *   Select either "inside area" or "outside area" for the operator.
    *   In the configuration panel, click the "GeoJSON" button and paste your GeoJSON into the text field. The UI provides validation tools to help with this.

5.  **Define Then-actions:** Specify the actions to be performed in the then-section when the geofence condition (inside or outside the area) is met.

## Example

Here’s an example of a GeoJSON Polygon, around the area of the Rotterdam default map:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [
              4.48556382778753,
              51.91779377518452
            ],
            [
              4.479700876335301,
              51.91779377518452
            ],
            [
              4.479700876335301,
              51.91514625782321
            ],
            [
              4.48556382778753,
              51.91514625782321
            ],
            [
              4.48556382778753,
              51.91779377518452
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
}
```

This Polygon defines a simple rectangular area. You can use more complex polygons, MultiPolygons, Features, or FeatureCollections to define more intricate geofences. You can input the same GeoJSON as custom GeoJSON styling in "Appearance -> Map Settings -> GeoJSON", to see the same area highlighted on the various OpenRemote maps.
