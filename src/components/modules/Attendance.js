import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Attendance = () => {
  // State variables
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state for single attendance record
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: ''
  });

  // Form state for bulk attendance
  const [bulkAttendance, setBulkAttendance] = useState([]);

  // Load attendance records, batches, subjects on component mount
  useEffect(() => {
    fetchAttendanceRecords();
    fetchBatches();
    fetchSubjects();
  }, [pagination.page, selectedDate]);

  // Fetch attendance records from API
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.attendance.getAll(
        pagination.page, 
        pagination.limit, 
        selectedDate
      );
      
      setAttendanceRecords(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to load attendance records. Please try again.');
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

  // Fetch students by batch
  const fetchStudentsByBatch = async (batchId) => {
    try {
      const response = await ApiAdapter.students.getByBatch(batchId);
      setStudents(response.data || []);
      
      // Initialize bulk attendance form with student data
      const initialBulkData = (response.data || []).map(student => ({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        subject_id: selectedSubject,
        attendance_date: selectedDate,
        status: 'present',
        remarks: ''
      }));
      
      setBulkAttendance(initialBulkData);
    } catch (err) {
      console.error('Error fetching students by batch:', err);
    }
  };

  // Handle form input changes for single attendance
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle bulk attendance status change
  const handleBulkStatusChange = (studentId, status) => {
    setBulkAttendance(prevState => 
      prevState.map(item => 
        item.student_id === studentId 
          ? { ...item, status } 
          : item
      )
    );
  };

  // Handle bulk attendance remarks change
  const handleBulkRemarksChange = (studentId, remarks) => {
    setBulkAttendance(prevState => 
      prevState.map(item => 
        item.student_id === studentId 
          ? { ...item, remarks } 
          : item
      )
    );
  };

  // Open modal for creating new attendance record
  const handleAddNew = () => {
    setFormData({
      student_id: students.length > 0 ? students[0].id : '',
      subject_id: subjects.length > 0 ? subjects[0].id : '',
      attendance_date: selectedDate,
      status: 'present',
      remarks: ''
    });
    setBulkMode(false);
    setShowModal(true);
  };

  // Open modal for bulk attendance
  const handleBulkAttendance = () => {
    setSelectedBatch('');
    setSelectedSubject('');
    setBulkMode(true);
    setShowModal(true);
  };

  // Handle batch selection in bulk mode
  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    if (batchId) {
      fetchStudentsByBatch(batchId);
    } else {
      setStudents([]);
      setBulkAttendance([]);
    }
  };

  // Handle subject selection in bulk mode
  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    
    // Update all bulk attendance records with new subject
    setBulkAttendance(prevState => 
      prevState.map(item => ({ ...item, subject_id: subjectId }))
    );
  };

  // Handle date selection
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Update form data with new date
    setFormData({
      ...formData,
      attendance_date: date
    });
    
    // Update bulk attendance with new date
    setBulkAttendance(prevState => 
      prevState.map(item => ({ ...item, attendance_date: date }))
    );
  };

  // Handle form submission (create single attendance record)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await ApiAdapter.attendance.create(formData);
      setShowModal(false);
      fetchAttendanceRecords();
    } catch (err) {
      console.error('Error saving attendance record:', err);
      setError('Failed to save attendance record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk attendance submission
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await ApiAdapter.attendance.createBulk(bulkAttendance);
      setShowModal(false);
      fetchAttendanceRecords();
    } catch (err) {
      console.error('Error saving bulk attendance:', err);
      setError('Failed to save bulk attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete attendance record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.attendance.delete(id);
      fetchAttendanceRecords();
    } catch (err) {
      console.error('Error deleting attendance record:', err);
      setError('Failed to delete attendance record. Please try again.');
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

  // Get subject name by id
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge bg="success">Present</Badge>;
      case 'absent':
        return <Badge bg="danger">Absent</Badge>;
      case 'late':
        return <Badge bg="warning" text="dark">Late</Badge>;
      case 'excused':
        return <Badge bg="info">Excused</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Attendance Management</h5>
            <div>
              <Button 
                variant="light" 
                size="sm" 
                className="me-2"
                onClick={handleBulkAttendance}
              >
                Bulk Attendance
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddNew}
              >
                Add Single Record
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Date Filter */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
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
          
          {/* Attendance Records Table */}
          {loading && attendanceRecords.length === 0 ? (
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
                    <th>Date</th>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No attendance records found for this date
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record, index) => (
                      <tr key={record.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{new Date(record.attendance_date).toLocaleDateString()}</td>
                        <td>{record.student_name || getStudentName(record.student_id)}</td>
                        <td>{record.subject_name || getSubjectName(record.subject_id)}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>{record.remarks || '-'}</td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(record.id)}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size={bulkMode ? "lg" : "md"}>
        <Modal.Header closeButton>
          <Modal.Title>
            {bulkMode ? 'Bulk Attendance Entry' : 'Add Attendance Record'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={bulkMode ? handleBulkSubmit : handleSubmit}>
          <Modal.Body>
            {bulkMode ? (
              <>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Batch</Form.Label>
                      <Form.Select
                        value={selectedBatch}
                        onChange={handleBatchChange}
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
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        value={selectedSubject}
                        onChange={handleSubjectChange}
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
                
                {bulkAttendance.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkAttendance.map((item, index) => (
                        <tr key={item.student_id}>
                          <td>{index + 1}</td>
                          <td>{item.student_name}</td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={item.status}
                              onChange={(e) => handleBulkStatusChange(item.student_id, e.target.value)}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="excused">Excused</option>
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleBulkRemarksChange(item.student_id, e.target.value)}
                              placeholder="Optional remarks"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">
                    Select a batch to load students
                  </Alert>
                )}
              </>
            ) : (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="attendance_date"
                        value={formData.attendance_date}
                        onChange={handleInputChange}
                        required
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
                        required
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student</Form.Label>
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Optional remarks"
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || (bulkMode && bulkAttendance.length === 0)}
            >
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

export default Attendance;
