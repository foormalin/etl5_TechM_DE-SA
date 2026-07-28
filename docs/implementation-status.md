# Матрица реализации

| Область | Статус | Примечание |
|---|---|---|
| Responsive web shell, роли | Готово | buyer/seller/admin demo |
| Catalog, cart, checkout | Готово в demo | Worker + D1 |
| Purchase/Order, state policy | Готово в demo | контролируемые переходы |
| Complaints, audit | Готово в demo | базовый вертикальный slice |
| Target service template | Готово | FastAPI, context, health, RFC 9457 |
| Compose infrastructure | Готово | профили core/services/search/demo/tools/observability |
| OIDC configuration | Готово | импортируемый realm Keycloak |
| REST/event contracts | Готово | OpenAPI + Avro envelope/events |
| CI and contract gates | Готово | build, unit, schema validation |
| Real acquiring/carrier/ЭДО | Не входит в baseline | mock/adapter boundary |
| Production Kubernetes/Helm | Концепт | требует выбранного облака и secrets |
| Full PKT-002…023 logic | Расширяемый backlog | реализуется вертикальными slices |

“Готово” означает наличие проверяемого кода/конфигурации в репозитории, а не
подмену внешнего сервиса фиктивным production-утверждением.
