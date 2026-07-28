from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="TECHM_", extra="ignore")

    env: str = "local"
    service_name: str = "identity"
    log_level: str = "INFO"
    jwt_issuer: str = "http://keycloak:8080/realms/techm"
    jwt_audience: str = "techm-api"
    database_url: str = "postgresql://techm:techm@localhost/techm"
    kafka_bootstrap_servers: str = "kafka:9092"
    otel_exporter_otlp_endpoint: str = "http://otel-collector:4318"


@lru_cache
def get_settings() -> Settings:
    return Settings()
