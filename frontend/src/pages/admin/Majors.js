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
import TeacherService from '../../services/teacher.service';

const MajorSchema = Yup.object().shape({
  name: Yup.string()
    .required('Major name is required')
    .min(2, 'Major name must be at least 2 characters')
    .max(100, 'Major name must be at most 100 characters'),
  departmentId: Yup.number()
    .required('Department is required'),
  coordinatorId: Yup.number()
    .nullable(),
  description: Yup.string()
    .max(500, 'Description must be at most 500 characters')
});

const Majors = () => {
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const fetchMajors = async (page = 1, search = '', departmentId = '') => {
    try {
      setLoading(true);
      const response = await MajorService.getAll(page, 10, search, departmentId);
      setMajors(response.rows);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to fetch majors. Please try again.');
      console.error('Error fetching majors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAll(1, 100);
      setDepartments(response.rows);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await TeacherService.getAll(1, 100);
      setTeachers(response.rows);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  useEffect(() => {
    fetchMajors();
    fetchDepartments();
    fetchTeachers();
  }, []);

  const handleSearch = ({ search, departmentId }) => {
    setSelectedDepartment(departmentId || '');
    fetchMajors(1, search, departmentId);
  };

  const handlePageChange = (page) => {
    fetchMajors(page, '', selectedDepartment);
  };

  const handleEdit = (major) => {
    setEditingMajor(major);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await MajorService.delete(id);
      setSuccess('Major deleted successfully');
      fetchMajors(currentPage, '', selectedDepartment);
      setConfirmDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete major');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
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
      fetchMajors(currentPage, '', selectedDepartment);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save major');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Major Name' },
    { 
      key: 'department', 
      label: 'Department',
      render: (item) => item.department?.name || 'N/A'
    },
    { 
      key: 'coordinator', 
      label: 'Coordinator',
      render: (item) => item.coordinator ? `${item.coordinator.firstName} ${item.coordinator.lastName}` : 'None'
    },
    { key: 'description', label: 'Description' }
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
            name: editingMajor?.name || '',
            departmentId: editingMajor?.departmentId || '',
            coordinatorId: editingMajor?.coordinatorId || '',
            description: editingMajor?.description || ''
          }}
          validationSchema={MajorSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Major Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Software Engineering"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="departmentId" className="form-label">
                  Department
                </label>
                <Field
                  as="select"
                  id="departmentId"
                  name="departmentId"
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="departmentId"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="coordinatorId" className="form-label">
                  Coordinator (Optional)
                </label>
                <Field
                  as="select"
                  id="coordinatorId"
                  name="coordinatorId"
                  className="form-input"
                >
                  <option value="">Select Coordinator</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="coordinatorId"
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
            Are you sure you want to delete the major "{confirmDelete?.name}"?
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
