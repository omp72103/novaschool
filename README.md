# NovaSchool

AI-powered personalised learning for Classes 5–12 — CBSE, ICSE, IB and Cambridge, in English, Hindi and Hinglish.

## What's inside

| Area | What it does |
|---|---|
| Home | Hero, board → class → subject picker, features, tutor approach, live lab preview, Human + AI, 3 steps, stories, blog, FAQ |
| Programmes | Every board and class (PCM / PCB / PCMB for 11–12), chapter lists, 4 AI-written lectures per chapter, progress tracking. Chapter 1 free |
| Labs | 19 interactive simulations with controls, live readouts, formulas and explanations |
| AI tutor (Nova) | Step-by-step help in English / Hindi / Hinglish, child-safety rules, plan limits (Starter: 5 questions a day) |
| Plans | Starter / Scholar / Achiever with monthly–yearly toggle and comparison table |
| Dashboard | Progress, weekly insights, AI chapter tests and timed mock exams, revision plan, parent report |
| Forms | Book a free demo, contact |
| Legal | Child safety, accessibility, privacy, terms, cookies |

## Files

```
index.html    page shell
styles.css    theme
data.js       brand, syllabus, labs, plans, FAQ, blog, legal text  ← edit content here
labs.js       lab engine + 19 labs
fx.js         landing-page 3D and scroll animations
scene3d.js    WebGL 3D scroll journey (uses vendor/three.min.js, MIT)
app.js        router, pages, tutor, tests, forms, sign-in screens
auth.js       accounts: Google + email sign-in, JWT sessions, profile & progress sync (Supabase)
portal.js     student / parent / teacher / admin portal (ERP-style layout)
api/ai.js     serverless AI proxy (keeps your API key secret)
api/lead.js   serverless endpoint for demo bookings and contact messages
vercel.json   headers
```

## Accounts, Google sign-in and the portal

Accounts use **Supabase Auth** (Google OAuth with PKCE, or email + password). Every session is a signed JWT that refreshes automatically; the database checks it on every request through row-level security.

Database tables (all prefixed `ns_`, isolated from other apps in the same project): `ns_profiles`, `ns_state`, `ns_test_results`, `ns_leads`, `ns_notices`, `ns_audit`, `ns_admins`.

Roles: **student**, **parent** (learning portal), **teacher** (leads, users read-only, results, notices), **admin** (everything, incl. role/plan changes and the audit log). Emails listed in `ns_admins` become admins automatically on first sign-in. To add another admin, run in the Supabase SQL editor:

```sql
insert into public.ns_admins(email) values ('someone@example.com');
update public.ns_profiles set role = 'admin' where email = 'someone@example.com';
```

### One-time Supabase setup
1. **Authentication → URL Configuration → Redirect URLs:** add `https://omp72103.github.io/novaschool/` (and your Vercel URL if you use one). Leave *Site URL* unchanged.
2. **Authentication → Sign In / Providers → Google:** enable it and paste the Client ID and Client Secret from Google Cloud Console. In Google Cloud, the OAuth client's *Authorized redirect URI* must be `https://waffuxrfqswovuqkpedm.supabase.co/auth/v1/callback`.
3. **Emails (recommended):** Supabase's built-in mailer is rate-limited; add your own SMTP under Authentication → Emails before launch.

## Deploy on Vercel

1. Go to **vercel.com/new**, choose **Import Git Repository**, and pick `omp72103/novaschool`.
2. Framework preset: **Other**. Leave build command and output directory empty.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` (from console.anthropic.com). To allow only signed-in users to use the AI tutor, also add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (same values as in `data.js`). Optionally add `LEAD_WEBHOOK_URL`.
4. Click **Deploy**. Every push to this repo redeploys automatically.

## Run locally

```
npm run dev        # needs the Vercel CLI login; serves the site and /api
npm run check      # syntax check
```

## Customise

- **Name, phone, email, address:** `NS.BRAND` in `data.js`.
- **Prices and plan features:** `NS.PLANS` and `NS.PLAN_ROWS` in `data.js`.
- **Chapters:** the `SYL` lists in `data.js`.
- **Parent stories:** `NS.STORIES` in `data.js` — currently placeholders; replace with real feedback shared with permission.

## Before launch

- **Payments** are not connected: choosing a plan activates it in demo mode. Add a gateway (e.g. Razorpay) and set `paymentsLive: true` in `NS.CONFIG`.
- **Leads and messages** are saved to Supabase and managed in the portal (Admission Leads / Messages).
- **Student progress** syncs to the signed-in account across devices.
