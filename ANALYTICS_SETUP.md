# Website Analytics Setup (GA4 + Clarity)

This project now includes:
- Global Google Analytics 4 tracking in Next.js (public pages)
- Global Microsoft Clarity tracking in Next.js
- Admin analytics dashboard at `/admin/analytics`
- Backend GA4 Data API endpoint at `/api/v1/admin/analytics`

## 1) Packages

Installed packages:
- Frontend: `recharts`
- Backend: `googleapis`

## 2) Environment Variables

### Frontend (`iphint-frontend-production/.env.local`)

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-G36SYNKFZ10
NEXT_PUBLIC_CLARITY_PROJECT_ID=x0u12vgwao
```

### Backend (`iphint-backend-production/.env`)

```env
GA4_PROPERTY_ID=539915095
GA4_CLIENT_EMAIL=iphint@iphint.iam.gserviceaccount.com
GA4_PRIVATE_KEY="<SERVICE_ACCOUNT_PRIVATE_KEY_ONE_LINE_WITH_ESCAPED_\\n>"
```

Notes:
- Keep the private key in one line with escaped `\\n` in `.env`.
- Never commit real private keys to markdown/docs or git.
- The GA4 service account must have `Viewer` access (or equivalent read access) on the target GA4 property.

## 3) Google Cloud + GA4 Access

1. Create a service account in Google Cloud.
2. Create a JSON key for the service account.
3. In GA4 Admin -> Property Access Management, add the service account email.
4. Give read permissions to analytics reports.
5. Set the backend env values from the service account key and GA4 property id.

## 4) What is Tracked

### Frontend Tracking
Automatically tracks page views for public pages via GA4 in:
- `src/components/analytics/WebsiteAnalytics.tsx`
- mounted in `src/app/[locale]/layout.tsx`

Microsoft Clarity script is also loaded globally from the same component.

### Backend Analytics API
Admin analytics data endpoint:
- `GET /api/v1/admin/analytics?range=7d|30d|90d`

Implemented in:
- `src/modules/admin/admin-analytics.service.ts`
- `src/modules/admin/admin.controller.ts`
- `src/modules/admin/admin.routes.ts`

## 5) Admin Dashboard

New admin page:
- `src/app/[locale]/admin/analytics/page.tsx`

Sidebar entry:
- `src/components/adminLayout/Sidebar.tsx`

Redux state + API thunk:
- `src/lib/store/slices/adminSlice.ts`

Types:
- `src/types/admin.ts`
- `iphint-backend-production/src/modules/admin/admin.types.ts`

## 6) Analytics Coverage

Dashboard includes:
- Total visitors, active visitors, page views, sessions
- Engagement rate, bounce rate, average session duration
- Traffic trends and growth
- Top countries, top cities
- Traffic sources and referrers
- Device usage, browser usage, OS usage
- Top pages, top content, top landing pages

Date filters:
- Last 7 days
- Last 30 days
- Last 90 days

## 7) Run

Backend:
```bash
cd iphint-backend-production
npm run dev
```

Frontend:
```bash
cd iphint-frontend-production
npm run dev
```

Open:
- `/{locale}/admin/analytics`
