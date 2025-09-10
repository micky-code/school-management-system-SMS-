import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';
import { format } from 'date-fns';

const Exams = () => {
  // State variables
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    exam_name: '',
    batch_id: '',
    subject_id: '',
    exam_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '11:00',
    max_marks: 100,
    passing_marks: 40,
    exam_type: 'Written',
    description: '',
    venue: '',
    instructions: '',
    status: 'Scheduled'
  });

  // Load exams, batches, subjects on component mount
  useEffect(() => {
    fetchExams();
    fetchBatches();
    fetchSubjects();
  }, [pagination.page, searchTerm, activeTab]);

  // Fetch exams from API
  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.exams.getAll(
        pagination.page, 
        pagination.limit,
        searchTerm,
        activeTab
      );
      
      setExams(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
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

  // Fetch subjects for dropdown
  const fetchSubjects = async () => {
    try {
      const response = await ApiAdapter.subjects.getAll(1, 100, '');
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open modal for creating new exam
  const handleAddNew = () => {
    setCurrentExam(null);
    setFormData({
      exam_name: '',
      batch_id: batches.length > 0 ? batches[0].id : '',
      subject_id: subjects.length > 0 ? subjects[0].id : '',
      exam_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_time: '11:00',
      max_marks: 100,
      passing_marks: 40,
      exam_type: 'Written',
      description: '',
      venue: '',
      instructions: '',
      status: 'Scheduled'
    });
    setShowModal(true);
  };

  // Open modal for editing exam
  const handleEdit = (exam) => {
    setCurrentExam(exam);
    setFormData({
      exam_name: exam.exam_name || '',
      batch_id: exam.batch_id || '',
      subject_id: exam.subject_id || '',
      exam_date: exam.exam_date ? format(new Date(exam.exam_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      start_time: exam.start_time || '09:00',
      end_time: exam.end_time || '11:00',
      max_marks: exam.max_marks || 100,
      passing_marks: exam.passing_marks || 40,
      exam_type: exam.exam_type || 'Written',
      description: exam.description || '',
      venue: exam.venue || '',
      instructions: exam.instructions || '',
      status: exam.status || 'Scheduled'
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentExam) {
        await ApiAdapter.exams.update(currentExam.id, formData);
      } else {
        await ApiAdapter.exams.create(formData);
      }
      setShowModal(false);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      setError('Failed to save exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete exam
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.exams.delete(id);
      fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('Failed to delete exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle change exam status
  const handleChangeStatus = async (id, newStatus) => {
    setLoading(true);
    
    try {
      await ApiAdapter.exams.updateStatus(id, { status: newStatus });
      fetchExams();
    } catch (err) {
      console.error('Error updating exam status:', err);
      setError('Failed to update exam status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination({
      ...pagination,
      page: 1 // Reset to first page on new search
    });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination({
      ...pagination,
      page: 1 // Reset to first page on tab change
    });
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

  // Get batch name by id
  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? (batch.batch_name || batch.name) : 'N/A';
  };

  // Get subject name by id
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Ongoing':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      case 'Postponed':
        return 'secondary';
      default:
        return 'info';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Check if exam is upcoming
  const isUpcoming = (exam) => {
    if (!exam.exam_date) return false;
    const examDate = new Date(exam.exam_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return examDate >= today;
  };

  // Check if exam is today
  const isToday = (exam) => {
    if (!exam.exam_date) return false;
    const examDate = new Date(exam.exam_date);
    const today = new Date();
    return (
      examDate.getDate() === today.getDate() &&
      examDate.getMonth() === today.getMonth() &&
      examDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Exams Management</h5>
            <Button 
              variant="light" 
              size="sm" 
              onClick={handleAddNew}
            >
              Schedule New Exam
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-3"
          >
            <Tab eventKey="upcoming" title="Upcoming Exams">
              {/* Search and Filter */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Search by exam name or subject..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Exams Table */}
              {loading && exams.length === 0 ? (
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
                        <th>Exam Name</th>
                        <th>Batch</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No upcoming exams found
                          </td>
                        </tr>
                      ) : (
                        exams.map((exam, index) => (
                          <tr key={exam.id} className={isToday(exam) ? 'table-warning' : ''}>
                            <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                            <td>{exam.exam_name}</td>
                            <td>{exam.batch_name || getBatchName(exam.batch_id)}</td>
                            <td>{exam.subject_name || getSubjectName(exam.subject_id)}</td>
                            <td>
                              {formatDate(exam.exam_date)}
                              {isToday(exam) && (
                                <Badge bg="warning" className="ms-2">Today</Badge>
                              )}
                            </td>
                            <td>
                              {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                            </td>
                            <td>
                              <Badge bg={getStatusBadgeVariant(exam.status)}>
                                {exam.status}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => handleEdit(exam)}
                                >
                                  Edit
                                </Button>
                                {exam.status === 'Scheduled' && (
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    onClick={() => handleChangeStatus(exam.id, 'Ongoing')}
                                  >
                                    Start
                                  </Button>
                                )}
                                {exam.status === 'Ongoing' && (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => handleChangeStatus(exam.id, 'Completed')}
                                  >
                                    Complete
                                  </Button>
                                )}
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleDelete(exam.id)}
                                >
                                  Delete
                                </Button>
                              </div>
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
            </Tab>
            <Tab eventKey="completed" title="Completed Exams">
              {/* Similar table structure for completed exams */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Exam Name</th>
                      <th>Batch</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No completed exams found
                        </td>
                      </tr>
                    ) : (
                      exams.map((exam, index) => (
                        <tr key={exam.id}>
                          <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                          <td>{exam.exam_name}</td>
                          <td>{exam.batch_name || getBatchName(exam.batch_id)}</td>
                          <td>{exam.subject_name || getSubjectName(exam.subject_id)}</td>
                          <td>{formatDate(exam.exam_date)}</td>
                          <td>{formatTime(exam.start_time)} - {formatTime(exam.end_time)}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(exam.status)}>
                              {exam.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleEdit(exam)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDelete(exam.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
              
              {/* Pagination for completed exams */}
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
            </Tab>
            <Tab eventKey="all" title="All Exams">
              {/* Similar table structure for all exams */}
              {/* This tab shows all exams regardless of status */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Exam Name</th>
                      <th>Batch</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No exams found
                        </td>
                      </tr>
                    ) : (
                      exams.map((exam, index) => (
                        <tr key={exam.id} className={isToday(exam) ? 'table-warning' : ''}>
                          <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                          <td>{exam.exam_name}</td>
                          <td>{exam.batch_name || getBatchName(exam.batch_id)}</td>
                          <td>{exam.subject_name || getSubjectName(exam.subject_id)}</td>
                          <td>
                            {formatDate(exam.exam_date)}
                            {isToday(exam) && (
                              <Badge bg="warning" className="ms-2">Today</Badge>
                            )}
                          </td>
                          <td>{formatTime(exam.start_time)} - {formatTime(exam.end_time)}</td>
                          <td>
                            <Badge bg={getStatusBadgeVariant(exam.status)}>
                              {exam.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleEdit(exam)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDelete(exam.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
              
              {/* Pagination for all exams */}
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
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Add/Edit Exam Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentExam ? 'Edit Exam' : 'Schedule New Exam'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="basic" className="mb-3">
              <Tab eventKey="basic" title="Basic Information">
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Exam Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="exam_name"
                        value={formData.exam_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter exam name"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
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
                            {batch.batch_name || batch.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Exam Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="exam_date"
                        value={formData.exam_date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Maximum Marks</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_marks"
                        value={formData.max_marks}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Passing Marks</Form.Label>
                      <Form.Control
                        type="number"
                        name="passing_marks"
                        value={formData.passing_marks}
                        onChange={handleInputChange}
                        min="0"
                        max={formData.max_marks}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Postponed">Postponed</option>
                        <option value="Cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="details" title="Additional Details">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Exam Type</Form.Label>
                      <Form.Select
                        name="exam_type"
                        value={formData.exam_type}
                        onChange={handleInputChange}
                      >
                        <option value="Written">Written</option>
                        <option value="Oral">Oral</option>
                        <option value="Practical">Practical</option>
                        <option value="Online">Online</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Project">Project</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Venue</Form.Label>
                      <Form.Control
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        placeholder="Exam venue/location"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the exam"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="Instructions for students"
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

export default Exams;
