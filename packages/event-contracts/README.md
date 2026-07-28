# Event contracts

Public facts use Avro, past-tense event names and the common envelope. Schema
Registry subjects use backward compatibility. Consumers retain current and
previous supported event fixtures and deduplicate by `event_id`.
