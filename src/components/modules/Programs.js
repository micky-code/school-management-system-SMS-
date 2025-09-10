import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert 
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Programs = () => {
  // State variables
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [mainPrograms, setMainPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    degree_id: '',
    main_program_id: null,
    description: '',
    status: 1
  });

  // Load programs, departments, and degree levels on component mount and when pagination/search changes
  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
    fetchDegreeLevels();
  }, [pagination.page, searchTerm]);

  // Fetch programs from API
  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.programs.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setPrograms(response.data || []);
      setMainPrograms(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs. Please try again.');
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

  // Fetch degree levels for dropdown
  const fetchDegreeLevels = async () => {
    try {
      // If you have a dedicated endpoint for degree levels, use it
      // For now, we'll use a mock list
      setDegreeLevels([
        { id: 1, name: 'Associate Degree' },
        { id: 2, name: 'Bachelor Degree' },
        { id: 3, name: 'Master Degree' },
        { id: 4, name: 'Doctoral Degree' }
      ]);
    } catch (err) {
      console.error('Error fetching degree levels:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              name === 'main_program_id' && value === '' ? null : value
    });
  };

  // Open modal for creating new program
  const handleAddNew = () => {
    setCurrentProgram(null);
    setFormData({
      name: '',
      department_id: departments.length > 0 ? departments[0].id : '',
      degree_id: degreeLevels.length > 0 ? degreeLevels[0].id : '',
      main_program_id: null,
      description: '',
      status: 1
    });
    setShowModal(true);
  };

  // Open modal for editing existing program
  const handleEdit = (program) => {
    setCurrentProgram(program);
    setFormData({
      name: program.name || program.program_name,
      department_id: program.department_id || '',
      degree_id: program.degree_id || '',
      main_program_id: program.main_program_id || null,
      description: program.description || '',
      status: program.status || 1
    });
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentProgram) {
        // Update existing program
        await ApiAdapter.programs.update(currentProgram.id, formData);
      } else {
        // Create new program
        await ApiAdapter.programs.create(formData);
      }
      
      setShowModal(false);
      fetchPrograms();
    } catch (err) {
      console.error('Error saving program:', err);
      setError('Failed to save program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete program
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.programs.delete(id);
      fetchPrograms();
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Failed to delete program. Please try again.');
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

  // Get degree level name by id
  const getDegreeLevelName = (degreeId) => {
    const degreeLevel = degreeLevels.find(d => d.id === degreeId);
    return degreeLevel ? degreeLevel.name : 'N/A';
  };

  // Get main program name by id
  const getMainProgramName = (programId) => {
    if (!programId) return 'N/A';
    const program = mainPrograms.find(p => p.id === programId);
    return program ? (program.name || program.program_name) : 'N/A';
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Programs</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Program
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
                  placeholder="Search programs..."
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
          
          {/* Programs Table */}
          {loading && programs.length === 0 ? (
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
                    <th>Department</th>
                    <th>Degree Level</th>
                    <th>Main Program</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No programs found
                      </td>
                    </tr>
                  ) : (
                    programs.map((program, index) => (
                      <tr key={program.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{program.name || program.program_name}</td>
                        <td>{getDepartmentName(program.department_id)}</td>
                        <td>{getDegreeLevelName(program.degree_id)}</td>
                        <td>{getMainProgramName(program.main_program_id)}</td>
                        <td>
                          <span className={`badge ${program.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                            {program.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(program)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(program.id)}
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
            {currentProgram ? 'Edit Program' : 'Add New Program'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Program Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Program name"
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
              <Form.Label>Degree Level</Form.Label>
              <Form.Select
                name="degree_id"
                value={formData.degree_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Degree Level</option>
                {degreeLevels.map(degree => (
                  <option key={degree.id} value={degree.id}>
                    {degree.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Main Program (Optional)</Form.Label>
              <Form.Select
                name="main_program_id"
                value={formData.main_program_id || ''}
                onChange={handleInputChange}
              >
                <option value="">None (This is a main program)</option>
                {mainPrograms.filter(p => p.id !== (currentProgram?.id || -1)).map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name || program.program_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select a parent program if this is a specialization or concentration
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Program description"
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

export default Programs;
