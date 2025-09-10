import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SubjectService from '../../services/subject.service';

const SubjectSchema = Yup.object().shape({
  code: Yup.string()
    .required('Subject code is required')
    .min(2, 'Subject code must be at least 2 characters')
    .max(20, 'Subject code must be at most 20 characters'),
  name: Yup.string()
    .required('Subject name is required')
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name must be at most 100 characters'),
  credits: Yup.number()
    .required('Credits are required')
    .min(1, 'Credits must be at least 1')
    .max(10, 'Credits must be at most 10'),
  description: Yup.string()
    .max(500, 'Description must be at most 500 characters')
});

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSubjects = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await SubjectService.getAll(page, 10, search);
      
      if (response && response.success && response.rows) {
        setSubjects(response.rows || []);
        setTotalPages(Math.ceil((response.count || 0) / 10));
      } else if (response && response.rows) {
        setSubjects(response.rows || []);
        setTotalPages(Math.ceil((response.count || 0) / 10));
      } else {
        setSubjects([]);
        setTotalPages(1);
      }
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to fetch subjects. Please try again.');
      setSubjects([]);
      setTotalPages(1);
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSearch = ({ search }) => {
    fetchSubjects(1, search);
  };

  const handlePageChange = (page) => {
    fetchSubjects(page);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await SubjectService.delete(id);
      setSuccess('Subject deleted successfully');
      fetchSubjects(currentPage);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      
      // Handle specific error messages
      if (error.message && typeof error.message === 'string') {
        setError(error.message);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete subject. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      if (editingSubject) {
        await SubjectService.update(editingSubject.id, values);
        setSuccess('Subject updated successfully');
      } else {
        await SubjectService.create(values);
        setSuccess('Subject created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingSubject(null);
      fetchSubjects(currentPage);
    } catch (error) {
      console.error('Submit error:', error);
      
      // Handle specific error messages
      if (error.message && typeof error.message === 'string') {
        setError(error.message);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save subject. Please try again.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'subject_code', label: 'Code' },
    { key: 'subject_name', label: 'Subject Name' },
    { key: 'major_name', label: 'Major' },
    { key: 'description', label: 'Description' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Subjects</h1>
        <button
          onClick={() => {
            setEditingSubject(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Subject
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

      {loading && !subjects.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={subjects}
            actions={true}
            onEdit={handleEdit}
            onDelete={(subject) => setConfirmDelete(subject)}
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
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
      >
        <Formik
          initialValues={{
            code: editingSubject?.subject_code || '',
            name: editingSubject?.subject_name || '',
            credits: editingSubject?.credit || editingSubject?.credits || 3,
            description: editingSubject?.description || ''
          }}
          validationSchema={SubjectSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="code" className="form-label">
                  Subject Code
                </label>
                <Field
                  type="text"
                  id="code"
                  name="code"
                  className="form-input"
                  placeholder="e.g., CS101"
                />
                <ErrorMessage
                  name="code"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="name" className="form-label">
                  Subject Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Introduction to Computer Science"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="credits" className="form-label">
                  Credits
                </label>
                <Field
                  type="number"
                  id="credits"
                  name="credits"
                  min="1"
                  max="10"
                  className="form-input"
                />
                <ErrorMessage
                  name="credits"
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
                  placeholder="Subject description..."
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
            Are you sure you want to delete the subject "{confirmDelete?.subject_name}" ({confirmDelete?.subject_code})?
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

export default Subjects;
