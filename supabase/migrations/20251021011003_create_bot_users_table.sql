/*
  # Create Onix AI Bot Database Schema

  1. New Tables
    - `bot_users`
      - `id` (bigint, primary key) - Telegram user ID
      - `username` (text) - Telegram username
      - `first_name` (text) - User's first name
      - `started_at` (timestamptz) - When user started the bot
      - `last_active` (timestamptz) - Last time user interacted with bot
      - `last_reminder_sent` (timestamptz) - Last time reminder was sent
      - `created_at` (timestamptz) - Record creation time
      
  2. Security
    - Enable RLS on `bot_users` table
    - Add policies for service role access
*/

CREATE TABLE IF NOT EXISTS bot_users (
  id bigint PRIMARY KEY,
  username text,
  first_name text,
  started_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  last_reminder_sent timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage bot users"
  ON bot_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);