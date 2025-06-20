import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TeacherService from '../../services/teacher.service';
import DepartmentService from '../../services/department.service';

const phoneRegExp = /^(\+\d{1,3}[- ]?)?\d{10}$/;

const TeacherSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .required('Phone number is required'),
  address: Yup.string()
    .max(255, 'Address must be at most 255 characters'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other'], 'Invalid gender selection'),
  departmentId: Yup.number()
    .required('Department is required'),
  qualification: Yup.string()
    .required('Qualification is required')
    .max(100, 'Qualification must be at most 100 characters'),
  joinDate: Yup.date()
    .required('Join date is required')
    .max(new Date(), 'Join date cannot be in the future')
});

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const fetchTeachers = async (page = 1, search = '', departmentId = '') => {
    try {
      setLoading(true);
      const response = await TeacherService.getAll(page, 10, search, departmentId);
      setTeachers(response.rows);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to fetch teachers. Please try again.');
      console.error('Error fetching teachers:', error);
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

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const handleSearch = ({ search, departmentId }) => {
    setSelectedDepartment(departmentId || '');
    fetchTeachers(1, search, departmentId);
  };

  const handlePageChange = (page) => {
    fetchTeachers(page, '', selectedDepartment);
  };

  const handleView = (teacher) => {
    setViewTeacher(teacher);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await TeacherService.delete(id);
      setSuccess('Teacher deleted successfully');
      fetchTeachers(currentPage, '', selectedDepartment);
      setConfirmDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      // Format dates for API
      const formattedValues = {
        ...values,
        dateOfBirth: new Date(values.dateOfBirth).toISOString().split('T')[0],
        joinDate: new Date(values.joinDate).toISOString().split('T')[0]
      };
      
      if (editingTeacher) {
        await TeacherService.update(editingTeacher.id, formattedValues);
        setSuccess('Teacher updated successfully');
      } else {
        await TeacherService.create(formattedValues);
        setSuccess('Teacher created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingTeacher(null);
      fetchTeachers(currentPage, '', selectedDepartment);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save teacher');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (item) => `${item.firstName} ${item.lastName}`
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'department', 
      label: 'Department',
      render: (item) => item.department?.name || 'N/A'
    },
    { key: 'qualification', label: 'Qualification' }
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
        <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
        <button
          onClick={() => {
            setEditingTeacher(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Teacher
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

      {loading && !teachers.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={teachers}
            actions={true}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(teacher) => setConfirmDelete(teacher)}
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
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        size="lg"
      >
        <Formik
          initialValues={{
            firstName: editingTeacher?.firstName || '',
            lastName: editingTeacher?.lastName || '',
            email: editingTeacher?.email || '',
            phone: editingTeacher?.phone || '',
            address: editingTeacher?.address || '',
            dateOfBirth: editingTeacher?.dateOfBirth ? new Date(editingTeacher.dateOfBirth).toISOString().split('T')[0] : '',
            gender: editingTeacher?.gender || 'Male',
            departmentId: editingTeacher?.departmentId || '',
            qualification: editingTeacher?.qualification || '',
            joinDate: editingTeacher?.joinDate ? new Date(editingTeacher.joinDate).toISOString().split('T')[0] : ''
          }}
          validationSchema={TeacherSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <Field
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <Field
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <Field
                    type="text"
                    id="phone"
                    name="phone"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth
                  </label>
                  <Field
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="dateOfBirth"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <Field
                    as="select"
                    id="gender"
                    name="gender"
                    className="form-input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Field>
                  <ErrorMessage
                    name="gender"
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
                  <label htmlFor="qualification" className="form-label">
                    Qualification
                  </label>
                  <Field
                    type="text"
                    id="qualification"
                    name="qualification"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="qualification"
                    component="div"
                    className="form-error"
                  />
                </div>

                <div>
                  <label htmlFor="joinDate" className="form-label">
                    Join Date
                  </label>
                  <Field
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="joinDate"
                    component="div"
                    className="form-error"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <Field
                  as="textarea"
                  id="address"
                  name="address"
                  rows="3"
                  className="form-input"
                />
                <ErrorMessage
                  name="address"
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

      {/* View Teacher Modal */}
      <Modal
        isOpen={!!viewTeacher}
        onClose={() => setViewTeacher(null)}
        title="Teacher Details"
        size="lg"
      >
        {viewTeacher && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-sm text-gray-900">{viewTeacher.firstName} {viewTeacher.lastName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{viewTeacher.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">{viewTeacher.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(viewTeacher.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1 text-sm text-gray-900">{viewTeacher.gender}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1 text-sm text-gray-900">{viewTeacher.department?.name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Qualification</h3>
                <p className="mt-1 text-sm text-gray-900">{viewTeacher.qualification}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Join Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(viewTeacher.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 text-sm text-gray-900">{viewTeacher.address}</p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setViewTeacher(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
            Are you sure you want to delete teacher "{confirmDelete?.firstName} {confirmDelete?.lastName}"?
            This action cannot be undone and may affect related subject assignments.
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

export default Teachers;
