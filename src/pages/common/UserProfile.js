import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import profileService from '../../services/profile.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  ClockIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        setError('User not authenticated');
        return;
      }

      const userId = currentUser.id || 1; // Fallback ID for testing
      const userRole = currentUser.role || 'teacher'; // Fallback role for testing
      
      const response = await profileService.getProfile(userId, userRole);
      
      if (response) {
        setProfile(response.data || {});
        setIsMockData(response._isMockData || false);
        
        if (response._isMockData) {
          console.warn('Using mock data for user profile');
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image size must not exceed 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const userId = currentUser?.id || 1;
      const response = await profileService.uploadProfilePicture(userId, formData);

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          avatar: response.avatarUrl || prev.avatar
        }));
        toast.success('Profile picture updated successfully');
      } else {
        toast.error('Failed to update profile picture');
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const userId = currentUser?.id || 1;
      const response = await profileService.updateProfile(userId, values);
      
      if (response.success) {
        setProfile(prev => ({
          ...prev,
          ...values
        }));
        toast.success('Profile updated successfully');
        setIsEditMode(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile information');
    }
  };

  const handlePasswordChange = async (values, { resetForm }) => {
    try {
      const userId = currentUser?.id || 1;
      const response = await profileService.changePassword(userId, values);
      
      if (response.success) {
        toast.success('Password changed successfully');
        resetForm();
      } else {
        toast.error('Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={fetchUserProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No profile data available</h3>
      </div>
    );
  }

  // Will continue the implementation in the next part
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Mock Data Warning */}
      {isMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-700">
              <strong>Note:</strong> Displaying sample data. Connect to backend API for real-time data.
            </span>
            <button 
              onClick={fetchUserProfile} 
              className="ml-4 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium py-1 px-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Profile Header with Avatar */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
        <div className="px-6 py-4 md:p-6 relative">
          <div className="flex flex-col md:flex-row md:items-end">
            {/* Profile Avatar */}
            <div className="absolute transform -translate-y-1/2 p-1 bg-white rounded-full shadow-lg top-0 left-6 md:static md:transform-none md:mr-6 md:-mt-16">
              <div className="relative">
                <img 
                  src={profile.avatar || 'https://via.placeholder.com/128x128'} 
                  alt={`${profile.firstName} ${profile.lastName}`} 
                  className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover"
                />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <CameraIcon className="h-4 w-4 text-white" />
                  <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="mt-14 md:mt-0 flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    {(() => {
                      switch (profile.role) {
                        case 'admin': return <AcademicCapIcon className="h-4 w-4 mr-1" />;
                        case 'teacher': return <BuildingOfficeIcon className="h-4 w-4 mr-1" />;
                        case 'student': return <UserIcon className="h-4 w-4 mr-1" />;
                        case 'parent': return <UserIcon className="h-4 w-4 mr-1" />;
                        default: return <UserIcon className="h-4 w-4 mr-1" />;
                      }
                    })()} 
                    {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'User'}
                    {profile.department && 
                      <span className="ml-2">• {profile.department}</span>
                    }
                  </p>
                  
                  {/* Show specific role details */}
                  {profile.role === 'student' && (
                    <p className="text-sm text-gray-500 mt-1">Student ID: {profile.studentId} • {profile.program}</p>
                  )}
                  {profile.role === 'teacher' && (
                    <p className="text-sm text-gray-500 mt-1">{profile.position} • {profile.department}</p>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="mt-4 md:mt-0">
                  {!isEditMode && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="-ml-1 mr-2 h-4 w-4" /> Edit Profile
                    </button>
                  )}
                  {isEditMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <XMarkIcon className="-ml-1 mr-2 h-4 w-4" /> Cancel
                      </button>
                      <button
                        type="submit"
                        form="profile-form"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckIcon className="-ml-1 mr-2 h-4 w-4" /> Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Info Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{profile.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{profile.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto scrollbar-hide p-4" aria-label="Tabs">
            <button
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button
              className={`${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('account')}
            >
              Account Settings
            </button>
            {profile.role === 'teacher' && (
              <button
                className={`${
                  activeTab === 'teaching'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('teaching')}
              >
                Teaching Information
              </button>
            )}
            {profile.role === 'student' && (
              <button
                className={`${
                  activeTab === 'academic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('academic')}
              >
                Academic Information
              </button>
            )}
            {profile.role === 'parent' && (
              <button
                className={`${
                  activeTab === 'children'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-3 px-3 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('children')}
              >
                Children Information
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {/* Tab Contents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                  Personal Information
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Full Name:</span>
                    <span className="text-gray-900 font-medium">{profile.firstName} {profile.lastName}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900">{profile.email}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900">{profile.phone || 'Not provided'}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Address:</span>
                    <span className="text-gray-900">{profile.address || 'Not provided'}</span>
                  </li>
                </ul>
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <KeyIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                  Account Information
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Username:</span>
                    <span className="text-gray-900 font-medium">{profile.username}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">User ID:</span>
                    <span className="text-gray-900">{profile.id}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Role:</span>
                    <span className="text-gray-900">{profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'User'}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-gray-900">
                      {profile.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Role-specific Information */}
              {profile.role === 'teacher' && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                    Teaching Information
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Department:</span>
                      <span className="text-gray-900 font-medium">{profile.department}</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Position:</span>
                      <span className="text-gray-900">{profile.position}</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Experience:</span>
                      <span className="text-gray-900">{profile.yearsOfExperience} years</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Subjects:</span>
                      <span className="text-gray-900">
                        {profile.subjects ? profile.subjects.join(', ') : 'None assigned'}
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {profile.role === 'student' && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                    Academic Information
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Student ID:</span>
                      <span className="text-gray-900 font-medium">{profile.studentId}</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Program:</span>
                      <span className="text-gray-900">{profile.program}</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Year:</span>
                      <span className="text-gray-900">Year {profile.currentYear}</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">GPA:</span>
                      <span className="text-gray-900">{profile.gpa || 'N/A'}</span>
                    </li>
                  </ul>
                </div>
              )}

              {profile.role === 'parent' && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                    Parent Information
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Occupation:</span>
                      <span className="text-gray-900 font-medium">{profile.occupation || 'Not provided'}</span>
                    </li>
                    <li className="grid grid-cols-2">
                      <span className="text-gray-500">Children:</span>
                      <span className="text-gray-900">{profile.childrenIds ? profile.childrenIds.length : 0} children</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* System Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                  System Information
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Date Joined:</span>
                    <span className="text-gray-900">{new Date(profile.dateJoined).toLocaleDateString()}</span>
                  </li>
                  <li className="grid grid-cols-2">
                    <span className="text-gray-500">Last Login:</span>
                    <span className="text-gray-900">{new Date(profile.lastLogin).toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>

              {/* Bio/About */}
              {profile.bio && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                  <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                    <UserIcon className="h-5 w-5 text-blue-500 mr-2" /> 
                    About
                  </h3>
                  <p className="text-sm text-gray-700">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Personal Information Tab Content */}
        {activeTab === 'personal' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
            
            <Formik
              id="profile-form"
              initialValues={{
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                bio: profile.bio || '',
                ...(profile.role === 'teacher' ? {
                  education: profile.education || '',
                  yearsOfExperience: profile.yearsOfExperience || 0
                } : {}),
                ...(profile.role === 'student' ? {
                  program: profile.program || '',
                  currentYear: profile.currentYear || 1
                } : {}),
                ...(profile.role === 'parent' ? {
                  occupation: profile.occupation || ''
                } : {})
              }}
              validationSchema={Yup.object({
                firstName: Yup.string().required('First name is required'),
                lastName: Yup.string().required('Last name is required'),
                email: Yup.string().email('Invalid email address').required('Email is required'),
                phone: Yup.string(),
                address: Yup.string(),
                bio: Yup.string().max(500, 'Bio must not exceed 500 characters'),
                ...(profile.role === 'teacher' ? {
                  education: Yup.string(),
                  yearsOfExperience: Yup.number().min(0, 'Experience years cannot be negative')
                } : {}),
                ...(profile.role === 'student' ? {
                  program: Yup.string(),
                  currentYear: Yup.number().min(1, 'Year must be at least 1').max(8, 'Year cannot exceed 8')
                } : {}),
                ...(profile.role === 'parent' ? {
                  occupation: Yup.string()
                } : {})
              })}
              onSubmit={handleUpdateProfile}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form id="profile-form" className="space-y-6">
                  {/* Basic Info Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                        <Field
                          type="text"
                          name="firstName"
                          id="firstName"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <Field
                          type="text"
                          name="lastName"
                          id="lastName"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.email && touched.email ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <Field
                          type="text"
                          name="phone"
                          id="phone"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Info Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Contact Information</h3>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                      <Field
                        type="text"
                        name="address"
                        id="address"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.address && touched.address ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  {/* Teacher-specific fields */}
                  {profile.role === 'teacher' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Teaching Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
                          <Field
                            type="text"
                            name="education"
                            id="education"
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.education && touched.education ? 'border-red-500' : ''}`}
                          />
                          <ErrorMessage name="education" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div>
                          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                          <Field
                            type="number"
                            name="yearsOfExperience"
                            id="yearsOfExperience"
                            min="0"
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.yearsOfExperience && touched.yearsOfExperience ? 'border-red-500' : ''}`}
                          />
                          <ErrorMessage name="yearsOfExperience" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Student-specific fields */}
                  {profile.role === 'student' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Student Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program</label>
                          <Field
                            as="select"
                            name="program"
                            id="program"
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.program && touched.program ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select Program</option>
                            <option value="Bachelor of Information Technology">Bachelor of Information Technology</option>
                            <option value="Bachelor of Business Administration">Bachelor of Business Administration</option>
                            <option value="Bachelor of Education">Bachelor of Education</option>
                            <option value="Associate Degree in IT">Associate Degree in IT</option>
                            <option value="Associate Degree in Agriculture">Associate Degree in Agriculture</option>
                          </Field>
                          <ErrorMessage name="program" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div>
                          <label htmlFor="currentYear" className="block text-sm font-medium text-gray-700">Current Year</label>
                          <Field
                            type="number"
                            name="currentYear"
                            id="currentYear"
                            min="1"
                            max="8"
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.currentYear && touched.currentYear ? 'border-red-500' : ''}`}
                          />
                          <ErrorMessage name="currentYear" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Parent-specific fields */}
                  {profile.role === 'parent' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Parent Information</h3>
                      
                      <div>
                        <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Occupation</label>
                        <Field
                          type="text"
                          name="occupation"
                          id="occupation"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.occupation && touched.occupation ? 'border-red-500' : ''}`}
                        />
                        <ErrorMessage name="occupation" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  )}
                  
                  {/* Bio Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">About</h3>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                      <Field
                        as="textarea"
                        name="bio"
                        id="bio"
                        rows="4"
                        placeholder="Tell us about yourself"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.bio && touched.bio ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-600" />
                      <p className="mt-2 text-sm text-gray-500">Brief bio or introduction. Maximum 500 characters.</p>
                    </div>
                  </div>
                  
                  {/* Form Controls */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        {/* Account Settings Tab Content */}
        {activeTab === 'account' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Account Settings</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
              
              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }}
                validationSchema={Yup.object({
                  currentPassword: Yup.string().required('Current password is required'),
                  newPassword: Yup.string()
                    .min(8, 'Password must be at least 8 characters')
                    .matches(
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                    )
                    .required('New password is required'),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                    .required('Confirm password is required')
                })}
                onSubmit={handlePasswordChange}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                      <Field
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                      <Field
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.newPassword && touched.newPassword ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                      >
                        {isSubmitting ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
            
            <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Receive email notifications about account activity</p>
                  </div>
                  <div className="form-switch">
                    <input 
                      type="checkbox" 
                      id="email-notifications" 
                      className="form-switch-checkbox" 
                      defaultChecked={profile.preferences?.emailNotifications} 
                      onChange={(e) => {
                        // Handle preferences change
                        const updatedPrefs = {
                          ...profile.preferences,
                          emailNotifications: e.target.checked
                        };
                        // Would update preferences here
                      }}
                    />
                    <label htmlFor="email-notifications" className="form-switch-label"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <div className="form-switch">
                    <input 
                      type="checkbox" 
                      id="two-factor" 
                      className="form-switch-checkbox" 
                      defaultChecked={profile.preferences?.twoFactorEnabled} 
                      onChange={(e) => {
                        // Handle 2FA toggle
                        // This would typically open a setup process
                        if (e.target.checked) {
                          toast.info('Two-factor authentication setup would begin here');
                        } else {
                          toast.info('Two-factor authentication would be disabled here');
                        }
                      }}
                    />
                    <label htmlFor="two-factor" className="form-switch-label"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Teacher Role-specific Tab */}
        {activeTab === 'teaching' && profile.role === 'teacher' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Teaching Information</h2>

            <div className="space-y-6">
              {/* Subjects Taught Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Subjects Taught
                  </h3>
                </div>
                <div className="p-4">
                  {profile.subjects && profile.subjects.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Level</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {profile.subjects.map((subject, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.level}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.studentCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.schedule}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No subjects assigned</div>
                  )}
                </div>
              </div>
              
              {/* Class Schedule Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Weekly Schedule
                  </h3>
                </div>
                <div className="p-4">
                  {profile.schedule && profile.schedule.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {profile.schedule.map((session, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.day}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.startTime} - {session.endTime}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.subject}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.room}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No schedule information available</div>
                  )}
                </div>
              </div>

              {/* Academic & Professional Background */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Academic & Professional Background
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Education</h4>
                    <p className="mt-1 text-sm text-gray-600">{profile.education || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Certifications</h4>
                    {profile.certifications && profile.certifications.length > 0 ? (
                      <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                        {profile.certifications.map((cert, index) => (
                          <li key={index}>{cert}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-gray-600">No certifications listed</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Experience</h4>
                    <p className="mt-1 text-sm text-gray-600">{profile.yearsOfExperience} years of teaching experience</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Specializations</h4>
                    {profile.specializations && profile.specializations.length > 0 ? (
                      <ul className="mt-1 text-sm text-gray-600 list-disc pl-5 space-y-1">
                        {profile.specializations.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-gray-600">No specializations listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Academic Information Tab */}
        {activeTab === 'academic' && profile.role === 'student' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Academic Information</h2>

            <div className="space-y-6">
              {/* Academic Overview */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <IdentificationIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Program Information
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Student ID</h4>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{profile.studentId || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Enrollment Date</h4>
                      <p className="mt-1 text-sm text-gray-900">{profile.enrollmentDate ? new Date(profile.enrollmentDate).toLocaleDateString() : 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Degree Level</h4>
                      <p className="mt-1 text-sm text-gray-900">{profile.degreeLevel || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Department</h4>
                      <p className="mt-1 text-sm text-gray-900">{profile.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Program</h4>
                      <p className="mt-1 text-sm text-gray-900">{profile.program || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Current Year</h4>
                      <p className="mt-1 text-sm text-gray-900">Year {profile.currentYear || '1'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Batch</h4>
                      <p className="mt-1 text-sm text-gray-900">{profile.batch || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Academic Status</h4>
                      <p className="mt-1 text-sm">
                        {profile.academicStatus === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        ) : profile.academicStatus === 'probation' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Academic Probation</span>
                        ) : profile.academicStatus === 'graduated' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Graduated</span>
                        ) : profile.academicStatus === 'withdrawn' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Withdrawn</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Academic Performance
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Current GPA</h4>
                      <p className="mt-1 text-lg text-blue-600 font-bold">{profile.gpa || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Credits Completed</h4>
                      <p className="mt-1 text-lg text-blue-600 font-bold">{profile.creditsCompleted || '0'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Credits Required</h4>
                      <p className="mt-1 text-lg text-gray-900">{profile.creditsRequired || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {profile.creditsCompleted && profile.creditsRequired && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                        <span>Progress toward degree</span>
                        <span>
                          {Math.round((profile.creditsCompleted / profile.creditsRequired) * 100)}%
                          ({profile.creditsCompleted}/{profile.creditsRequired} credits)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.round((profile.creditsCompleted / profile.creditsRequired) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Courses */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Current Courses
                  </h3>
                </div>
                <div className="p-4">
                  {profile.currentCourses && profile.currentCourses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {profile.currentCourses.map((course, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.courseCode}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.courseName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.credits}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.teacher}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.schedule}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No courses currently enrolled</div>
                  )}
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500 mr-2" />
                    Attendance Summary
                  </h3>
                </div>
                <div className="p-4">
                  {profile.attendanceSummary ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-700">Present</div>
                        <div className="text-xl font-bold text-green-800">{profile.attendanceSummary.present || 0}</div>
                        <div className="text-xs text-green-600">{profile.attendanceSummary.presentPercent || 0}%</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-sm text-red-700">Absent</div>
                        <div className="text-xl font-bold text-red-800">{profile.attendanceSummary.absent || 0}</div>
                        <div className="text-xs text-red-600">{profile.attendanceSummary.absentPercent || 0}%</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm text-yellow-700">Late</div>
                        <div className="text-xl font-bold text-yellow-800">{profile.attendanceSummary.late || 0}</div>
                        <div className="text-xs text-yellow-600">{profile.attendanceSummary.latePercent || 0}%</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-700">Excused</div>
                        <div className="text-xl font-bold text-blue-800">{profile.attendanceSummary.excused || 0}</div>
                        <div className="text-xs text-blue-600">{profile.attendanceSummary.excusedPercent || 0}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No attendance data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parent Children Information Tab */}
        {activeTab === 'children' && profile.role === 'parent' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Children Information</h2>
            
            {profile.children && profile.children.length > 0 ? (
              <div className="space-y-6">
                {profile.children.map((child, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                          <UserGroupIcon className="h-5 w-5 text-blue-500 mr-2" />
                          {child.firstName} {child.lastName}
                        </h3>
                        <div className="text-sm text-gray-500">
                          Student ID: <span className="font-medium">{child.studentId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Academic Program</h4>
                          <p className="mt-1 text-sm text-gray-900">{child.program || 'Not specified'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Current Year</h4>
                          <p className="mt-1 text-sm text-gray-900">Year {child.currentYear || '1'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">GPA</h4>
                          <p className="mt-1 text-sm text-gray-900">{child.gpa || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Attendance Rate</h4>
                          <p className="mt-1 text-sm text-gray-900">{child.attendanceRate || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Performance</h4>
                        {child.recentGrades && child.recentGrades.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {child.recentGrades.map((grade, i) => (
                                  <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.assignment}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{grade.grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(grade.date).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No recent grades available</p>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <a 
                          href={`/parent/children/${child.id}`} 
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Full Profile
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                <p className="text-gray-500">No children information available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
