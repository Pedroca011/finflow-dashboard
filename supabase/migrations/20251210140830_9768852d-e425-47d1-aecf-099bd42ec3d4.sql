-- Create unique index on user_id for subscriptions upsert
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_key ON public.subscriptions (user_id);