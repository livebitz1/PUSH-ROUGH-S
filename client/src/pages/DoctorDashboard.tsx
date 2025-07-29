import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Bell, 
  Search,
  Filter,
  Eye,
  MessageSquare,
  Video,
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  FileText,
  Package,
  Building2,
  PhoneCall,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  BarChart3,
  TrendingUp,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Helper function to check if user is authenticated as doctor
const useDoctorAuth = () => {
  const { data: doctorUser, isLoading } = useQuery({
    queryKey: ["/api/doctor/auth/user"],
    retry: false,
  });

  return {
    doctor: doctorUser,
    isLoading,
    isAuthenticated: !!doctorUser,
  };
};

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon: Icon, trend }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: { value: string; isPositive: boolean };
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend.value}
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

// Appointment Card Component
const AppointmentCard = ({ appointment, onAction }: {
  appointment: any;
  onAction: (action: string, appointmentId: number) => void;
}) => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={appointment.patient?.profileImage} />
            <AvatarFallback>
              {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</p>
            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
          </div>
        </div>
        <Badge 
          variant={appointment.status === 'confirmed' ? 'default' : 
                   appointment.status === 'pending' ? 'secondary' :
                   appointment.status === 'completed' ? 'outline' : 'destructive'}
        >
          {appointment.status}
        </Badge>
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mb-3">
        <Calendar className="w-4 h-4 mr-2" />
        {appointment.appointmentDate}
        <Clock className="w-4 h-4 ml-4 mr-2" />
        {appointment.appointmentTime}
        <Badge variant="outline" className="ml-4">
          {appointment.consultationType}
        </Badge>
        {appointment.isEmergency && (
          <Badge variant="destructive" className="ml-2">Emergency</Badge>
        )}
      </div>

      <div className="flex gap-2">
        {appointment.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              onClick={() => onAction('confirm', appointment.id)}
              data-testid={`button-confirm-${appointment.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction('reschedule', appointment.id)}
              data-testid={`button-reschedule-${appointment.id}`}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onAction('cancel', appointment.id)}
              data-testid={`button-cancel-${appointment.id}`}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </>
        )}
        
        {appointment.status === 'confirmed' && (
          <>
            <Button size="sm" variant="outline">
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
            {appointment.consultationType === 'video' && (
              <Button size="sm">
                <Video className="w-4 h-4 mr-1" />
                Start Video
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction('complete', appointment.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </>
        )}
        
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function DoctorDashboard() {
  const { doctor, isLoading, isAuthenticated } = useDoctorAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("today");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/doctor-login";
    }
  }, [isAuthenticated, isLoading]);

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/doctor/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/doctor/appointments", filterStatus, filterDate],
    enabled: isAuthenticated,
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ["/api/doctor/activities"],
    enabled: isAuthenticated,
  });

  // Appointment action mutation
  const appointmentActionMutation = useMutation({
    mutationFn: async ({ action, appointmentId, data }: { action: string; appointmentId: number; data?: any }) => {
      return await apiRequest("POST", `/api/doctor/appointments/${appointmentId}/${action}`, data);
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/dashboard/stats"] });
      toast({
        title: "Success",
        description: `Appointment ${action}ed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/doctor/logout");
    },
    onSuccess: () => {
      window.location.href = "/doctor-login";
    },
  });

  const handleAppointmentAction = (action: string, appointmentId: number) => {
    appointmentActionMutation.mutate({ action, appointmentId });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const filteredAppointments = (appointments as any[])?.filter((appointment: any) => {
    const matchesSearch = appointment.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <User className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Santepheap</span>
              </Link>
              <span className="ml-4 text-sm text-gray-500">Doctor Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <Avatar>
                <AvatarImage src={(doctor as any)?.profileImage} />
                <AvatarFallback>
                  {(doctor as any)?.firstName?.[0]}{(doctor as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">Dr. {(doctor as any)?.firstName} {(doctor as any)?.lastName}</p>
                <p className="text-gray-500">{(doctor as any)?.specialization}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Today's Appointments"
            value={(stats as any)?.todayAppointments || 0}
            subtitle="Scheduled for today"
            icon={Calendar}
            trend={{ value: "+12% from yesterday", isPositive: true }}
          />
          <StatsCard
            title="Pending Approvals"
            value={(stats as any)?.pendingAppointments || 0}
            subtitle="Awaiting confirmation"
            icon={Clock}
          />
          <StatsCard
            title="Total Patients"
            value={(stats as any)?.totalPatients || 0}
            subtitle="All time"
            icon={Users}
            trend={{ value: "+5 this week", isPositive: true }}
          />
          <StatsCard
            title="Monthly Earnings"
            value={`$${(stats as any)?.monthlyEarnings || 0}`}
            subtitle="This month"
            icon={DollarSign}
            trend={{ value: "+15% from last month", isPositive: true }}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="corporate">Corporate</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded" />
                      ))}
                    </div>
                  ) : filteredAppointments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredAppointments.slice(0, 5).map((appointment: any) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onAction={handleAppointmentAction}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(recentActivities as any[])?.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No recent activities</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Plus className="w-6 h-6 mb-2" />
                    Create Package
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    View Patients
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <PhoneCall className="w-6 h-6 mb-2" />
                    Emergency Care
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <CardTitle>Appointment Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                        data-testid="input-search-patients"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterDate} onValueChange={setFilterDate}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse h-32 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment: any) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onAction={handleAppointmentAction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No appointments found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>View and manage patient profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Patient management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs placeholder */}
          {["packages", "corporate", "billing", "emergency", "settings"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab} Management</CardTitle>
                  <CardDescription>Manage your {tab} related tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tab} management features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}