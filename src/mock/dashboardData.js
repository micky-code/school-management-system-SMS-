/**
 * Mock Dashboard Data
 * Provides mock data for dashboard components when real data is unavailable
 */

// Mock data for admin dashboard
export const mockAdminDashboardStats = {
  totalStudents: 1250,
  activeStudents: 1180,
  totalTeachers: 75,
  totalPrograms: 12,
  recentEnrollments: 45,
  currentAcademicYear: '2024-2025',
  studentsByProgram: [
    { programName: 'Bachelor of Information Technology', count: 320 },
    { programName: 'Bachelor of Business Administration', count: 280 },
    { programName: 'Associate Degree in Software Development', count: 150 },
    { programName: 'Bachelor of English Literature', count: 120 },
    { programName: 'Associate Degree in System Administration', count: 110 },
    { programName: 'Bachelor of Tourism Management', count: 95 },
    { programName: 'Bachelor of Agronomy', count: 85 },
    { programName: 'Associate Degree in Food Processing', count: 60 },
    { programName: 'Bachelor of Social Work', count: 30 }
  ],
  recentActivity: [
    { type: 'enrollment', description: 'New student enrolled in Bachelor of IT', timestamp: '2024-06-30 14:25:00' },
    { type: 'attendance', description: 'Attendance recorded for Web Development class', timestamp: '2024-06-30 10:15:00' },
    { type: 'grade', description: 'Grades submitted for Database Systems', timestamp: '2024-06-29 16:30:00' },
    { type: 'payment', description: 'Tuition payment received from Dara Sok', timestamp: '2024-06-29 11:45:00' },
    { type: 'course', description: 'New course added: Advanced Machine Learning', timestamp: '2024-06-28 09:20:00' }
  ],
  attendanceStats: {
    present: 85,
    absent: 8,
    late: 5,
    excused: 2
  },
  courseStats: {
    active: 48,
    completed: 12,
    upcoming: 15
  }
};

// Mock data for student dashboard
export const mockStudentDashboardStats = {
  studentInfo: {
    name: 'Dara Sok',
    id: 'S2023001',
    program: 'Bachelor of Information Technology',
    batch: '2023-2027',
    gpa: 3.75
  },
  attendance: {
    present: 92,
    absent: 3,
    late: 4,
    excused: 1
  },
  courses: [
    { code: 'CS101', name: 'Introduction to Programming', grade: 'A', credits: 3 },
    { code: 'CS102', name: 'Data Structures', grade: 'A-', credits: 3 },
    { code: 'CS201', name: 'Database Systems', grade: 'B+', credits: 3 },
    { code: 'CS202', name: 'Web Development', grade: 'A', credits: 3 },
    { code: 'MATH101', name: 'Calculus I', grade: 'B', credits: 3 }
  ],
  upcomingAssignments: [
    { course: 'CS202', title: 'Final Project', dueDate: '2024-07-15' },
    { course: 'CS201', title: 'Database Design', dueDate: '2024-07-10' }
  ],
  recentActivity: [
    { type: 'grade', description: 'New grade posted for Web Development', timestamp: '2024-06-29 16:30:00' },
    { type: 'attendance', description: 'Marked present in Database Systems', timestamp: '2024-06-29 10:15:00' },
    { type: 'assignment', description: 'Submitted Web Development assignment', timestamp: '2024-06-28 23:45:00' }
  ]
};

// Mock data for teacher dashboard
export const mockTeacherDashboardStats = {
  teacherInfo: {
    name: 'Sopheap Keo',
    id: 'T2020005',
    department: 'Information Technology',
    courses: 4
  },
  courseLoad: {
    currentCourses: 4,
    totalStudents: 120,
    averageClassSize: 30
  },
  courses: [
    { code: 'CS101', name: 'Introduction to Programming', students: 35, schedule: 'Mon/Wed 9:00-10:30' },
    { code: 'CS202', name: 'Web Development', students: 28, schedule: 'Tue/Thu 13:00-14:30' },
    { code: 'CS301', name: 'Software Engineering', students: 22, schedule: 'Mon/Wed 13:00-14:30' },
    { code: 'CS401', name: 'Advanced Programming', students: 15, schedule: 'Fri 9:00-12:00' }
  ],
  upcomingClasses: [
    { course: 'CS101', time: '2024-07-01 09:00', room: 'B201' },
    { course: 'CS301', time: '2024-07-01 13:00', room: 'B205' },
    { course: 'CS202', time: '2024-07-02 13:00', room: 'B203' }
  ],
  recentActivity: [
    { type: 'grade', description: 'Submitted grades for Web Development', timestamp: '2024-06-29 16:30:00' },
    { type: 'attendance', description: 'Recorded attendance for Software Engineering', timestamp: '2024-06-29 13:15:00' },
    { type: 'assignment', description: 'Posted new assignment for Intro to Programming', timestamp: '2024-06-28 10:45:00' }
  ]
};

// Mock data for parent dashboard
export const mockParentDashboardStats = {
  parentInfo: {
    name: 'Chanthy Meas',
    id: 'P2023010',
    children: 2
  },
  children: [
    {
      name: 'Dara Sok',
      id: 'S2023001',
      program: 'Bachelor of Information Technology',
      batch: '2023-2027',
      gpa: 3.75,
      attendance: {
        present: 92,
        absent: 3,
        late: 4,
        excused: 1
      }
    },
    {
      name: 'Bopha Sok',
      id: 'S2024015',
      program: 'Associate Degree in Business Administration',
      batch: '2024-2026',
      gpa: 3.5,
      attendance: {
        present: 88,
        absent: 5,
        late: 6,
        excused: 1
      }
    }
  ],
  upcomingEvents: [
    { title: 'Parent-Teacher Meeting', date: '2024-07-15', time: '18:00-20:00', location: 'Main Hall' },
    { title: 'End of Semester Ceremony', date: '2024-07-30', time: '10:00-12:00', location: 'Auditorium' }
  ],
  recentActivity: [
    { type: 'grade', description: 'Dara received new grades for Web Development', timestamp: '2024-06-29 16:30:00' },
    { type: 'attendance', description: 'Bopha was marked late in Marketing class', timestamp: '2024-06-29 09:15:00' },
    { type: 'payment', description: 'Tuition payment confirmed for Dara', timestamp: '2024-06-28 14:45:00' }
  ],
  financialSummary: {
    currentBalance: 250,
    nextPaymentDue: '2024-07-15',
    paymentAmount: 500
  }
};
