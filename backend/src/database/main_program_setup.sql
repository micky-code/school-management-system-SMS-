-- Create tbl_main_program table if it doesn't exist
CREATE TABLE IF NOT EXISTS `tbl_main_program` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add main_program_id column to tbl_program if it doesn't exist
ALTER TABLE `tbl_program` 
ADD COLUMN IF NOT EXISTS `main_program_id` INT NULL AFTER `id`,
ADD CONSTRAINT `fk_program_main_program` 
  FOREIGN KEY (`main_program_id`) 
  REFERENCES `tbl_main_program` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Insert sample data into tbl_main_program if it's empty
INSERT INTO `tbl_main_program` (`name`, `description`) 
SELECT 'Bachelor Degree', 'Four-year undergraduate degree programs'
WHERE NOT EXISTS (SELECT 1 FROM `tbl_main_program` WHERE `name` = 'Bachelor Degree');

INSERT INTO `tbl_main_program` (`name`, `description`) 
SELECT 'Associate Degree', 'Two-year undergraduate degree programs'
WHERE NOT EXISTS (SELECT 1 FROM `tbl_main_program` WHERE `name` = 'Associate Degree');

-- Update existing programs with main_program_id
-- Bachelor Degree programs (IDs 101-105)
UPDATE `tbl_program` SET `main_program_id` = 1 
WHERE `id` IN (101, 102, 103, 104, 105) AND `main_program_id` IS NULL;

-- Associate Degree programs (IDs 201-205)
UPDATE `tbl_program` SET `main_program_id` = 2 
WHERE `id` IN (201, 202, 203, 204, 205) AND `main_program_id` IS NULL;
