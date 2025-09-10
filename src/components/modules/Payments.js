import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Form, 
  Modal, Pagination, Spinner, Alert, Badge, Tabs, Tab
} from 'react-bootstrap';
import ApiAdapter from '../../services/api-adapter';
import { format } from 'date-fns';

const Payments = () => {
  // State variables
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    fee_type_id: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'Cash',
    reference_number: '',
    description: '',
    status: 'Paid'
  });

  // Load payments, students, and fee types on component mount
  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchFeeTypes();
  }, [pagination.page, searchTerm]);

  // Fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.payments.getAll(
        pagination.page, 
        pagination.limit,
        searchTerm
      );
      
      setPayments(response.data || []);
      setPagination({
        ...pagination,
        total: response.count || 0
      });
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for dropdown
  const fetchStudents = async () => {
    try {
      const response = await ApiAdapter.students.getAll(1, 100, '');
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Fetch fee types for dropdown
  const fetchFeeTypes = async () => {
    try {
      const response = await ApiAdapter.feeTypes.getAll();
      setFeeTypes(response.data || []);
    } catch (err) {
      console.error('Error fetching fee types:', err);
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

  // Open modal for creating new payment
  const handleAddNew = () => {
    setCurrentPayment(null);
    setFormData({
      student_id: students.length > 0 ? students[0].id : '',
      fee_type_id: feeTypes.length > 0 ? feeTypes[0].id : '',
      amount: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'Cash',
      reference_number: '',
      description: '',
      status: 'Paid'
    });
    setShowModal(true);
  };

  // Open modal for editing payment
  const handleEdit = (payment) => {
    setCurrentPayment(payment);
    setFormData({
      student_id: payment.student_id,
      fee_type_id: payment.fee_type_id,
      amount: payment.amount,
      payment_date: payment.payment_date ? format(new Date(payment.payment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      payment_method: payment.payment_method || 'Cash',
      reference_number: payment.reference_number || '',
      description: payment.description || '',
      status: payment.status || 'Paid'
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (currentPayment) {
        await ApiAdapter.payments.update(currentPayment.id, formData);
      } else {
        await ApiAdapter.payments.create(formData);
      }
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      console.error('Error saving payment:', err);
      setError('Failed to save payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete payment
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await ApiAdapter.payments.delete(id);
      fetchPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle view receipt
  const handleViewReceipt = (payment) => {
    setCurrentPayment(payment);
    setShowReceiptModal(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination({
      ...pagination,
      page: 1 // Reset to first page on new search
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

  // Get student name by id
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'N/A';
  };

  // Get fee type name by id
  const getFeeTypeName = (feeTypeId) => {
    const feeType = feeTypes.find(f => f.id === feeTypeId);
    return feeType ? feeType.name : 'N/A';
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'danger';
      case 'Cancelled':
        return 'secondary';
      case 'Partial':
        return 'info';
      default:
        return 'primary';
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

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Generate receipt number
  const generateReceiptNumber = (payment) => {
    if (!payment || !payment.id) return 'RECEIPT-PREVIEW';
    const paddedId = String(payment.id).padStart(6, '0');
    const date = payment.payment_date ? 
      format(new Date(payment.payment_date), 'yyyyMMdd') : 
      format(new Date(), 'yyyyMMdd');
    return `REC-${date}-${paddedId}`;
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Payments Management</h5>
            <Button 
              variant="light" 
              size="sm" 
              onClick={handleAddNew}
            >
              Add New Payment
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
          
          {/* Search and Filter */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by student name or reference number..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Payments Table */}
          {loading && payments.length === 0 ? (
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
                    <th>Fee Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No payment records found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, index) => (
                      <tr key={payment.id}>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{payment.student_name || getStudentName(payment.student_id)}</td>
                        <td>{payment.fee_type_name || getFeeTypeName(payment.fee_type_id)}</td>
                        <td className="text-end">
                          <strong>{formatCurrency(payment.amount)}</strong>
                        </td>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td>{payment.payment_method}</td>
                        <td>{payment.reference_number || '-'}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            className="me-1"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            Receipt
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="me-1"
                            onClick={() => handleEdit(payment)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(payment.id)}
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
      
      {/* Add/Edit Payment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPayment ? 'Edit Payment' : 'Add New Payment'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
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
                  <Form.Label>Fee Type</Form.Label>
                  <Form.Select
                    name="fee_type_id"
                    value={formData.fee_type_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Fee Type</option>
                    {feeTypes.map(feeType => (
                      <option key={feeType.id} value={feeType.id}>
                        {feeType.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="Payment amount"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reference Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleInputChange}
                    placeholder="Transaction/Check/Reference number"
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
                placeholder="Payment description"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
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
      
      {/* Receipt Modal */}
      <Modal 
        show={showReceiptModal} 
        onHide={() => setShowReceiptModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPayment && (
            <div className="receipt-container p-4">
              <div className="text-center mb-4">
                <h4>STUDENT MANAGEMENT SYSTEM</h4>
                <p className="mb-0">123 Education Street, Academic City</p>
                <p>Phone: (123) 456-7890 | Email: info@sms-spi.edu</p>
              </div>
              
              <div className="d-flex justify-content-between mb-4">
                <div>
                  <h5>RECEIPT</h5>
                  <p className="mb-0"><strong>Receipt No:</strong> {generateReceiptNumber(currentPayment)}</p>
                  <p><strong>Date:</strong> {formatDate(currentPayment.payment_date)}</p>
                </div>
                <div className="text-end">
                  <p className="mb-0"><strong>Status:</strong> {currentPayment.status}</p>
                  <p><strong>Method:</strong> {currentPayment.payment_method}</p>
                  {currentPayment.reference_number && (
                    <p className="mb-0"><strong>Reference:</strong> {currentPayment.reference_number}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="mb-0"><strong>Student:</strong> {getStudentName(currentPayment.student_id)}</p>
                <p><strong>Fee Type:</strong> {getFeeTypeName(currentPayment.fee_type_id)}</p>
              </div>
              
              <Table bordered className="mb-4">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{currentPayment.description || getFeeTypeName(currentPayment.fee_type_id)}</td>
                    <td className="text-end">{formatCurrency(currentPayment.amount)}</td>
                  </tr>
                  <tr>
                    <th>Total</th>
                    <th className="text-end">{formatCurrency(currentPayment.amount)}</th>
                  </tr>
                </tbody>
              </Table>
              
              <div className="mt-5 pt-5">
                <div className="row">
                  <div className="col-6 text-center">
                    <div className="border-top border-dark pt-2">
                      Received By
                    </div>
                  </div>
                  <div className="col-6 text-center">
                    <div className="border-top border-dark pt-2">
                      Authorized Signature
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-5">
                <p className="small text-muted mb-0">This is a computer-generated receipt and does not require a physical signature.</p>
                <p className="small text-muted">Thank you for your payment!</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceiptModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Payments;
