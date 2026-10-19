-- Correct the flying-fox growth reference curves in the live database.
--
-- The 20260408 seed migration loaded the upstream Grey-headed (birth 25-27 g)
-- and Little Red (birth 18 g) curves. prisma/growth-reference-seed-data.ts was
-- corrected to DEECA's published tables in 2026-08 (with regression tests),
-- but that file only feeds fresh seeds, so the live rows were never updated.
-- On the old curve an 85 g newborn grey-headed pup reads as about three weeks
-- old. This replaces both species' rows with the DEECA values.
--
-- Source: Victorian Wildlife Rehabilitation Guidelines Part B Ch.4,
-- Tables 4.7 (Grey-headed) and 4.8 (Little Red), DEECA 2023.

DELETE FROM species_growth_references
WHERE species_name IN ('Grey-headed Flying Fox', 'Little Red Flying-fox');

INSERT INTO species_growth_references (
  id, species_name, sex, age_days, weight_grams,
  head_length_mm, ear_length_mm, arm_length_mm, leg_length_mm,
  foot_length_mm, tail_length_mm, body_length_mm, wing_length_mm,
  reference
) VALUES
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 0, 85, NULL, NULL, 57, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 7, 99, NULL, NULL, 69, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 14, 117, NULL, NULL, 79, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 21, 133, NULL, NULL, 87, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 28, 150, NULL, NULL, 93, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 35, 167, NULL, NULL, 99, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 42, 184, NULL, NULL, 104, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 49, 201, NULL, NULL, 109, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 56, 217, NULL, NULL, 114, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 63, 235, NULL, NULL, 118, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 70, 252, NULL, NULL, 122, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 77, 269, NULL, NULL, 125, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 84, 286, NULL, NULL, 129, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 91, 302, NULL, NULL, 132, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 98, 319, NULL, NULL, 136, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 105, 336, NULL, NULL, 139, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Female', 112, 353, NULL, NULL, 143, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 0, 85, NULL, NULL, 57, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 7, 99, NULL, NULL, 69, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 14, 117, NULL, NULL, 79, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 21, 133, NULL, NULL, 87, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 28, 150, NULL, NULL, 93, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 35, 167, NULL, NULL, 99, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 42, 184, NULL, NULL, 104, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 49, 201, NULL, NULL, 109, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 56, 217, NULL, NULL, 114, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 63, 235, NULL, NULL, 118, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 70, 252, NULL, NULL, 122, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 77, 269, NULL, NULL, 125, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 84, 286, NULL, NULL, 129, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 91, 302, NULL, NULL, 132, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 98, 319, NULL, NULL, 136, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 105, 336, NULL, NULL, 139, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Grey-headed Flying Fox', 'Male', 112, 353, NULL, NULL, 143, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.7 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 0, 41, NULL, NULL, 45, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 7, 49, NULL, NULL, 50, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 14, 59, NULL, NULL, 55, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 21, 68, NULL, NULL, 61, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 28, 79, NULL, NULL, 66, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 35, 89, NULL, NULL, 71, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 42, 100, NULL, NULL, 75, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 49, 111, NULL, NULL, 80, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 56, 122, NULL, NULL, 83, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 63, 133, NULL, NULL, 87, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 70, 145, NULL, NULL, 90, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 77, 157, NULL, NULL, 93, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 84, 169, NULL, NULL, 96, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 91, 182, NULL, NULL, 98, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 98, 195, NULL, NULL, 100, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 105, 208, NULL, NULL, 101, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Female', 112, 221, NULL, NULL, 103, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 0, 41, NULL, NULL, 45, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 7, 49, NULL, NULL, 50, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 14, 59, NULL, NULL, 55, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 21, 68, NULL, NULL, 61, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 28, 79, NULL, NULL, 66, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 35, 89, NULL, NULL, 71, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 42, 100, NULL, NULL, 75, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 49, 111, NULL, NULL, 80, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 56, 122, NULL, NULL, 83, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 63, 133, NULL, NULL, 87, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 70, 145, NULL, NULL, 90, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 77, 157, NULL, NULL, 93, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 84, 169, NULL, NULL, 96, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 91, 182, NULL, NULL, 98, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 98, 195, NULL, NULL, 100, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 105, 208, NULL, NULL, 101, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)'),
  (gen_random_uuid(), 'Little Red Flying-fox', 'Male', 112, 221, NULL, NULL, 103, NULL, NULL, NULL, NULL, NULL, 'DEECA Victorian Wildlife Rehabilitation Guidelines Part B Ch.4 Table 4.8 (2023)');
