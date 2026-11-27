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
app.js        router, pages, tutor, dashboard, tests, forms
api/ai.js     serverless AI proxy (keeps your API key secret)
api/lead.js   serverless endpoint for demo bookings and contact messages
vercel.json   headers
```

## Deploy on Vercel

1. Go to **vercel.com/new**, choose **Import Git Repository**, and pick `omp72103/novaschool`.
2. Framework preset: **Other**. Leave build command and output directory empty.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` (from console.anthropic.com). Optionally add `LEAD_WEBHOOK_URL`.
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
- **Leads** are written to the Vercel logs (search `NOVASCHOOL_LEAD`) and, if set, sent to `LEAD_WEBHOOK_URL`.
- **Student progress** is stored in each visitor's browser. Add a database (e.g. Supabase) for cross-device accounts.
