import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Batches = () => {
  // State variables
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    batch_name: '',
    program_id: '',
    academic_year_id: '',
    start_date: '',
    end_date: '',
    capacity: 30,
    description: '',
    status: 1
  });

  // Load batches, programs, and academic years on component mount and when pagination/search changes
  useEffect(() => {
    fetchBatches();
    fetchPrograms();
    fetchAcademicYears();
  }, [pagination.page, searchTerm]);

  // Fetch batches from API
  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.batches.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setBatches(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batches. Please try again.');
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

  // Fetch academic years for dropdown
  const fetchAcademicYears = async () => {
    try {
      const response = await ApiAdapter.academicYears.getAll(1, 100, '');
      setAcademicYears(response.data || []);
    } catch (err) {
      console.error('Error fetching academic years:', err);
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

  // Open modal for creating new batch
  const handleAddNew = () => {
    setCurrentBatch(null);
    setFormData({
      batch_name: '',
      program_id: programs.length > 0 ? programs[0].id : '',
      academic_year_id: academicYears.length > 0 ? academicYears[0].id : '',
      start_date: '',
      end_date: '',
      capacity: 30,
      description: '',
      status: 1
    });
    setShowModal(true);
  };

  // Open modal for editing existing batch
  const handleEdit = (batch) => {
    setCurrentBatch(batch);
    setFormData({
      batch_name: batch.batch_name || batch.name || '',
      program_id: batch.program_id || '',
      academic_year_id: batch.academic_year_id || '',
      start_date: batch.start_date ? batch.start_date.split('T')[0] : '',
      end_date: batch.end_date ? batch.end_date.split('T')[0] : '',
      capacity: batch.capacity || 30,
      description: batch.description || '',
      status: batch.status || 1
    });
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentBatch) {
        // Update existing batch
        await ApiAdapter.batches.update(currentBatch.id, formData);
      } else {
        // Create new batch
        await ApiAdapter.batches.create(formData);
      }
      
      setShowModal(false);
      fetchBatches();
    } catch (err) {
      console.error('Error saving batch:', err);
      setError('Failed to save batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete batch
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.batches.delete(id);
      fetchBatches();
    } catch (err) {
      console.error('Error deleting batch:', err);
      setError('Failed to delete batch. Please try again.');
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

  // Get academic year name by id
  const getAcademicYearName = (academicYearId) => {
    const academicYear = academicYears.find(a => a.id === academicYearId);
    return academicYear ? academicYear.academic_year : 'N/A';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Batches</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Batch
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
                  placeholder="Search batches..."
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
          
          {/* Batches Table */}
          {loading && batches.length === 0 ? (
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
                    <th>Batch Name</th>
                    <th>Program</th>
                    <th>Academic Year</th>
                    <th>Duration</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No batches found
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch, index) => (
                      <tr key={batch.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{batch.batch_name || batch.name}</td>
                        <td>{getProgramName(batch.program_id)}</td>
                        <td>{getAcademicYearName(batch.academic_year_id)}</td>
                        <td>
                          {formatDate(batch.start_date)} - {formatDate(batch.end_date)}
                        </td>
                        <td>{batch.capacity || 'N/A'}</td>
                        <td>
                          <Badge bg={batch.status === 1 ? 'success' : 'secondary'}>
                            {batch.status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(batch)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(batch.id)}
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
            {currentBatch ? 'Edit Batch' : 'Add New Batch'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Batch Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="batch_name"
                    value={formData.batch_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Batch name"
                  />
                </Form.Group>
              </Col>
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
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year</Form.Label>
                  <Form.Select
                    name="academic_year_id"
                    value={formData.academic_year_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.academic_year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Maximum number of students"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Batch description"
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

export default Batches;
