import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Image 
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';
import { formatDate } from '../../utils/formatters';

const Teachers = () => {
  // State variables
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
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
    email: '',
    phone: '',
    department_id: '',
    hire_date: '',
    qualification: '',
    address: '',
    gender: 'M',
    status: 1,
    profile_picture: null
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Load teachers and departments on component mount and when pagination/search changes
  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, [pagination.page, searchTerm]);

  // Fetch teachers from API
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.teachers.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setTeachers(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again.');
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
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({
        ...formData,
        profile_picture: file
      });
    }
  };

  // Open modal for creating new teacher
  const handleAddNew = () => {
    setCurrentTeacher(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: departments.length > 0 ? departments[0].id : '',
      hire_date: new Date().toISOString().split('T')[0],
      qualification: '',
      address: '',
      gender: 'M',
      status: 1,
      profile_picture: null
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowModal(true);
  };

  // Open modal for editing existing teacher
  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      department_id: teacher.department_id || '',
      hire_date: teacher.hire_date ? formatDate(teacher.hire_date, 'yyyy-MM-dd') : '',
      qualification: teacher.qualification || '',
      address: teacher.address || '',
      gender: teacher.gender || 'M',
      status: teacher.status || 1,
      profile_picture: null
    });
    setSelectedFile(null);
    setPreviewUrl(teacher.profile_picture || '');
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'profile_picture' || (key === 'profile_picture' && formData[key])) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (currentTeacher) {
        // Update existing teacher
        await ApiAdapter.teachers.update(currentTeacher.id, formDataToSend);
      } else {
        // Create new teacher
        await ApiAdapter.teachers.create(formDataToSend);
      }
      
      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      console.error('Error saving teacher:', err);
      setError('Failed to save teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.teachers.delete(id);
      fetchTeachers();
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError('Failed to delete teacher. Please try again.');
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

  // Get full name
  const getFullName = (teacher) => {
    return `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'N/A';
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Teachers</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Teacher
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
                  placeholder="Search teachers by name, email, or phone..."
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
          
          {/* Teachers Table */}
          {loading && teachers.length === 0 ? (
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
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Hire Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No teachers found
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher, index) => (
                      <tr key={teacher.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>
                          {teacher.profile_picture ? (
                            <Image 
                              src={teacher.profile_picture} 
                              roundedCircle 
                              width={40} 
                              height={40} 
                              className="object-fit-cover"
                              alt={getFullName(teacher)}
                            />
                          ) : (
                            <div 
                              className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '40px', height: '40px' }}
                            >
                              {teacher.first_name?.charAt(0) || ''}
                              {teacher.last_name?.charAt(0) || ''}
                            </div>
                          )}
                        </td>
                        <td>{getFullName(teacher)}</td>
                        <td>{teacher.email || 'N/A'}</td>
                        <td>{teacher.phone || 'N/A'}</td>
                        <td>{getDepartmentName(teacher.department_id)}</td>
                        <td>{teacher.hire_date ? formatDate(teacher.hire_date) : 'N/A'}</td>
                        <td>
                          <span className={`badge ${teacher.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                            {teacher.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(teacher)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(teacher.id)}
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
            {currentTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={4} className="text-center mb-3">
                {/* Profile Picture Preview */}
                <div className="mb-3">
                  {previewUrl ? (
                    <Image 
                      src={previewUrl} 
                      roundedCircle 
                      className="object-fit-cover"
                      style={{ width: '150px', height: '150px' }}
                      alt="Profile Preview"
                    />
                  ) : (
                    <div 
                      className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                    >
                      {formData.first_name?.charAt(0) || ''}
                      {formData.last_name?.charAt(0) || ''}
                    </div>
                  )}
                </div>
                
                {/* Profile Picture Upload */}
                <Form.Group>
                  <Form.Label>Profile Picture</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={8}>
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
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Email address"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
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
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hire Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="hire_date"
                        value={formData.hire_date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Qualification</Form.Label>
                      <Form.Control
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        placeholder="e.g., PhD in Computer Science"
                      />
                    </Form.Group>
                  </Col>
                  
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
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
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
              </Col>
            </Row>
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

export default Teachers;
