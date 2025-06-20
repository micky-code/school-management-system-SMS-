-- Student Management System Database Schema

-- Disable foreign key checks to avoid conflicts during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Create tables
CREATE TABLE `tbl_student`(
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
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE
    `tbl_student` ADD UNIQUE `tbl_student_student_id_unique`(`student_id`);

CREATE TABLE `tbl_user`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    `status` ENUM('1', '0') NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE
    `tbl_user` ADD UNIQUE `tbl_user_email_unique`(`email`);

CREATE TABLE `tbl_teacher_staff`(
    `Id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `eng_name` VARCHAR(255) NOT NULL,
    `khmer_name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) NULL,
    `phone` INT NOT NULL,
    `positions` ENUM('teacher', 'staff') NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_role`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `role` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL
);

CREATE TABLE `tbl_department`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `department_name` VARCHAR(255) NOT NULL,
    `teacher_id` INT UNSIGNED NOT NULL COMMENT 'dean id'
);

CREATE TABLE `tbl_course`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(255) NOT NULL,
    `course_name` VARCHAR(255) NOT NULL,
    `program_id` INT UNSIGNED NOT NULL,
    `credit` BIGINT NOT NULL
);
ALTER TABLE
    `tbl_course` ADD UNIQUE `tbl_course_course_code_unique`(`course_code`);
ALTER TABLE
    `tbl_course` ADD UNIQUE `tbl_course_course_name_unique`(`course_name`);

CREATE TABLE `tbl_course_enrollment`(
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

CREATE TABLE `tbl_batch`(
    `Id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `batch_code` VARCHAR(255) NOT NULL,
    `program_id` INT UNSIGNED NOT NULL,
    `academic_year` INT NOT NULL,
    `admission_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE
    `tbl_batch` ADD UNIQUE `tbl_batch_batch_code_unique`(`batch_code`);

CREATE TABLE `tbl_admission`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `admission_year` VARCHAR(255) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL
);

CREATE TABLE `tbl_parent`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `mother_name` VARCHAR(255) NOT NULL,
    `father_name` VARCHAR(255) NOT NULL,
    `mother_occupation` VARCHAR(255) NULL,
    `father_occupation` VARCHAR(255) NULL,
    `mother_phone` INT NOT NULL,
    `father_phone` INT NOT NULL,
    `mother_status` ENUM('alive', 'deceased') NOT NULL DEFAULT 'alive',
    `father_status` ENUM('alive', 'deceased') NOT NULL DEFAULT 'alive',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `provinces`(
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(50) NOT NULL,
    `country_id` VARCHAR(50) NOT NULL,
    `region_type_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NULL
);

CREATE TABLE `districts`(
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NULL,
    `province_id` VARCHAR(50) NOT NULL
);

CREATE TABLE `communes`(
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NULL,
    `district_id` VARCHAR(100) NOT NULL
);

CREATE TABLE `villages`(
    `no` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NULL,
    `commune_id` VARCHAR(100) NOT NULL
);

CREATE TABLE `tbl_attendance`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT UNSIGNED NOT NULL,
    `course_enroll_id` INT UNSIGNED NOT NULL,
    `status_type` INT UNSIGNED NOT NULL,
    `remake` VARCHAR(255) NULL,
    `attendance_date` DATE NOT NULL,
    `marked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_grade`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `course_enroll_id` INT UNSIGNED NOT NULL,
    `student_id` INT UNSIGNED NOT NULL,
    `course_id` INT UNSIGNED NOT NULL,
    `grade_type_id` INT UNSIGNED NOT NULL,
    `score` INT NOT NULL,
    `remark` VARCHAR(255) NULL,
    `grade_by` INT UNSIGNED NOT NULL,
    `grade_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_program`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `program_name` VARCHAR(255) NOT NULL,
    `department_id` INT UNSIGNED NOT NULL,
    `degree_id` INT UNSIGNED NOT NULL
);
ALTER TABLE
    `tbl_program` ADD UNIQUE `tbl_program_program_name_unique`(`program_name`);

CREATE TABLE `tbl_degree_level`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `degree` VARCHAR(255) NOT NULL
);

CREATE TABLE `tbl_grade_type`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `grade_type` VARCHAR(255) NOT NULL,
    `max_score` INT NOT NULL
);

CREATE TABLE `tbl_marital_status`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `marital` VARCHAR(255) NOT NULL
);

CREATE TABLE `tbl_student_status`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `std_status` VARCHAR(255) NOT NULL,
    `desciption` VARCHAR(255) NOT NULL
);

CREATE TABLE `tbl_department_changes`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT UNSIGNED NOT NULL,
    `from_batch_id` INT UNSIGNED NOT NULL,
    `to_batch_id` INT UNSIGNED NOT NULL,
    `chang_by` INT UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_attendance_status_type`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `typs` VARCHAR(255) NOT NULL
);

CREATE TABLE `tbl_course_enroll_status`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `status_type` VARCHAR(255) NOT NULL
);

-- Add foreign key constraints
ALTER TABLE
    `tbl_grade` ADD CONSTRAINT `tbl_grade_course_id_foreign` FOREIGN KEY(`course_id`) REFERENCES `tbl_course`(`id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_province_no_foreign` FOREIGN KEY(`province_no`) REFERENCES `provinces`(`no`);
ALTER TABLE
    `tbl_grade` ADD CONSTRAINT `tbl_grade_grade_type_id_foreign` FOREIGN KEY(`grade_type_id`) REFERENCES `tbl_grade_type`(`id`);
ALTER TABLE
    `tbl_course` ADD CONSTRAINT `tbl_course_program_id_foreign` FOREIGN KEY(`program_id`) REFERENCES `tbl_program`(`id`);
ALTER TABLE
    `tbl_grade` ADD CONSTRAINT `tbl_grade_course_enroll_id_foreign` FOREIGN KEY(`course_enroll_id`) REFERENCES `tbl_course_enrollment`(`id`);
ALTER TABLE
    `tbl_department_changes` ADD CONSTRAINT `tbl_department_changes_from_batch_id_foreign` FOREIGN KEY(`from_batch_id`) REFERENCES `tbl_batch`(`Id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_district_no_foreign` FOREIGN KEY(`district_no`) REFERENCES `districts`(`no`);
ALTER TABLE
    `tbl_batch` ADD CONSTRAINT `tbl_batch_program_id_foreign` FOREIGN KEY(`program_id`) REFERENCES `tbl_program`(`id`);
ALTER TABLE
    `tbl_department_changes` ADD CONSTRAINT `tbl_department_changes_to_batch_id_foreign` FOREIGN KEY(`to_batch_id`) REFERENCES `tbl_batch`(`Id`);
ALTER TABLE
    `tbl_course_enrollment` ADD CONSTRAINT `tbl_course_enrollment_course_id_foreign` FOREIGN KEY(`course_id`) REFERENCES `tbl_course`(`id`);
ALTER TABLE
    `tbl_attendance` ADD CONSTRAINT `tbl_attendance_course_enroll_id_foreign` FOREIGN KEY(`course_enroll_id`) REFERENCES `tbl_course_enrollment`(`id`);
ALTER TABLE
    `tbl_department` ADD CONSTRAINT `tbl_department_teacher_id_foreign` FOREIGN KEY(`teacher_id`) REFERENCES `tbl_teacher_staff`(`Id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_commune_no_foreign` FOREIGN KEY(`commune_no`) REFERENCES `communes`(`no`);
ALTER TABLE
    `tbl_course_enrollment` ADD CONSTRAINT `tbl_course_enrollment_program_id_foreign` FOREIGN KEY(`program_id`) REFERENCES `tbl_program`(`id`);
ALTER TABLE
    `tbl_batch` ADD CONSTRAINT `tbl_batch_admission_id_foreign` FOREIGN KEY(`admission_id`) REFERENCES `tbl_admission`(`id`);
ALTER TABLE
    `tbl_attendance` ADD CONSTRAINT `tbl_attendance_student_id_foreign` FOREIGN KEY(`student_id`) REFERENCES `tbl_student`(`id`);
ALTER TABLE
    `tbl_program` ADD CONSTRAINT `tbl_program_department_id_foreign` FOREIGN KEY(`department_id`) REFERENCES `tbl_department`(`id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_village_no_foreign` FOREIGN KEY(`village_no`) REFERENCES `villages`(`no`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_batch_id_foreign` FOREIGN KEY(`batch_id`) REFERENCES `tbl_batch`(`Id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_parent_id_foreign` FOREIGN KEY(`parent_id`) REFERENCES `tbl_parent`(`id`);
ALTER TABLE
    `tbl_teacher_staff` ADD CONSTRAINT `tbl_teacher_staff_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `tbl_user`(`id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `tbl_user`(`id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_marital_status_id_foreign` FOREIGN KEY(`marital_status_id`) REFERENCES `tbl_marital_status`(`id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_program_id_foreign` FOREIGN KEY(`program_id`) REFERENCES `tbl_program`(`id`);
ALTER TABLE
    `tbl_department_changes` ADD CONSTRAINT `tbl_department_changes_student_id_foreign` FOREIGN KEY(`student_id`) REFERENCES `tbl_student`(`id`);
ALTER TABLE
    `tbl_department_changes` ADD CONSTRAINT `tbl_department_changes_chang_by_foreign` FOREIGN KEY(`chang_by`) REFERENCES `tbl_teacher_staff`(`Id`);
ALTER TABLE
    `tbl_course_enrollment` ADD CONSTRAINT `tbl_course_enrollment_batch_id_foreign` FOREIGN KEY(`batch_id`) REFERENCES `tbl_batch`(`Id`);
ALTER TABLE
    `tbl_grade` ADD CONSTRAINT `tbl_grade_student_id_foreign` FOREIGN KEY(`student_id`) REFERENCES `tbl_student`(`id`);
ALTER TABLE
    `tbl_course_enrollment` ADD CONSTRAINT `tbl_course_enrollment_teacher_id_foreign` FOREIGN KEY(`teacher_id`) REFERENCES `tbl_teacher_staff`(`Id`);
ALTER TABLE
    `tbl_attendance` ADD CONSTRAINT `tbl_attendance_status_type_foreign` FOREIGN KEY(`status_type`) REFERENCES `tbl_attendance_status_type`(`id`);
ALTER TABLE
    `tbl_course_enrollment` ADD CONSTRAINT `tbl_course_enrollment_status_foreign` FOREIGN KEY(`status`) REFERENCES `tbl_course_enroll_status`(`id`);
ALTER TABLE
    `tbl_program` ADD CONSTRAINT `tbl_program_degree_id_foreign` FOREIGN KEY(`degree_id`) REFERENCES `tbl_degree_level`(`id`);
ALTER TABLE
    `tbl_user` ADD CONSTRAINT `tbl_user_role_id_foreign` FOREIGN KEY(`role_id`) REFERENCES `tbl_role`(`id`);
ALTER TABLE
    `tbl_grade` ADD CONSTRAINT `tbl_grade_grade_by_foreign` FOREIGN KEY(`grade_by`) REFERENCES `tbl_teacher_staff`(`Id`);
ALTER TABLE
    `tbl_student` ADD CONSTRAINT `tbl_student_std_status_id_foreign` FOREIGN KEY(`std_status_id`) REFERENCES `tbl_student_status`(`id`);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
