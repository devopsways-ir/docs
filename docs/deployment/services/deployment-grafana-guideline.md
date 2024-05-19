# شیوه‌نامه استقرار grafana

## تخمین منابع

![grafana-stats](../../../static/img/deployment-grafana-guideline/grafana-stats.png 'grafana-stats')

## نمونه فایل تعریف سرویس

### docker compose

```
services:
  grafana:
    image: grafana/grafana
    container_name: grafana
    ports:
      - 3000:3000
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=grafana
    volumes:
      - ./grafana:/etc/grafana/provisioning/datasources

```

### docker compose swarm & traefik(v2)

```
version: '3.8'

services:
  grafana:
    image: grafana/grafana
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
      # در صورت لزوم می توانید شرط را تغییر بدهید
        constraints:
          - 'node.labels.cluster.node-name == ${NODE_NAME}'

      labels:
        traefik.enable: 'true'
        traefik.docker.network: 'traefik-public'
        traefik.constraint-label: 'traefik'

        traefik.http.services.grafana-service.loadbalancer.server.port: ${GRAFANA_SERVER_HTTP_PORT}

        traefik.http.routers.grafana-router.service: 'grafana-service'
        traefik.http.routers.grafana-router.entrypoints: 'https'
        traefik.http.routers.grafana-router.rule: 'Host(`grafana.${HOST_BASE_URL}`) && PathPrefix(`/`)'
        traefik.http.routers.grafana-router.tls: 'true'
        traefik.http.routers.grafana-router.tls.certresolver: 'le'
    volumes:
      - type: volume
        source: grafana-data
        target: /var/lib/grafana
    environment:
    # احراز هویت
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      # اجازه برای ثبت نام عمومی
      - GF_USERS_ALLOW_SIGN_UP=false
      # معرفی دامنه به گرافانا
      - GF_SERVER_DOMAIN=${GRAFANA_SERVER_DOMAIN}
      - GF_SERVER_HTTP_PORT=${GRAFANA_SERVER_HTTP_PORT}
      # معرفی هاست به گرافانا
      - HOSTNAME=${GRAFANA_SERVER_DOMAIN}

    networks:
      - traefik-public

volumes:
  grafana-data:

networks:
  traefik-public:
    external: true

```
