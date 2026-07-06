# boltciudadactiva

A React Native / Expo job-marketplace app with company and worker sides, backed by Supabase. Originally developed in Bolt.

## Stack

- **Framework**: React Native + Expo (expo-router for file-based navigation)
- **Backend**: Supabase (auth, database, edge functions)
- **Language**: TypeScript

## Project Structure

```
app/          # Expo Router screens (file-based routing)
  (worker)/   # Worker-side tab screens
  (company)/  # Company-side tab screens
  auth/       # OAuth callback
assets/       # Images, fonts
components/   # Shared UI components
contexts/     # React contexts (Auth, Theme, Demo)
hooks/        # Custom hooks
lib/          # Supabase client, OAuth helpers, stores
constants/    # Colors, spacing, typography
```

## Running the App

```bash
npx expo start --port 8080
```

The workflow **"Start application"** runs this automatically. Expo serves:
- **Mobile**: scan the QR code in the console with Expo Go
- **Web preview**: available on port 8080 in the Replit preview pane

## Required Secrets

| Secret | Where to find it |
|--------|-----------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |

## User Preferences

- Keep the project as React Native / Expo — do not convert to a plain web app.
- Do not modify UI, routing, authentication, navigation, or database structure unless required to make the project run.
- Preserve the existing project structure exactly as imported.
