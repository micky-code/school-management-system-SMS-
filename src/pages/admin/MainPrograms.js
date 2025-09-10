import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MainProgramService from '../../services/mainProgram.service';

const MainProgramSchema = Yup.object().shape({
  name: Yup.string()
    .required('Program name is required')
    .min(2, 'Program name must be at least 2 characters')
    .max(100, 'Program name must be at most 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be at most 500 characters')
});

const MainPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchPrograms = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await MainProgramService.getAll(page, 10, search);
      setPrograms(response.rows);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to fetch programs. Please try again.');
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSearch = ({ search }) => {
    fetchPrograms(1, search);
  };

  const handlePageChange = (page) => {
    fetchPrograms(page);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await MainProgramService.delete(id);
      setSuccess('Program deleted successfully');
      fetchPrograms(currentPage);
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
        await MainProgramService.update(editingProgram.id, values);
        setSuccess('Program updated successfully');
      } else {
        await MainProgramService.create(values);
        setSuccess('Program created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingProgram(null);
      fetchPrograms(currentPage);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save program');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Program Name' },
    { key: 'description', label: 'Description' },
    { 
      key: 'createdAt', 
      label: 'Created At', 
      render: (item) => new Date(item.createdAt).toLocaleDateString() 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Main Programs</h1>
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
          <Table
            columns={columns}
            data={programs}
            actions={true}
            onEdit={handleEdit}
            onDelete={(program) => setConfirmDelete(program)}
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
        title={editingProgram ? 'Edit Program' : 'Add Program'}
      >
        <Formik
          initialValues={{
            name: editingProgram?.name || '',
            description: editingProgram?.description || ''
          }}
          validationSchema={MainProgramSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Program Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="e.g., Bachelor of Science"
                />
                <ErrorMessage
                  name="name"
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
                  placeholder="Program description..."
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
            Are you sure you want to delete the program "{confirmDelete?.name}"?
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

export default MainPrograms;
