from dataclasses import dataclass

from fastapi import Header

from .errors import DomainError


@dataclass(frozen=True, slots=True)
class RequestContext:
    request_id: str
    subject_id: str
    active_company_id: str
    roles: frozenset[str]

    def require(self, *allowed: str) -> None:
        if not self.roles.intersection(allowed):
            raise DomainError("AUTH_FORBIDDEN", 403, "Insufficient role")


async def resolve_context(
    x_request_id: str = Header(alias="X-Request-ID", default="local-request"),
    x_subject_id: str = Header(alias="X-Subject-ID", default="demo-user"),
    x_active_company_id: str | None = Header(
        alias="X-Active-Company-ID", default=None
    ),
    x_techm_roles: str = Header(alias="X-TechM-Roles", default="buyer"),
) -> RequestContext:
    if not x_active_company_id:
        raise DomainError(
            "ACTIVE_COMPANY_REQUIRED", 400, "Active company context is required"
        )
    return RequestContext(
        request_id=x_request_id,
        subject_id=x_subject_id,
        active_company_id=x_active_company_id,
        roles=frozenset(role.strip() for role in x_techm_roles.split(",")),
    )
