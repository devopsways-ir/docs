# شیوه‌نامه استقرار node-exporter

برای معرفی و و شیوه استقرار node-exporter مستند را مطالعه کنید.

## آشنایی با سرویس

node-exporter یک نرم افزار برای بیرون کشیدن و استخراج داده های آماری مرتبط با کرنل لینوکس است،
سیستمی برای نظارت بر Host.

## چرا باید از node-exporter استفاده کنیم؟

گاها پیش میاد که بخواهیم از اوضاع سرور ها و گره هایی که داریم مطلع شویم
node-exporter
این شرایط را برای ما فراهم می کند.

به گونه ای که پارامتر هایی که به آن ها نیاز داریم را به صورت شسته و رفته در اختیار ما قرار می دهد.

پارامترهایی مانند :

- مصرف cpu
- مصرف ram
- مصرف disk
  و...

## سیستم مورد نیاز

node-exporter
نرم افزاری سبک و کم حجم هست.

در این مورد که
node-exporter
به چه مقدار منابع برای اجرا نیاز دارد در مستندات اشاره‌ای نیامده است اما در ادامه تصویری از نمودار دو روزه مصرف منابع node-exporter آمده است.

نکته قابل توجه این است که داده‌ی آماری که داخل نمودار مشاهده می کنید به کمک node-exporter به دست آمده است
که نشان دهنده مصرف 15 مگابایت ram و چیزی نزدیک به نیم درصد مصرف cpu است.

این دیتا مربوط به سروری می شود که داری دو هسته cpu و 4گیگابایت ram میباشد.

![مانیتور node-exporter](../../../static/img/deployment-node-exporter-guideline/Screenshot2024-04-25T14-41-22.png 'node-exporter system requierments')

## پارامتر‌ها و پیکربندی

برای پیکربندی
node-exporter
با متد اصلی و استفاده از فایل اجرایی شما نیازی به تنظیم پارامتر یا آرگومان خاصی ندارید.

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

## مقیاس پذیری و دسترسی پذیری بالا

node-exporter
برای نظارت بر محیط هاست تهیه شده است و نیازی به ارتقا scale نیست.

و شما باید برای نظارت به هر سرور فقط یک نسخه از این نرم افزار را مستقر و اجرا کنید.

## بازیابی فاجعه

اگر سناریویی را در نظر بگیریم که در آن سرور از دست رفته است و ما بخواهیم مجددا
node-exporter
را بازیابی کنیم.

باید آن را مجددا راه اندازی و مستقر کنیم.

تقریبا میشه گفت راهی برای restore کردن های مشابه با دیتابیس ها نیست.

و در کل نیازی هم به این کار نیست باتوجه به اینکه دیتا نگهداری شده ای وجود ندارد این کار غیرمنطقی می تواند باشد.

## نظارت و بررسی سلامت

node-exporter
به اندازه کافی قابل اطمینان هست و در ضمن خود این ابزار برای نظارت است.

و نظارت بر یک ابزار نظارتی می تواند عجیب باشد.

البته که راه هایی برای نظارت بر uptime
وجود دارد ولی در این مستند نمی گنجد.

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
