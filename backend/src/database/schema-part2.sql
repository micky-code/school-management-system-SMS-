-- Student Management System Database Schema - Part 2: Academic and Course Tables

-- Disable foreign key checks to avoid conflicts during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Create tables for admission and batch management
CREATE TABLE IF NOT EXISTS `tbl_admission` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `admission_year` VARCHAR(255) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `tbl_batch` (
    `Id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `batch_code` VARCHAR(255) NOT NULL,
    `program_id` INT UNSIGNED NOT NULL,
    `academic_year` INT NOT NULL,
    `admission_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL
);
ALTER TABLE `tbl_batch` ADD UNIQUE `tbl_batch_batch_code_unique`(`batch_code`);

-- Create tables for course management
CREATE TABLE IF NOT EXISTS `tbl_course` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(255) NOT NULL,
    `course_name` VARCHAR(255) NOT NULL,
    `program_id` INT UNSIGNED NOT NULL,
    `credit` BIGINT NOT NULL
);
ALTER TABLE `tbl_course` ADD UNIQUE `tbl_course_course_code_unique`(`course_code`);
ALTER TABLE `tbl_course` ADD UNIQUE `tbl_course_course_name_unique`(`course_name`);

CREATE TABLE IF NOT EXISTS `tbl_course_enroll_status` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `status_type` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `tbl_course_enrollment` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `program_id` INT UNSIGNED NOT NULL,
    `course_id` INT UNSIGNED NOT NULL,
    `teacher_id` INT UNSIGNED NOT NULL,
    `batch_id` INT UNSIGNED NOT NULL,
    `semester` INT NOT NULL,
    `status` INT UNSIGNED NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL
);

-- Create tables for student status and marital status
CREATE TABLE IF NOT EXISTS `tbl_marital_status` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `marital` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `tbl_student_status` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `std_status` VARCHAR(255) NOT NULL,
    `desciption` VARCHAR(255) NOT NULL
);

-- Create table for student information
CREATE TABLE IF NOT EXISTS `tbl_student` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `student_id` VARCHAR(255) NOT NULL,
    `std_eng_name` VARCHAR(255) NOT NULL,
    `std_khmer_name` VARCHAR(255) NOT NULL,
    `program_id` INT UNSIGNED NOT NULL,
    `batch_id` INT UNSIGNED NOT NULL,
    `dob` DATE NOT NULL,
    `from_high_school` VARCHAR(255) NOT NULL,
    `race` VARCHAR(255) NOT NULL,
    `nationaly` VARCHAR(255) NOT NULL,
    `marital_status_id` INT UNSIGNED NOT NULL,
    `phone` INT NOT NULL,
    `parent_id` INT UNSIGNED NOT NULL,
    `province_no` INT UNSIGNED NOT NULL,
    `district_no` INT UNSIGNED NOT NULL,
    `commune_no` INT UNSIGNED NOT NULL,
    `village_no` INT UNSIGNED NOT NULL,
    `image` VARCHAR(255) NULL,
    `std_status_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL
);
ALTER TABLE `tbl_student` ADD UNIQUE `tbl_student_student_id_unique`(`student_id`);

-- Create table for department changes
CREATE TABLE IF NOT EXISTS `tbl_department_changes` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT UNSIGNED NOT NULL,
    `from_batch_id` INT UNSIGNED NOT NULL,
    `to_batch_id` INT UNSIGNED NOT NULL,
    `chang_by` INT UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `changed_at` TIMESTAMP NOT NULL
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
