# Runbook: деградация и восстановление

1. Определить затронутый correlation/trace ID в Grafana.
2. Проверить `/health/ready`, lag consumer group и DLQ.
3. Не редактировать агрегаты вручную и не переигрывать команду без
   `Idempotency-Key`.
4. После восстановления зависимости перезапустить только затронутый consumer.
5. Replay выполнять от сохранённого offset; consumer dedupe не допускает
   повторного side effect.
6. Для Search допустим rebuild индекса из событий/источников с alias switch.
7. PostgreSQL восстанавливается из backup; Kafka/OpenSearch/Redis не являются
   source of truth.
8. Зафиксировать timeline, impact, trace IDs и corrective action.
