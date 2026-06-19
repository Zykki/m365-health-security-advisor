# M365 Health & Security Advisor

Release 0.1 zaklada Next.js aplikaciu s prihlasenim cez Microsoft Entra ID, chranenou dashboard routou a Prisma modelmi pripravenymi pre neskorsi rozvoj.

## Stack

- Next.js 15
- TypeScript
- App Router
- Auth.js / NextAuth
- Microsoft Entra ID provider
- Prisma
- PostgreSQL
- ESLint + Prettier

## Co je v Release 0.1

- login cez Microsoft Entra ID
- logout
- chranena route `/dashboard`
- zobrazenie mena, emailu a tenant ID z tokenu
- zobrazenie zakladneho prehladu pouzivatelov cez Microsoft Graph
- Prisma schema so zakladnymi entitami `Tenant`, `AppUser`, `Account`, `Session`

Nie je tu este scan engine, scoring, reporty, MFA kontroly, Application permissions ani Azure Functions.

## Lokalne spustenie

1. Nainstaluj zavislosti:

   ```bash
   npm install
   ```

2. Vytvor `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

3. Nastav PostgreSQL databazu a uprav `DATABASE_URL` v `.env.local`.

4. Vygeneruj Prisma klienta:

   ```bash
   npx prisma generate
   ```

5. Spusti migraciu:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Spusti dev server:

   ```bash
   npm run dev
   ```

7. Otvor `http://localhost:3000`.

## Microsoft Entra ID konfiguracia

V App registration nastav redirect URI:

```text
http://localhost:3000/api/auth/callback/azure-ad
```

Provider ID v `auth.ts` je `azure-ad`, preto musi redirect URI v Entra portali pouzivat presne tuto callback path.

Pouzivaju sa iba delegated scope `openid profile email offline_access User.Read Directory.Read.All`. Aplikacia zatial neziada Application permissions. Graph Engine vola iba zakladne `/users` count dotazy pre `Total Users`, `Members`, `Guests`, `Enabled Users` a `Disabled Users`.

## Uzitocne prikazy

```bash
npm run lint
npm run format:check
npm run build
npm run prisma:generate
npm run prisma:migrate
```
