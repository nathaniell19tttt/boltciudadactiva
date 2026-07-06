declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;

      // OAuth 2.0 - Google
      EXPO_PUBLIC_GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;

      // OAuth 2.0 - LinkedIn
      EXPO_PUBLIC_LINKEDIN_CLIENT_ID: string;
      LINKEDIN_CLIENT_SECRET: string;

      // OAuth Redirect URI
      EXPO_PUBLIC_OAUTH_REDIRECT_URI: string;

      // Email Service (Resend)
      EMAIL_API_KEY: string;
      EMAIL_DOMAIN: string;
      EMAIL_SENDER: string;
      EMAIL_SENDER_NAME: string;
    }
  }
}

export {};
