# استقرار سرویس prometheus

## تخمین منابع

Minimum Requirements to Install Prometheus :
2 CPU cores
4 GB of memory
20 GB of free disk space

![prometheus-stats](../../../static/img/deployment-prometheus-guideline/prometheus-stats.png 'prometheus-stats')

## نمونه فایل تعریف سرویس

### docker compose

```
services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - 9090:9090
    restart: unless-stopped
    volumes:
      - ./prometheus:/etc/prometheus
      - prom_data:/prometheus
volumes:
  prom_data:

```

### docker compose swarm & traefik(v2)

```
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    command:
      # تعریف مسیر فایل کانفیگ
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--log.level=error'
      - '--storage.tsdb.path=/prometheus'
      # مدت زمان نگهداری از دیتا
      - '--storage.tsdb.retention.time=90d'
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - 'node.labels.cluster.node-name == ${NODE_NAME}'

      labels:
        traefik.enable: 'true'
        traefik.docker.network: 'traefik-public'
        traefik.constraint-label: 'traefik'

        traefik.http.services.prometheus-service.loadbalancer.server.port: '9090'

        traefik.http.routers.prometheus-router.service: 'prometheus-service'
        traefik.http.routers.prometheus-router.entrypoints: 'https'
        # دامنه اصلی را به صورت متغییرهای محیطی وارد کنید
        traefik.http.routers.prometheus-router.rule: 'Host(`prometheus.${HOST_BASE_URL}`) && PathPrefix(`/`)'
        traefik.http.routers.prometheus-router.tls: 'true'
        traefik.http.routers.prometheus-router.tls.certresolver: 'le'

        # تنظیمات مربوط به basic-auth
        traefik.http.middlewares.prometheus-auth.basicauth.users: '${PROMETHEUS_USERNAME?Variable not set}:${PROMETHEUS_HASHED_PASSWORD?Variable not set}'
        traefik.http.routers.prometheus-router.middlewares: 'prometheus-auth'

# تعریف ولوم برای ذخیره ساری پرومتئوس
    volumes:
      - type: volume
        source: prometheus-data
        target: /prometheus
    networks:
      - default
      - traefik-public
    # در این فایل قصد داریم فایل تنظیمات پرومتئوس را در قالب کانفیگ در مسیر مورد نظر قرار دهیم و همینطور فایل تارگت
    configs:
      - source: prom-targets
        target: /etc/prometheus/targets.yml
      - source: prom-config
        target: /etc/prometheus/prometheus.yml

volumes:
  prometheus-data:

networks:
  default:
  traefik-public:
    external: true
# تعریف تاپ لول کانفیگ ها
configs:
  prom-targets:
    external: true
  prom-config:
    external: true

```

prom-config file :

```
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'jobs'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ['localhost:9090']

    file_sd_configs:
      - files:
          - /etc/prometheus/targets.yml

    basic_auth:
      username: admin
      password: 1as6d4sa16v5gfbixjcos


```

prom-targets file :

```

[
  {
    "labels": {
      "job": "jobs"
    },
    "targets": [
      "ex.com"
    ]
  }
]
```
