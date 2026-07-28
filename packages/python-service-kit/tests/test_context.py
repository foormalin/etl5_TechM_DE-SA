from techm_service_kit.context import RequestContext
from techm_service_kit.errors import DomainError


def test_role_policy_allows_matching_role() -> None:
    context = RequestContext("r1", "u1", "c1", frozenset({"buyer"}))
    context.require("buyer")


def test_role_policy_rejects_other_role() -> None:
    context = RequestContext("r1", "u1", "c1", frozenset({"buyer"}))
    try:
        context.require("admin")
    except DomainError as error:
        assert error.code == "AUTH_FORBIDDEN"
    else:
        raise AssertionError("DomainError was not raised")
