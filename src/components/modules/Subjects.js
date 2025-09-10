import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert 
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Subjects = () => {
  // State variables
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credit: 3,
    department_id: '',
    description: '',
    status: 1
  });

  // Load subjects and departments on component mount and when pagination/search changes
  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, [pagination.page, searchTerm]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.subjects.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setSubjects(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      const response = await ApiAdapter.departments.getAll(1, 100, '');
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'credit' ? parseInt(value, 10) || 0 : value
    });
  };

  // Open modal for creating new subject
  const handleAddNew = () => {
    setCurrentSubject(null);
    setFormData({
      name: '',
      code: '',
      credit: 3,
      department_id: departments.length > 0 ? departments[0].id : '',
      description: '',
      status: 1
    });
    setShowModal(true);
  };

  // Open modal for editing existing subject
  const handleEdit = (subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name || subject.subject_name,
      code: subject.code || subject.subject_code || '',
      credit: subject.credit || 3,
      department_id: subject.department_id || '',
      description: subject.description || '',
      status: subject.status || 1
    });
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentSubject) {
        // Update existing subject
        await ApiAdapter.subjects.update(currentSubject.id, formData);
      } else {
        // Create new subject
        await ApiAdapter.subjects.create(formData);
      }
      
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      console.error('Error saving subject:', err);
      setError('Failed to save subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete subject
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.subjects.delete(id);
      fetchSubjects();
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      page
    });
  };

  // Generate pagination items
  const paginationItems = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const items = [];
    
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === pagination.page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    return items;
  };

  // Get department name by id
  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? (department.name || department.department_name) : 'N/A';
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Subjects</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Subject
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Search and Filter */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search subjects by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {/* Subjects Table */}
          {loading && subjects.length === 0 ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credit</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No subjects found
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject, index) => (
                      <tr key={subject.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{subject.code || subject.subject_code || 'N/A'}</td>
                        <td>{subject.name || subject.subject_name}</td>
                        <td>{subject.credit || 'N/A'}</td>
                        <td>{getDepartmentName(subject.department_id)}</td>
                        <td>
                          <span className={`badge ${subject.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                            {subject.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(subject)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(subject.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              
              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    />
                    {paginationItems()}
                    <Pagination.Next 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.limit))}
                      disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentSubject ? 'Edit Subject' : 'Add New Subject'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Subject Code</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., CS101"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Subject Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Subject name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Credit Hours</Form.Label>
              <Form.Control
                type="number"
                name="credit"
                value={formData.credit}
                onChange={handleInputChange}
                required
                min="0"
                max="10"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name || department.department_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Subject description"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                'Save'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Subjects;
