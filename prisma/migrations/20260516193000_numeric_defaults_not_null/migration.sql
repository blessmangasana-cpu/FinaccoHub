-- Backfill old rows before enforcing NOT NULL numeric columns.
UPDATE "rse_equities"
SET
  "opening_price" = COALESCE("opening_price", 0),
  "closing_price" = COALESCE("closing_price", 0),
  "volume" = COALESCE("volume", 0),
  "value" = COALESCE("value", 0);

ALTER TABLE "rse_equities"
  ALTER COLUMN "opening_price" SET DEFAULT 0,
  ALTER COLUMN "opening_price" SET NOT NULL,
  ALTER COLUMN "closing_price" SET DEFAULT 0,
  ALTER COLUMN "closing_price" SET NOT NULL,
  ALTER COLUMN "volume" SET DEFAULT 0,
  ALTER COLUMN "volume" SET NOT NULL,
  ALTER COLUMN "value" SET DEFAULT 0,
  ALTER COLUMN "value" SET NOT NULL;
