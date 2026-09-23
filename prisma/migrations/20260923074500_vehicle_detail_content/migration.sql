-- Extend vehicle editorial and technical content for the detailed product page.
ALTER TABLE "Vehicle"
ADD COLUMN "specifications" JSONB,
ADD COLUMN "overviewTitle" TEXT,
ADD COLUMN "overviewQuote" TEXT,
ADD COLUMN "brochureUrl" TEXT;
