"""Infrastructure-only building blocks shared by TechM services."""

from .app import create_app
from .context import RequestContext
from .errors import DomainError

__all__ = ["DomainError", "RequestContext", "create_app"]
