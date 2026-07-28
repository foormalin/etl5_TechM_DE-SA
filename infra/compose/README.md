# Compose profiles

- `core`: gateway, Keycloak, Kafka, Schema Registry, Redis, MinIO.
- `services`: ten domain services and isolated PostgreSQL databases.
- `search`: OpenSearch and indexer API.
- `observability`: Prometheus, Grafana and OpenTelemetry Collector.
- `demo`: deterministic external mocks and MailHog.
- `tools`: Kafka UI and optional operator consoles.

Start only the profiles needed for the current packet to keep local resource use
predictable.
