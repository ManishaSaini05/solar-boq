# Solar BoQ System

Rooftop solar — from site survey to client proposal in one app.

## Stack
- **Next.js 14** — frontend + backend in one codebase
- **Supabase** — project database (free tier)
- **Nodemailer** — email notifications (your own SMTP)
- **SheetJS** — export BoQ as Excel (.xlsx)
- **react-pdf** — client proposal PDF (phase 2)
- **Vercel** — deployment (free tier)

---

## Step 1 — Set up Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **SQL Editor** and run this:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  site_location TEXT,
  stage INTEGER DEFAULT 1,

  -- Stage 2: Design
  design_inputs JSONB,
  boq_manual JSONB,
  boq_total NUMERIC,
  design_completed_at TIMESTAMPTZ,

  -- Stage 3: CFO
  gross_margin NUMERIC,
  cfo_approved_at TIMESTAMPTZ,

  -- Stage 4: Finance
  finance_inputs JSONB,
  finance_completed_at TIMESTAMPTZ,

  -- Team emails for notifications
  design_team_email TEXT,
  cfo_email TEXT,
  finance_team_email TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Go to **Settings → API** and copy:
   - Project URL
   - anon public key

---

## Step 2 — Set up Gmail App Password

1. Go to your Google Account → Security
2. Enable 2-Step Verification if not already on
3. Go to **App Passwords** → create one for "Mail"
4. Copy the 16-character password

---

## Step 3 — Local setup

```bash
# Clone / open in VS Code
cd solar-boq

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL, keys, and Gmail credentials

# Run locally
npm run dev
```

Open http://localhost:3000

---

## Step 4 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# vercel.com → your project → Settings → Environment Variables
# Add all variables from .env.local
```

After deploy, update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your production URL.

---

## Workflow

| Stage | Who | What |
|-------|-----|-------|
| 1 | Sales team | Fills Google Form on-site → creates project in app |
| 2 | Design team | Opens email link → fills design inputs → BoQ auto-populates → submits to CFO |
| 3 | CFO | Opens email link → enters gross margin % → approves → notifies finance |
| 4 | Finance | Opens email link → enters tariff, generation data → reviews financials |
| 5 | Anyone | Downloads BoQ Excel + proposal PDF → sends to client |

---

## Project structure

```
app/
  dashboard/          → project list
  new-project/        → create project form
  project/[id]/
    design/           → Stage 2: BoQ designer
    cfo/              → Stage 3: gross margin
    finance/          → Stage 4: financial analysis
    proposal/         → Stage 5: downloads
  api/
    projects/         → CRUD for projects
    send-email/       → Nodemailer email (server-side)
    export-excel/     → SheetJS Excel generation

components/
  BoQCalculator.jsx   → main interactive BoQ form
  CFOView.jsx         → margin input + BoQ summary
  FinanceView.jsx     → financial analysis
  ProposalActions.jsx → download buttons
  StageNav.jsx        → stage progress bar

lib/
  supabase.js         → Supabase client
  boqData.js          → BOQ catalog (75 items), lookup tables
  calculations.js     → all formula logic (shared between client/server)
```

---

## Phase 2 (after testing)

- [ ] PDF proposal generation with your company branding (react-pdf)
- [ ] Project search and filtering on dashboard
- [ ] Simple login (Supabase Auth)
- [ ] Excel import of site survey data
