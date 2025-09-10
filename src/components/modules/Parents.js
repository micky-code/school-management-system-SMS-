import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Parents = () => {
  // State variables
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentParent, setCurrentParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'M',
    relationship: 'Father',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    emergency_contact: false,
    student_id: '',
    status: 1
  });

  // Load parents and students on component mount and when pagination/search changes
  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, [pagination.page, searchTerm]);

  // Fetch parents from API
  const fetchParents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.parents.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setParents(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError('Failed to load parents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for dropdown
  const fetchStudents = async () => {
    try {
      const response = await ApiAdapter.students.getAll(1, 100, '');
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal for creating new parent
  const handleAddNew = () => {
    setCurrentParent(null);
    setFormData({
      first_name: '',
      last_name: '',
      gender: 'M',
      relationship: 'Father',
      phone: '',
      email: '',
      occupation: '',
      address: '',
      emergency_contact: false,
      student_id: students.length > 0 ? students[0].id : '',
      status: 1
    });
    setShowModal(true);
  };

  // Open modal for editing existing parent
  const handleEdit = (parent) => {
    setCurrentParent(parent);
    setFormData({
      first_name: parent.first_name || '',
      last_name: parent.last_name || '',
      gender: parent.gender || 'M',
      relationship: parent.relationship || 'Father',
      phone: parent.phone || '',
      email: parent.email || '',
      occupation: parent.occupation || '',
      address: parent.address || '',
      emergency_contact: parent.emergency_contact || false,
      student_id: parent.student_id || '',
      status: parent.status || 1
    });
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentParent) {
        // Update existing parent
        await ApiAdapter.parents.update(currentParent.id, formData);
      } else {
        // Create new parent
        await ApiAdapter.parents.create(formData);
      }
      
      setShowModal(false);
      fetchParents();
    } catch (err) {
      console.error('Error saving parent:', err);
      setError('Failed to save parent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete parent
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parent?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.parents.delete(id);
      fetchParents();
    } catch (err) {
      console.error('Error deleting parent:', err);
      setError('Failed to delete parent. Please try again.');
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

  // Get student name by id
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Parents/Guardians</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Parent/Guardian
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
                  placeholder="Search by name, phone, or email..."
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
          
          {/* Parents Table */}
          {loading && parents.length === 0 ? (
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
                    <th>Name</th>
                    <th>Relationship</th>
                    <th>Contact</th>
                    <th>Student</th>
                    <th>Emergency Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No parents/guardians found
                      </td>
                    </tr>
                  ) : (
                    parents.map((parent, index) => (
                      <tr key={parent.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{`${parent.first_name} ${parent.last_name}`}</td>
                        <td>{parent.relationship}</td>
                        <td>
                          <div>{parent.phone}</div>
                          <div className="text-muted small">{parent.email}</div>
                        </td>
                        <td>{getStudentName(parent.student_id)}</td>
                        <td>
                          {parent.emergency_contact ? (
                            <Badge bg="warning" text="dark">Emergency Contact</Badge>
                          ) : (
                            <Badge bg="light" text="dark">Secondary</Badge>
                          )}
                        </td>
                        <td>
                          <Badge bg={parent.status === 1 ? 'success' : 'secondary'}>
                            {parent.status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(parent)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(parent.id)}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentParent ? 'Edit Parent/Guardian' : 'Add New Parent/Guardian'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="personal" className="mb-3">
              <Tab eventKey="personal" title="Personal Information">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        placeholder="First name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Last name"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Relationship</Form.Label>
                      <Form.Select
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other Relative</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Occupation</Form.Label>
                      <Form.Control
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        placeholder="Occupation"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
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
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="contact" title="Contact Information">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Emergency Contact"
                    name="emergency_contact"
                    checked={formData.emergency_contact}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Designate this person as a primary emergency contact
                  </Form.Text>
                </Form.Group>
              </Tab>
              
              <Tab eventKey="student" title="Student Association">
                <Form.Group className="mb-3">
                  <Form.Label>Associated Student</Form.Label>
                  <Form.Select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Select the student this parent/guardian is associated with
                  </Form.Text>
                </Form.Group>
              </Tab>
            </Tabs>
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

export default Parents;
