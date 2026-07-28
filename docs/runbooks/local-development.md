# Локальный запуск

## Лёгкий режим

```bash
pnpm install
pnpm dev
```

## Полная платформа

```bash
copy .env.example .env
docker compose --profile core --profile services --profile demo up --build
```

Проверка:

```bash
pnpm check
curl http://localhost:8080/api/identity/health/ready
curl http://localhost:8080/api/commerce/v1/meta
```

Все значения `.env.example` предназначены только для локальной синтетической
среды. Перед внешним развёртыванием пароли и ключи заменяются secret manager-ом.
