# M365 Health & Security Advisor

M365 Health & Security Advisor is a Next.js MVP for reviewing basic Microsoft 365 tenant health and identity security signals. It uses Microsoft Entra ID login, delegated Microsoft Graph access, Prisma, and PostgreSQL.

## Current MVP Status

Release 0.1 includes:

- Microsoft Entra ID authentication with Auth.js / NextAuth.
- Protected dashboard route at `/dashboard`.
- Tenant overview with signed-in user name, email, and tenant ID.
- Microsoft Graph dashboard aggregation endpoint.
- Users overview for total, member, guest, enabled, and disabled users.
- Check Framework with reusable check definitions, status helpers, metadata, and recommendations.
- Security and governance checks:
  - Global Admin Count
  - MFA Registration Coverage
  - Admin Accounts Hygiene
  - Guest Users Governance
  - Disabled Users Hygiene
- Health Score MVP calculation.
- Quick Wins recommendations.
- Check Detail Drawer.
- Manual scan snapshot saving.
- Recent scan history and scan detail drawer.
- HTML report preview at `/reports/[scanId]`.
- Browser-based Print / Save as PDF.

## Stack

- Next.js 15
- TypeScript
- App Router
- Auth.js / NextAuth
- Microsoft Entra ID provider
- Microsoft Graph SDK
- Prisma
- PostgreSQL
- ESLint + Prettier

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local`.

4. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open:

   ```text
   http://localhost:3000
   ```

## Environment Variables

Use `.env.example` as the template:

```env
DATABASE_URL=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

Notes:

- `DATABASE_URL` must point to a PostgreSQL database.
- `AZURE_AD_TENANT_ID=common` allows sign-in from multiple Entra tenants during local testing.
- `NEXTAUTH_SECRET` must be a strong random secret.
- Do not commit real secrets.

## Microsoft Entra App Registration

Create or update an App Registration in Microsoft Entra ID.

Authentication settings:

- Platform: Web
- Redirect URI:

  ```text
  http://localhost:3000/api/auth/callback/azure-ad
  ```

Supported account types:

- Use the option that matches your testing model.
- For multi-tenant testing, use accounts in any organizational directory.

Client credentials:

- Create a client secret.
- Store it locally as `AZURE_AD_CLIENT_SECRET`.

## Microsoft Graph Delegated Permissions

The MVP uses delegated permissions only. Application permissions are not used yet.

Required delegated permissions:

- `openid`
- `profile`
- `email`
- `offline_access`
- `User.Read`
- `Directory.Read.All`
- `Reports.Read.All`

Permission notes:

- `Directory.Read.All` is used for users, directory roles, and privileged admin checks.
- `Reports.Read.All` is used by MFA Registration Coverage through Microsoft Graph reporting data.
- Some permissions usually require admin consent in the tenant.
- No Application permissions are required for Release 0.1.

## Useful Commands

```bash
npm run lint
npm run format:check
npm run build
npm run prisma:generate
npm run prisma:migrate
```

## Known MVP Limitations

- MFA Registration Coverage uses the Microsoft Graph beta/report endpoint.
- Health Score is a simple unweighted MVP calculation.
- Quick Wins are heuristic recommendations.
- Print/PDF export uses browser print.
- Scans are started manually.
- Refresh token flow is not implemented.
- Scheduled scanning is not implemented.
- Multi-customer MSP interface is not implemented.
- No server-side PDF generation is implemented.
- No public report sharing is implemented.
