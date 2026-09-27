---
name: oauth-providers
description: "Turn on Google or Facebook login for T-Drop customers: the Google Cloud Console and Meta for Developers steps, the exact redirect URIs, the four env vars, and the Facebook App Review requirement before real customers can log in."
---

# Turning on a Google/Facebook provider

Architecture and the never-wire-to-/admin rule stay in `CLAUDE.md`; this is the console setup only.

To turn a provider on:
- **Google**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → OAuth consent screen (External, fill in app name + support email) → Credentials → Create Credentials → OAuth client ID → Application type "Web application" → Authorized redirect URIs: add `<NEXT_PUBLIC_SERVER_URL>/your-profile/oauth/google/callback` (locally `http://localhost:3000/your-profile/oauth/google/callback`). Copy the Client ID and Client Secret into `.env.local` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- **Facebook**: [Meta for Developers](https://developers.facebook.com/apps/) → Create App (type "Consumer") → add the "Facebook Login" product → Facebook Login → Settings → Valid OAuth Redirect URIs: add `<NEXT_PUBLIC_SERVER_URL>/your-profile/oauth/facebook/callback`. App Settings → Basic: copy the App ID and App Secret into `.env.local` as `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`. A new Facebook app starts in Development mode, where only the app's own registered testers/admins can log in — real customers need the app switched to Live (Settings → Basic → toggle at the top), which requires the `email` permission to pass App Review first.
- Production needs its own redirect URI added in both consoles once the real domain is live (Vercel env vars, not `.env.local`).
