CREATE TABLE IF NOT EXISTS rse_equities (
  id bigserial PRIMARY KEY,
  trade_date date NOT NULL,
  security text NOT NULL,
  opening_price numeric,
  closing_price numeric,
  volume bigint,
  value numeric,
  inserted_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (trade_date, security)
);

CREATE INDEX IF NOT EXISTS idx_rse_equities_trade_date ON rse_equities (trade_date);
