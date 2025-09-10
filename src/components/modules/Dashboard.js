import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, 
  Spinner, Alert, Badge, ProgressBar
} from 'react-bootstrap';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import ApiAdapter from '../../services/api-adapter';
import { format } from 'date-fns';

const Dashboard = () => {
  // State variables
  const [stats, setStats] = useState({
    students: {
      total: 0,
      active: 0,
      inactive: 0,
      graduated: 0,
      suspended: 0
    },
    teachers: {
      total: 0,
      active: 0,
      departments: 0
    },
    academics: {
      programs: 0,
      batches: 0,
      departments: 0,
      subjects: 0
    },
    attendance: {
      today: 0,
      present: 0,
      absent: 0,
      rate: 0
    },
    exams: {
      upcoming: 0,
      completed: 0,
      ongoing: 0
    },
    payments: {
      total: 0,
      pending: 0,
      overdue: 0,
      thisMonth: 0
    },
    users: {
      total: 0,
      active: 0,
      roles: {}
    },
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Load dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
    
    // Set up automatic refresh every 2 minutes
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 120000); // 2 minutes
    
    setRefreshInterval(interval);
    
    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Fetch dashboard statistics from API
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiAdapter.dashboard.getStats();
      
      if (response && response.data) {
        setStats(response.data);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardStats();
  };

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'MMM dd, yyyy HH:mm:ss');
  };

  // Prepare data for student status pie chart
  const studentStatusData = [
    { name: 'Active', value: stats.students.active },
    { name: 'Inactive', value: stats.students.inactive },
    { name: 'Graduated', value: stats.students.graduated },
    { name: 'Suspended', value: stats.students.suspended }
  ];

  // Prepare data for attendance bar chart
  const attendanceData = [
    { name: 'Present', value: stats.attendance.present },
    { name: 'Absent', value: stats.attendance.absent },
    { name: 'Late', value: stats.attendance.today - stats.attendance.present - stats.attendance.absent }
  ];

  // Prepare data for payments line chart (mock data for demonstration)
  const paymentData = [
    { month: 'Jan', amount: 4000 },
    { month: 'Feb', amount: 3000 },
    { month: 'Mar', amount: 5000 },
    { month: 'Apr', amount: 4500 },
    { month: 'May', amount: 6000 },
    { month: 'Jun', amount: 5500 },
    { month: 'Jul', amount: stats.payments.thisMonth }
  ];

  return (
    <Container fluid className="py-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Dashboard</h5>
            <div>
              <small className="me-2">Last updated: {formatDate(lastUpdated)}</small>
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Refreshing...</span>
                  </>
                ) : (
                  'Refresh'
                )}
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
          
          {loading && Object.keys(stats).length === 0 ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {/* Main Stats Cards */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Total Students</h6>
                          <h3 className="mb-0">{stats.students.total}</h3>
                        </div>
                        <div className="dashboard-icon bg-primary">
                          <i className="fas fa-user-graduate"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">
                          <i className="fas fa-arrow-up me-1"></i>
                          {Math.round((stats.students.active / stats.students.total) * 100)}% Active
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Total Teachers</h6>
                          <h3 className="mb-0">{stats.teachers.total}</h3>
                        </div>
                        <div className="dashboard-icon bg-success">
                          <i className="fas fa-chalkboard-teacher"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">
                          <i className="fas fa-building me-1"></i>
                          {stats.teachers.departments} Departments
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Programs</h6>
                          <h3 className="mb-0">{stats.academics.programs}</h3>
                        </div>
                        <div className="dashboard-icon bg-warning">
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-warning">
                          <i className="fas fa-users me-1"></i>
                          {stats.academics.batches} Active Batches
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Today's Attendance</h6>
                          <h3 className="mb-0">{stats.attendance.rate}%</h3>
                        </div>
                        <div className="dashboard-icon bg-info">
                          <i className="fas fa-calendar-check"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-info">
                          <i className="fas fa-user-check me-1"></i>
                          {stats.attendance.present} Present / {stats.attendance.absent} Absent
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {/* Second Row Stats */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Upcoming Exams</h6>
                          <h3 className="mb-0">{stats.exams.upcoming}</h3>
                        </div>
                        <div className="dashboard-icon bg-danger">
                          <i className="fas fa-file-alt"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-danger">
                          <i className="fas fa-clock me-1"></i>
                          {stats.exams.ongoing} Ongoing Exams
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Payments This Month</h6>
                          <h3 className="mb-0">${stats.payments.thisMonth}</h3>
                        </div>
                        <div className="dashboard-icon bg-secondary">
                          <i className="fas fa-dollar-sign"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-secondary">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {stats.payments.overdue} Overdue Payments
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Total Subjects</h6>
                          <h3 className="mb-0">{stats.academics.subjects}</h3>
                        </div>
                        <div className="dashboard-icon bg-primary">
                          <i className="fas fa-book"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-primary">
                          <i className="fas fa-building me-1"></i>
                          {stats.academics.departments} Departments
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">System Users</h6>
                          <h3 className="mb-0">{stats.users.total}</h3>
                        </div>
                        <div className="dashboard-icon bg-success">
                          <i className="fas fa-users-cog"></i>
                        </div>
                      </div>
                      <div className="mt-3">
                        <small className="text-success">
                          <i className="fas fa-user-shield me-1"></i>
                          {stats.users.active} Active Users
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {/* Charts Row */}
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Student Status Distribution</h6>
                    </Card.Header>
                    <Card.Body>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={studentStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {studentStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Active Students</span>
                          <span>{stats.students.active} ({Math.round((stats.students.active / stats.students.total) * 100)}%)</span>
                        </div>
                        <ProgressBar variant="success" now={(stats.students.active / stats.students.total) * 100} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Today's Attendance</h6>
                    </Card.Header>
                    <Card.Body>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={attendanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8">
                            <Cell fill="#28a745" />
                            <Cell fill="#dc3545" />
                            <Cell fill="#ffc107" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Attendance Rate</span>
                          <span>{stats.attendance.rate}%</span>
                        </div>
                        <ProgressBar variant="info" now={stats.attendance.rate} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Monthly Payments</h6>
                    </Card.Header>
                    <Card.Body>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={paymentData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Pending Payments</span>
                          <span>${stats.payments.pending}</span>
                        </div>
                        <ProgressBar variant="warning" now={(stats.payments.pending / stats.payments.total) * 100} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {/* Recent Activity and Upcoming Exams */}
              <Row>
                <Col md={6}>
                  <Card>
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Recent Activity</h6>
                    </Card.Header>
                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {stats.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="timeline">
                          {stats.recentActivity.map((activity, index) => (
                            <div key={index} className="timeline-item">
                              <div className="timeline-marker"></div>
                              <div className="timeline-content">
                                <h6 className="mb-1">{activity.title}</h6>
                                <p className="mb-0 small">{activity.description}</p>
                                <small className="text-muted">{activity.time}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted">No recent activity</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Upcoming Exams</h6>
                    </Card.Header>
                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {stats.exams && stats.exams.upcoming > 0 ? (
                        <Table responsive borderless size="sm">
                          <thead>
                            <tr>
                              <th>Exam</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.exams.list && stats.exams.list.map((exam, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="fw-bold">{exam.name}</div>
                                  <small className="text-muted">{exam.subject}</small>
                                </td>
                                <td>
                                  <div>{exam.date}</div>
                                  <small className="text-muted">{exam.time}</small>
                                </td>
                                <td>
                                  <Badge bg={
                                    exam.status === 'Scheduled' ? 'primary' :
                                    exam.status === 'Ongoing' ? 'warning' :
                                    'success'
                                  }>
                                    {exam.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p className="text-center text-muted">No upcoming exams</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Custom CSS for dashboard */}
      <style jsx="true">{`
        .dashboard-card {
          transition: all 0.3s;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        .dashboard-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }
        
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline-item {
          position: relative;
          padding-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -30px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background-color: #007bff;
          top: 5px;
        }
        
        .timeline-item:not(:last-child):before {
          content: '';
          position: absolute;
          left: -23px;
          width: 2px;
          background-color: #e9ecef;
          top: 25px;
          bottom: 0;
        }
      `}</style>
    </Container>
  );
};

export default Dashboard;
