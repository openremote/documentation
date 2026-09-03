# Traces

To help with understanding the system and potential performance issues, we expose OpenTelemetry traces.  
At this stage, only the manager produces those.

## Manager OpenTelemetry tracing

The manager distribution and container image include OpenTelemetry Java agent. The image entrypoint adds
`-javaagent:/opt/opentelemetry/opentelemetry-javaagent.jar` only when the standard
`OTEL_JAVAAGENT_ENABLED` environment variable is `true`; tracing is therefore opt-in and the agent is not loaded for
existing deployments.

No application source instrumentation is used. The agent and its automatic instrumentations are configured with
standard OpenTelemetry environment variables.

### Docker Compose

Set these values in the deployment environment or `.env` file used by `docker-compose.yml` or
`profile/deploy.yml`:

```dotenv
OTEL_JAVAAGENT_ENABLED=true
OTEL_SERVICE_NAME=openremote-manager
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy-otel:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_INSTRUMENTATION_COMMON_DB_STATEMENT_SANITIZER_ENABLED=true
```

The `alloy-otel` service must be reachable from the manager container's Compose network. The Compose profile sets
`OTEL_METRICS_EXPORTER=none` and `OTEL_LOGS_EXPORTER=none` by default so this integration exports traces only and
does not duplicate the existing Prometheus metrics or export application logs. These remain standard OpenTelemetry
settings and can be overridden in the deployment environment.

Do not configure Tempo credentials on the manager. The manager sends OTLP to its local Alloy instance, and Alloy
handles authenticated forwarding to Tempo.

### Kubernetes

Add the following to the environment-specific manager Helm values file, replacing the example service DNS name and
namespace with the Alloy service used by the cluster:

```yaml
or:
  otel:
    enabled: true
    serviceName: openremote-manager
    endpoint: http://alloy-otel.observability.svc.cluster.local:4318
    protocol: http/protobuf
```

This uses Alloy's OTLP/HTTP receiver on port `4318`.  
Additional OpenTelemetry Java agent settings, such as sampling, can be supplied through
`or.env`.
