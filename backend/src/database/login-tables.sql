-- SQL schema for login-related tables

-- Role table
CREATE TABLE IF NOT EXISTS tbl_role (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User table
CREATE TABLE IF NOT EXISTS tbl_user (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  status ENUM('1', '0') DEFAULT '1' COMMENT '1=active, 0=inactive',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES tbl_role(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default roles
INSERT INTO tbl_role (name, description, permissions) VALUES
('admin', 'Administrator with full access', '{"all": true}'),
('teacher', 'Teacher with limited access', '{"students": {"view": true}, "subjects": {"view": true}, "attendance": {"view": true, "create": true, "update": true}}'),
('student', 'Student with minimal access', '{"profile": {"view": true}, "attendance": {"view": true}, "grades": {"view": true}}');

-- Insert default admin user (password: admin123)
INSERT INTO tbl_user (username, name, email, password, role_id) VALUES
('admin', 'Admin User', 'admin@sms.com', '$2a$10$8OlpdzgYVZFEAPPYH8hQcOPFUlQlEdINc2w8/qm1.iCTTDLhUZYyS', 1);
