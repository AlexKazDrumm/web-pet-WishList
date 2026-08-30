-- Up Migration
-- Accounts plus user-owned lists and items, layered on top of the catalog
-- schema without touching it.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  section     text NOT NULL DEFAULT 'other'
              CHECK (section IN ('wishlist', 'boardgames', 'books', 'other')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lists_user_id_idx ON lists (user_id);

CREATE TABLE IF NOT EXISTS list_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id        uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title          text NOT NULL,
  notes          text,
  cover_image    text,
  link           text,
  price_amount   numeric(12, 2),
  price_currency text,
  is_done        boolean NOT NULL DEFAULT false,
  position       integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS list_items_list_id_idx ON list_items (list_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens (user_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lists_set_updated_at ON lists;
CREATE TRIGGER lists_set_updated_at BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS list_items_set_updated_at ON list_items;
CREATE TRIGGER list_items_set_updated_at BEFORE UPDATE ON list_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS list_items_set_updated_at ON list_items;
DROP TRIGGER IF EXISTS lists_set_updated_at ON lists;
DROP TABLE IF EXISTS refresh_tokens, list_items, lists, users CASCADE;
DROP FUNCTION IF EXISTS set_updated_at();
