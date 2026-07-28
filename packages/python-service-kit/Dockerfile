FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY packages/python-service-kit /app
RUN pip install --no-cache-dir .

USER 65532:65532
EXPOSE 8000
CMD ["uvicorn", "techm_service_kit.app:app", "--host", "0.0.0.0", "--port", "8000"]
