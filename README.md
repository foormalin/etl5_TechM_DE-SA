# TechM — B2B IT Marketplace

Учебный и портфельный B2B-маркетплейс IT-оборудования по системной документации
TECHM-DOC-001…020. Репозиторий содержит два совместимых контура:

- `src`, `server`, `db` — лёгкая публичная demo-версия на React, Cloudflare Worker и D1;
- `services`, `packages`, `infra`, `contracts` — целевая микросервисная архитектура
  FastAPI/PostgreSQL/Kafka/Keycloak из документации.

## Быстрый запуск demo

```bash
pnpm install
pnpm dev
```

На Windows можно просто запустить `START_LOCAL.cmd`. Откроется единый локальный
контур на http://localhost:5173: Vite frontend и in-memory demo API. Данные
сбрасываются после остановки процесса; облачный D1 для этого режима не нужен.

Проверка и production-сборка:

```bash
pnpm check
pnpm build
```

## Полная локальная платформа

Требования: Docker Engine 25+ и Docker Compose v2.

```bash
copy .env.example .env
docker compose --profile core --profile services --profile demo up --build
```

После запуска:

- Web: http://localhost:5173
- API gateway: http://localhost:8080
- Keycloak: http://localhost:8081
- MailHog: http://localhost:8025
- Kafka UI (`tools`): http://localhost:8088
- Grafana (`observability`): http://localhost:3000

Каждый доменный сервис имеет собственный PostgreSQL, `/health/live`,
`/health/ready`, `/v1/meta`, OpenAPI и единый RFC 9457 формат ошибок.

## Сервисные границы

| Сервис | Ответственность |
|---|---|
| Identity | компании, членство, роли и активный контекст |
| Seller | онбординг, статус и подписка продавца |
| Catalog | категории, Product/SKU, модерация, метаданные файлов |
| Inventory | склады, предложения, цены, остатки и резервы |
| Commerce | корзина, checkout Saga, Purchase и Order |
| Finance | платежи, возвраты, ledger, payout и billing |
| Trust | жалобы, решения и ограничения |
| Integration | OAuth-клиенты, импорты, webhooks и event feed |
| Search | проекции каталога в OpenSearch |
| Notifications | in-app/email уведомления |

## Основные гарантии

- деньги хранятся целыми minor units, не `float`;
- каждый корпоративный запрос проверяет `active_company_id`;
- команды и consumers идемпотентны;
- бизнес-изменение и Outbox записываются одной локальной транзакцией;
- Order меняет состояние только через transition policy;
- PostgreSQL сервисов остаётся source of truth.

Архитектура, команды, известные ограничения и сценарий демонстрации находятся в
[`docs/`](docs/README.md). Публичная demo-версия:
https://techm-b2b-prototype.bv78dg.chatgpt.site/
