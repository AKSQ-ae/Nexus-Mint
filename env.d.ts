declare namespace NodeJS {
  interface ProcessEnv {
    DB_HOST: string;
    DB_PORT?: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASS: string;
    DB_SSL?: 'true' | 'false';
    REDIS_URL?: string;
    JWT_SECRET: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  }
}