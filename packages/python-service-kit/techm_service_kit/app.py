from fastapi import Depends, FastAPI

from .context import RequestContext, resolve_context
from .errors import DomainError, domain_error_handler
from .settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=f"TechM {settings.service_name.title()} API",
        version="1.0.0",
        openapi_url="/openapi.json",
    )
    app.add_exception_handler(DomainError, domain_error_handler)

    @app.get("/health/live", tags=["operations"])
    async def live() -> dict[str, str]:
        return {"status": "ok", "service": settings.service_name}

    @app.get("/health/ready", tags=["operations"])
    async def ready() -> dict[str, str]:
        # Concrete services extend this with DB/broker probes.
        return {"status": "ready", "service": settings.service_name}

    @app.get("/v1/meta", tags=["platform"])
    async def meta(
        context: RequestContext = Depends(resolve_context),
    ) -> dict[str, object]:
        return {
            "service": settings.service_name,
            "environment": settings.env,
            "active_company_id": context.active_company_id,
            "subject_id": context.subject_id,
            "roles": sorted(context.roles),
        }

    return app


app = create_app()
