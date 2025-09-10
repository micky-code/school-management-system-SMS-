import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert 
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';
import { formatDate } from '../../utils/formatters';

const AcademicYears = () => {
  // State variables
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentYear, setCurrentYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  // Load academic years on component mount and when pagination/search changes
  useEffect(() => {
    fetchAcademicYears();
  }, [pagination.page, searchTerm]);

  // Fetch academic years from API
  const fetchAcademicYears = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.academicYears.getAll(
        pagination.page, 
        pagination.limit, 
        searchTerm
      );
      
      setAcademicYears(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching academic years:', err);
      setError('Failed to load academic years. Please try again.');
    } finally {
      setLoading(false);
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

  // Open modal for creating new academic year
  const handleAddNew = () => {
    setCurrentYear(null);
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_current: false
    });
    setShowModal(true);
  };

  // Open modal for editing existing academic year
  const handleEdit = (year) => {
    setCurrentYear(year);
    setFormData({
      name: year.name,
      start_date: formatDateForInput(year.start_date),
      end_date: formatDateForInput(year.end_date),
      is_current: year.is_current
    });
    setShowModal(true);
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentYear) {
        // Update existing academic year
        await ApiAdapter.academicYears.update(currentYear.id, formData);
      } else {
        // Create new academic year
        await ApiAdapter.academicYears.create(formData);
      }
      
      setShowModal(false);
      fetchAcademicYears();
    } catch (err) {
      console.error('Error saving academic year:', err);
      setError('Failed to save academic year. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete academic year
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this academic year?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.academicYears.delete(id);
      fetchAcademicYears();
    } catch (err) {
      console.error('Error deleting academic year:', err);
      setError('Failed to delete academic year. Please try again.');
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

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Academic Years</h5>
            <Button variant="light" size="sm" onClick={handleAddNew}>
              Add New Academic Year
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
                  placeholder="Search academic years..."
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
          
          {/* Academic Years Table */}
          {loading && academicYears.length === 0 ? (
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
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {academicYears.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No academic years found
                      </td>
                    </tr>
                  ) : (
                    academicYears.map((year, index) => (
                      <tr key={year.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{year.name}</td>
                        <td>{formatDate(year.start_date)}</td>
                        <td>{formatDate(year.end_date)}</td>
                        <td>
                          <span className={`badge ${year.is_current ? 'bg-success' : 'bg-secondary'}`}>
                            {year.is_current ? 'Current' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEdit(year)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(year.id)}
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
            {currentYear ? 'Edit Academic Year' : 'Add New Academic Year'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., 2025-2026"
              />
            </Form.Group>
            
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
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_current"
                label="Set as current academic year"
                checked={formData.is_current}
                onChange={handleInputChange}
              />
              {formData.is_current && (
                <Form.Text className="text-muted">
                  This will unset any other current academic year.
                </Form.Text>
              )}
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

export default AcademicYears;
