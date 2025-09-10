import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Image, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';
import { formatDate } from '../../utils/formatters';

const Students = () => {
  // State variables
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    gender: 'M',
    date_of_birth: '',
    email: '',
    phone: '',
    address: '',
    
    // Academic Information
    student_id: '',
    program_id: '',
    batch_id: '',
    enrollment_date: '',
    graduation_date: '',
    status_id: 1,
    
    // Parent/Guardian Information
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    parent_address: '',
    relationship: '',
    
    // Additional Information
    profile_picture: null,
    notes: ''
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Load students, programs, and batches on component mount and when pagination/search changes
  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchBatches();
  }, [pagination.page, searchTerm]);

  // Fetch students from API
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.students.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setStudents(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch programs for dropdown
  const fetchPrograms = async () => {
    try {
      const response = await ApiAdapter.programs.getAll(1, 100, '');
      setPrograms(response.data || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  // Fetch batches for dropdown
  const fetchBatches = async () => {
    try {
      const response = await ApiAdapter.batches.getAll(1, 100, '');
      setBatches(response.data || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
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

  // Open modal for creating new student
  const handleAddNew = () => {
    setCurrentStudent(null);
    setFormData({
      // Personal Information
      first_name: '',
      last_name: '',
      gender: 'M',
      date_of_birth: '',
      email: '',
      phone: '',
      address: '',
      
      // Academic Information
      student_id: '',
      program_id: programs.length > 0 ? programs[0].id : '',
      batch_id: batches.length > 0 ? batches[0].id : '',
      enrollment_date: new Date().toISOString().split('T')[0],
      graduation_date: '',
      status_id: 1,
      
      // Parent/Guardian Information
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      parent_address: '',
      relationship: '',
      
      // Additional Information
      profile_picture: null,
      notes: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setActiveTab('personal');
    setShowModal(true);
  };

  // Open modal for editing existing student
  const handleEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      // Personal Information
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      gender: student.gender || 'M',
      date_of_birth: student.date_of_birth ? formatDate(student.date_of_birth, 'yyyy-MM-dd') : '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      
      // Academic Information
      student_id: student.student_id || '',
      program_id: student.program_id || '',
      batch_id: student.batch_id || '',
      enrollment_date: student.enrollment_date ? formatDate(student.enrollment_date, 'yyyy-MM-dd') : '',
      graduation_date: student.graduation_date ? formatDate(student.graduation_date, 'yyyy-MM-dd') : '',
      status_id: student.status_id || 1,
      
      // Parent/Guardian Information
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      parent_email: student.parent_email || '',
      parent_address: student.parent_address || '',
      relationship: student.relationship || '',
      
      // Additional Information
      profile_picture: null,
      notes: student.notes || ''
    });
    setSelectedFile(null);
    setPreviewUrl(student.profile_picture || '');
    setActiveTab('personal');
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
      
      if (currentStudent) {
        // Update existing student
        await ApiAdapter.students.update(currentStudent.id, formDataToSend);
      } else {
        // Create new student
        await ApiAdapter.students.create(formDataToSend);
      }
      
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      setError('Failed to save student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete student
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.students.delete(id);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
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

  // Get program name by id
  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? (program.name || program.program_name) : 'N/A';
  };

  // Get batch name by id
  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? (batch.name || batch.batch_name) : 'N/A';
  };

  // Get full name
  const getFullName = (student) => {
    return `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A';
  };

  // Get status label
  const getStatusLabel = (statusId) => {
    const statusMap = {
      1: { label: 'Active', class: 'bg-success' },
      2: { label: 'Inactive', class: 'bg-secondary' },
      3: { label: 'Graduated', class: 'bg-primary' },
      4: { label: 'Suspended', class: 'bg-warning' },
      5: { label: 'Withdrawn', class: 'bg-danger' }
    };
    
    return statusMap[statusId] || { label: 'Unknown', class: 'bg-secondary' };
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Students</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Student
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
                  placeholder="Search students by name, ID, email, or phone..."
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
          
          {/* Students Table */}
          {loading && students.length === 0 ? (
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
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Batch</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student, index) => {
                      const status = getStatusLabel(student.status_id);
                      return (
                        <tr key={student.id}>
                          <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                          <td>
                            {student.profile_picture ? (
                              <Image 
                                src={student.profile_picture} 
                                roundedCircle 
                                width={40} 
                                height={40} 
                                className="object-fit-cover"
                                alt={getFullName(student)}
                              />
                            ) : (
                              <div 
                                className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                {student.first_name?.charAt(0) || ''}
                                {student.last_name?.charAt(0) || ''}
                              </div>
                            )}
                          </td>
                          <td>{student.student_id || 'N/A'}</td>
                          <td>{getFullName(student)}</td>
                          <td>{getProgramName(student.program_id)}</td>
                          <td>{getBatchName(student.batch_id)}</td>
                          <td>{student.email || 'N/A'}</td>
                          <td>{student.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge ${status.class}`}>
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(student)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDelete(student.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
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
            {currentStudent ? 'Edit Student' : 'Add New Student'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="personal" title="Personal Information">
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
                          <Form.Label>Date of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
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
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="academic" title="Academic Information">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        required
                        placeholder="Student ID"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status_id"
                        value={formData.status_id}
                        onChange={handleInputChange}
                      >
                        <option value={1}>Active</option>
                        <option value={2}>Inactive</option>
                        <option value={3}>Graduated</option>
                        <option value={4}>Suspended</option>
                        <option value={5}>Withdrawn</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Program</Form.Label>
                      <Form.Select
                        name="program_id"
                        value={formData.program_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Program</option>
                        {programs.map(program => (
                          <option key={program.id} value={program.id}>
                            {program.name || program.program_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Batch</Form.Label>
                      <Form.Select
                        name="batch_id"
                        value={formData.batch_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                          <option key={batch.id} value={batch.id}>
                            {batch.name || batch.batch_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enrollment Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="enrollment_date"
                        value={formData.enrollment_date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expected Graduation Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="graduation_date"
                        value={formData.graduation_date}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="parent" title="Parent/Guardian">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Parent/Guardian Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleInputChange}
                        placeholder="Full name"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Relationship</Form.Label>
                      <Form.Control
                        type="text"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleInputChange}
                        placeholder="e.g., Father, Mother, Guardian"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="parent_phone"
                        value={formData.parent_phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="parent_email"
                        value={formData.parent_email}
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
                    rows={2}
                    name="parent_address"
                    value={formData.parent_address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                  />
                </Form.Group>
              </Tab>
              
              <Tab eventKey="additional" title="Additional Info">
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information about the student"
                  />
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

export default Students;
