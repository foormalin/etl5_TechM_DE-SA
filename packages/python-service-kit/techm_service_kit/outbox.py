from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid4


@dataclass(frozen=True, slots=True)
class OutboxMessage:
    event_type: str
    aggregate_type: str
    aggregate_id: str
    payload: dict[str, object]
    company_id: str | None = None
    event_id: UUID = field(default_factory=uuid4)
    occurred_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    event_version: int = 1

    def envelope(self) -> dict[str, object]:
        return {
            "event_id": str(self.event_id),
            "event_type": self.event_type,
            "event_version": self.event_version,
            "occurred_at": self.occurred_at.isoformat(),
            "aggregate_type": self.aggregate_type,
            "aggregate_id": self.aggregate_id,
            "company_id": self.company_id,
            "payload": self.payload,
        }
