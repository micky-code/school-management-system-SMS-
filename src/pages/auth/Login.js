import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FullPageLoader from '../../components/common/FullPageLoader';
import DatabaseErrorHandler from '../../components/DatabaseErrorHandler';
import SPILogo from '../../assets/images/SPI-logo-landscape.png';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('general');
  
  // Check if user is already logged in
  React.useEffect(() => {
    if (currentUser) {
      // Get the redirect URL if it exists
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      
      if (redirectUrl) {
        console.log('User already logged in, redirecting to saved URL:', redirectUrl);
        sessionStorage.removeItem('redirectUrl'); // Clear it after use
        navigate(redirectUrl, { replace: true });
      } else {
        // User is already logged in, redirect to appropriate dashboard
        // Make sure we use a valid role (admin, teacher, student, parent)
        const validRoles = ['admin', 'teacher', 'student', 'parent'];
        let role = currentUser.role?.toLowerCase() || '';
        
        // If role is not valid, default to admin
        if (!validRoles.includes(role)) {
          console.log(`Invalid role detected: ${role}, defaulting to admin`);
          role = 'admin';
        }
        
        const dashboardPath = `/${role}/dashboard`;
        console.log('User already logged in, redirecting to', dashboardPath);
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [currentUser, navigate]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError('');
      setErrorType('general');
      
      // Clear any existing auth data before login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Attempt login
      const user = await login(values.username, values.password);
      
      // Get the redirect URL if it exists
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      console.log('Redirect URL after login:', redirectUrl);
      
      // Short delay to ensure localStorage is updated before navigation
      setTimeout(() => {
        // Get role and convert to lowercase for consistency
        const role = (user.role || '').toLowerCase();
        console.log('User authenticated with role:', role);
        
        // Navigate based on saved redirect URL or role
        if (redirectUrl) {
          console.log('Redirecting to previously attempted URL:', redirectUrl);
          sessionStorage.removeItem('redirectUrl'); // Clear it after use
          navigate(redirectUrl, { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'teacher') {
          navigate('/teacher/dashboard', { replace: true });
        } else if (role === 'student') {
          navigate('/student/dashboard', { replace: true });
        } else if (role === 'parent') {
          navigate('/parent/dashboard', { replace: true });
        } else {
          // Default to admin dashboard if role is not recognized
          console.log('Unrecognized role, defaulting to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        }
      }, 100); // Small delay to ensure localStorage is updated
    } catch (error) {
      console.error('Login error:', error);
      
      // Detect specific error types
      if (error.message?.includes('Too many connections') || 
          error.response?.data?.message?.includes('Too many connections')) {
        setErrorType('tooManyConnections');
      } else if (error.message?.includes('expired') || 
                error.response?.status === 401) {
        setErrorType('authError');
      } else {
        setErrorType('general');
      }
      
      setError(error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  const handleRetry = () => {
    // Clear errors and allow user to try again
    setError('');
    setErrorType('general');
  };

  return (
    <>
      {loading && <FullPageLoader />}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center">
          <img 
            src={SPILogo} 
            alt="SPI Logo" 
            className="h-24 w-auto mb-4"
          />
        </div>
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Student Management System
          </p>
        </div>
        
        {error && (
          <DatabaseErrorHandler
            error={error}
            errorType={errorType}
            onRetry={handleRetry}
          />
        )}
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Username (your name)"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        </div>
      </div>
    </>
  );
};

export default Login;
