# Events Manager

React SPA + Laravel API + PostgreSQL.

## Структура

```
diploma/
  firsttry/       # фронтенд (React + Vite)
  firsttry-api/   # backend (Laravel + Sanctum)
```

## Требования

- Node.js 20.19+ или 22.12+ (`nvm use` в `firsttry`)
- PHP 8.2+ с расширениями `pgsql`, `mbstring`, `openssl`
- Composer
- Docker (для PostgreSQL)

## Backend

```bash
cd firsttry-api
./start.sh
# первый раз с пустой БД: docker compose exec api php artisan db:seed
```

API: http://localhost:8000/api

Тестовые пользователи:
Тестовые пользователи (пароль `password`):
- Менеджер: `manager@click2mice.ru`
- Клиенты: по 3 на компанию, например `client@vector-events.ru` (ООО «Вектор Событий»); всего 6 вымышленных компаний, 50 мероприятий

## Frontend

```bash
cd firsttry
nvm use
npm install
cp .env.example .env
npm run dev
```

Приложение: http://localhost:5173/

Vite проксирует `/api` на `http://localhost:8000`.

На Linux выполняйте `npm install` локально — не копируйте `node_modules` с Windows.

## Проверка

1. Войти как `manager@click2mice.ru`
2. Страницы `/current`, `/upcoming`, `/reports` показывают 4 события из Postgres
3. Профиль сохраняется, смена пароля работает
4. Excel-выгрузка на странице отчётов
