/**
 * Centralized service exports for SMS Frontend
 * This file provides easy access to all enhanced services using smsdb data
 */

// Import the new enhanced services
import EnhancedServices from './enhanced-services';
import SMSDBDataFetcher from './smsdb-data-fetcher';

// Import original services for backward compatibility
import DepartmentService from './department.service';
import ProgramService from './program.service';
import MajorService from './major.service';
import StudentService from './student.service';
import TeacherService from './teacher.service';
import CourseService from './course.service';
import BatchService from './batch.service';
import AcademicYearService from './academicYear.service';
import DegreeLevelService from './degreeLevel.service';
import DashboardService from './dashboard.service';

// Configuration flag to switch between enhanced and original services
const USE_ENHANCED_SERVICES = true;

// Export enhanced services by default, with fallback to original
export const departmentService = USE_ENHANCED_SERVICES ? EnhancedServices.Department : DepartmentService;
export const programService = USE_ENHANCED_SERVICES ? EnhancedServices.Program : ProgramService;
export const majorService = USE_ENHANCED_SERVICES ? EnhancedServices.Major : MajorService;
export const studentService = USE_ENHANCED_SERVICES ? EnhancedServices.Student : StudentService;
export const teacherService = USE_ENHANCED_SERVICES ? EnhancedServices.Teacher : TeacherService;
export const courseService = USE_ENHANCED_SERVICES ? EnhancedServices.Course : CourseService;
export const batchService = USE_ENHANCED_SERVICES ? EnhancedServices.Batch : BatchService;
export const academicYearService = USE_ENHANCED_SERVICES ? EnhancedServices.AcademicYear : AcademicYearService;
export const degreeLevelService = USE_ENHANCED_SERVICES ? EnhancedServices.DegreeLevel : DegreeLevelService;
export const dashboardService = USE_ENHANCED_SERVICES ? EnhancedServices.Dashboard : DashboardService;

// New enhanced services not available in original
export const gradeService = EnhancedServices.Grade;
export const attendanceService = EnhancedServices.Attendance;
export const scholarshipService = EnhancedServices.Scholarship;
export const feePaymentService = EnhancedServices.FeePayment;
export const subjectAssignmentService = EnhancedServices.SubjectAssignment;

// Direct access to data fetcher
export const dataFetcher = SMSDBDataFetcher;

// Utility function to check backend status
export const checkBackendStatus = () => SMSDBDataFetcher.checkBackendStatus();

// Default export for convenience
export default {
  // Core services
  department: departmentService,
  program: programService,
  major: majorService,
  student: studentService,
  teacher: teacherService,
  course: courseService,
  batch: batchService,
  academicYear: academicYearService,
  degreeLevel: degreeLevelService,
  dashboard: dashboardService,
  
  // Additional services
  grade: gradeService,
  attendance: attendanceService,
  scholarship: scholarshipService,
  feePayment: feePaymentService,
  subjectAssignment: subjectAssignmentService,
  
  // Utilities
  dataFetcher,
  checkBackendStatus
};
