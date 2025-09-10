import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:5000/api';

// Mock user profile data for development/testing
const mockProfiles = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'admin@school.edu',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    phone: '+855 12 345 678',
    address: 'Phnom Penh, Cambodia',
    dateJoined: '2023-01-15',
    lastLogin: '2025-06-20',
    department: 'Administration',
    status: 'active',
    bio: 'System administrator responsible for managing the Student Management System.'
  },
  teacher: {
    id: 2,
    username: 'jsmith',
    email: 'john.smith@school.edu',
    firstName: 'John',
    lastName: 'Smith',
    role: 'teacher',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '+855 12 456 789',
    address: 'Phnom Penh, Cambodia',
    dateJoined: '2023-02-10',
    lastLogin: '2025-06-19',
    department: 'Mathematics',
    position: 'Senior Lecturer',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
    education: 'PhD in Mathematics',
    yearsOfExperience: 8,
    status: 'active',
    bio: 'Experienced mathematics teacher with a passion for helping students understand complex concepts.'
  },
  student: {
    id: 3,
    username: 'sopheak',
    email: 'sopheak.chhum@school.edu',
    firstName: 'Sopheak',
    lastName: 'Chhum',
    role: 'student',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    phone: '+855 98 765 432',
    address: 'Siem Reap, Cambodia',
    dateJoined: '2024-09-05',
    lastLogin: '2025-06-18',
    studentId: 'ST202405789',
    program: 'Bachelor of Information Technology',
    batch: '2024',
    department: 'Information Technology',
    currentYear: 2,
    currentSemester: 1,
    gpa: 3.7,
    status: 'active',
    bio: 'Dedicated student pursuing a degree in Information Technology with interests in web development and AI.'
  },
  parent: {
    id: 4,
    username: 'sothea',
    email: 'sothea.meas@example.com',
    firstName: 'Sothea',
    lastName: 'Meas',
    role: 'parent',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    phone: '+855 92 345 678',
    address: 'Phnom Penh, Cambodia',
    dateJoined: '2024-09-10',
    lastLogin: '2025-06-15',
    occupation: 'Business Owner',
    childrenIds: [3, 5],
    status: 'active',
    bio: 'Concerned parent actively involved in my children\'s education and development.'
  }
};

// Helper function to add mock data flag
const addMockFlag = (data) => {
  return {
    _isMockData: true,
    data
  };
};

// Safe API call with mock fallback
const safeApiCall = async (apiCall, mockData) => {
  try {
    const response = await apiCall();
    if (!response || !response.data) {
      return addMockFlag(mockData);
    }
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    return addMockFlag(mockData);
  }
};

const profileService = {
  // Get profile information based on userId and role
  getProfile: async (userId, role) => {
    const mockProfile = mockProfiles[role] || mockProfiles.teacher;
    
    return await safeApiCall(
      () => api.get(`/users/profile/${userId}`),
      mockProfile
    );
  },
  
  // Update user profile
  updateProfile: async (userId, profileData) => {
    return await safeApiCall(
      () => api.put(`/users/profile/${userId}`, profileData),
      { success: true, message: 'Profile updated successfully' }
    );
  },
  
  // Change user password
  changePassword: async (userId, passwordData) => {
    return await safeApiCall(
      () => api.post(`/users/password/${userId}`, passwordData),
      { success: true, message: 'Password changed successfully' }
    );
  },
  
  // Upload profile picture
  uploadProfilePicture: async (userId, formData) => {
    return await safeApiCall(
      () => api.post(`/users/profile-picture/${userId}`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data'
        } 
      }),
      { success: true, message: 'Profile picture uploaded successfully', url: 'https://randomuser.me/api/portraits/men/41.jpg' }
    );
  }
};

export default profileService;
