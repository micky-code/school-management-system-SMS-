# SMS Frontend Clone

A complete clone of the Student Management System (SMS) frontend application built with React.js.

## Project Overview

This is a standalone React application that provides a comprehensive interface for managing academic institutions including students, teachers, departments, courses, and administrative functions.

## Features

### Multi-Role Dashboard System
- **Admin Dashboard**: Complete system management
- **Teacher Dashboard**: Course and student management
- **Student Dashboard**: Academic progress tracking
- **Parent Dashboard**: Child progress monitoring

### Core Modules
- **Academic Management**: Academic years, programs, departments, majors
- **User Management**: Students, teachers, parents, staff
- **Course Management**: Subjects, enrollments, assignments
- **Attendance System**: Real-time attendance tracking
- **Grade Management**: Marks, exams, assessments
- **Financial Management**: Fee payments, scholarships

### Technical Features
- Role-based authentication and authorization
- Real-time WebSocket integration
- Responsive design with Bootstrap and Tailwind CSS
- API service layer with fallback mechanisms
- Form validation with Yup
- Toast notifications
- Pagination and search functionality

## Technology Stack

- **Frontend Framework**: React 18.2.0
- **Routing**: React Router DOM 7.6.2
- **Styling**: Bootstrap 5.3.8 + Tailwind CSS 3.3.3
- **HTTP Client**: Axios 1.10.0
- **Form Handling**: Formik 2.4.6
- **Validation**: Yup 1.6.1
- **Icons**: React Icons 5.5.0 + Heroicons 2.2.0
- **Notifications**: React Toastify 11.0.5
- **Build Tool**: React Scripts 5.0.1 with react-app-rewired

## Installation

1. **Navigate to project directory**
   ```bash
   cd c:\xampp\htdocs\sms-frontend-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
ESLINT_NO_DEV_ERRORS=true
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
REACT_APP_DISABLE_ESLINT_PLUGIN=true
REACT_APP_API_URL=http://localhost:5000
```

### API Configuration
Update `src/config.js` to match your backend API:

```javascript
export const API_URL = 'http://localhost:5000/api';
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   ├── teacher/        # Teacher dashboard pages
│   ├── student/        # Student dashboard pages
│   ├── parent/         # Parent dashboard pages
│   └── auth/           # Authentication pages
├── services/           # API service layer
├── context/            # React context providers
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── config.js           # Application configuration
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Authentication

The application uses JWT-based authentication with role-based access control:

- **Admin**: Full system access
- **Teacher**: Course and student management
- **Student**: Academic progress access
- **Parent**: Child progress monitoring

## API Integration

The frontend integrates with a Node.js/Express backend API with the following endpoints:

- Authentication: `/api/auth/*`
- Academic Years: `/api/academic-years`
- Departments: `/api/departments`
- Programs: `/api/programs`
- Majors: `/api/majors`
- Subjects: `/api/subjects`
- Teachers: `/api/teachers`
- Students: `/api/students`
- Enrollments: `/api/enrollments`

## Development

### Adding New Pages
1. Create component in appropriate `pages/` subdirectory
2. Add route in `App.js`
3. Update navigation in sidebar component

### Adding New Services
1. Create service file in `services/` directory
2. Follow existing API service patterns
3. Include error handling and fallback mechanisms

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the SMS (Student Management System) and is intended for educational and institutional use.

## Support

For technical support or questions about this frontend application, please refer to the main SMS system documentation.
