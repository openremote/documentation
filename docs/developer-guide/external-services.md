---
sidebar_position: 17
---

# External Services

External services allow developers to extend the functionality of the OpenRemote platform by integrating their own applications directly into the OpenRemote Manager, giving users a seamless way to configure and manage them.

The registration process is primarily intended for services that provide a **user interface**. When registered, the service's web interface is embedded in the Manager Web UI using an **iframe**, allowing users to interact with it without leaving OpenRemote.

Services without a UI can remain fully standalone applications. They can still make use of OpenRemote's APIs but do not need to register as an external service.

---

## Overview

### What is an External Service?

An external service is a standalone application that communicates with OpenRemote through its APIs. When registered, it appears in the Manager Web UI with its own embedded web interface, enabling direct interaction from within OpenRemote.

External services can be built using any programming language or framework. They should be viewed as independent applications that **extend the platform's capabilities** while leveraging OpenRemote for integration and management.

### Types of External Services

There are two types of external services in OpenRemote:

**Global Services**
- Registered using the `/services/global` endpoint
- Must be registered via the **master realm**
- Require a **Service User with Super User privileges** for registration
- Once registered, they are available and listed on **all realms**
- Typically designed with **multi-tenancy** in mind, but this is not strictly required

**Regular Services**
- Registered using the `/services` endpoint
- Bound to a **specific realm** and only available within that realm (single-tenant)
- Simpler to implement when multi-tenancy is not required

Both global and regular services must be registered by **Service Users**. Global services specifically require a Super User account in the master realm, while regular services can be registered with a realm-specific Service User. For more information on Service Users, see [Realm Users and Roles](../user-guide/identity-and-security/realms-users-and-roles.md) and [Security](../architecture/security.md).

---

## Development

### Service Web Interface Requirements

Registered external services must expose a web interface via a URL. OpenRemote embeds this interface in the Manager Web UI using an **iframe**.

**Technical Requirements:**
- **Same origin and protocol**: The service must use the same domain and protocol (HTTP or HTTPS) as the OpenRemote Manager (no mixed content)
- **Headers**: Do not block embedding. Avoid `X-Frame-Options: DENY` or restrictive `Content-Security-Policy`
  - Recommended: `Content-Security-Policy: frame-ancestors 'self' https://<manager-domain>`
- **Responsive design**: The iframe may resize; ensure the UI adapts dynamically
- **Navigation**: Avoid pop-ups or full-page redirects; keep interactions within the iframe

### Building the Interface

Developers can use any web framework or technology stack. Optionally, OpenRemote provides a set of pre-made web components such as buttons, panels, forms, and tables that integrate seamlessly with the Manager UI for a consistent look and feel.

These components are available on [npmjs](https://www.npmjs.com/~openremotedeveloper).

### Security Considerations

When developing and integrating an external service, consider the following:

- **Authentication**: OpenRemote uses Keycloak as an identity provider. External services should ensure that only authorized users can access them, either by integrating with Keycloak or implementing their own mechanism
- **Protocol**: Always use **HTTPS** in production to protect data integrity and confidentiality
- **Data validation**: Validate and sanitize all data received from OpenRemote or users to prevent vulnerabilities such as SQL injection or cross-site scripting (XSS)
- **CORS**: If hosting on a different domain, configure Cross-Origin Resource Sharing (CORS) appropriately. Note that using a different domain may complicate Keycloak integration

---

## Registration

### Registration Process

Registration is only required if the service provides a web interface and is expected to be embedded and used within the OpenRemote Manager UI. This process is always performed using a **Service User** account (see [Service Users](../architecture/security.md) for details).

It involves sending a `POST` request to the OpenRemote API with details about the service.

**Example request:**

```json
{
  "serviceId": "my-service",
  "label": "My External Service",
  "icon": "mdi-cloud",
  "homepageUrl": "https://my-external-service.com/interface",
  "status": "AVAILABLE"
}
```

OpenRemote responds with the same `ExternalService` object, but with an additional field, `instanceId`, which uniquely identifies the service and must be included in subsequent heartbeat requests.

### API Endpoints

| Endpoint                | Method | Scope     | Purpose                                                |
|-------------------------|--------|-----------|--------------------------------------------------------|
| `/services`             | POST   | Realm     | Register a realm-specific external service             |
| `/services/global`      | POST   | Global    | Register a global external service (master realm only) |
| `/services/heartbeat`   | POST   | Both      | Send periodic heartbeat with `instanceId`              |

➡ The exact API endpoint and request format can be found in the [OpenRemote API documentation](https://docs.openremote.io/developer-guide/api/).

### Heartbeat Mechanism

After registration, each service must send periodic heartbeat requests to confirm its availability.

- The request must include the `instanceId` received during registration
- The default TTL (Time To Live) is **60 seconds**
- If OpenRemote does not receive a heartbeat within this period, the service is marked as **unavailable**

The diagram below illustrates the registration and heartbeat process:

```mermaid
sequenceDiagram
    participant Service as External Service
    participant OR as OpenRemote Manager API

    alt Regular Service
        Service->>OR: POST /services (serviceId, name, url, metadata…)
        OR-->>Service: ExternalService object with instanceId
    else Global Service
        Service->>OR: POST /services/global (serviceId, name, url, metadata…)
        OR-->>Service: ExternalService object with instanceId
    end

    loop Every < 60s
        Service->>OR: POST /services/heartbeat (serviceId, instanceId)
        OR-->>Service: 204 No Content
    end
```

---

## Deployment

### Docker Compose Setup

External services can be deployed alongside the OpenRemote stack using Docker Compose. The easiest approach is to add your service to an existing Docker Compose profile or create a custom one.

**Example service configuration:**

```yaml
volumes:
  service-ml-forecast-data:

services:
  ml-forecast:
    image: openremote/service-ml-forecast:latest
    restart: always
    environment:
      ML_LOG_LEVEL: INFO
      ML_ENVIRONMENT: production
      ML_WEBSERVER_ORIGINS: '["https://${OR_HOSTNAME:-localhost}"]'
      ML_SERVICE_HOSTNAME: https://${OR_HOSTNAME:-localhost}
      ML_OR_URL: https://${OR_HOSTNAME:-localhost}
      ML_OR_KEYCLOAK_URL: https://${OR_HOSTNAME:-localhost}/auth
      ML_OR_SERVICE_USER: ${ML_OR_SERVICE_USER:-mlserviceuser}
      ML_OR_SERVICE_USER_SECRET: ${ML_OR_SERVICE_USER_SECRET:-secret}
    volumes:
      - service-ml-forecast-data:/app/deployment/data
```

### Service User Configuration

Your external service will need a **service user account** in OpenRemote for API authentication. The service user credentials should be provided via environment variables and kept secure.

### Reverse Proxy Configuration

If you want to use OpenRemote's reverse proxy (HAProxy) to route traffic to your service:

**1. Enable Custom HAProxy Configuration**

```yaml
proxy:
  environment:
    HAPROXY_CONFIG: '/data/proxy/haproxy.cfg'
  volumes:
    - proxy-data:/deployment
    - deployment-data:/data
```

**2. Create Custom HAProxy Configuration**

Create a custom `haproxy.cfg` file based on the [base configuration](https://github.com/openremote/proxy/blob/main/haproxy.cfg) and place it at `deployment/proxy/haproxy.cfg`.

Add frontend routing:
```haproxy
acl ml-forecast path_beg /services/ml-forecast
use_backend ml-forecast if ml-forecast
```

Add backend configuration:
```haproxy
backend ml-forecast
    server ml-forecast ml-forecast:8000 resolvers docker_resolver
```

---

## Examples

### Use Cases

External services can be used to extend OpenRemote in many ways:

- **AI/LLM Integration**: Connect AI services (e.g., ChatGPT, Claude) to provide contextual querying of devices, assets, and data
- **Machine Learning**: Implement predictive maintenance, energy optimization, or anomaly detection
- **Firmware Management**: Manage and deploy firmware updates to connected devices

### Reference Implementation

We provide the [ML Forecast Service](https://github.com/openremote/service-ml-forecast) which can serve as a reference implementation. This service connects to OpenRemote, retrieves historical data, and provides forecasting capabilities using machine learning/statistical models.

It demonstrates how to:

- **Register** an external service
- **Send and manage** heartbeats
- **Interact** with OpenRemote's APIs (OAuth2 authentication, data retrieval, data writing)
- **Integrate** securely with Keycloak for authentication
- **Implement** a web interface (using OpenRemote's web components)

---

## Summary

By leveraging external services, developers can significantly extend and enhance the OpenRemote platform:

- **Registration** connects services with a UI to the Manager, embedding their interface directly
- **Global vs regular services** allow flexibility between multi-tenant and realm-specific use cases
- **Heartbeats** ensure service availability is tracked in real time
- **Security best practices** help ensure safe and reliable integrations

Together, these mechanisms provide a way to extend OpenRemote while maintaining a unified and secure user experience.