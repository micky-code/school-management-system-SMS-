-- Student Management System Database Schema - Part 1: Main Tables

-- Disable foreign key checks to avoid conflicts during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Create tables for users, roles, and authentication
CREATE TABLE IF NOT EXISTS `tbl_role` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `role` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `tbl_user` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    `status` ENUM('1', '0') NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL
);
ALTER TABLE `tbl_user` ADD UNIQUE `tbl_user_email_unique`(`email`);

-- Create tables for location data
CREATE TABLE IF NOT EXISTS `provinces` (
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(50) NOT NULL,
    `country_id` VARCHAR(50) NOT NULL,
    `region_type_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS `districts` (
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NULL,
    `province_id` VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS `communes` (
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NULL,
    `district_id` VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS `villages` (
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NULL,
    `commune_id` VARCHAR(100) NOT NULL
);

-- Create tables for parent information
CREATE TABLE IF NOT EXISTS `tbl_parent` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `mother_name` VARCHAR(255) NOT NULL,
    `father_name` VARCHAR(255) NOT NULL,
    `mother_occupation` VARCHAR(255) NULL,
    `father_occupation` VARCHAR(255) NULL,
    `mother_phone` INT NOT NULL,
    `father_phone` INT NOT NULL,
    `mother_status` ENUM('alive', 'deceased') NOT NULL DEFAULT 'alive',
    `father_status` ENUM('alive', 'deceased') NOT NULL DEFAULT 'alive',
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL
);

-- Create tables for teacher/staff information
CREATE TABLE IF NOT EXISTS `tbl_teacher_staff` (
    `Id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `eng_name` VARCHAR(255) NOT NULL,
    `khmer_name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NULL,
    `phone` INT NOT NULL,
    `positions` ENUM('teacher', 'staff') NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL
);

-- Create tables for department and program structure
CREATE TABLE IF NOT EXISTS `tbl_department` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `department_name` VARCHAR(255) NOT NULL,
    `teacher_id` INT UNSIGNED NOT NULL COMMENT 'dean id'
);

CREATE TABLE IF NOT EXISTS `tbl_degree_level` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `degree` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `tbl_program` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `program_name` VARCHAR(255) NOT NULL,
    `department_id` INT UNSIGNED NOT NULL,
    `degree_id` INT UNSIGNED NOT NULL
);
ALTER TABLE `tbl_program` ADD UNIQUE `tbl_program_program_name_unique`(`program_name`);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
