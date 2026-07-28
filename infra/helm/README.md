# Helm deployment concept

Production manifests are intentionally not generated until the target Kubernetes
platform, ingress, secret manager, managed databases and backup policy are
selected. Images remain portable and configuration follows twelve-factor
environment variables. This gap is explicit per TECHM-DOC-020.
