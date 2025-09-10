import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MajorService from '../../services/major.service';
import DepartmentService from '../../services/department.service';

const MajorSchema = Yup.object().shape({
  major_name: Yup.string()
    .required('Major name is required')
    .min(2, 'Major name must be at least 2 characters')
    .max(100, 'Major name must be at most 100 characters'),
  department_id: Yup.number()
    .required('Department is required')
    .positive('Please select a valid department'),
  description: Yup.string()
    .max(500, 'Description must be at most 500 characters')
});

const Majors = () => {
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch majors with enhanced data including department info
  const fetchMajors = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('Fetching majors, page:', page, 'search:', search);
      
      // First try the authenticated endpoint
      try {
        console.log('Trying authenticated endpoint...');
        const response = await MajorService.getAll(page, 10, search);
        console.log('Auth endpoint response:', response);
        
        // Handle Node.js backend response format
        if (response && response.success && response.data) {
          setMajors(response.data || []);
          // Use count for pagination from Node.js backend
          setTotalPages(Math.ceil((response.count || response.total || 0) / 10));
          console.log('Majors fetched successfully:', response.data.length);
          setLoading(false);
          return; // Exit if successful
        } else if (response && (response.rows || response.data)) {
          // Fallback for other response formats
          const dataArray = response.rows || response.data || [];
          setMajors(dataArray);
          setTotalPages(Math.ceil((response.count || response.total || 0) / 10));
          console.log('Majors fetched with fallback format, count:', dataArray.length);
          setLoading(false);
          return; // Exit if successful
        }
      } catch (mainError) {
        console.warn('Primary endpoint failed, trying fallback:', mainError.message);
        // Continue to fallback if main endpoint fails
      }
      
      // Try the open endpoint as fallback
      try {
        console.log('Trying open endpoint...');
        const response = await MajorService.getAllOpen(page, 10, search);
        console.log('Open endpoint response:', response);
        
        if (response && (response.data || response.rows)) {
          const dataArray = response.data || response.rows || [];
          setMajors(dataArray);
          setTotalPages(Math.ceil((response.count || response.total || 0) / 10));
          console.log('Majors fetched from open endpoint:', dataArray.length);
          setCurrentPage(page);
        } else {
          console.warn('Open endpoint returned unexpected format:', response);
          setError('Could not load majors data');
          setMajors([]); // Ensure majors is always an array
        }
      } catch (openError) {
        console.error('Both endpoints failed:', openError.message);
        setError('Failed to load majors. Please try again later.');
        setMajors([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
      setError('Failed to fetch majors. Please try again.');
      setMajors([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAll(1, 100);
      console.log('Departments API response:', response);
      
      if (response.success !== false) {
        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
        } else if (response.rows && Array.isArray(response.rows)) {
          setDepartments(response.rows);
        } else if (Array.isArray(response)) {
          setDepartments(response);
        } else {
          console.warn('Unexpected departments response format:', response);
          setDepartments([]);
        }
      } else {
        console.error('Failed to fetch departments:', response?.error);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchMajors();
    fetchDepartments();
  }, []);

  const handleSearch = ({ search }) => {
    setSearchTerm(search);
    fetchMajors(1, search);
  };

  const handlePageChange = (page) => {
    fetchMajors(page, searchTerm);
  };

  const handleEdit = (major) => {
    setEditingMajor(major);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError('');
      await MajorService.delete(id);
      setSuccess('Major deleted successfully');
      fetchMajors(currentPage, searchTerm);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      
      // Handle specific error types
      if (error.message.includes('Authentication required')) {
        setError('Authentication required. Please log in again to delete majors.');
      } else if (error.message.includes('permission')) {
        setError('You do not have permission to delete majors.');
      } else if (error.message.includes('dependencies')) {
        setError(error.message);
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to delete major');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (editingMajor) {
        await MajorService.update(editingMajor.id, values);
        setSuccess('Major updated successfully');
      } else {
        await MajorService.create(values);
        setSuccess('Major created successfully');
      }

      resetForm();
      setIsModalOpen(false);
      setEditingMajor(null);
      fetchMajors(currentPage, searchTerm);
    } catch (error) {
      console.error('Submit error:', error);
      
      // Handle specific error types
      if (error.message.includes('Authentication required')) {
        setError('Authentication required. Please log in again to save majors.');
      } else if (error.message.includes('permission')) {
        setError('You do not have permission to modify majors.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to save major');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'major_name',
      label: 'MAJOR NAME',
      render: (item) => (
        <div className="font-medium text-gray-900">
          {item.major_name || item.name}
        </div>
      )
    },
    {
      key: 'department',
      label: 'DEPARTMENT',
      render: (item) => (
        <div className="text-gray-600">
          {item.department_name || 'N/A'}
        </div>
      )
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      render: (item) => (
        <div className="text-gray-600 max-w-xs truncate">
          {item.description || 'N/A'}
        </div>
      )
    },
  ];

  const filters = [
    {
      name: 'departmentId',
      label: 'Department',
      options: departments.map(dept => ({
        value: dept.id,
        label: dept.name
      }))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Majors</h1>
        <button
          onClick={() => {
            setEditingMajor(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Major
        </button>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert 
          type="success" 
          message={success} 
          onClose={() => setSuccess('')}
        />
      )}

      <SearchFilter onSearch={handleSearch} filters={filters} />

      {loading && !majors.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={majors}
            actions={true}
            onEdit={handleEdit}
            onDelete={(major) => setConfirmDelete(major)}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMajor ? 'Edit Major' : 'Add Major'}
      >
        <Formik
          initialValues={{
            major_name: editingMajor?.major_name || editingMajor?.name || '',
            department_id: editingMajor?.department_id || editingMajor?.departmentId || '',
            description: editingMajor?.description || ''
          }}
          validationSchema={MajorSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="major_name" className="form-label">
                  Major Name
                </label>
                <Field
                  type="text"
                  id="major_name"
                  name="major_name"
                  className="form-input"
                  placeholder="Enter major name"
                />
                <ErrorMessage
                  name="major_name"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="department_id" className="form-label">
                  Department
                </label>
                <Field
                  as="select"
                  id="department_id"
                  name="department_id"
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {Array.isArray(departments) && departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name || department.department_name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="department_id"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows="4"
                  className="form-input"
                  placeholder="Major description..."
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="form-error"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary"
                >
                  {loading ? <LoadingSpinner size="sm" color="white" /> : 'Save'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete the major "{confirmDelete?.major_name || confirmDelete?.name}"?
            This action cannot be undone and may affect related students and subjects.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDelete(confirmDelete.id)}
              className="btn-danger"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Majors;
