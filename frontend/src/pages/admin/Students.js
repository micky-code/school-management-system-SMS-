import React, { useState, useEffect } from 'react';
import StudentService from '../../services/student.service';
import ProgramService from '../../services/program.service';
import BatchService from '../../services/batch.service';
import DepartmentService from '../../services/department.service';
import DegreeLevelService from '../../services/degreeLevel.service';
import LocationService from '../../services/location.service';
import AdmissionService from '../../services/admission.service';
import MaritalStatusService from '../../services/maritalStatus.service';
import StudentStatusService from '../../services/studentStatus.service';
import UserService from '../../services/user.service';
import ParentService from '../../services/parent.service';
import statsService from '../../services/stats.service';
import { toast } from 'react-toastify';
import StatCard from '../../components/StatCard';
import StudentForm from '../../components/StudentForm';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [villages, setVillages] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [studentStatuses, setStudentStatuses] = useState([]);
  const [parents, setParents] = useState([]);
  const [users, setUsers] = useState([]);
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    graduated: 0,
    suspended: 0
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchBatches();
    fetchProvinces();
    fetchDistricts();
    fetchCommunes();
    fetchVillages();
    fetchAdmissions();
    fetchMaritalStatuses();
    fetchStudentStatuses();
    fetchParents();
    fetchUsers();
    fetchDegreeLevels();
    fetchDepartments();
    fetchStats();
  }, [currentPage, searchTerm, selectedProgram, selectedBatch]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await StudentService.getAll(
        currentPage,
        10,
        searchTerm,
        selectedProgram,
        selectedBatch
      );
      setStudents(response.data);
      setTotalPages(response.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
      // Fallback data to prevent complete failure
      setStudents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await ProgramService.getAll();
      setPrograms(response.data);
    } catch (err) {
      console.error('Error fetching programs:', err);
      // Fallback data
      setPrograms([
        // Associate Degree Programs
        { id: 1, name: 'Software Development', degree_level_id: 2, department_id: null },
        { id: 2, name: 'System and Network Administration', degree_level_id: 2, department_id: null },
        { id: 3, name: 'Food Processing', degree_level_id: 2, department_id: null },
        { id: 4, name: 'Integrated Farming System', degree_level_id: 2, department_id: null },
        { id: 5, name: 'Veterinary Medicine', degree_level_id: 2, department_id: null },
        // Bachelor Degree Programs
        { id: 6, name: 'Computer Science', degree_level_id: 1, department_id: 1 },
        { id: 7, name: 'Information Systems', degree_level_id: 1, department_id: 1 },
        { id: 8, name: 'English Literature', degree_level_id: 1, department_id: 2 },
        { id: 9, name: 'Tourism and Hospitality', degree_level_id: 1, department_id: 3 },
        { id: 10, name: 'Agricultural Science', degree_level_id: 1, department_id: 4 },
        { id: 11, name: 'Social Work', degree_level_id: 1, department_id: 5 }
      ]);
    }
  };
  
  const fetchBatches = async () => {
    try {
      const response = await BatchService.getAll();
      setBatches(response.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
      // Fallback data
      setBatches([
        { id: 1, name: 'Batch 1' },
        { id: 2, name: 'Batch 2' },
        { id: 3, name: 'Batch 3' },
        { id: 4, name: 'Batch 4' },
        { id: 5, name: 'Batch 5' }
      ]);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await LocationService.getProvinces();
      setProvinces(response.data);
    } catch (err) {
      console.error('Error fetching provinces:', err);
      // Fallback data
      setProvinces([
        { id: 1, name: 'Banteay Meanchey' },
        { id: 2, name: 'Battambang' },
        { id: 3, name: 'Kampong Cham' },
        { id: 4, name: 'Kampong Chhnang' },
        { id: 5, name: 'Kampong Speu' }
      ]);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await LocationService.getDistricts();
      setDistricts(response.data);
    } catch (err) {
      console.error('Error fetching districts:', err);
      // Fallback data
      setDistricts([
        { id: 1, name: 'District 1' },
        { id: 2, name: 'District 2' },
        { id: 3, name: 'District 3' },
        { id: 4, name: 'District 4' },
        { id: 5, name: 'District 5' }
      ]);
    }
  };

  const fetchCommunes = async () => {
    try {
      const response = await LocationService.getCommunes();
      setCommunes(response.data);
    } catch (err) {
      console.error('Error fetching communes:', err);
      // Fallback data
      setCommunes([
        { id: 1, name: 'Commune 1' },
        { id: 2, name: 'Commune 2' },
        { id: 3, name: 'Commune 3' },
        { id: 4, name: 'Commune 4' },
        { id: 5, name: 'Commune 5' }
      ]);
    }
  };

  const fetchVillages = async () => {
    try {
      const response = await LocationService.getVillages();
      setVillages(response.data);
    } catch (err) {
      console.error('Error fetching villages:', err);
      // Fallback data
      setVillages([
        { id: 1, name: 'Village 1' },
        { id: 2, name: 'Village 2' },
        { id: 3, name: 'Village 3' },
        { id: 4, name: 'Village 4' },
        { id: 5, name: 'Village 5' }
      ]);
    }
  };

  const fetchAdmissions = async () => {
    try {
      const response = await AdmissionService.getAll();
      setAdmissions(response.data);
    } catch (err) {
      console.error('Error fetching admissions:', err);
      // Fallback data
      setAdmissions([
        { id: 1, name: 'Admission 1' },
        { id: 2, name: 'Admission 2' },
        { id: 3, name: 'Admission 3' },
        { id: 4, name: 'Admission 4' },
        { id: 5, name: 'Admission 5' }
      ]);
    }
  };

  const fetchMaritalStatuses = async () => {
    try {
      const response = await MaritalStatusService.getAll();
      setMaritalStatuses(response.data);
    } catch (err) {
      console.error('Error fetching marital statuses:', err);
      // Fallback data
      setMaritalStatuses([
        { id: 1, name: 'Single' },
        { id: 2, name: 'Married' },
        { id: 3, name: 'Divorced' },
        { id: 4, name: 'Widowed' }
      ]);
    }
  };

  const fetchStudentStatuses = async () => {
    try {
      const response = await StudentStatusService.getAll();
      setStudentStatuses(response.data);
    } catch (err) {
      console.error('Error fetching student statuses:', err);
      // Fallback data
      setStudentStatuses([
        { id: 1, name: 'Active' },
        { id: 2, name: 'Graduated' },
        { id: 3, name: 'Suspended' }
      ]);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await ParentService.getAll();
      setParents(response.data);
    } catch (err) {
      console.error('Error fetching parents:', err);
      // Fallback data
      setParents([
        { id: 1, name: 'Parent 1' },
        { id: 2, name: 'Parent 2' },
        { id: 3, name: 'Parent 3' },
        { id: 4, name: 'Parent 4' },
        { id: 5, name: 'Parent 5' }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await UserService.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback data
      setUsers([
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
        { id: 3, name: 'User 3' },
        { id: 4, name: 'User 4' },
        { id: 5, name: 'User 5' }
      ]);
    }
  };

  const fetchDegreeLevels = async () => {
    try {
      const response = await DegreeLevelService.getAll();
      setDegreeLevels(response.data);
    } catch (err) {
      console.error('Error fetching degree levels:', err);
      // Fallback data
      setDegreeLevels([
        { id: 1, name: 'Bachelor Degree' },
        { id: 2, name: 'Associate Degree' }
      ]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAll();
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      // Fallback data
      setDepartments([
        { id: 1, name: 'Faculty of Information Technology', degree_level_id: 1 },
        { id: 2, name: 'Department of English Literature', degree_level_id: 1 },
        { id: 3, name: 'Department of Tourism Management', degree_level_id: 1 },
        { id: 4, name: 'Department of Agronomy', degree_level_id: 1 },
        { id: 5, name: 'Department of Social Work', degree_level_id: 1 }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await statsService.getStudentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };



  const handleDelete = async (id) => {
    try {
      await StudentService.delete(id);
      setConfirmDelete(null);
      setSuccess('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      setError('Failed to delete student');
      console.error('Error deleting student:', err);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const studentData = {
        // Personal Information
        student_name_en: values.student_name_en,
        student_name_kh: values.student_name_kh,
        dob: values.dob,
        nationality: values.nationality,
        race: values.race,
        gender: values.gender,
        marital_status_id: values.marital_status_id,
        
        // Contact Information
        phone: values.phone,
        email: values.email,
        
        // Academic Information
        degree_level_id: values.degree_level_id,
        department_id: values.department_id,
        program_id: values.program_id,
        batch_id: values.batch_id,
        admission_id: values.admission_id,
        student_status_id: values.student_status_id,
        
        // Location Information
        province_id: values.province_id,
        district_id: values.district_id,
        commune_id: values.commune_id,
        village_id: values.village_id,
        
        // Relationships
        parent_id: values.parent_id || null,
        user_id: values.user_id || null,
        
        // Additional Information
        notes: values.notes
      };

      if (editingStudent) {
        await StudentService.update(editingStudent.id, studentData);
        setSuccess('Student updated successfully');
        toast.success('Student updated successfully');
      } else {
        await StudentService.create(studentData);
        setSuccess('Student created successfully');
        toast.success('Student created successfully');
      }
      
      fetchStudents();
      fetchStats();
      setIsModalOpen(false);
      setEditingStudent(null);
      resetForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save student';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error saving student:', err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="h-8 w-8 mr-3 text-blue-600" />
            Student Management
          </h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Students"
          value={stats.active}
          icon={AcademicCapIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Graduated"
          value={stats.graduated}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Suspended"
          value={stats.suspended}
          icon={DocumentTextIcon}
          color="bg-red-500"
        />
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Batches</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.student_name_en}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.student_name_kh}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {student.student_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {student.phone}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {student.province}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.program?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.batch?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : student.status === 'Graduated'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewStudent(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(student)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <StudentForm
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmit}
              editingStudent={editingStudent}
              programs={programs}
              batches={batches}
              provinces={provinces}
              districts={districts}
              communes={communes}
              villages={villages}
              admissions={admissions}
              maritalStatuses={maritalStatuses}
              studentStatuses={studentStatuses}
              parents={parents}
              users={users}
              degreeLevels={degreeLevels}
              departments={departments}
            />
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Student Details</h3>
              <button
                onClick={() => setViewStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-sm text-gray-900">{viewStudent.student_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">English Name</label>
                  <p className="text-sm text-gray-900">{viewStudent.student_name_en}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Khmer Name</label>
                  <p className="text-sm text-gray-900">{viewStudent.student_name_kh}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{viewStudent.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm text-gray-900">{new Date(viewStudent.dob).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Program</label>
                  <p className="text-sm text-gray-900">{viewStudent.program?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Batch</label>
                  <p className="text-sm text-gray-900">{viewStudent.batch?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm text-gray-900">{viewStudent.status}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900">
                  {viewStudent.village}, {viewStudent.commune}, {viewStudent.district}, {viewStudent.province}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete Student</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {confirmDelete.student_name_en}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
