-- SQL script to insert default roles and admin user for login system

-- Insert default roles if they don't exist
INSERT INTO tbl_role (role, description) 
VALUES 
('admin', 'Administrator with full access to the system'),
('teacher', 'Teacher with access to courses, grades, and attendance'),
('student', 'Student with limited access to view their own data')
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO tbl_user (name, email, password, role_id, status) 
VALUES 
('Admin User', 'admin@sms.com', '$2a$10$8OlpdzgYVZFEAPPYH8hQcOPFUlQlEdINc2w8/qm1.iCTTDLhUZYyS', 
 (SELECT id FROM tbl_role WHERE role = 'admin' LIMIT 1), 
 '1')
ON DUPLICATE KEY UPDATE email = VALUES(email);
