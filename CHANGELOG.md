# Changelog

## Release 0.1

### Authentication

- Added Microsoft Entra ID sign-in with Auth.js / NextAuth.
- Added protected dashboard route and logout.
- Stored Microsoft Graph access token in the Auth.js JWT session.
- Added expired Microsoft Graph access token handling for the dashboard aggregation endpoint.

### Graph Engine

- Added Microsoft Graph SDK client.
- Added delegated Graph calls for users overview, admin role checks, privileged roles, and MFA registration coverage.
- Added pagination handling for MFA registration coverage report data.

### Dashboard Overview

- Added tenant identity summary.
- Added users overview.
- Added dashboard aggregation endpoint at `/api/dashboard/overview`.
- Added sticky sidebar layout and dashboard sections.

### Check Framework

- Added check definitions, statuses, categories, metadata, recommendations, and status helpers.
- Added reusable `SecurityCheckCard`.
- Added Check Detail Drawer.

### Health Score

- Added MVP health score calculation from check statuses.
- Added OK, Warning, and Critical counts.

### Quick Wins

- Added heuristic Quick Wins selection from non-OK checks.
- Added dashboard Quick Wins section.

### Scan Snapshot

- Added Prisma models for saved scans and check results.
- Added manual scan snapshot saving.

### Scan History

- Added recent scans endpoint and dashboard history section.
- Added scan detail endpoint and drawer.

### Report Preview

- Added HTML report preview at `/reports/[scanId]`.
- Added Executive Summary, Health Score Summary, Top Recommendations, and findings grouped by severity.

### Print / Save as PDF

- Added browser-based Print / Save as PDF action for report previews.
- Added print-friendly report styling.
