-- Template purchases table for Notion template delivery system.
--
-- Each row represents one purchase. access_token is the buyer's unique
-- download key — used in /download/templates/[access_token].
-- notion_share_url is the Notion duplication URL, set via admin after
-- creating the share link in Notion.
--
-- Run: psql $DATABASE_URL < migrations/add-template-purchases.sql

CREATE TABLE IF NOT EXISTS template_purchases (
  id                      SERIAL PRIMARY KEY,
  access_token            TEXT        NOT NULL UNIQUE,
  template_id             TEXT        NOT NULL,
  customer_email          TEXT        NOT NULL,
  stripe_session_id       TEXT        NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  notion_share_url        TEXT,                          -- set by admin after Notion share link created
  access_count            INTEGER     NOT NULL DEFAULT 0,
  first_accessed_at       TIMESTAMPTZ,
  last_accessed_at        TIMESTAMPTZ,
  revoked                 BOOLEAN     NOT NULL DEFAULT FALSE,
  revoked_at              TIMESTAMPTZ,
  revoked_reason          TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_purchases_access_token  ON template_purchases (access_token);
CREATE INDEX IF NOT EXISTS idx_template_purchases_customer_email ON template_purchases (customer_email);
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id    ON template_purchases (template_id);

-- Access log — one row per click of the download link.
-- Used for suspicious access detection (multiple IPs = possible sharing).

CREATE TABLE IF NOT EXISTS template_access_logs (
  id           SERIAL PRIMARY KEY,
  purchase_id  INTEGER     NOT NULL REFERENCES template_purchases (id) ON DELETE CASCADE,
  ip           TEXT,
  user_agent   TEXT,
  accessed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_access_logs_purchase_id ON template_access_logs (purchase_id);
