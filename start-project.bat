@echo off
echo Starting SMS Frontend Clone Project...
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting development server...
echo The application will open at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
