import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './common/Card';
import { Badge } from './common/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './common/Tabs';
import { Alert, AlertDescription } from './common/Alert';
import { Loader2, CheckCircle, XCircle, Info, Users, GraduationCap, Calendar } from 'lucide-react';
import { apiAdapter } from '../services/api-adapter';

const StatusManager = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all status information
      const response = await apiAdapter.get('/status/all-statuses');
      
      if (response.success) {
        setStatusData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch status data');
      }
    } catch (err) {
      console.error('Error fetching status data:', err);
      setError(err.message || 'Failed to load status information');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await apiAdapter.get('/status/system-status');
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
    }
    return null;
  };

  const StatusCard = ({ title, statuses, icon: Icon, color = "blue" }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`h-4 w-4 text-${color}-600`} />
          {title}
        </CardTitle>
        <Badge variant="secondary">{statuses?.length || 0}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {statuses?.map((status, index) => (
            <div key={status.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">{status.name}</span>
              </div>
              {status.student_count && (
                <Badge variant="outline" className="text-xs">
                  {status.student_count} students
                </Badge>
              )}
              {status.user_count && (
                <Badge variant="outline" className="text-xs">
                  {status.user_count} users
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const SystemStatusCard = () => {
    const [systemStatus, setSystemStatus] = useState(null);
    
    useEffect(() => {
      fetchSystemStatus().then(setSystemStatus);
    }, []);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStatus.total_students}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemStatus.total_users}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStatus.total_programs}</div>
                <div className="text-sm text-gray-600">Programs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemStatus.tables_active}</div>
                <div className="text-sm text-gray-600">Active Tables</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading status information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <button 
            onClick={fetchStatusData}
            className="ml-2 underline hover:no-underline"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Status Management</h1>
        <button
          onClick={fetchStatusData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Info className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <SystemStatusCard />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Status</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusCard
              title="Student Status"
              statuses={statusData?.student_statuses}
              icon={Users}
              color="blue"
            />
            <StatusCard
              title="User Status"
              statuses={statusData?.user_statuses}
              icon={Users}
              color="green"
            />
            <StatusCard
              title="Academic Status"
              statuses={statusData?.academic_statuses}
              icon={GraduationCap}
              color="purple"
            />
          </div>
        </TabsContent>

        <TabsContent value="students">
          <StatusCard
            title="Student Status Details"
            statuses={statusData?.student_statuses}
            icon={Users}
            color="blue"
          />
        </TabsContent>

        <TabsContent value="users">
          <StatusCard
            title="User Status Details"
            statuses={statusData?.user_statuses}
            icon={Users}
            color="green"
          />
        </TabsContent>

        <TabsContent value="academic">
          <StatusCard
            title="Academic Status Details"
            statuses={statusData?.academic_statuses}
            icon={Calendar}
            color="purple"
          />
        </TabsContent>
      </Tabs>

      {statusData?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {statusData.summary.total_student_statuses}
                </div>
                <div className="text-sm text-gray-600">Student Status Types</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {statusData.summary.total_user_statuses}
                </div>
                <div className="text-sm text-gray-600">User Status Types</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">
                  {statusData.summary.total_academic_statuses}
                </div>
                <div className="text-sm text-gray-600">Academic Status Types</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {statusData.summary.categories?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatusManager;
