This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker / Локальный запуск в контейнерах (проект)

Короткие шаги для запуска frontend + backend локально через Docker Compose (compose собирает образы):

1. В корне репозитория выполните:

```bash
docker compose -f docker/docker-compose.yml up --build
```

2. Фронтенд будет доступен по адресу http://localhost:3000. Внутри сети compose фронтенд обращается к бэкенду по `http://backend:8000`.

3. Остановить и удалить контейнеры:

```bash
docker compose -f docker/docker-compose.yml down
```

Заметки:
- Публичные переменные окружения для фронтенда задаются в `docker/docker-compose.yml` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_BASE`).
- Секреты не храните в образе фронтенда; держите секреты бэкенда в `backend/simple.env` и передавайте их через `env_file` или CI.

