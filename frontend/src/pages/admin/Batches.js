import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Import services
import BatchService from '../../services/batch.service';
import ProgramService from '../../services/program.service';
import AcademicYearService from '../../services/academicYear.service';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [viewBatch, setViewBatch] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Batch name is required')
      .min(2, 'Batch name must be at least 2 characters')
      .max(100, 'Batch name must not exceed 100 characters'),
    code: Yup.string()
      .required('Batch code is required')
      .min(2, 'Batch code must be at least 2 characters')
      .max(20, 'Batch code must not exceed 20 characters'),
    program_id: Yup.number().required('Program is required'),
    academic_year_id: Yup.number().required('Academic year is required'),
    start_date: Yup.date().required('Start date is required'),
    end_date: Yup.date()
      .required('End date is required')
      .min(Yup.ref('start_date'), 'End date must be after start date'),
    max_students: Yup.number()
      .required('Maximum students is required')
      .min(1, 'Maximum students must be at least 1')
      .max(1000, 'Maximum students must not exceed 1000'),
    status: Yup.string().required('Status is required')
  });

  useEffect(() => {
    fetchBatches();
    fetchPrograms();
    fetchAcademicYears();
  }, [currentPage, searchTerm, selectedProgram, selectedAcademicYear]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await BatchService.getAll(
        currentPage,
        10,
        searchTerm,
        selectedProgram,
        selectedAcademicYear
      );
      setBatches(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to fetch batches');
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await ProgramService.getAll(1, 1000);
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicYearService.getAll();
      setAcademicYears(response.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingBatch) {
        await BatchService.update(editingBatch.id, values);
        toast.success('Batch updated successfully');
      } else {
        await BatchService.create(values);
        toast.success('Batch created successfully');
      }
      setIsModalOpen(false);
      setEditingBatch(null);
      resetForm();
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setIsModalOpen(true);
  };

  const handleView = (batch) => {
    setViewBatch(batch);
  };

  const handleDelete = async (id) => {
    try {
      await BatchService.delete(id);
      toast.success('Batch deleted successfully');
      fetchBatches();
      setConfirmDelete(null);
    } catch (error) {
      toast.error('Failed to delete batch');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProgram('');
    setSelectedAcademicYear('');
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
            <p className="text-gray-600">Manage student batches and cohorts</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Batch
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Programs</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Academic Years</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No batches found
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {batch.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {batch.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.program_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {batch.academic_year_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-blue-600 font-medium">{batch.current_students || 0}</span>
                      <span className="text-gray-500"> / {batch.max_students}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        batch.status === 'active' ? 'bg-green-100 text-green-800' :
                        batch.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        batch.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(batch)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(batch)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(batch)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBatch ? 'Edit Batch' : 'Add Batch'}
              </h3>
              <Formik
                initialValues={{
                  name: editingBatch?.name || '',
                  code: editingBatch?.code || '',
                  program_id: editingBatch?.program_id || '',
                  academic_year_id: editingBatch?.academic_year_id || '',
                  start_date: editingBatch?.start_date?.split('T')[0] || '',
                  end_date: editingBatch?.end_date?.split('T')[0] || '',
                  max_students: editingBatch?.max_students || '',
                  status: editingBatch?.status || 'upcoming'
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                      <Field
                        type="text"
                        name="name"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Batch Code</label>
                      <Field
                        type="text"
                        name="code"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="code" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Program</label>
                      <Field
                        as="select"
                        name="program_id"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Program</option>
                        {programs.map(program => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="program_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                      <Field
                        as="select"
                        name="academic_year_id"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Academic Year</option>
                        {academicYears.map(year => (
                          <option key={year.id} value={year.id}>
                            {year.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="academic_year_id" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <Field
                          type="date"
                          name="start_date"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="start_date" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <Field
                          type="date"
                          name="end_date"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="end_date" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum Students</label>
                      <Field
                        type="number"
                        name="max_students"
                        min="1"
                        max="1000"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="max_students" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <Field
                        as="select"
                        name="status"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setEditingBatch(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : (editingBatch ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewBatch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Batch Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                  <p className="text-sm text-gray-900">{viewBatch.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Code</label>
                  <p className="text-sm text-gray-900">{viewBatch.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <p className="text-sm text-gray-900">{viewBatch.program_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <p className="text-sm text-gray-900">{viewBatch.academic_year_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <p className="text-sm text-gray-900">{new Date(viewBatch.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <p className="text-sm text-gray-900">{new Date(viewBatch.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Students</label>
                  <p className="text-sm text-gray-900">
                    <span className="text-blue-600 font-medium">{viewBatch.current_students || 0}</span>
                    <span className="text-gray-500"> / {viewBatch.max_students}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    viewBatch.status === 'active' ? 'bg-green-100 text-green-800' :
                    viewBatch.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    viewBatch.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {viewBatch.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setViewBatch(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Batch</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete "{confirmDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

export default Batches;
