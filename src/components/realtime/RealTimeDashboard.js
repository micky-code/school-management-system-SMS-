/**
 * Real-time Dashboard Component
 * Displays live statistics and database updates
 */
import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from './WebSocketProvider';
import { Card, Row, Col, Badge, Alert, Spin, Typography, Progress } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  TeamOutlined, 
  DatabaseOutlined,
  WifiOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const RealTimeDashboard = () => {
  const { isConnected, lastMessage, sendMessage } = useWebSocketContext();
  const [stats, setStats] = useState({
    students: 0,
    users: 0,
    programs: 0,
    batches: 0,
    active_connections: 0
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState('unknown');

  // Fetch initial stats
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        
        if (data.type === 'database_update') {
          handleDatabaseUpdate(data.data);
        } else if (data.type === 'user_login') {
          handleUserLogin(data.data);
        } else if (data.type === 'connection') {
          setDatabaseStatus('connected');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setStats(data.data);
          setLastUpdate(new Date(data.data.timestamp));
          setDatabaseStatus('connected');
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setDatabaseStatus('error');
    }
  };

  const handleDatabaseUpdate = (updateData) => {
    setStats(prevStats => ({
      ...prevStats,
      students: updateData.students?.count || prevStats.students,
      users: updateData.users?.count || prevStats.users,
      programs: updateData.programs?.count || prevStats.programs
    }));
    setLastUpdate(new Date(updateData.timestamp));
  };

  const handleUserLogin = (loginData) => {
    // Handle user login notifications
    console.log('User logged in:', loginData);
  };

  const sendPing = () => {
    sendMessage({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  };

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'red';
    if (databaseStatus === 'error') return 'orange';
    return 'green';
  };

  const getConnectionStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (databaseStatus === 'error') return 'Database Error';
    return 'Connected';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Real-time Dashboard</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Badge 
            color={getConnectionStatusColor()} 
            text={getConnectionStatusText()}
          />
          <WifiOutlined 
            style={{ 
              color: getConnectionStatusColor(),
              fontSize: '18px',
              cursor: 'pointer'
            }}
            onClick={sendPing}
            title="Test connection"
          />
        </div>
      </div>

      {!isConnected && (
        <Alert
          message="WebSocket Disconnected"
          description="Real-time updates are not available. Please check your connection."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Students</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {stats.students}
                </div>
              </div>
              <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Users</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {stats.users}
                </div>
              </div>
              <TeamOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Programs</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {stats.programs}
                </div>
              </div>
              <BookOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Batches</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eb2f96' }}>
                  {stats.batches}
                </div>
              </div>
              <DatabaseOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Connection Status" extra={<SyncOutlined spin={isConnected} />}>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>WebSocket Status: </Text>
              <Badge 
                color={isConnected ? 'green' : 'red'} 
                text={isConnected ? 'Connected' : 'Disconnected'}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Database Status: </Text>
              <Badge 
                color={databaseStatus === 'connected' ? 'green' : 'red'} 
                text={databaseStatus === 'connected' ? 'Connected' : 'Error'}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Active Connections: </Text>
              <Text>{stats.active_connections}</Text>
            </div>
            {lastUpdate && (
              <div>
                <Text strong>Last Update: </Text>
                <Text type="secondary">{lastUpdate.toLocaleString()}</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Real-time Features">
            <div style={{ marginBottom: '12px' }}>
              <Text>✅ Live database monitoring</Text>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text>✅ Real-time statistics updates</Text>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text>✅ User activity notifications</Text>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text>✅ WebSocket communication</Text>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text>✅ Auto-reconnection</Text>
            </div>
            <div>
              <Text>✅ Connection health monitoring</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="System Health">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Database Connection</Text>
                </div>
                <Progress 
                  percent={databaseStatus === 'connected' ? 100 : 0}
                  status={databaseStatus === 'connected' ? 'success' : 'exception'}
                  showInfo={false}
                />
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>WebSocket Connection</Text>
                </div>
                <Progress 
                  percent={isConnected ? 100 : 0}
                  status={isConnected ? 'success' : 'exception'}
                  showInfo={false}
                />
              </Col>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Real-time Updates</Text>
                </div>
                <Progress 
                  percent={isConnected && databaseStatus === 'connected' ? 100 : 0}
                  status={isConnected && databaseStatus === 'connected' ? 'success' : 'exception'}
                  showInfo={false}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RealTimeDashboard;
