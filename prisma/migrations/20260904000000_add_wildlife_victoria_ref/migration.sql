-- Wildlife Victoria case reference on the animal record.
-- Nullable and additive: existing animals simply have no reference recorded.
ALTER TABLE "animals" ADD COLUMN "wildlife_victoria_ref" TEXT;
