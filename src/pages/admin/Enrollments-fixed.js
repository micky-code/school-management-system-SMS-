import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Table, 
    Button, 
    Modal, 
    Form, 
    Alert, 
    Spinner, 
    Badge,
    InputGroup
} from 'react-bootstrap';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaEye, 
    FaGraduationCap, 
    FaSearch 
} from 'react-icons/fa';
import EnrollmentService from '../../services/enrollment.service';

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    
    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
    
    // Form data
    const [formData, setFormData] = useState({
        student_id: '',
        program_id: '',
        batch_id: '',
        academic_year_id: 1,
        enrollment_date: '',
        status: 'active'
    });
    
    // Pagination and search
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch enrollments
    const fetchEnrollments = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await EnrollmentService.getAll(page, 10, search);
            
            if (response.success) {
                setEnrollments(response.rows || []);
                setTotalPages(Math.ceil((response.total || 0) / 10));
            } else {
                setError('Failed to fetch enrollments');
            }
        } catch (err) {
            console.error('Error fetching enrollments:', err);
            setError('Error loading enrollments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    // Handle modal show/hide
    const handleShowModal = (mode, enrollment = null) => {
        setModalMode(mode);
        setSelectedEnrollment(enrollment);
        
        if (mode === 'add') {
            setFormData({
                student_id: '',
                program_id: '',
                batch_id: '',
                academic_year_id: 1,
                enrollment_date: new Date().toISOString().split('T')[0],
                status: 'active'
            });
        } else if (mode === 'edit' && enrollment) {
            setFormData({
                student_id: enrollment.student_id || '',
                program_id: enrollment.program_id || '',
                batch_id: enrollment.batch_id || '',
                academic_year_id: enrollment.academic_year_id || 1,
                enrollment_date: enrollment.enrollment_date ? enrollment.enrollment_date.split('T')[0] : '',
                status: enrollment.status || 'active'
            });
        }
        
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEnrollment(null);
        setModalMode('add');
    };

    // Handle delete modal
    const handleShowDeleteModal = (enrollment) => {
        setEnrollmentToDelete(enrollment);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setEnrollmentToDelete(null);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let response;
            
            if (modalMode === 'add') {
                response = await EnrollmentService.create(formData);
                setSuccess('Enrollment created successfully!');
            } else if (modalMode === 'edit') {
                response = await EnrollmentService.update(selectedEnrollment.id, formData);
                setSuccess('Enrollment updated successfully!');
            }
            
            handleCloseModal();
            fetchEnrollments(currentPage, searchTerm);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving enrollment:', err);
            setError(err.response?.data?.message || 'Error saving enrollment');
        }
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchEnrollments(1, searchTerm);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!enrollmentToDelete) return;
        
        try {
            await EnrollmentService.delete(enrollmentToDelete.id);
            setSuccess('Enrollment deleted successfully!');
            
            handleCloseDeleteModal();
            fetchEnrollments(currentPage, searchTerm);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting enrollment:', err);
            setError(err.response?.data?.message || 'Error deleting enrollment');
        }
    };

    // Get status color for Bootstrap badges
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'inactive': return 'secondary';
            case 'graduated': return 'primary';
            default: return 'secondary';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="d-flex align-items-center gap-2">
                            <FaGraduationCap /> Student Enrollments
                        </h2>
                        <Button 
                            variant="primary" 
                            onClick={() => handleShowModal('add')}
                        >
                            <FaPlus className="me-2" /> Add New Enrollment
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Alerts */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}
            {success && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Search */}
            <Row className="mb-3">
                <Col md={6}>
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search by student name or program..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="outline-primary" type="submit">
                                <FaSearch />
                            </Button>
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            {/* Enrollments Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Enrollment Records</h5>
                        </Card.Header>
                        <Card.Body>
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
                                            <th>ID</th>
                                            <th>Student Name</th>
                                            <th>Program</th>
                                            <th>Batch</th>
                                            <th>Enrollment Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments && enrollments.length > 0 ? (
                                            enrollments.map((enrollment) => (
                                                <tr key={enrollment.id}>
                                                    <td>{enrollment.id}</td>
                                                    <td>{enrollment.student_name || '-'}</td>
                                                    <td>{enrollment.program_name || '-'}</td>
                                                    <td>{enrollment.batch_name || '-'}</td>
                                                    <td>{formatDate(enrollment.enrollment_date)}</td>
                                                    <td>
                                                        <Badge bg={getStatusColor(enrollment.status)}>
                                                            {enrollment.status}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            className="me-1"
                                                            onClick={() => handleShowModal('view', enrollment)}
                                                        >
                                                            <FaEye />
                                                        </Button>
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            className="me-1"
                                                            onClick={() => handleShowModal('edit', enrollment)}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleShowDeleteModal(enrollment)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4">
                                                    No enrollment records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === 'add' && 'Add New Enrollment'}
                        {modalMode === 'edit' && 'Edit Enrollment'}
                        {modalMode === 'view' && 'View Enrollment Details'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalMode === 'view' ? (
                        selectedEnrollment && (
                            <div>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <p><strong>Student:</strong> {selectedEnrollment.student_name}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Program:</strong> {selectedEnrollment.program_name}</p>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <p><strong>Batch:</strong> {selectedEnrollment.batch_name || '-'}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Enrollment Date:</strong> {formatDate(selectedEnrollment.enrollment_date)}</p>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <Badge bg={getStatusColor(selectedEnrollment.status)} className="ms-1">
                                                {selectedEnrollment.status}
                                            </Badge>
                                        </p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Created:</strong> {formatDate(selectedEnrollment.created_at)}</p>
                                    </Col>
                                </Row>
                            </div>
                        )
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Student ID *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="student_id"
                                            value={formData.student_id}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Program ID *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="program_id"
                                            value={formData.program_id}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Batch ID</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="batch_id"
                                            value={formData.batch_id}
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Enrollment Date *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="enrollment_date"
                                            value={formData.enrollment_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status *</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="graduated">Graduated</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    {modalMode !== 'view' && (
                        <Button variant="primary" onClick={handleSubmit}>
                            {modalMode === 'add' ? 'Create Enrollment' : 'Update Enrollment'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this enrollment record?
                    {enrollmentToDelete && (
                        <div className="mt-2">
                            <strong>Student:</strong> {enrollmentToDelete.student_name}<br />
                            <strong>Program:</strong> {enrollmentToDelete.program_name}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Enrollments;
