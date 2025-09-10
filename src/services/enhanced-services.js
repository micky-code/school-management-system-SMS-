/**
 * Enhanced services for all frontend pages using smsdb data
 * This file updates all existing services to use the new data fetcher
 */

import SMSDBDataFetcher from './smsdb-data-fetcher';

// Enhanced Department Service
export const EnhancedDepartmentService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getDepartments(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getDepartments(1, 1000);
    const department = result.rows?.find(d => d.id === parseInt(id));
    return department ? { success: true, data: department } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/departments', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/departments', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/departments', id)
};

// Enhanced Program Service
export const EnhancedProgramService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getPrograms(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getPrograms(1, 1000);
    const program = result.rows?.find(p => p.id === parseInt(id));
    return program ? { success: true, data: program } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/programs', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/programs', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/programs', id)
};

// Enhanced Major Service
export const EnhancedMajorService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getMajors(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getMajors(1, 1000);
    const major = result.rows?.find(m => m.id === parseInt(id));
    return major ? { success: true, data: major } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/majors', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/majors', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/majors', id)
};

// Enhanced Student Service
export const EnhancedStudentService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getStudents(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getStudents(1, 1000);
    const student = result.rows?.find(s => s.id === parseInt(id));
    return student ? { success: true, data: student } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/students', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/students', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/students', id),
  getGrades: (studentId) => SMSDBDataFetcher.getGrades(studentId),
  getAttendance: (studentId) => SMSDBDataFetcher.getAttendance(studentId),
  getFeePayments: (studentId) => SMSDBDataFetcher.getFeePayments(studentId)
};

// Enhanced Teacher Service
export const EnhancedTeacherService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getTeachers(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getTeachers(1, 1000);
    const teacher = result.rows?.find(t => t.id === parseInt(id));
    return teacher ? { success: true, data: teacher } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/teachers', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/teachers', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/teachers', id),
  getSubjects: (teacherId) => SMSDBDataFetcher.getSubjectAssignments(1, 100, `teacher_id:${teacherId}`)
};

// Enhanced Course Service
export const EnhancedCourseService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getCourses(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getCourses(1, 1000);
    const course = result.rows?.find(c => c.id === parseInt(id));
    return course ? { success: true, data: course } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/courses', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/courses', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/courses', id)
};

// Enhanced Batch Service
export const EnhancedBatchService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getBatches(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getBatches(1, 1000);
    const batch = result.rows?.find(b => b.id === parseInt(id));
    return batch ? { success: true, data: batch } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/batches', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/batches', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/batches', id)
};

// Enhanced Academic Year Service
export const EnhancedAcademicYearService = {
  getAll: (page = 1, limit = 10) => SMSDBDataFetcher.getAcademicYears(page, limit),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getAcademicYears(1, 1000);
    const academicYear = result.rows?.find(ay => ay.id === parseInt(id));
    return academicYear ? { success: true, data: academicYear } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/academic-years', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/academic-years', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/academic-years', id)
};

// Enhanced Degree Level Service
export const EnhancedDegreeLevelService = {
  getAll: () => SMSDBDataFetcher.getDegreeLevels(),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getDegreeLevels();
    const degreeLevel = result.rows?.find(dl => dl.id === parseInt(id));
    return degreeLevel ? { success: true, data: degreeLevel } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/degree-levels', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/degree-levels', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/degree-levels', id)
};

// Enhanced Subject Assignment Service
export const EnhancedSubjectAssignmentService = {
  getAll: (page = 1, limit = 10, search = '') => SMSDBDataFetcher.getSubjectAssignments(page, limit, search),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getSubjectAssignments(1, 1000);
    const assignment = result.rows?.find(sa => sa.id === parseInt(id));
    return assignment ? { success: true, data: assignment } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/subject-assignments', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/subject-assignments', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/subject-assignments', id)
};

// Enhanced Grade Service
export const EnhancedGradeService = {
  getAll: (page = 1, limit = 10, studentId = null, courseId = null) => 
    SMSDBDataFetcher.getGrades(studentId, courseId, page, limit),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getGrades(null, null, 1, 1000);
    const grade = result.rows?.find(g => g.id === parseInt(id));
    return grade ? { success: true, data: grade } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/grades', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/grades', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/grades', id)
};

// Enhanced Attendance Service
export const EnhancedAttendanceService = {
  getAll: (page = 1, limit = 10, studentId = null, courseId = null, date = null) => 
    SMSDBDataFetcher.getAttendance(studentId, courseId, date, page, limit),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getAttendance(null, null, null, 1, 1000);
    const attendance = result.rows?.find(a => a.id === parseInt(id));
    return attendance ? { success: true, data: attendance } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/attendance', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/attendance', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/attendance', id)
};

// Enhanced Scholarship Service
export const EnhancedScholarshipService = {
  getAll: (page = 1, limit = 10) => SMSDBDataFetcher.getScholarships(page, limit),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getScholarships(1, 1000);
    const scholarship = result.rows?.find(s => s.id === parseInt(id));
    return scholarship ? { success: true, data: scholarship } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/scholarships', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/scholarships', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/scholarships', id)
};

// Enhanced Fee Payment Service
export const EnhancedFeePaymentService = {
  getAll: (page = 1, limit = 10, studentId = null) => SMSDBDataFetcher.getFeePayments(studentId, page, limit),
  getById: async (id) => {
    const result = await SMSDBDataFetcher.getFeePayments(null, 1, 1000);
    const payment = result.rows?.find(fp => fp.id === parseInt(id));
    return payment ? { success: true, data: payment } : { success: false, error: 'Not found' };
  },
  create: (data) => SMSDBDataFetcher.createRecord('/fee-payments', data),
  update: (id, data) => SMSDBDataFetcher.updateRecord('/fee-payments', id, data),
  delete: (id) => SMSDBDataFetcher.deleteRecord('/fee-payments', id)
};

// Enhanced Dashboard Service
export const EnhancedDashboardService = {
  getStats: () => SMSDBDataFetcher.getDashboardStats(),
  getRecentActivities: async () => {
    // Compile recent activities from various sources
    try {
      const [students, teachers, courses] = await Promise.all([
        SMSDBDataFetcher.getStudents(1, 5),
        SMSDBDataFetcher.getTeachers(1, 5),
        SMSDBDataFetcher.getCourses(1, 5)
      ]);

      const activities = [
        ...students.rows.slice(0, 3).map(s => ({
          id: `student-${s.id}`,
          title: `New Student Enrolled`,
          description: `${s.name} ${s.surname} (${s.student_code})`,
          time: s.enrollment_date || new Date().toISOString(),
          type: 'enrollment'
        })),
        ...teachers.rows.slice(0, 2).map(t => ({
          id: `teacher-${t.id}`,
          title: `Teacher Active`,
          description: `${t.first_name} ${t.last_name} (${t.teacher_code})`,
          time: t.hire_date || new Date().toISOString(),
          type: 'staff'
        }))
      ];

      return { success: true, rows: activities, count: activities.length };
    } catch (error) {
      return {
        success: false,
        rows: [{
          id: 'system-1',
          title: 'System Status',
          description: 'SMS system is running with smsdb data',
          time: new Date().toISOString(),
          type: 'system'
        }],
        count: 1
      };
    }
  }
};

// Export all enhanced services
export default {
  Department: EnhancedDepartmentService,
  Program: EnhancedProgramService,
  Major: EnhancedMajorService,
  Student: EnhancedStudentService,
  Teacher: EnhancedTeacherService,
  Course: EnhancedCourseService,
  Batch: EnhancedBatchService,
  AcademicYear: EnhancedAcademicYearService,
  DegreeLevel: EnhancedDegreeLevelService,
  SubjectAssignment: EnhancedSubjectAssignmentService,
  Grade: EnhancedGradeService,
  Attendance: EnhancedAttendanceService,
  Scholarship: EnhancedScholarshipService,
  FeePayment: EnhancedFeePaymentService,
  Dashboard: EnhancedDashboardService
};
