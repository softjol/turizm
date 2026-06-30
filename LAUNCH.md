# 🚀 Как запустить проект (backend + web)

Справочник по локальному запуску. Это **только инструкция** - файл ничего не запускает сам.

```
turizm/
├── backend/   FastAPI + async SQLAlchemy + PostgreSQL   →  http://localhost:8000
└── web/       React 19 + Vite                            →  http://localhost:5173
```

---

## 0. Предусловия (один раз)

- **PostgreSQL** запущен на `localhost:5432`, есть база `turizm` (см. `backend/.env`).
  Проверить, что порт слушается:
  ```bash
  nc -z localhost 5432 && echo "postgres ok"
  ```
- **Python 3.13** для venv бэкенда, **Node/npm** (или bun) для веба.
- Файлы окружения уже на месте: `backend/.env` и `web/.env`. В репозиторий они не коммитятся.

---

## 1. Backend (FastAPI)

```bash
cd backend
.venv/bin/python run.py
```

- API: `http://localhost:8000/api/v1`
- Swagger-доки: `http://localhost:8000/docs`
- Health-check: `http://localhost:8000/health`  →  `{"status":"ok"}`
- Авто-релоад включён (правки в `backend/` подхватываются сами).

Если venv ещё не создан:
```bash
/Library/Frameworks/Python.framework/Versions/3.13/bin/python3.13 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### Полезное (backend)
- Заполнить базу тестовыми данными (типы, удобства, 3 отеля с номерами):
  ```bash
  .venv/bin/python seed.py
  ```
- Выдать аккаунту роль (для host/reception функций). **Номер - точно как в базе:**
  ```bash
  .venv/bin/python grant_role.py +996XXXXXXXXX reception
  ```
- **OTP замокан:** код печатается в консоль бэкенда (ищи строку `WHATSAPP OTP MOCK`).

---

## 2. Web (React + Vite)

```bash
cd web
npm install      # только при первом запуске / после изменения зависимостей
npm run dev
```

- Открыть: `http://localhost:5173`
- Адрес API берётся из `web/.env` → `VITE_API_URL=http://localhost:8000/api/v1`.
- Для работы веба бэкенд должен быть запущен (иначе `ERR_CONNECTION_REFUSED`).

Прочие команды:
```bash
npm run build    # прод-сборка (проверка, что всё компилируется)
npm run lint     # проверка кода
```

---

## 3. Порядок запуска

1. Поднять PostgreSQL.
2. Терминал 1 → запустить **backend** (`cd backend && .venv/bin/python run.py`).
3. Терминал 2 → запустить **web** (`cd web && npm run dev`).
4. Открыть `http://localhost:5173`.

---

## 4. Если что-то не так

| Симптом | Причина / решение |
|---|---|
| `Address already in use` (порт 8000) | бэкенд уже запущен. Остановить: `lsof -ti tcp:8000 \| xargs kill -9` |
| Web: `ERR_CONNECTION_REFUSED` на `:8000` | бэкенд не запущен - подними его |
| `403 Forbidden` при публикации отеля | у аккаунта роль `user` - выдай `reception` через `grant_role.py` |
| `Phone number not registered` при логине | сначала зарегистрируйся на фронте этим номером |
| Пустой каталог | база пустая - запусти `seed.py` |