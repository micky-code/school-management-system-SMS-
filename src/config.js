/**
 * Application Configuration
 * Contains global configuration settings for the application
 */

// API URL configuration
export const API_URL = 'http://localhost:5000/api';

// Real-time API configuration removed

// Application settings
export const APP_CONFIG = {
  appName: 'Student Management System',
  version: '1.0.0',
  defaultPageSize: 10,
  maxPageSize: 100,
  dashboardRefreshInterval: 60000, // 1 minute
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'km'],
  defaultCurrency: 'USD',
  defaultTimezone: 'Asia/Phnom_Penh'
};

// Authentication settings
export const AUTH_CONFIG = {
  tokenKey: 'token',
  userKey: 'user',
  roleKey: 'role',
  tokenExpiry: 86400000, // 24 hours
  refreshThreshold: 3600000 // 1 hour
};

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

// Status options
export const STATUS_OPTIONS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Attendance status options
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

// Default export for backward compatibility
export default {
  API_URL,
  APP_CONFIG,
  AUTH_CONFIG,
  ROLES,
  STATUS_OPTIONS,
  ATTENDANCE_STATUS
};
