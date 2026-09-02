-- ABLV / rabies protection fields on the carer record.
--
-- All columns are nullable and additive, so this is safe against a populated
-- database: existing carers simply have no ABLV data recorded, which the
-- application treats as "not covered for bat work" rather than assuming
-- protection.
ALTER TABLE "carers" ADD COLUMN "ablv_vaccination_date" TIMESTAMP(3);
ALTER TABLE "carers" ADD COLUMN "ablv_titre_date" TIMESTAMP(3);
ALTER TABLE "carers" ADD COLUMN "ablv_titre_value" DOUBLE PRECISION;
ALTER TABLE "carers" ADD COLUMN "ablv_titre_unit" TEXT DEFAULT 'IU/mL';
