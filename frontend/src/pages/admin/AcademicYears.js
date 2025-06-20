import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AcademicYearService from '../../services/academicYear.service';

const AcademicYearSchema = Yup.object().shape({
  name: Yup.string()
    .required('Academic year name is required')
    .matches(/^\d{4}-\d{4}$/, 'Format must be YYYY-YYYY (e.g., 2024-2025)'),
  startDate: Yup.date()
    .required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(
      Yup.ref('startDate'),
      'End date must be after start date'
    )
});

const AcademicYears = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAcademicYears = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await AcademicYearService.getAll(page, 10, search);
      setAcademicYears(response.rows);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to fetch academic years. Please try again.');
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleSearch = ({ search }) => {
    fetchAcademicYears(1, search);
  };

  const handlePageChange = (page) => {
    fetchAcademicYears(page);
  };

  const handleEdit = (year) => {
    setEditingYear(year);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await AcademicYearService.delete(id);
      setSuccess('Academic year deleted successfully');
      fetchAcademicYears(currentPage);
      setConfirmDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete academic year');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrent = async (id) => {
    try {
      setLoading(true);
      await AcademicYearService.setCurrent(id);
      setSuccess('Current academic year updated successfully');
      fetchAcademicYears(currentPage);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update current academic year');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      if (editingYear) {
        await AcademicYearService.update(editingYear.id, values);
        setSuccess('Academic year updated successfully');
      } else {
        await AcademicYearService.create(values);
        setSuccess('Academic year created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingYear(null);
      fetchAcademicYears(currentPage);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save academic year');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Academic Year' },
    { key: 'startDate', label: 'Start Date', render: (item) => new Date(item.startDate).toLocaleDateString() },
    { key: 'endDate', label: 'End Date', render: (item) => new Date(item.endDate).toLocaleDateString() },
    { 
      key: 'isCurrent', 
      label: 'Status', 
      render: (item) => item.isCurrent ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          Current
        </span>
      ) : (
        <button
          onClick={() => handleSetCurrent(item.id)}
          className="text-blue-600 hover:text-blue-900"
        >
          Set as Current
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Academic Years</h1>
        <button
          onClick={() => {
            setEditingYear(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Add Academic Year
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

      {loading && !academicYears.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={academicYears}
            actions={true}
            onEdit={handleEdit}
            onDelete={(year) => setConfirmDelete(year)}
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
        title={editingYear ? 'Edit Academic Year' : 'Add Academic Year'}
      >
        <Formik
          initialValues={{
            name: editingYear?.name || '',
            startDate: editingYear?.startDate ? new Date(editingYear.startDate).toISOString().split('T')[0] : '',
            endDate: editingYear?.endDate ? new Date(editingYear.endDate).toISOString().split('T')[0] : ''
          }}
          validationSchema={AcademicYearSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Academic Year Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="e.g., 2024-2025"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>
                <Field
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                />
                <ErrorMessage
                  name="startDate"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>
                <Field
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="form-input"
                />
                <ErrorMessage
                  name="endDate"
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
            Are you sure you want to delete the academic year "{confirmDelete?.name}"?
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

export default AcademicYears;
