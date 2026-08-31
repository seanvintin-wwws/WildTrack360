-- Add VIC (DEECA) Wildlife Shelter Record Sheet case-sheet fields.
--
-- These support Condition 23 of the Wildlife Rehabilitator Authorisation Guide,
-- which requires shelters to record species, found date/location, condition,
-- cause, and fate for every animal, retain those records for 3 years, and
-- produce them to a Conservation Regulator Authorised Officer without delay.
--
-- All columns are nullable so existing records in other jurisdictions are
-- unaffected and no backfill is required.

ALTER TABLE "animals" ADD COLUMN "vic_age_code" TEXT;
ALTER TABLE "animals" ADD COLUMN "vic_injury_code" TEXT;
ALTER TABLE "animals" ADD COLUMN "vic_cause_code" TEXT;
ALTER TABLE "animals" ADD COLUMN "vic_fate_code" TEXT;
ALTER TABLE "animals" ADD COLUMN "vic_found_ref" TEXT;
