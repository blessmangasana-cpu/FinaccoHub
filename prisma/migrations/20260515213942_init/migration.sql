-- CreateTable
CREATE TABLE "rse_equities" (
    "id" BIGSERIAL NOT NULL,
    "trade_date" DATE NOT NULL,
    "security" TEXT NOT NULL,
    "opening_price" DECIMAL(18,8),
    "closing_price" DECIMAL(18,8),
    "volume" BIGINT,
    "value" DECIMAL(18,8),
    "inserted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rse_equities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_rse_equities_trade_date" ON "rse_equities"("trade_date");

-- CreateIndex
CREATE UNIQUE INDEX "rse_equities_trade_date_security_key" ON "rse_equities"("trade_date", "security");
