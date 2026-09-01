# WishList

Веб‑приложение для личных списков желаний и коллекции настольных игр. Пользователь заводит аккаунт,
собирает списки по разделам (вишлист, настолки, книги, прочее), добавляет в них элементы со ссылкой,
ценой и обложкой, отмечает выполненное и удаляет ненужное. Отдельно доступна витрина каталога —
подборки настольных игр с группами, ссылками на магазины и ценами в разных валютах.

## Возможности

- Регистрация и вход, пары access/refresh‑токенов с ротацией refresh‑токена и завершением сессии по
  истечении срока.
- Списки, привязанные к аккаунту: создание по разделам, переименование, удаление.
- Элементы списка: название, заметка, ссылка, цена с валютой, обложка, отметка «сделано», удаление.
- Загрузка обложек и инструкций: проверка содержимого по сигнатуре, ограничение размера и количества,
  случайные имена файлов на сервере, защищённая раздача.
- Витрина каталога: разделы, группы, карточки игр с числом игроков, ссылками и ценами; добавление
  групп и игр доступно авторизованному пользователю.
- Состояния загрузки, ошибки и пустого списка на каждом экране; адаптивная вёрстка.

## Интерфейс

| | |
| --- | --- |
| ![Главная](docs/screenshots/01-landing.png) | ![Настолки](docs/screenshots/02-boardgames.png) |
| ![Вишлист](docs/screenshots/03-wishlist.png) | ![Вход](docs/screenshots/04-auth.png) |
| ![Мои списки](docs/screenshots/05-my-lists.png) | |

## Архитектура

Монорепозиторий на npm workspaces:

```
apps/
  backend/    Express + TypeScript: маршруты, сервисы, доступ к данным, миграции, seed
  frontend/   Next.js (pages router, JavaScript): экраны каталога и личных списков
packages/
  shared/     общий контракт API: типы и константы маршрутов и кодов ошибок
docker/       образы backend и frontend
```

Backend разбит по модулям (`auth`, `lists`, `catalog`, `upload`); каждый модуль содержит маршруты,
сервис с бизнес‑логикой и слой запросов к PostgreSQL. HTTP‑слой закрыт Helmet, точным списком
разрешённых origin для CORS, ограничением частоты запросов и размера тела, единым обработчиком ошибок.
Frontend обращается к API через один экземпляр axios: он подставляет токен, один раз пытается обновить
сессию при ответе 401 и сообщает интерфейсу об истечении сессии.

## Стек

- Backend: Node.js 24, Express, TypeScript, PostgreSQL (`pg`), `node-pg-migrate`, `zod`, `helmet`,
  `express-rate-limit`, `jsonwebtoken`, `bcryptjs`, `pino`.
- Frontend: Next.js 16, React 19, CSS‑модули, axios. Проверка типов — `tsc --checkJs`.
- Тесты: Vitest и Supertest (backend), Vitest и Testing Library (frontend), Playwright (сквозной сценарий).
- Инфраструктура: Docker Compose, GitHub Actions.

## Переменные окружения

Значения берутся из `.env` (файл в `.gitignore`); шаблон — `.env.example`.

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | строка подключения к PostgreSQL |
| `NODE_ENV` | `development`, `test` или `production` |
| `PORT` | порт API (по умолчанию 3031) |
| `TRUST_PROXY` | доверие reverse proxy: `false`, `true` или точное число промежуточных узлов |
| `CORS_ORIGINS` | список разрешённых origin через запятую, без подстановочных знаков |
| `JWT_ACCESS_SECRET` | секрет для access‑токенов; в production обязателен и без значения по умолчанию |
| `JWT_REFRESH_SECRET` | секрет для refresh‑токенов; требования те же |
| `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` | сроки жизни токенов (например, `15m`, `30d`) |
| `UPLOAD_DIR` | каталог хранения загруженных файлов вне репозитория |
| `MAX_UPLOAD_BYTES` | максимальный размер одного файла |
| `LOG_LEVEL` | уровень логирования |
| `NEXT_PUBLIC_API_BASE_URL` | базовый URL API для браузера |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | параметры БД, поднимаемой Docker Compose |
| `RUN_SEED` | `true` — идемпотентно прогнать seed при старте контейнера backend |

Сгенерировать секрет:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Миграции и seed

Схема описана SQL‑миграциями в `apps/backend/src/db/migrations`. Миграции идемпотентны: применение к
пустой базе создаёт полную схему, применение к базе с уже существующими таблицами каталога только
добавляет недостающее.

```bash
npm run migrate        # применить миграции
npm run seed           # заполнить пустую базу демоданными
npm run migrate:create -- <name>   # создать новый файл миграции
```

Seed добавляет небольшой каталог и демоаккаунт `demo@wishlist.local` с паролем `demo-passphrase-123`
и двумя списками. Повторный запуск не перезаписывает существующий каталог, пароль или пользовательские
списки.

## Запуск

Требуются Node.js 24, npm 11+ и PostgreSQL (или Docker).

### Локально

```bash
cp .env.example .env      # заполнить DATABASE_URL и секреты
npm ci
npm run migrate
npm run seed              # по желанию
npm run dev               # backend на :3031, frontend на :3000
```

### Docker

```bash
cp .env.example .env      # задать JWT_ACCESS_SECRET и JWT_REFRESH_SECRET
npm run docker:up         # db + backend (с миграциями и seed) + frontend
npm run docker:down       # остановить контейнеры, сохранив тома с данными
npm run docker:reset      # удалить контейнеры и тома; все Docker-данные будут потеряны
```

После старта: интерфейс — http://localhost:3000, API — http://localhost:3031, проверка состояния —
`GET /health`.

## Тесты

```bash
npm run typecheck                         # проверка типов во всех пакетах
npm run lint
npm run test --workspace @wishlist/backend   # нужен TEST_DATABASE_URL или локальная БД wishlist_test
npm run test --workspace @wishlist/frontend
npm run e2e --workspace @wishlist/frontend    # Playwright поднимает backend и frontend сам
```

CI выполняет установку, аудит зависимостей, линт, проверку типов, оба набора тестов, сборку,
сквозной сценарий и поиск секретов в истории.

## Хранение файлов

Загруженные файлы не попадают в Git. Backend принимает их в память, проверяет сигнатуру содержимого
(разрешены JPEG, PNG, WebP, PDF), присваивает случайное имя вида `<uuid>.<расширение>` и сохраняет в
каталог `UPLOAD_DIR` (локально — `apps/backend/var/uploads`, в Docker — том `uploads`). Раздача идёт
через `GET /files/:id`: идентификатор проверяется по шаблону, путь резолвится строго внутри
`UPLOAD_DIR`, попытки выхода за пределы каталога отклоняются. Ссылки на публикацию произвольного пути
нет.

Существующий каталог можно подключить напрямую через `DATABASE_URL`, а соответствующее файловое
хранилище — через `UPLOAD_DIR`. Сами рабочие данные, `.env` и каталог `apps/backend/var` намеренно
игнорируются Git и не входят в публичный репозиторий.

## API

| Метод и путь | Назначение |
| --- | --- |
| `POST /auth/register`, `POST /auth/login` | создание аккаунта и вход |
| `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | обновление сессии, выход, профиль |
| `GET/POST /lists`, `GET/PATCH/DELETE /lists/:id` | списки пользователя |
| `GET/POST /lists/:id/items`, `PATCH/DELETE /lists/:id/items/:itemId` | элементы списка |
| `GET /catalog/sections`, `/catalog/wish-types`, `/catalog/groups`, `/catalog/games` | витрина каталога |
| `POST /catalog/groups`, `POST /catalog/games` | добавление групп и игр (требуется вход) |
| `POST /uploads`, `GET /files/:id` | загрузка и раздача файлов |

## Лицензия

Лицензия на повторное использование кода и материалов не предоставлена.
