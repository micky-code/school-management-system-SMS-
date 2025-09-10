import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';

const Grades = () => {
  // State variables
  const [grades, setGrades] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state for single grade entry
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    exam_id: '',
    marks_obtained: '',
    max_marks: 100,
    grade_letter: '',
    remarks: '',
    status: 1
  });

  // Form state for bulk grade entry
  const [bulkGrades, setBulkGrades] = useState([]);

  // Load grades, batches, subjects, exams on component mount
  useEffect(() => {
    fetchGrades();
    fetchBatches();
    fetchSubjects();
    fetchExams();
  }, [pagination.page]);

  // Fetch grades from API
  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.grades.getAll(
        pagination.page, 
        pagination.limit
      );
      
      setGrades(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades. Please try again.');
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

  // Fetch exams for dropdown
  const fetchExams = async () => {
    try {
      const response = await ApiAdapter.exams.getAll(1, 100, '');
      setExams(response.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  // Fetch students by batch
  const fetchStudentsByBatch = async (batchId) => {
    try {
      const response = await ApiAdapter.students.getByBatch(batchId);
      setStudents(response.data || []);
      
      // Initialize bulk grades form with student data
      const initialBulkData = (response.data || []).map(student => ({
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        subject_id: selectedSubject,
        exam_id: selectedExam,
        marks_obtained: '',
        max_marks: 100,
        grade_letter: '',
        remarks: '',
        status: 1
      }));
      
      setBulkGrades(initialBulkData);
    } catch (err) {
      console.error('Error fetching students by batch:', err);
    }
  };

  // Calculate grade letter based on marks
  const calculateGradeLetter = (marksObtained, maxMarks) => {
    if (!marksObtained || !maxMarks) return '';
    
    const percentage = (marksObtained / maxMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  // Handle form input changes for single grade
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let updatedFormData = {
      ...formData,
      [name]: value
    };
    
    // Auto-calculate grade letter if marks are entered
    if (name === 'marks_obtained' || name === 'max_marks') {
      const gradeLetter = calculateGradeLetter(
        name === 'marks_obtained' ? value : formData.marks_obtained,
        name === 'max_marks' ? value : formData.max_marks
      );
      updatedFormData.grade_letter = gradeLetter;
    }
    
    setFormData(updatedFormData);
  };

  // Handle bulk grade marks change
  const handleBulkMarksChange = (studentId, marks) => {
    setBulkGrades(prevState => 
      prevState.map(item => {
        if (item.student_id === studentId) {
          const gradeLetter = calculateGradeLetter(marks, item.max_marks);
          return { 
            ...item, 
            marks_obtained: marks,
            grade_letter: gradeLetter
          };
        }
        return item;
      })
    );
  };

  // Handle bulk grade remarks change
  const handleBulkRemarksChange = (studentId, remarks) => {
    setBulkGrades(prevState => 
      prevState.map(item => 
        item.student_id === studentId 
          ? { ...item, remarks } 
          : item
      )
    );
  };

  // Open modal for creating new grade entry
  const handleAddNew = () => {
    setFormData({
      student_id: students.length > 0 ? students[0].id : '',
      subject_id: subjects.length > 0 ? subjects[0].id : '',
      exam_id: exams.length > 0 ? exams[0].id : '',
      marks_obtained: '',
      max_marks: 100,
      grade_letter: '',
      remarks: '',
      status: 1
    });
    setBulkMode(false);
    setShowModal(true);
  };

  // Open modal for bulk grade entry
  const handleBulkEntry = () => {
    setSelectedBatch('');
    setSelectedSubject('');
    setSelectedExam('');
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
      setBulkGrades([]);
    }
  };

  // Handle subject selection in bulk mode
  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    
    // Update all bulk grade records with new subject
    setBulkGrades(prevState => 
      prevState.map(item => ({ ...item, subject_id: subjectId }))
    );
  };

  // Handle exam selection in bulk mode
  const handleExamChange = (e) => {
    const examId = e.target.value;
    setSelectedExam(examId);
    
    // Update all bulk grade records with new exam
    setBulkGrades(prevState => 
      prevState.map(item => ({ ...item, exam_id: examId }))
    );
  };

  // Handle form submission (create single grade)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await ApiAdapter.grades.create(formData);
      setShowModal(false);
      fetchGrades();
    } catch (err) {
      console.error('Error saving grade:', err);
      setError('Failed to save grade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk grades submission
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await ApiAdapter.grades.createBulk(bulkGrades);
      setShowModal(false);
      fetchGrades();
    } catch (err) {
      console.error('Error saving bulk grades:', err);
      setError('Failed to save bulk grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete grade
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade record?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.grades.delete(id);
      fetchGrades();
    } catch (err) {
      console.error('Error deleting grade:', err);
      setError('Failed to delete grade. Please try again.');
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

  // Get exam name by id
  const getExamName = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.exam_name : 'N/A';
  };

  // Get grade color class
  const getGradeColorClass = (gradeLetter) => {
    switch (gradeLetter) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'primary';
      case 'C+':
      case 'C':
        return 'info';
      case 'D':
        return 'warning';
      case 'F':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Grades Management</h5>
            <div>
              <Button 
                variant="light" 
                size="sm" 
                className="me-2"
                onClick={handleBulkEntry}
              >
                Bulk Grade Entry
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleAddNew}
              >
                Add Single Grade
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {/* Grades Table */}
          {loading && grades.length === 0 ? (
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
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No grade records found
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade, index) => (
                      <tr key={grade.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{grade.student_name || getStudentName(grade.student_id)}</td>
                        <td>{grade.subject_name || getSubjectName(grade.subject_id)}</td>
                        <td>{grade.exam_name || getExamName(grade.exam_id)}</td>
                        <td>
                          {grade.marks_obtained} / {grade.max_marks}
                          <div className="progress mt-1" style={{ height: '5px' }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${(grade.marks_obtained / grade.max_marks) * 100}%` }}
                              aria-valuenow={(grade.marks_obtained / grade.max_marks) * 100}
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getGradeColorClass(grade.grade_letter)}>
                            {grade.grade_letter}
                          </Badge>
                        </td>
                        <td>{grade.remarks || '-'}</td>
                        <td>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(grade.id)}
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
            {bulkMode ? 'Bulk Grade Entry' : 'Add Grade Record'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={bulkMode ? handleBulkSubmit : handleSubmit}>
          <Modal.Body>
            {bulkMode ? (
              <>
                <Row className="mb-3">
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
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Exam</Form.Label>
                      <Form.Select
                        value={selectedExam}
                        onChange={handleExamChange}
                        required
                      >
                        <option value="">Select Exam</option>
                        {exams.map(exam => (
                          <option key={exam.id} value={exam.id}>
                            {exam.exam_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                {bulkGrades.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Marks (out of 100)</th>
                        <th>Grade</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkGrades.map((item, index) => (
                        <tr key={item.student_id}>
                          <td>{index + 1}</td>
                          <td>{item.student_name}</td>
                          <td>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              max="100"
                              value={item.marks_obtained}
                              onChange={(e) => handleBulkMarksChange(item.student_id, e.target.value)}
                              placeholder="Marks"
                              required
                            />
                          </td>
                          <td>
                            <Badge bg={getGradeColorClass(item.grade_letter)}>
                              {item.grade_letter || '-'}
                            </Badge>
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
                  <Form.Label>Exam</Form.Label>
                  <Form.Select
                    name="exam_id"
                    value={formData.exam_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Exam</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.exam_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Marks Obtained</Form.Label>
                      <Form.Control
                        type="number"
                        name="marks_obtained"
                        value={formData.marks_obtained}
                        onChange={handleInputChange}
                        min="0"
                        max={formData.max_marks}
                        required
                        placeholder="Marks obtained"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Maximum Marks</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_marks"
                        value={formData.max_marks}
                        onChange={handleInputChange}
                        min="1"
                        required
                        placeholder="Maximum marks"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Grade Letter</Form.Label>
                      <Form.Control
                        type="text"
                        name="grade_letter"
                        value={formData.grade_letter}
                        onChange={handleInputChange}
                        readOnly
                        placeholder="Auto-calculated"
                      />
                      <Form.Text className="text-muted">
                        Grade is automatically calculated based on marks
                      </Form.Text>
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
                        <option value={1}>Published</option>
                        <option value={0}>Draft</option>
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
              disabled={loading || (bulkMode && bulkGrades.length === 0)}
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

export default Grades;
