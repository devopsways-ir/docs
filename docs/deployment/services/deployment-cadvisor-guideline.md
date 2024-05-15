# شیوه‌نامه استقرار cadvisor

![مانیتور با cadvisor](../../../static/img/deployment-cadvisor-guideline/cadvisor-logo.png 'cAdvisor')

## آشنایی با سرویس

cAdvisor
به شما کمک می کند تا متوجه مقدار منابع مصرفی و مشخصات عملکردی کانتینرها بشوید.
ابزاری برای رصد و مانیتور کانتینرها.

cadvisor
از کانتینر های داکر پشتیبانی محلی دارد پس تقریبا از هر نوع کانتینر دیگری نیز باید پشتیبانی کند.

> از آنجا که این نرم افزار قرار است داخل کانتینر ها ایجاد و مورد استفاده قرار بگیرد باید دقت داشته باشید تا ولوم(volume) هایی را تنظیم کنید که موجب می شود مسیرهای سیستم به مسیرهای داخل کانتینر مپ(map) شوند.
> به این ولوم ها در قسمت پیکربندی اشاره خواهیم کرد.

## پارامتر‌ها و پیکربندی

### تعریف volume ها برای اجرا با docker

پایین تر لیست ولوم هایی که باید ست شوند رو قرار دادیم.

<table style={{"direction": "ltr"}}>
<tr>
  <th>machine</th>
  <th>in container</th>
  <th>mode</th>
  <th>ex</th>
  
</tr>
<tr>
  <td>/</td>
  <td>/rootfs</td>
  <td>ro</td>
  <td>  --volume=/:/rootfs:ro </td>

</tr>
<tr>
  <td>/var/run</td>
  <td>/var/run</td>
  <td>ro</td>
  <td>  --volume=/var/run:/var/run:ro </td>
</tr>
<tr>
  <td>/sys</td>
  <td>/sys</td>
  <td>ro</td>
  <td>  --volume=/sys:/sys:ro </td>
</tr>
<tr>
  <td>/var/lib/docker/ </td>
  <td>/var/lib/docker</td>
  <td>ro</td>
  <td>  --volume=/var/lib/docker/:/var/lib/docker:ro </td>
</tr>
<tr>
  <td>/dev/disk/</td>
  <td>/dev/disk</td>
  <td>ro</td>
  <td>  --volume=/dev/disk/:/dev/disk:ro </td>
</tr>
</table>

### پارامتر های زمان اجرا

<p style={{"direction": "ltr"}}>https://github.com/google/cadvisor/blob/master/docs/runtime_options.md</p>

با استفاده از لینک بالا می توانید پارامتر های زمان اجرا را مشاهده کنید.

## تخمین منابع

در مستندات رسمی اشاره ای به منابع مصرفی نشده است.
اما ما با مانیتور کردن
cAdvisor
به نمودار زیر رسیده ایم.

![نمودار منابع مصرفی cadvisor](../../../static/img/deployment-cadvisor-guideline/cadvisor-stats.png 'cAdvisor stats')

## به‌روزرسانی

با توجه به اینکه cadvisor دیتایی برای نگهداری ندارد و نیازی به بکاپ گیری نیست
برای ارتقا سرویس به نسخه‌های بالاتر نیاز به انجام ملاحظات خاصی نیست.

## مقیاس پذیری و دسترسی پذیری بالا

cAdvisor به
scale نیازی
ندارد
و به تنهایی از پس رصد و مانیتور کانتینرها بر می آید.

> دقت داشته باشید اگر از تکنیک هایی مثل swarm
> استفاده می کنید و چندین سرور دارید برای هر سرور باید جداگانه این نرم افزار را مستقر کنید.

## بازیابی فاجعه

در صورت وقوع فاجعه و از دست رفتن سرور ها شما باید مجدد cAdvisor
را مستقر کنید و باتوجه به اینکه دیتا مانایی وجود ندارد،نیازی به بازیابی اطلاعات نیست.

## نظارت و بررسی سلامت

با توجه به اینکه این ابزار خود یک ابزار مانیتور است نیازی به رصد این ابزار نیست گرچه می توانید از ui
این ابزار برای health check
استفاده کنید.

> معمولا ui در آدرس
> http://localhost:8080
> قرار می گیرد.

## نمونه فایل تعریف سرویس

### docker cli

```
sudo docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  --privileged \
  --device=/dev/kmsg \
  gcr.io/cadvisor/cadvisor
```

### docker compose

```
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
```

### docker compose swarm mode

```
version: '3.8'

services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    command: -logtostderr -docker_only
    deploy:
      placement:
        constraints:
          - 'node.hostname == ${NODE_HOSTNAME}'
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
    volumes:
      - type: bind
        source: /
        target: /rootfs
        read_only: true
      - type: bind
        source: /var/run
        target: /var/run
        read_only: true
      - type: bind
        source: /sys
        target: /sys
        read_only: true
      - type: bind
        source: /var/lib/docker
        target: /var/lib/docker
        read_only: true
      - type: bind
        source: /dev/disk
        target: /dev/disk
        read_only: true


```

### docker compose swarm & traefik(v2)

> دقت داشته باشید که متغیرهای محیطی داخل فایل نمونه را به درستی پر کرده باشید.

> در صورت لزوم می توانید احراز هویت را از این فرآیند حذف کنید.

```
version: '3.8'

services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    command: -logtostderr -docker_only
    deploy:
      placement:
        constraints:
          - 'node.hostname == ${NODE_HOSTNAME}'
      labels:
        traefik.enable: 'true'
        traefik.docker.network: 'traefik-public'
        traefik.constraint-label: 'traefik'
        traefik.http.services.cadvisor-service.loadbalancer.server.port: '8080'
        traefik.http.routers.cadvisor-router.service: 'cadvisor-service'
        traefik.http.routers.cadvisor-router.entrypoints: 'https'
        traefik.http.routers.cadvisor-router.rule: 'Host(`cadvisor.${HOST_BASE_URL}`) && PathPrefix(`/`)'
        traefik.http.routers.cadvisor-router.tls: 'true'
        traefik.http.routers.cadvisor-router.tls.certresolver: 'le'
        # احراز هویت به شیوه baseic auth
        traefik.http.middlewares.cadvisor-auth.basicauth.users: '${CADVISOR_USERNAME?Variable not set}:${CADVISOR_HASHED_PASSWORD?Variable not set}'
        traefik.http.routers.cadvisor-router.middlewares: 'cadvisor-auth'
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro

    networks:
      - traefik-public

# دقت داشته باشید که نتورک را به صورت اکسترنال تعریف کرده باشید
networks:
  traefik-public:
    external: true

```

## منابع

<p style={{"direction": "ltr"}}>https://hub.docker.com/r/google/cadvisor/</p>
<p style={{"direction": "ltr"}}>https://github.com/google/cadvisor?tab=readme-ov-file#readme</p>
