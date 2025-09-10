import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Users = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    first_name: '',
    last_name: '',
    role_id: '',
    status: 1,
    phone: '',
    profile_image: null,
    profile_image_preview: null
  });

  // Load users and roles on component mount and when pagination/search changes
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [pagination.page, searchTerm]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.users.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setUsers(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles for dropdown
  const fetchRoles = async () => {
    try {
      const response = await ApiAdapter.roles.getAll();
      setRoles(response.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profile_image: file,
          profile_image_preview: reader.result
        });
      };
      
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Open modal for creating new user
  const handleAddNew = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      password: '',
      confirm_password: '',
      email: '',
      first_name: '',
      last_name: '',
      role_id: roles.length > 0 ? roles[0].id : '',
      status: 1,
      phone: '',
      profile_image: null,
      profile_image_preview: null
    });
    setShowModal(true);
  };

  // Open modal for editing existing user
  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username || '',
      password: '',
      confirm_password: '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role_id: user.role_id || '',
      status: user.status || 1,
      phone: user.phone || '',
      profile_image: null,
      profile_image_preview: user.profile_image_url || null
    });
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match for new users or password changes
    if (formData.password && formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'profile_image' && formData[key]) {
          formDataToSend.append('profile_image', formData[key]);
        } else if (key !== 'profile_image_preview' && key !== 'confirm_password') {
          // Don't send empty password for updates
          if (key !== 'password' || formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      if (currentUser) {
        // Update existing user
        await ApiAdapter.users.update(currentUser.id, formDataToSend);
      } else {
        // Create new user
        await ApiAdapter.users.create(formDataToSend);
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.users.delete(id);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
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

  // Get role name by id
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 1:
        return <Badge bg="success">Active</Badge>;
      case 0:
        return <Badge bg="secondary">Inactive</Badge>;
      case 2:
        return <Badge bg="warning" text="dark">Pending</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">User Management</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New User
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
                  placeholder="Search by username, name, or email..."
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
          
          {/* Users Table */}
          {loading && users.length === 0 ? (
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
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {user.profile_image_url && (
                              <div 
                                className="me-2 rounded-circle overflow-hidden" 
                                style={{ width: '30px', height: '30px' }}
                              >
                                <img 
                                  src={user.profile_image_url} 
                                  alt={user.username} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            )}
                            {user.username}
                          </div>
                        </td>
                        <td>{`${user.first_name || ''} ${user.last_name || ''}`}</td>
                        <td>{user.email}</td>
                        <td>{getRoleName(user.role_id)}</td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(user.id)}
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
            {currentUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="account" className="mb-3">
              <Tab eventKey="account" title="Account Information">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        disabled={currentUser} // Username cannot be changed once created
                        placeholder="Username"
                      />
                    </Form.Group>
                  </Col>
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
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{currentUser ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!currentUser}
                        placeholder="Password"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        required={!currentUser || formData.password !== ''}
                        placeholder="Confirm password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Form.Select>
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
                        <option value={2}>Pending</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              
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
                        placeholder="Last name"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </Form.Group>
              </Tab>
              
              <Tab eventKey="profile" title="Profile Image">
                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="profile_image"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                  <Form.Text className="text-muted">
                    Upload a profile image (optional)
                  </Form.Text>
                </Form.Group>
                
                {formData.profile_image_preview && (
                  <div className="text-center mb-3">
                    <p>Preview:</p>
                    <img 
                      src={formData.profile_image_preview} 
                      alt="Profile Preview" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }} 
                    />
                  </div>
                )}
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

export default Users;
