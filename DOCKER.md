# 🐳 Запуск проекта в Docker

Весь проект (PostgreSQL + FastAPI backend + React/nginx web) поднимается одной
командой через Docker Compose. Никаких локальных Python/Node/Postgres ставить
не нужно — только **Docker** (Docker Desktop или Docker Engine + плагин compose).

```
turizm/
├── docker-compose.yml     ← описывает 3 сервиса: db, backend, web
├── .env.example           ← шаблон настроек (скопировать в .env)
├── backend/Dockerfile     ← образ FastAPI (миграции + uvicorn)
└── web/Dockerfile         ← сборка Vite → отдаётся через nginx
                              nginx же проксирует /api и /static на backend
```

Браузер ходит на **один адрес** (сайт), а nginx внутри сам перенаправляет
запросы `/api/v1/...` и `/static/...` на backend. Поэтому **не нужно знать домен
сервера заранее** — заработает и на `localhost`, и на любом IP/домене.

---

## 1. Настройка (один раз)

```bash
cp .env.example .env
```

Открой `.env` и поменяй как минимум:

| Переменная           | Что это                                                        |
|----------------------|----------------------------------------------------------------|
| `POSTGRES_PASSWORD`  | пароль БД — поставь свой надёжный                              |
| `SECRET_KEY`         | секрет для JWT. Сгенерировать: `openssl rand -hex 32`         |
| `WEB_PORT`           | порт, на котором будет открываться сайт (по умолчанию `80`)    |
| `SEED_DEMO`          | `1` — залить демо-отели при первом старте, `0` — пустая база   |
| `VITE_GOOGLE_CLIENT_ID` | ID для кнопки «Войти через Google» (если не нужен — пусто) |

> `VITE_API_URL=/api/v1` менять не нужно — это относительный путь через nginx.

---

## 2. Запуск

```bash
docker compose up -d --build
```

- `--build` — собрать образы (нужно при первом запуске и после изменений кода).
- `-d` — в фоне.

Backend при старте сам применяет миграции (`alembic upgrade head`), а при
`SEED_DEMO=1` ещё и заполняет каталог демо-данными.

Открыть сайт: **http://localhost:<WEB_PORT>** (например `http://localhost:80`).

Проверить, что всё живо:
```bash
curl http://localhost:<WEB_PORT>/health        # {"status":"ok"}
docker compose ps                              # все сервисы Up
```

---

## 3. Полезные команды

```bash
docker compose logs -f backend     # логи бэкенда (тут же печатается OTP-код!)
docker compose ps                  # статус контейнеров
docker compose down                # остановить (данные БД и фото сохранятся)
docker compose down -v             # остановить И стереть БД + загруженные фото
docker compose up -d --build       # пересобрать и перезапустить после правок
```

Выдать аккаунту роль (для функций ресепшена/хоста — номер точно как в базе):
```bash
docker compose exec backend python grant_role.py +996XXXXXXXXX reception
```

Перезалить демо-каталог вручную:
```bash
docker compose exec backend python seed.py
```

> **OTP замокан:** код подтверждения печатается в логах backend
> (`docker compose logs -f backend`, строка `WHATSAPP OTP MOCK`).

---

## 4. Деплой на сервер (для того, кто разворачивает)

1. Установить Docker и плагин compose на сервере.
2. Скопировать туда папку проекта (`git clone` или `scp`).
3. `cp .env.example .env` и прописать **свои** `POSTGRES_PASSWORD`, `SECRET_KEY`,
   при необходимости `WEB_PORT` (обычно `80`).
4. `docker compose up -d --build`.
5. Сайт доступен на `http://<IP-или-домен-сервера>:<WEB_PORT>`.

Данные переживают перезапуск и пересборку: БД лежит в томе `pgdata`,
загруженные фото — в томе `backend_static`.

### Что стоит сделать для боевого сервера
- Поставить перед стеком reverse-proxy с HTTPS (Caddy / Traefik / nginx + certbot)
  и пробросить на `web` — тогда сайт будет по `https://...`.
- В [backend/app/main.py](backend/app/main.py) CORS открыт на `*` (для MVP) —
  при желании сузить до своего домена.
- Хранить `.env` в секрете (он уже в `.gitignore`).

---

## 5. Если что-то не так

| Симптом                                    | Причина / решение                                                        |
|--------------------------------------------|--------------------------------------------------------------------------|
| `Bind for 0.0.0.0:80 failed: port allocated` | порт занят другим сервисом — поменяй `WEB_PORT` в `.env`               |
| Сайт открывается, но данные не грузятся     | смотри `docker compose logs backend`; проверь, что миграции прошли       |
| Пустой каталог                              | в `.env` поставь `SEED_DEMO=1` или выполни `seed.py` (см. выше)           |
| Изменил код, но ничего не поменялось        | пересобрать: `docker compose up -d --build`                              |
```
