from dataclasses import dataclass

from fastapi import Request
from fastapi.responses import JSONResponse


@dataclass(slots=True)
class DomainError(Exception):
    code: str
    status: int
    detail: str


async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    request_id = request.headers.get("x-request-id", "unknown")
    return JSONResponse(
        status_code=exc.status,
        media_type="application/problem+json",
        content={
            "type": f"https://techm.local/problems/{exc.code.lower()}",
            "title": exc.code,
            "status": exc.status,
            "detail": exc.detail,
            "instance": str(request.url.path),
            "code": exc.code,
            "request_id": request_id,
        },
    )
