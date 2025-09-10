
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SPILogo from '../../assets/images/SPI-logo-landscape.png';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px'
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(2),
  borderRadius: '50%',
  color: 'white'
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.2),
  fontWeight: 'bold'
}));

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth(); // Get login function and current user from AuthContext
  
  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      console.log('Login component: User already logged in', currentUser);
      // Get role from user data, default to admin if missing
      // Valid roles are: admin, teacher, student, parent
      const role = currentUser.role?.toLowerCase() || 'admin';
      
      // Redirect to appropriate dashboard based on role
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'parent') {
        navigate('/parent/dashboard', { replace: true });
      } else {
        // Fallback to admin dashboard if role is not recognized
        console.log('Unknown role:', role, 'defaulting to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { username });
      
      // Use the login function from AuthContext
      await login(username, password);
      
      // Login is successful - the useEffect hook will handle the redirect
      // based on the currentUser that will be set by the login function
      console.log('Login successful, waiting for redirect');
      
      // No need to navigate here - the useEffect will do it
      // This prevents race conditions and redirect loops
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 0 }}>
          <img 
            src={SPILogo} 
            alt="SPI Logo" 
            style={{ width: 250, height: 'auto', marginBottom: '16px' }}
          />
        </Box>
        <IconWrapper>
          <LockOutlinedIcon />
        </IconWrapper>
        
        <Typography component="h1" variant="h5">
          Student Management System
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Sign in to your account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText="Use your name as username"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </SubmitButton>
        </Form>
      </StyledPaper>
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Student Management System
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;