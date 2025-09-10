import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  InputGroup,
  FormControl,
  Image
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaPhone, FaImage } from 'react-icons/fa';
import * as Yup from 'yup';
import { Formik } from 'formik';
import teacherService from '../../services/teacher.service';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Validation schema for teacher form
  const validationSchema = Yup.object({
    eng_name: Yup.string()
      .min(2, 'English name must be at least 2 characters')
      .max(100, 'English name must be less than 100 characters'),
    khmer_name: Yup.string()
      .min(2, 'Khmer name must be at least 2 characters')
      .max(100, 'Khmer name must be less than 100 characters'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
      .max(20, 'Phone number must be less than 20 characters'),
    positions: Yup.string()
      .max(200, 'Position must be less than 200 characters'),
    user_id: Yup.number()
      .nullable()
      .positive('User ID must be positive')
  }).test('at-least-one-name', 'At least one name (English or Khmer) is required', function(values) {
    return values.eng_name || values.khmer_name;
  });

  // Fetch teachers data
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      });

      if (response.success) {
        setTeachers(response.data || response.rows || []);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
        setError('');
      } else {
        setError(response.message || 'Failed to fetch teachers');
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers data');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load teachers on component mount and when dependencies change
  useEffect(() => {
    fetchTeachers();
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Open modal for adding new teacher
  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setModalMode('add');
    setShowModal(true);
  };

  // Open modal for editing teacher
  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('eng_name', values.eng_name || '');
      formData.append('khmer_name', values.khmer_name || '');
      formData.append('phone', values.phone || '');
      formData.append('positions', values.positions || '');
      formData.append('user_id', values.user_id || '');
      
      if (values.image) {
        formData.append('image', values.image);
      }

      let response;
      if (modalMode === 'add') {
        response = await teacherService.create(formData);
      } else {
        response = await teacherService.update(selectedTeacher.id, formData);
      }

      if (response.success) {
        setSuccess(modalMode === 'add' ? 'Teacher added successfully!' : 'Teacher updated successfully!');
        setShowModal(false);
        resetForm();
        fetchTeachers(); // Refresh the list
      } else {
        setError(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to save teacher');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete teacher
  const handleDeleteTeacher = async (teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.full_name || teacher.eng_name || teacher.khmer_name}?`)) {
      try {
        const response = await teacherService.delete(teacher.id);
        if (response.success) {
          setSuccess('Teacher deleted successfully!');
          fetchTeachers(); // Refresh the list
        } else {
          setError(response.message || 'Failed to delete teacher');
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
        setError('Failed to delete teacher');
      }
    }
  };

  // Get initial form values
  const getInitialValues = () => {
    if (modalMode === 'edit' && selectedTeacher) {
      return {
        eng_name: selectedTeacher.eng_name || '',
        khmer_name: selectedTeacher.khmer_name || '',
        phone: selectedTeacher.phone || '',
        positions: selectedTeacher.positions || '',
        user_id: selectedTeacher.user_id || '',
        image: null
      };
    }
    return {
      eng_name: '',
      khmer_name: '',
      phone: '',
      positions: '',
      user_id: '',
      image: null
    };
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? 'primary' : 'outline-primary'}
          size="sm"
          className="mx-1"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="outline-primary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        {pages}
        <Button
          variant="outline-primary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <FaUser className="me-2" />
                    Teachers Management
                  </h4>
                  <small className="text-muted">
                    Total: {totalCount} teachers
                  </small>
                </Col>
                <Col xs="auto">
                  <Button variant="primary" onClick={handleAddTeacher}>
                    <FaPlus className="me-2" />
                    Add Teacher
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Alerts */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {/* Search */}
              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <FormControl
                      type="text"
                      placeholder="Search by name, phone, position..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Col>
              </Row>

              {/* Teachers Table */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No teachers found</p>
                </div>
              ) : (
                <>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>English Name</th>
                        <th>Khmer Name</th>
                        <th>Phone</th>
                        <th>Position</th>
                        <th>User Info</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.id}>
                          <td>{teacher.id}</td>
                          <td>
                            {teacher.image ? (
                              <Image
                                src={`/uploads/teachers/${teacher.image}`}
                                alt={teacher.full_name}
                                width="40"
                                height="40"
                                className="rounded-circle"
                              />
                            ) : (
                              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                <FaUser className="text-white" />
                              </div>
                            )}
                          </td>
                          <td>{teacher.eng_name || '-'}</td>
                          <td>{teacher.khmer_name || '-'}</td>
                          <td>
                            {teacher.phone ? (
                              <span>
                                <FaPhone className="me-1" />
                                {teacher.phone}
                              </span>
                            ) : '-'}
                          </td>
                          <td>
                            {teacher.positions ? (
                              <Badge bg="info">{teacher.positions}</Badge>
                            ) : '-'}
                          </td>
                          <td>
                            {teacher.email ? (
                              <div>
                                <small className="d-block">{teacher.username}</small>
                                <small className="text-muted">{teacher.email}</small>
                                {teacher.role && <Badge bg="secondary" className="ms-1">{teacher.role}</Badge>}
                              </div>
                            ) : (
                              <small className="text-muted">No user linked</small>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditTeacher(teacher)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'Add New Teacher' : 'Edit Teacher'}
          </Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>English Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="eng_name"
                        value={values.eng_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.eng_name && errors.eng_name}
                        placeholder="Enter English name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.eng_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Khmer Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="khmer_name"
                        value={values.khmer_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.khmer_name && errors.khmer_name}
                        placeholder="Enter Khmer name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.khmer_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.phone && errors.phone}
                        placeholder="Enter phone number"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Position</Form.Label>
                      <Form.Control
                        type="text"
                        name="positions"
                        value={values.positions}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.positions && errors.positions}
                        placeholder="Enter position/title"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.positions}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>User ID (Optional)</Form.Label>
                      <Form.Control
                        type="number"
                        name="user_id"
                        value={values.user_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.user_id && errors.user_id}
                        placeholder="Link to user account"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.user_id}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Optional: Link this teacher to a user account
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Profile Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFieldValue('image', file);
                        }}
                      />
                      <Form.Text className="text-muted">
                        Upload a profile image (max 5MB)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Show current image if editing */}
                {modalMode === 'edit' && selectedTeacher?.image && (
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Image</Form.Label>
                        <div>
                          <Image
                            src={`/uploads/teachers/${selectedTeacher.image}`}
                            alt="Current"
                            width="100"
                            height="100"
                            className="rounded"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {modalMode === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    modalMode === 'add' ? 'Add Teacher' : 'Update Teacher'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default Teachers;
