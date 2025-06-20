const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const errorHandler = require('./middleware/error');

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Prevent http param pollution
app.use(hpp());

// Compress response bodies
app.use(compression());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/students', require('./routes/student.route'));
app.use('/api/programs', require('./routes/program.route'));
app.use('/api/batches', require('./routes/batch.route'));
app.use('/api/stats', require('./routes/stats.route'));
app.use('/api/departments', require('./routes/department.route'));
app.use('/api/main-programs', require('./routes/mainProgram.route'));
app.use('/api/majors', require('./routes/major.route'));
app.use('/api/parents', require('./routes/parent.route'));
app.use('/api/teachers', require('./routes/teacher.route'));

// Error handler
app.use(errorHandler);

module.exports = app;
