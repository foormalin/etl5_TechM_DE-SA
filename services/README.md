# Domain services

Каждый каталог — отдельная deployable boundary с собственной БД и владельцем
данных. На Foundation-этапе сервисы запускают единый hardened FastAPI template
из `packages/python-service-kit`; доменная логика добавляется только вертикальными
пакетами и не переносится в shared ORM.

| Service | Database | Publishes |
|---|---|---|
| identity | identity_db | CompanyCreated, MembershipChanged |
| seller | seller_db | SellerActivated, SellerSuspended |
| catalog | catalog_db | ProductPublished, ProductUpdated |
| inventory | inventory_db | StockChanged, PriceChanged, StockReserved |
| commerce | commerce_db | PurchaseCreated, OrderStatusChanged |
| finance | finance_db | PaymentCaptured, RefundCompleted, PayoutCompleted |
| trust | trust_db | ComplaintCreated, ComplaintDecided |
| integration | integration_db | ImportCompleted, WebhookDeliveryFailed |
| search | OpenSearch | projection metrics only |
| notifications | notification_db | NotificationDelivered |
