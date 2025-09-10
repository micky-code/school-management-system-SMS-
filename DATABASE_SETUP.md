# SMS Database Integration Setup

This guide explains how to fetch data from your `smsspi_db` database in XAMPP using the created PHP backend API.

## Prerequisites

1. **XAMPP** must be running with Apache and MySQL services
2. **smsspi_db** database must exist in your MySQL server
3. React frontend should be running on `http://localhost:3000`

## Backend API Structure

The backend API is located in the `backend/` directory:

```
backend/
├── config/
│   └── database.php     # Database connection configuration
├── api/
│   └── index.php        # Main API endpoints
└── test_connection.php  # Database connection test
```

## Available API Endpoints

### Base URL: `http://localhost/sms-frontend-clone/backend/api/`

1. **GET /tables** - Get all tables in the database
2. **GET /data?table=TABLE_NAME&limit=100** - Get data from a specific table
3. **GET /students** - Get all students (if students table exists)
4. **GET /courses** - Get all courses (if courses table exists)
5. **GET /enrollments** - Get all enrollments (if enrollments table exists)

## Frontend Usage

### Import the database service:
```javascript
import { databaseService } from '../services/api';
```

### Example usage:
```javascript
// Get all tables
const tables = await databaseService.getTables();

// Get data from a specific table
const studentData = await databaseService.getTableData('students', 50);

// Get students using dedicated endpoint
const students = await databaseService.getStudents();
```

## Testing the Setup

1. **Test Database Connection:**
   - Open: `http://localhost/sms-frontend-clone/backend/test_connection.php`
   - This will show if the connection works and list available tables

2. **Test API Endpoints:**
   - `http://localhost/sms-frontend-clone/backend/api/tables`
   - `http://localhost/sms-frontend-clone/backend/api/data?table=YOUR_TABLE_NAME`

3. **Use the Database Viewer Component:**
   - Import and use the `DatabaseViewer` component in your React app
   - It provides a UI to browse all tables and data

## Database Configuration

The database connection settings are in `backend/config/database.php`:

```php
private $host = "localhost";
private $db_name = "smsspi_db";
private $username = "root";
private $password = "";
```

Update these settings if your XAMPP MySQL configuration is different.

## CORS Configuration

The API includes CORS headers to allow requests from `http://localhost:3000`. If your React app runs on a different port, update the CORS settings in `database.php`.

## Error Handling

All API responses include:
- `success`: boolean indicating if the request was successful
- `data`: the requested data (on success)
- `message`: error message (on failure)
- `count`: number of records returned (for data endpoints)

## Security Notes

- The current setup uses basic SQL injection protection
- For production use, implement proper authentication and authorization
- Consider using environment variables for database credentials
