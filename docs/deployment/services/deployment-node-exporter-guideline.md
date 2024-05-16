# استقرار node-exporter

## سیستم مورد نیاز

node-exporter
نرم افزاری سبک و کم حجم هست.

نکته قابل توجه این است که داده‌ی آماری که داخل نمودار مشاهده می کنید به کمک node-exporter به دست آمده است
که نشان دهنده مصرف 15 مگابایت ram و چیزی نزدیک به نیم درصد مصرف cpu است.

این دیتا مربوط به سروری می شود که داری دو هسته cpu و 4گیگابایت ram میباشد.

![مانیتور node-exporter](../../../static/img/deployment-node-exporter-guideline/Screenshot2024-04-25T14-41-22.png 'node-exporter system requierments')

### node-exporter در کانتینر ها

نکته
node-eporter
برای نظارت در محیط میزبان طراحی شده است.

برای اینکه مطمئن شویم که
node-exporter
درحال نظارت از محیط کانتینر نیست باید چند فلگ رو تنظیم کنیم.

- برای کانتینر باید ولومی ست شود که
  مسیرهای
  میزبان را به کانتینر متصل کند.

- اگر Container را برای نظارت بر میزبان راه اندازی می کنید، آرگومان path.rootfs را مشخص کنید.
  node_exporter از path.rootfs برای دسترسی به filesystem میزبان استفاده می کند.

  در ادامه با مشاهده نمونه ها بهتر متوجه این فلگ ها خواهید شد.

درکل اگر نیاز دارید فلگ خاصی را ست کنید تا به تنظیمات دلخواهتان برسید سری به لینک زیر بزنید.

https://hub.docker.com/r/prom/node-exporter

## به‌روزرسانی

از آنجایی که node exporter
دیتا مانایی ندارد ملاحظات خاصی برای آپدیت آن وجود ندارد.

برای بروزرسانی می توانید همان مراحل نصب را مجدد طی کنید این مورد برای وقتی است که شما به صورت مستقیم روی هاست node-exporter را نصب کرده اید
برای اطلاعات بیشتر از لینک زیر استفاده کنید.

https://prometheus.io/docs/guides/node-exporter/#installing-and-running-the-node-exporter

و اما برای بروزرسانی در محیط کانتینر ها شما می توانید ورژن image را ارتقا دهید.

## نمونه فایل تعریف سرویس

### شیوه docker compose

```
version: '3.8'

services:
  node_exporter:
    image: quay.io/prometheus/node-exporter:latest
    command:
    # این دستور مشخص کننده مسیر ریشه برای نود-اکپورتر است
      - '--path.rootfs=/host'
    network_mode: host
    restart: unless-stopped
    volumes:
    # در اینجا مسیر ریشه هاست اصلی را در مسیر /هاست بایند می کنیم
      - '/:/host:ro,rslave'
```

OR

```
version: '3.3'

services:
  node-exporter:
    privileged: true
    image: prom/node-exporter
    container_name: node-exporter
    restart: always
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - "--path.procfs=/host/proc"
      - "--path.sysfs=/host/sys"
      - "--collector.filesystem.ignored-mount-points"
      - "^/(rootfs/)?(dev|etc|host|proc|run|sys|volume1)($$|/)"
```

#### swarm & traefik(v2)

```
version: '3.8'

services:
  node-exporter:
    image: prom/node-exporter
    command:
      - '--path.sysfs=/host/sys'
      - '--path.procfs=/host/proc'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
      - '--no-collector.ipvs'
    deploy:
      placement:
        constraints:
          - 'node.labels.cluster.node-name == ${NODE_NAME}'
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
      labels:
        traefik.enable: 'true'
        traefik.docker.network: 'traefik-public'
        traefik.constraint-label: 'traefik'

        traefik.http.services.node-exporter-service.loadbalancer.server.port: '9100'

        traefik.http.routers.node-exporter-router.service: 'node-exporter-service'
        traefik.http.routers.node-exporter-router.entrypoints: 'https'
        traefik.http.routers.node-exporter-router.rule: 'Host(`node-exporter.${HOST_BASE_URL}`) && PathPrefix(`/`)'
        traefik.http.routers.node-exporter-router.tls: 'true'
        traefik.http.routers.node-exporter-router.tls.certresolver: 'le'

        traefik.http.middlewares.node-exporter-auth.basicauth.users: '${NODE_EXPORTER_USERNAME?Variable not set}:${NODE_EXPORTER_HASHED_PASSWORD?Variable not set}'
        traefik.http.routers.node-exporter-router.middlewares: 'node-exporter-auth'
    volumes:
      - type: bind
        source: /
        target: /rootfs
        read_only: true
      - type: bind
        source: /proc
        target: /host/proc
        read_only: true
      - type: bind
        source: /sys
        target: /host/sys
        read_only: true
    networks:
      - traefik-public

networks:
  traefik-public:
    external: true

```
