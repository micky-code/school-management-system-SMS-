const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const studentRoutes = require('./src/routes/student.routes');
const teacherRoutes = require('./src/routes/teacher.routes');
const parentRoutes = require('./src/routes/parent.routes');
const departmentRoutes = require('./src/routes/department.routes');
const majorRoutes = require('./src/routes/major.routes');
const subjectRoutes = require('./src/routes/subject.routes');
const academicYearRoutes = require('./src/routes/academic_year.routes');
const mainProgramRoutes = require('./src/routes/main_program.routes');
const manageSubjectRoutes = require('./src/routes/manage_subject.routes');

// Initialize express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/main-programs', mainProgramRoutes);
app.use('/api/manage-subjects', manageSubjectRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Student Management System API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
