# The Dating App

A dating app that keeps profiles anonymous until you match, then helps you plan the perfect first date — including booking a table at a partner-verified cafe or restaurant, with a discount for booking a date over booking solo.

> Personal portfolio project. Live demo: _add your deployed URL here once live._

<!-- TODO: add screenshots of the landing page, home/swipe deck, and cafe booking flow here -->

## What it does

- **Anonymous-first matching** — profiles show interests and vibe before photos; a similarity-score algorithm ranks potential matches on orientation, goals, communication style, lifestyle, and interests.
- **Real-time chat** — once matched, chat unlocks via WebSockets (typing indicators, presence, read receipts).
- **Cafe & table booking** — browse partner-verified cafes/restaurants and book a table either solo or with a match. Date bookings get an automatic discount.
- **Cafe partner pipeline** — venues apply to be listed; admins review and approve applications, which creates a public listing.
- **Premium subscriptions** — Razorpay-backed plans with promo codes.
- **Admin panel** — role-based access control (per-section view/edit permissions) covering users, reports, premium plans, promo codes, reviews, expert tips, footer content, and cafe/booking management.
- **Account deletion** — self-service, cascades through profile, likes, matches, chats, and bookings.

## Tech stack

**Frontend:** React 19 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), Framer Motion
**Backend:** Django 5 + Django REST Framework, Django Channels (WebSockets), JWT auth
**Database:** PostgreSQL ([Neon](https://neon.tech), serverless/free tier)
**Media storage:** [Cloudinary](https://cloudinary.com) (free tier)
**Payments:** Razorpay
**Hosting:** Vercel (frontend) + Render (backend), both free tier — see [Deployment](#deployment)

## Project structure

```
backend/
  config/        settings, URLs, ASGI entrypoint
  login/         auth, matching, chat, likes, notifications, payments
  profiles/      user profile CRUD
  cafes/         cafe listings, partner applications, bookings
  admin_panel/   admin dashboard, RBAC, premium/promo/review/footer management
front-end/
  src/pages/           top-level routed pages
  src/pages/adminpages/ admin panel sections
  src/components/      shared UI, onboarding steps, layout
  src/services/        API client
  src/lib/config.ts    API base URL (env-driven)
```

## Local setup

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate   # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in values — see below
python manage.py migrate
python manage.py seed_demo_data   # populates demo profiles, cafes, premium plans, reviews
python manage.py runserver
```

With no `DATABASE_URL` set, the backend falls back to a local SQLite file automatically — no database setup required to get started.

### Frontend

```bash
cd front-end
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:8000/api
npm run dev
```

### Demo login

After running `seed_demo_data`, log in as any seeded profile (e.g. `arjun.demo@example.com`) with password `DemoPass123!` to see a populated app with real matches, cafes, and reviews.

## Environment variables

See [`.env.example`](.env.example) (backend, repo root) and [`front-end/.env.example`](front-end/.env.example) (frontend) for the full list. Only `SECRET_KEY` is required to boot the backend — everything else (database, email, Razorpay, Cloudinary, Google OAuth) has a safe default or degrades gracefully if unset.

## Testing

```bash
# Backend (uses the SQLite fallback automatically if DATABASE_URL isn't set)
cd backend && python manage.py test

# Frontend
cd front-end && npm test
```

CI (`.github/workflows/ci.yml`) runs both suites plus lint and a production build on every push.

## Deployment

Zero-cost stack: **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres) + **Cloudinary** (media).

1. **Neon**: create a project, copy the pooled connection string.
2. **Cloudinary**: create an account, copy the `CLOUDINARY_URL` from the dashboard.
3. **Render**: new Web Service pointed at `backend/`.
   - Build command: `bash build.sh`
   - Start command: `daphne config.asgi:application --port $PORT --bind 0.0.0.0`
   - Environment: set `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS` (your Render domain), `DATABASE_URL` (Neon), `CLOUDINARY_URL`, `CORS_ALLOWED_ORIGINS` (your Vercel domain), plus email/Razorpay/Google OAuth vars as needed.
4. **Vercel**: import `front-end/` as the project root.
   - Set `VITE_API_URL` to your Render backend URL + `/api`.
5. After the first deploy, run `python manage.py seed_demo_data` once (via Render's shell) to populate demo content.

**Before pushing this repo publicly**: the git history on this branch predates this cleanup and has hardcoded secrets and multiple contributors' commits in it. Start a fresh initial commit for the public repo rather than pushing the full history.

## License

Personal project — all rights reserved.
