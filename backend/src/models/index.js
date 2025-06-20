const { sequelize } = require('../config/db.config');
const User = require('./user.model');
const Role = require('./role.model');
const RolePermission = require('./role_permission.model');
const Student = require('./student.model');
const Teacher = require('./teacher.model');
const Parent = require('./parent.model');
const Department = require('./department.model');
const Major = require('./major.model');
const Subject = require('./subject.model');
const ManageSubject = require('./manage_subject.model');
const AcademicYear = require('./academic_year.model');
const MainProgram = require('./main_program.model');
const StudentSchedule = require('./student_schedule.model');
const StudentAttendance = require('./student_attendance.model');
const Exam = require('./exam.model');
const Mark = require('./mark.model');
const Fee = require('./fee.model');
const Payment = require('./payment.model');
const Scholarship = require('./scholarship.model');
const StudentScholarship = require('./student_scholarship.model');
const StudentPromotion = require('./student_promotion.model');
const Setting = require('./setting.model');

// Define relationships

// Role and User
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Role and RolePermission
Role.hasMany(RolePermission, { foreignKey: 'role_id' });
RolePermission.belongsTo(Role, { foreignKey: 'role_id' });

// Department and Teacher (Dean)
Teacher.hasOne(Department, { foreignKey: 'dean_id' });
Department.belongsTo(Teacher, { foreignKey: 'dean_id' });

// Department and Major
Department.hasMany(Major, { foreignKey: 'department_id' });
Major.belongsTo(Department, { foreignKey: 'department_id' });

// Teacher and Major (Coordinator)
Teacher.hasMany(Major, { foreignKey: 'coordinator_id' });
Major.belongsTo(Teacher, { foreignKey: 'coordinator_id' });

// Department and Teacher
Department.hasMany(Teacher, { foreignKey: 'department_id' });
Teacher.belongsTo(Department, { foreignKey: 'department_id' });

// MainProgram and Student
MainProgram.hasMany(Student, { foreignKey: 'main_program_id' });
Student.belongsTo(MainProgram, { foreignKey: 'main_program_id' });

// Major and Student
Major.hasMany(Student, { foreignKey: 'major_id' });
Student.belongsTo(Major, { foreignKey: 'major_id' });

// Parent and Student
Parent.hasMany(Student, { foreignKey: 'parent_id' });
Student.belongsTo(Parent, { foreignKey: 'parent_id' });

// Subject and ManageSubject
Subject.hasMany(ManageSubject, { foreignKey: 'subject_id' });
ManageSubject.belongsTo(Subject, { foreignKey: 'subject_id' });

// Major and ManageSubject
Major.hasMany(ManageSubject, { foreignKey: 'major_id' });
ManageSubject.belongsTo(Major, { foreignKey: 'major_id' });

// Teacher and ManageSubject
Teacher.hasMany(ManageSubject, { foreignKey: 'teacher_id' });
ManageSubject.belongsTo(Teacher, { foreignKey: 'teacher_id' });

// AcademicYear and ManageSubject
AcademicYear.hasMany(ManageSubject, { foreignKey: 'academic_year_id' });
ManageSubject.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

// ManageSubject and StudentSchedule
ManageSubject.hasMany(StudentSchedule, { foreignKey: 'manage_subject_id' });
StudentSchedule.belongsTo(ManageSubject, { foreignKey: 'manage_subject_id' });

// AcademicYear and StudentSchedule
AcademicYear.hasMany(StudentSchedule, { foreignKey: 'academic_year_id' });
StudentSchedule.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

// Student and StudentAttendance
Student.hasMany(StudentAttendance, { foreignKey: 'student_id' });
StudentAttendance.belongsTo(Student, { foreignKey: 'student_id' });

// ManageSubject and StudentAttendance
ManageSubject.hasMany(StudentAttendance, { foreignKey: 'manage_subject_id' });
StudentAttendance.belongsTo(ManageSubject, { foreignKey: 'manage_subject_id' });

// StudentSchedule and StudentAttendance
StudentSchedule.hasMany(StudentAttendance, { foreignKey: 'schedule_id' });
StudentAttendance.belongsTo(StudentSchedule, { foreignKey: 'schedule_id' });

// User and StudentAttendance (marked_by)
User.hasMany(StudentAttendance, { foreignKey: 'marked_by' });
StudentAttendance.belongsTo(User, { foreignKey: 'marked_by' });

// Department and Exam
Department.hasMany(Exam, { foreignKey: 'department_id' });
Exam.belongsTo(Department, { foreignKey: 'department_id' });

// Major and Exam
Major.hasMany(Exam, { foreignKey: 'major_id' });
Exam.belongsTo(Major, { foreignKey: 'major_id' });

// ManageSubject and Exam
ManageSubject.hasMany(Exam, { foreignKey: 'manage_subject_id' });
Exam.belongsTo(ManageSubject, { foreignKey: 'manage_subject_id' });

// AcademicYear and Exam
AcademicYear.hasMany(Exam, { foreignKey: 'academic_year_id' });
Exam.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

// User and Exam (created_by)
User.hasMany(Exam, { foreignKey: 'created_by' });
Exam.belongsTo(User, { foreignKey: 'created_by' });

// Student and Mark
Student.hasMany(Mark, { foreignKey: 'student_id' });
Mark.belongsTo(Student, { foreignKey: 'student_id' });

// Exam and Mark
Exam.hasMany(Mark, { foreignKey: 'exam_id' });
Mark.belongsTo(Exam, { foreignKey: 'exam_id' });

// Subject and Mark
Subject.hasMany(Mark, { foreignKey: 'subject_id' });
Mark.belongsTo(Subject, { foreignKey: 'subject_id' });

// User and Mark (marked_by)
User.hasMany(Mark, { foreignKey: 'marked_by' });
Mark.belongsTo(User, { foreignKey: 'marked_by' });

// AcademicYear and Fee
AcademicYear.hasMany(Fee, { foreignKey: 'academic_year_id' });
Fee.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

// MainProgram and Fee
MainProgram.hasMany(Fee, { foreignKey: 'main_program_id' });
Fee.belongsTo(MainProgram, { foreignKey: 'main_program_id' });

// Major and Fee
Major.hasMany(Fee, { foreignKey: 'major_id' });
Fee.belongsTo(Major, { foreignKey: 'major_id' });

// Student and Payment
Student.hasMany(Payment, { foreignKey: 'student_id' });
Payment.belongsTo(Student, { foreignKey: 'student_id' });

// Fee and Payment
Fee.hasMany(Payment, { foreignKey: 'fee_id' });
Payment.belongsTo(Fee, { foreignKey: 'fee_id' });

// User and Payment (collected_by)
User.hasMany(Payment, { foreignKey: 'collected_by' });
Payment.belongsTo(User, { foreignKey: 'collected_by' });

// AcademicYear and Scholarship
AcademicYear.hasMany(Scholarship, { foreignKey: 'academic_year_id' });
Scholarship.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

// Student and StudentScholarship
Student.hasMany(StudentScholarship, { foreignKey: 'student_id' });
StudentScholarship.belongsTo(Student, { foreignKey: 'student_id' });

// Scholarship and StudentScholarship
Scholarship.hasMany(StudentScholarship, { foreignKey: 'scholarship_id' });
StudentScholarship.belongsTo(Scholarship, { foreignKey: 'scholarship_id' });

// AcademicYear and StudentScholarship
AcademicYear.hasMany(StudentScholarship, { foreignKey: 'academic_year_id' });
StudentScholarship.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

// User and StudentScholarship (approved_by)
User.hasMany(StudentScholarship, { foreignKey: 'approved_by' });
StudentScholarship.belongsTo(User, { foreignKey: 'approved_by' });

// Student and StudentPromotion
Student.hasMany(StudentPromotion, { foreignKey: 'student_id' });
StudentPromotion.belongsTo(Student, { foreignKey: 'student_id' });

// AcademicYear and StudentPromotion (from)
AcademicYear.hasMany(StudentPromotion, { foreignKey: 'from_academic_year_id', as: 'FromPromotions' });
StudentPromotion.belongsTo(AcademicYear, { foreignKey: 'from_academic_year_id', as: 'FromAcademicYear' });

// AcademicYear and StudentPromotion (to)
AcademicYear.hasMany(StudentPromotion, { foreignKey: 'to_academic_year_id', as: 'ToPromotions' });
StudentPromotion.belongsTo(AcademicYear, { foreignKey: 'to_academic_year_id', as: 'ToAcademicYear' });

// Major and StudentPromotion (from)
Major.hasMany(StudentPromotion, { foreignKey: 'from_major_id', as: 'FromPromotions' });
StudentPromotion.belongsTo(Major, { foreignKey: 'from_major_id', as: 'FromMajor' });

// Major and StudentPromotion (to)
Major.hasMany(StudentPromotion, { foreignKey: 'to_major_id', as: 'ToPromotions' });
StudentPromotion.belongsTo(Major, { foreignKey: 'to_major_id', as: 'ToMajor' });

// User and StudentPromotion (promoted_by)
User.hasMany(StudentPromotion, { foreignKey: 'promoted_by' });
StudentPromotion.belongsTo(User, { foreignKey: 'promoted_by' });

const db = {
  sequelize,
  User,
  Role,
  RolePermission,
  Student,
  Teacher,
  Parent,
  Department,
  Major,
  Subject,
  ManageSubject,
  AcademicYear,
  MainProgram,
  StudentSchedule,
  StudentAttendance,
  Exam,
  Mark,
  Fee,
  Payment,
  Scholarship,
  StudentScholarship,
  StudentPromotion,
  Setting
};

module.exports = db;
