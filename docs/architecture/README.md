# Архитектура

## Контуры

```text
Browser -> Traefik -> Web / REST APIs
                    -> Keycloak (OIDC)

Domain services -> own PostgreSQL + transactional Outbox
Outbox relay -> Kafka + Schema Registry -> Search / Notifications / Integration
Catalog & Inventory events -> OpenSearch projections
Files -> MinIO -> scan adapter -> CLEAN gate
All components -> OpenTelemetry -> Tempo / Prometheus / Loki / Grafana
```

Синхронные вызовы используются только там, где ответ нужен текущему use case.
Асинхронные факты публикуются в прошедшем времени и имеют версионированную Avro
схему. Ни один сервис не обращается к БД другого сервиса.

## Checkout

1. Commerce фиксирует CheckoutSession и идемпотентный ключ.
2. Inventory атомарно резервирует каждую позицию.
3. Finance mock/provider авторизует платёж.
4. Commerce создаёт один Purchase и по одному Order на пару Seller + Warehouse.
5. Локальная транзакция сохраняет агрегаты и Outbox.
6. При отказе Saga освобождает резервы и void-ит авторизацию.

Demo Worker реализует основной happy path и негативные API-ответы в одном
deployable unit. Compose-контур сохраняет утверждённые границы и предназначен для
дальнейшей реализации вертикальными пакетами PKT-001…023.
