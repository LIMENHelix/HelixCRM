# HELIX CRM — AI-Powered Email Automation

## Deploy in 2 Minutes (No Terminal Needed)

### Option 1: Vercel Dashboard (Easiest)
1. Go to [github.com/new](https://github.com/new) → Create repo named `helix-crm`
2. Upload the extracted files from the tar.gz archive
3. Go to [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
4. Select your **LIMEN Helix** team
5. Click **Deploy** — done

### Option 2: If you have Git
```bash
tar -xzf helix-crm.tar.gz
cd helix-crm
npm install
git init && git add . && git commit -m "HELIX CRM"
# Push to GitHub, Vercel auto-deploys
```

## What This Does

- **Contacts**: Upload CSV (name, email, phone), add manually, filter by status
- **Campaigns**: Create email templates with {{name}} personalization, one-click send
- **Inbox**: AI classifies replies (hot-lead, question, opt-out), drafts contextual responses
- **Settings**: Gmail OAuth2 connect, Anthropic API key, CAN-SPAM compliance config

## Compliance Built In

- **CAN-SPAM** (15 U.S.C. §7704): Auto-appended unsubscribe footer, physical address, immediate opt-out processing
- **TCPA** (47 U.S.C. §227): Consent logging per contact with timestamps
- Opted-out contacts auto-excluded from all campaigns

## Production Environment Variables

Add these in Vercel → Project Settings → Environment Variables:

| Variable | Where to get it |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs → Credentials → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Same page |
| `GOOGLE_REDIRECT_URI` | `https://your-domain.vercel.app/api/gmail/callback` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |

## Architecture

- **Next.js 14** (App Router) on Vercel
- **Gmail API** (googleapis) for send/receive/auto-reply
- **Claude API** (Anthropic) for reply classification + drafting
- **In-memory store** (demo) → upgrade to Supabase for production
- **Tailwind CSS v3** custom design system

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/contacts` | GET/POST/DELETE | Contact CRUD + CSV bulk import |
| `/api/campaigns` | GET/POST | Campaign create + send |
| `/api/gmail` | GET/POST | Gmail OAuth connect/disconnect |
| `/api/gmail/callback` | GET | OAuth2 callback handler |
| `/api/gmail/inbox` | GET/POST | Thread list + status updates |
| `/api/ai-reply` | POST | Classify emails, draft replies, approve+send |
| `/api/settings` | GET/POST | App configuration |
