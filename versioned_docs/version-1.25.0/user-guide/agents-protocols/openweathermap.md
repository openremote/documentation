---
sidebar_position: 19
---

# OpenWeatherMap

This agent enables integration with [OpenWeatherMap](https://openweathermap.org/), providing access to weather data via the [One Call 3.0 API](https://openweathermap.org/api/one-call-3#current).

- Periodically retrieves **current**, **hourly**, and **daily** forecast data from OpenWeatherMap  
- Updates the current and predicted values of linked attributes  
- Supports both current conditions and forecasted hourly and daily data  
- Can optionally provision a complete **Weather Asset** with preconfigured attributes and links  

---

## Agent configuration
The following table describes the supported configuration attributes and their purpose:

| Attribute | Description | Required | Default |
| ---------- | ------------ | -------- | -------- |
| **API key** | API key for the OpenWeatherMap API. Must have access to the One Call 3.0 API. | Yes | - |
| **Polling millis** | Polling interval in milliseconds. | No | `3600000` |

**Polling millis** is an optional attribute and does not need to be set, the agent will by default update the weather values every hour.

---

### Provision weather asset
**Provision weather asset** is a helper attribute that provisions a **Weather Asset** with the appropriate attributes and agent links when checked. After the asset is created, the checkbox resets automatically. The provisioned asset will appear as a child of the agent.

---

## Agent Link
For attributes linked to this agent, the following table describes the supported **Agent Link** fields, in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Attribute | Description | Required | Default |
| ---------- | ------------ | -------- | -------- |
| **Weather property** | The weather property to use for the linked attribute. | Yes | - |

Example when linking an attribute that represents the current/forecasted temperature, the **Weather property** should be set to `TEMPERATURE`.

---

## Important notes
- The asset containing the linked attribute(s) **must have a location set**. The agent uses this location to retrieve weather data from the OpenWeatherMap API.  
- Weather values of the linked attributes are updated each time the polling interval is reached. It may take some time before the linked attributes are updated. Note, disabling and re-enabling the agent will trigger an immediate update of the linked attributes.
