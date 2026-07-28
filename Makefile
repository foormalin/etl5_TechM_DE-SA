.PHONY: install dev build check contracts test compose-up compose-down smoke

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

check:
	pnpm check

contracts:
	node tests/contract/validate-contracts.mjs

test:
	node --test tests/unit/*.test.mjs

compose-up:
	docker compose --profile core --profile services --profile demo up --build -d

compose-down:
	docker compose --profile core --profile services --profile demo down

smoke:
	node tests/smoke/demo-worker.mjs
