import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgramService from '../../services/program.service';
import DepartmentService from '../../services/department.service';
import DegreeLevelService from '../../services/degreeLevel.service';

const ProgramSchema = Yup.object().shape({
  program_name: Yup.string()
    .required('Program name is required')
    .min(2, 'Program name must be at least 2 characters')
    .max(100, 'Program name must be at most 100 characters'),
  department_id: Yup.number()
    .required('Department is required')
    .positive('Please select a valid department'),
  degree_id: Yup.number()
    .required('Degree level is required')
    .positive('Please select a valid degree level'),
  main_program_id: Yup.number()
    .nullable()
    .positive('Please select a valid main program')
});

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [mainPrograms, setMainPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch programs with enhanced data including department and degree level info
  const fetchPrograms = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching programs with search:', search, 'page:', page);
      
      const response = await ProgramService.getAll(page, 10, search);
      console.log('Programs API response:', response);
      
      if (response.success === false) {
        setError(response.error || 'Failed to fetch programs');
        setPrograms([]);
      } else {
        // Handle different response formats
        if (response.data && Array.isArray(response.data)) {
          setPrograms(response.data);
          setTotalPages(response.totalPages || Math.ceil((response.count || 0) / 10));
          setError('');
        } else if (response.rows && Array.isArray(response.rows)) {
          setPrograms(response.rows);
          setTotalPages(Math.ceil((response.count || 0) / 10));
          setError('');
        } else if (Array.isArray(response)) {
          setPrograms(response);
          setTotalPages(Math.ceil(response.length / 10));
          setError('');
        } else {
          setPrograms([]);
          setTotalPages(1);
          setError('Received unexpected data format from server');
        }
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Failed to fetch programs. Please try again.');
      setPrograms([]);
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
          setDepartments([]);
        }
      } else {
        console.error('Failed to fetch departments:', response.error);
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  // Fetch degree levels for dropdown
  const fetchDegreeLevels = async () => {
    try {
      const response = await DegreeLevelService.getAll();
      console.log('Degree levels API response:', response);
      
      if (response.success !== false) {
        if (response.data && Array.isArray(response.data)) {
          setDegreeLevels(response.data);
        } else if (response.rows && Array.isArray(response.rows)) {
          setDegreeLevels(response.rows);
        } else if (Array.isArray(response)) {
          setDegreeLevels(response);
        } else {
          setDegreeLevels([]);
        }
      } else {
        console.error('Failed to fetch degree levels:', response.error);
        setDegreeLevels([]);
      }
    } catch (error) {
      console.error('Error fetching degree levels:', error);
      setDegreeLevels([]);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
    fetchDegreeLevels();
  }, []);

  const handleSearch = ({ search }) => {
    setSearchTerm(search);
    fetchPrograms(1, search);
  };

  const handlePageChange = (page) => {
    fetchPrograms(page, searchTerm);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await ProgramService.delete(id);
      setSuccess('Program deleted successfully');
      fetchPrograms(currentPage, searchTerm);
      setConfirmDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete program');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      if (editingProgram) {
        await ProgramService.update(editingProgram.id, values);
        setSuccess('Program updated successfully');
      } else {
        await ProgramService.create(values);
        setSuccess('Program created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingProgram(null);
      fetchPrograms(currentPage, searchTerm);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save program');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'program_name', 
      label: 'Program Name',
      render: (item) => item.program_name || item.name || 'N/A'
    },
    { 
      key: 'department_name', 
      label: 'Department',
      render: (item) => item.department_name || 'N/A'
    },
    { 
      key: 'degree_level', 
      label: 'Degree Level',
      render: (item) => item.degree_level || item.degree || 'N/A'
    },
    { 
      key: 'main_program_name', 
      label: 'Main Program',
      render: (item) => item.main_program_name || 'N/A'
    },
    { 
      key: 'student_count', 
      label: 'Students',
      render: (item) => item.student_count || '0'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Programs</h1>
        <button
          onClick={() => {
            setEditingProgram(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Program
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

      {loading && !programs.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <Table
              columns={columns}
              data={programs}
              actions={true}
              onEdit={handleEdit}
              onDelete={(program) => setConfirmDelete(program)}
            />
          </div>

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
        title={editingProgram ? 'Edit Program' : 'Add Program'}
      >
        <Formik
          initialValues={{
            program_name: editingProgram?.program_name || editingProgram?.name || '',
            department_id: editingProgram?.department_id || '',
            degree_id: editingProgram?.degree_id || '',
            main_program_id: editingProgram?.main_program_id || ''
          }}
          validationSchema={ProgramSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="program_name" className="form-label">
                  Program Name
                </label>
                <Field
                  type="text"
                  id="program_name"
                  name="program_name"
                  className="form-input"
                  placeholder="e.g., Computer Science"
                />
                <ErrorMessage
                  name="program_name"
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
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name || dept.name}
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
                <label htmlFor="degree_id" className="form-label">
                  Degree Level
                </label>
                <Field
                  as="select"
                  id="degree_id"
                  name="degree_id"
                  className="form-input"
                >
                  <option value="">Select Degree Level</option>
                  {degreeLevels.map((degree) => (
                    <option key={degree.id} value={degree.id}>
                      {degree.degree || degree.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="degree_id"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="main_program_id" className="form-label">
                  Main Program (Optional)
                </label>
                <Field
                  as="select"
                  id="main_program_id"
                  name="main_program_id"
                  className="form-input"
                >
                  <option value="">Select Main Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.program_name || program.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="main_program_id"
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
            Are you sure you want to delete the program "{confirmDelete?.program_name || confirmDelete?.name}"?
            This action cannot be undone.
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

export default Programs;
