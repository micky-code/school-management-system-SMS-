import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UsersIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  PencilSquareIcon,
  ArrowRightCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Import services
import TeacherService from '../../services/teacher.service';
import SubjectService from '../../services/subject.service';
import AttendanceService from '../../services/attendance.service';
import CourseService from '../../services/course.service';
import CourseEnrollmentService from '../../services/courseEnrollment.service';
import { useAuth } from '../../context/AuthContext';

const Subjects = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('current');
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  useEffect(() => {
    fetchTeacherSubjects();
  }, [currentUser, academicYear, searchTerm]);

  const fetchTeacherSubjects = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const teacherId = currentUser.teacher_id || currentUser.id;
      const response = await TeacherService.getSubjects(teacherId, academicYear);
      
      // Filter by search term if provided
      const filteredSubjects = searchTerm 
        ? response.filter(subject => 
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            subject.code.toLowerCase().includes(searchTerm.toLowerCase()))
        : response;
      
      setSubjects(filteredSubjects);
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      toast.error('Failed to load your subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (subjectId) => {
    setEnrollmentsLoading(true);
    try {
      const response = await CourseEnrollmentService.getByCourse(subjectId);
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrolled students');
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleExpand = (subjectId) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectId);
      fetchEnrollments(subjectId);
    }
  };

  const navigateToAttendance = (subjectId) => {
    navigate(`/teacher/attendance/${subjectId}`);
  };

  const navigateToGrades = (subjectId) => {
    navigate(`/teacher/grades/${subjectId}`);
  };

  const navigateToMaterials = (subjectId) => {
    navigate(`/teacher/materials/${subjectId}`);
  };

  const getSubjectStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'upcoming':
        return 'blue';
      case 'completed':
        return 'gray';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600">Manage your teaching subjects, students, and materials</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="current">Current Academic Year</option>
          <option value="all">All Academic Years</option>
          {/* We could fetch and map actual academic years here */}
        </select>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-gray-600">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No subjects found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term.' : 'You have no assigned subjects for this period.'}
            </p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleExpand(subject.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpenIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {subject.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="mr-3">{subject.code}</span>
                        <span className="mr-3">•</span>
                        <span>{subject.credits} Credits</span>
                        <span className="mx-3">•</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getSubjectStatusColor(subject.status)}-100 text-${getSubjectStatusColor(subject.status)}-800`}>
                          {subject.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {expandedSubject === subject.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded View */}
              {expandedSubject === subject.id && (
                <div className="border-t border-gray-200">
                  {/* Subject Details */}
                  <div className="p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800 mb-2">Subject Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Academic Year</p>
                          <p className="text-sm font-medium">{subject.academic_year || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Schedule</p>
                          <p className="text-sm font-medium">{subject.schedule || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="text-sm font-medium">{subject.department || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white p-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigateToAttendance(subject.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <UserGroupIcon className="h-4 w-4" />
                      <span>Attendance</span>
                    </button>
                    <button
                      onClick={() => navigateToGrades(subject.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      <span>Grades</span>
                    </button>
                    <button
                      onClick={() => navigateToMaterials(subject.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      <span>Materials</span>
                    </button>
                  </div>

                  {/* Enrolled Students */}
                  <div className="border-t border-gray-200 p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Enrolled Students</h4>
                    {enrollmentsLoading ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="mt-1 text-sm text-gray-500">Loading students...</p>
                      </div>
                    ) : enrollments.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">No students enrolled yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enrollment Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.map((enrollment) => (
                              <tr key={enrollment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {enrollment.student_name_en}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {enrollment.student_id}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${enrollment.status === 'active' ? 'green' : 'red'}-100 text-${enrollment.status === 'active' ? 'green' : 'red'}-800`}>
                                    {enrollment.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                                  <button 
                                    onClick={() => navigate(`/teacher/student/${enrollment.student_id}`)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <ArrowRightCircleIcon className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subjects;
