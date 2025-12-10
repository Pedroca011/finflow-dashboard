-- Add balance column to profiles table with default 10000 BRL
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS balance NUMERIC NOT NULL DEFAULT 10000.00;