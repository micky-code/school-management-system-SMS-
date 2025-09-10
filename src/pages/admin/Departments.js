import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DepartmentService from '../../services/department.service';

const DepartmentSchema = Yup.object().shape({
  department_name: Yup.string()
    .required('Department name is required')
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must be at most 100 characters'),
  teacher_id: Yup.number()
    .nullable()
    .positive('Teacher ID must be a positive number')
    .integer('Teacher ID must be an integer')
});

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchDepartments = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching departments with search:', search, 'page:', page);
      
      const response = await DepartmentService.getAll(page, 10, search);
      console.log('Departments API response:', response);
      
      if (response.success === false) {
        setError(response.error || 'Failed to fetch departments');
        setDepartments([]);
      } else {
        // Handle different response formats
        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
          setTotalPages(response.pagination?.totalPages || Math.ceil((response.count || 0) / 10));
          setError('');
        } else if (response.rows && Array.isArray(response.rows)) {
          setDepartments(response.rows);
          setTotalPages(Math.ceil((response.count || 0) / 10));
          setError('');
        } else if (Array.isArray(response)) {
          setDepartments(response);
          setTotalPages(Math.ceil(response.length / 10));
          setError('');
        } else {
          setDepartments([]);
          setTotalPages(1);
          setError('Received unexpected data format from server');
        }
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments. Please try again.');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSearch = ({ search }) => {
    fetchDepartments(1, search);
  };

  const handlePageChange = (page) => {
    fetchDepartments(page);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
    
    // Ensure we're using the correct field names based on API response
    const departmentName = department.department_name || department.name;
    const departmentDescription = department.description || '';
    
    // Set form initial values with the correct field names
    setEditingDepartment({
      ...department,
      name: departmentName,
      description: departmentDescription
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await DepartmentService.delete(id);
      setSuccess('Department deleted successfully');
      fetchDepartments(currentPage);
      setConfirmDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      if (editingDepartment) {
        await DepartmentService.update(editingDepartment.id, values);
        setSuccess('Department updated successfully');
      } else {
        await DepartmentService.create(values);
        setSuccess('Department created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingDepartment(null);
      fetchDepartments(currentPage);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      key: 'department_name', 
      label: 'Department Name',
      render: (item) => item.department_name || item.name || 'N/A'
    },
    { 
      key: 'teacher_id', 
      label: 'Head Teacher ID',
      render: (item) => item.teacher_id || 'Not Assigned'
    },
    { 
      key: 'id', 
      label: 'ID',
      render: (item) => item.id || 'N/A'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
        <button
          onClick={() => {
            setEditingDepartment(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Department
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

      <SearchFilter onSearch={handleSearch} />

      {loading && (!departments || !departments.length) ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={departments || []}
            actions={true}
            onEdit={handleEdit}
            onDelete={(department) => setConfirmDelete(department)}
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
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
      >
        <Formik
          initialValues={{
            department_name: editingDepartment?.department_name || '',
            teacher_id: editingDepartment?.teacher_id || ''
          }}
          validationSchema={DepartmentSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="department_name" className="form-label">
                  Department Name *
                </label>
                <Field
                  type="text"
                  id="department_name"
                  name="department_name"
                  className="form-input"
                  placeholder="e.g., Faculty of Information Technology"
                />
                <ErrorMessage
                  name="department_name"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="teacher_id" className="form-label">
                  Head Teacher ID
                </label>
                <Field
                  type="number"
                  id="teacher_id"
                  name="teacher_id"
                  className="form-input"
                  placeholder="Enter teacher ID for department head"
                />
                <ErrorMessage
                  name="teacher_id"
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
            Are you sure you want to delete the department "{confirmDelete?.department_name}"?
            This action cannot be undone and may affect related programs.
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

export default Departments;
