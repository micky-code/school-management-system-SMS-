import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ManageSubjectService from '../../services/manageSubject.service';
import SubjectService from '../../services/subject.service';
import TeacherService from '../../services/teacher.service';
import MajorService from '../../services/major.service';
import AcademicYearService from '../../services/academicYear.service';

const ManageSubjectSchema = Yup.object().shape({
  subjectId: Yup.number()
    .required('Subject is required'),
  teacherId: Yup.number()
    .required('Teacher is required'),
  majorId: Yup.number()
    .required('Major is required'),
  academicYearId: Yup.number()
    .required('Academic year is required'),
  semester: Yup.number()
    .required('Semester is required')
    .min(1, 'Semester must be at least 1')
    .max(3, 'Semester must be at most 3')
});

const ManageSubjects = () => {
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [majors, setMajors] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filters, setFilters] = useState({
    majorId: '',
    academicYearId: '',
    semester: '',
    teacherId: '',
    subjectId: ''
  });

  const fetchSubjectAssignments = async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const response = await ManageSubjectService.getAll(
        page, 
        10, 
        search, 
        filterParams.majorId,
        filterParams.academicYearId,
        filterParams.semester,
        filterParams.teacherId,
        filterParams.subjectId
      );
      setSubjectAssignments(response.rows);
      setTotalPages(Math.ceil(response.count / 10));
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to fetch subject assignments. Please try again.');
      console.error('Error fetching subject assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await SubjectService.getAll(1, 100);
      setSubjects(response.rows);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const fetchMajors = async () => {
    try {
      const response = await MajorService.getAll(1, 100);
      setMajors(response.rows);
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicYearService.getAll(1, 100);
      setAcademicYears(response.rows);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  useEffect(() => {
    fetchSubjectAssignments();
    fetchSubjects();
    fetchTeachers();
    fetchMajors();
    fetchAcademicYears();
  }, []);

  const handleSearch = (searchFilters) => {
    const { search, ...otherFilters } = searchFilters;
    setFilters(otherFilters);
    fetchSubjectAssignments(1, search, otherFilters);
  };

  const handlePageChange = (page) => {
    fetchSubjectAssignments(page, '', filters);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await ManageSubjectService.delete(id);
      setSuccess('Subject assignment deleted successfully');
      fetchSubjectAssignments(currentPage, '', filters);
      setConfirmDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete subject assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      if (editingAssignment) {
        await ManageSubjectService.update(editingAssignment.id, values);
        setSuccess('Subject assignment updated successfully');
      } else {
        await ManageSubjectService.create(values);
        setSuccess('Subject assignment created successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
      setEditingAssignment(null);
      fetchSubjectAssignments(currentPage, '', filters);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save subject assignment');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      key: 'subject', 
      label: 'Subject',
      render: (item) => `${item.subject?.code} - ${item.subject?.name}` || 'N/A'
    },
    { 
      key: 'teacher', 
      label: 'Teacher',
      render: (item) => item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : 'N/A'
    },
    { 
      key: 'major', 
      label: 'Major',
      render: (item) => item.major?.name || 'N/A'
    },
    { 
      key: 'academicYear', 
      label: 'Academic Year',
      render: (item) => item.academicYear?.name || 'N/A'
    },
    { 
      key: 'semester', 
      label: 'Semester'
    }
  ];

  const searchFilters = [
    {
      name: 'majorId',
      label: 'Major',
      options: majors.map(major => ({
        value: major.id,
        label: major.name
      }))
    },
    {
      name: 'academicYearId',
      label: 'Academic Year',
      options: academicYears.map(year => ({
        value: year.id,
        label: year.name
      }))
    },
    {
      name: 'semester',
      label: 'Semester',
      options: [
        { value: 1, label: 'Semester 1' },
        { value: 2, label: 'Semester 2' },
        { value: 3, label: 'Semester 3' }
      ]
    },
    {
      name: 'teacherId',
      label: 'Teacher',
      options: teachers.map(teacher => ({
        value: teacher.id,
        label: `${teacher.firstName} ${teacher.lastName}`
      }))
    },
    {
      name: 'subjectId',
      label: 'Subject',
      options: subjects.map(subject => ({
        value: subject.id,
        label: `${subject.code} - ${subject.name}`
      }))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Subject Assignments</h1>
        <button
          onClick={() => {
            setEditingAssignment(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          Assign Subject
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

      <SearchFilter onSearch={handleSearch} filters={searchFilters} />

      {loading && !subjectAssignments.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={subjectAssignments}
            actions={true}
            onEdit={handleEdit}
            onDelete={(assignment) => setConfirmDelete(assignment)}
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
        title={editingAssignment ? 'Edit Subject Assignment' : 'Assign Subject'}
      >
        <Formik
          initialValues={{
            subjectId: editingAssignment?.subjectId || '',
            teacherId: editingAssignment?.teacherId || '',
            majorId: editingAssignment?.majorId || '',
            academicYearId: editingAssignment?.academicYearId || '',
            semester: editingAssignment?.semester || 1
          }}
          validationSchema={ManageSubjectSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="subjectId" className="form-label">
                  Subject
                </label>
                <Field
                  as="select"
                  id="subjectId"
                  name="subjectId"
                  className="form-input"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="subjectId"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="teacherId" className="form-label">
                  Teacher
                </label>
                <Field
                  as="select"
                  id="teacherId"
                  name="teacherId"
                  className="form-input"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="teacherId"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="majorId" className="form-label">
                  Major
                </label>
                <Field
                  as="select"
                  id="majorId"
                  name="majorId"
                  className="form-input"
                >
                  <option value="">Select Major</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="majorId"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="academicYearId" className="form-label">
                  Academic Year
                </label>
                <Field
                  as="select"
                  id="academicYearId"
                  name="academicYearId"
                  className="form-input"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="academicYearId"
                  component="div"
                  className="form-error"
                />
              </div>

              <div>
                <label htmlFor="semester" className="form-label">
                  Semester
                </label>
                <Field
                  as="select"
                  id="semester"
                  name="semester"
                  className="form-input"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                </Field>
                <ErrorMessage
                  name="semester"
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
            Are you sure you want to delete this subject assignment?
            This action cannot be undone and may affect related schedules and marks.
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

export default ManageSubjects;
