import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Shield,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Building2,
  Stethoscope,
  ShoppingCart,
  Package,
  LogOut,
} from "lucide-react";

// Admin dashboard stats interface
interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  activeProducts: number;
  systemHealth: string;
}

// Component for stat cards
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: string; isPositive: boolean };
  color?: string;
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Check authentication
  const { data: admin, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    retry: false,
  });

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: !!admin,
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!admin && activeTab === "users",
  });

  // Fetch doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ["/api/admin/doctors"],
    enabled: !!admin && activeTab === "doctors",
  });

  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/admin/appointments"],
    enabled: !!admin && activeTab === "appointments",
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    enabled: !!admin && activeTab === "products",
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!adminLoading && !admin) {
      setLocation("/admin-login");
    }
  }, [admin, adminLoading, setLocation]);

  if (adminLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <Avatar>
                <AvatarImage src={(admin as any)?.profileImage} />
                <AvatarFallback>
                  {(admin as any)?.firstName?.[0]}{(admin as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{(admin as any)?.firstName} {(admin as any)?.lastName}</p>
                <p className="text-gray-500">Administrator</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-12 h-auto">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
            <TabsTrigger value="doctors" className="text-xs">Doctors</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs">Appointments</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-xs">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="support" className="text-xs">Support</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Users"
                value={(stats as any)?.totalUsers || 0}
                subtitle="Registered patients"
                icon={Users}
                trend={{ value: "+12% this month", isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Active Doctors"
                value={(stats as any)?.totalDoctors || 0}
                subtitle="Verified doctors"
                icon={Stethoscope}
                trend={{ value: "+2 this week", isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Total Appointments"
                value={(stats as any)?.totalAppointments || 0}
                subtitle="All time bookings"
                icon={Calendar}
                trend={{ value: "+8% this week", isPositive: true }}
                color="purple"
              />
              <StatsCard
                title="Monthly Revenue"
                value={`$${(stats as any)?.monthlyRevenue || 0}`}
                subtitle="This month"
                icon={DollarSign}
                trend={{ value: "+15% from last month", isPositive: true }}
                color="indigo"
              />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <StatsCard
                title="Total Orders"
                value={(stats as any)?.totalOrders || 0}
                subtitle="Product orders"
                icon={ShoppingCart}
                color="blue"
              />
              <StatsCard
                title="Active Products"
                value={(stats as any)?.activeProducts || 0}
                subtitle="In store"
                icon={Package}
                color="green"
              />
              <StatsCard
                title="Pending Approvals"
                value={(stats as any)?.pendingApprovals || 0}
                subtitle="Requires attention"
                icon={UserCheck}
                color="yellow"
              />
              <StatsCard
                title="Total Revenue"
                value={`$${(stats as any)?.totalRevenue || 0}`}
                subtitle="All time earnings"
                icon={DollarSign}
                color="green"
              />
              <StatsCard
                title="Support Tickets"
                value={(stats as any)?.supportTickets || 0}
                subtitle="Open tickets"
                icon={Bell}
                color="red"
              />
              <StatsCard
                title="System Health"
                value={(stats as any)?.systemHealth || "Good"}
                subtitle="All systems operational"
                icon={TrendingUp}
                color="green"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab("doctors")}
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add Doctor</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab("reports")}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>View Reports</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="w-6 h-6" />
                    <span>System Settings</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab("support")}
                  >
                    <Bell className="w-6 h-6" />
                    <span>Support Center</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Download className="w-6 h-6" />
                    <span>Export Data</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="w-6 h-6" />
                    <span>Send Notifications</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    (users as any[]).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.profileImage} />
                            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Blocked"}
                          </Badge>
                          <Button variant="ghost" size="sm" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit User">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={user.isActive ? "Block User" : "Unblock User"}
                            className="text-yellow-600"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" title="Delete User">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Doctor Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {doctorsLoading ? (
                    <div className="text-center py-8">Loading doctors...</div>
                  ) : (
                    (doctors as any[]).map((doctor: any) => (
                      <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={doctor.profileImage} />
                            <AvatarFallback>Dr. {doctor.firstName?.[0]}{doctor.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</p>
                            <p className="text-sm text-gray-500">{doctor.specialization}</p>
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={doctor.isActive ? "default" : "secondary"}>
                            {doctor.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={doctor.isVerified ? "default" : "destructive"}>
                            {doctor.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointment Management</h2>
              <div className="flex items-center space-x-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="text-center py-8">Loading appointments...</div>
                  ) : (
                    (appointments as any[]).map((appointment: any) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Calendar className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</p>
                            <p className="text-sm text-gray-500">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
                            <p className="text-sm text-gray-500">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              appointment.status === 'confirmed' ? 'default' : 
                              appointment.status === 'pending' ? 'secondary' :
                              appointment.status === 'completed' ? 'outline' : 'destructive'
                            }
                          >
                            {appointment.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {productsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : (
                    (products as any[]).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <p className="text-sm font-medium text-green-600">${product.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={product.isFeatured ? "default" : "outline"}>
                            {product.isFeatured ? "Featured" : "Regular"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Billing & Payment Management</h2>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Reports
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard
                title="Monthly Revenue"
                value="$12,450"
                subtitle="This month earnings"
                icon={DollarSign}
                color="green"
              />
              <StatsCard
                title="Pending Payments"
                value="$2,340"
                subtitle="Awaiting payment"
                icon={Bell}
                color="yellow"
              />
              <StatsCard
                title="Total Transactions"
                value="328"
                subtitle="This month"
                icon={BarChart3}
                color="blue"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Payment transactions and billing records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((transaction) => (
                    <div key={transaction} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Payment from John Doe</p>
                          <p className="text-sm text-gray-500">Dental consultation - Invoice #INV-{1000 + transaction}</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+$125.00</p>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Prescription Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((prescription) => (
                    <div key={prescription} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Prescription #{1000 + prescription}</p>
                          <p className="text-sm text-gray-500">Patient: Sarah Johnson</p>
                          <p className="text-sm text-gray-500">Doctor: Dr. Smith</p>
                          <p className="text-xs text-gray-400">Issued: 2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="ghost" size="sm" title="View Prescription">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit Prescription">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Reports & Analytics</h2>
              <div className="flex items-center space-x-4">
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Revenue Report</h3>
                    <p className="text-sm text-gray-500">Monthly earnings breakdown</p>
                    <Button variant="outline" className="mt-2" size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold">Patient Report</h3>
                    <p className="text-sm text-gray-500">Demographics & statistics</p>
                    <Button variant="outline" className="mt-2" size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">Appointment Report</h3>
                    <p className="text-sm text-gray-500">Booking patterns & trends</p>
                    <Button variant="outline" className="mt-2" size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <h3 className="font-semibold">Doctor Performance</h3>
                    <p className="text-sm text-gray-500">Ratings & metrics</p>
                    <Button variant="outline" className="mt-2" size="sm">Generate</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Notification Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Send New Notification</CardTitle>
                  <CardDescription>Send notifications to users or doctors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Recipient Type</label>
                    <Select defaultValue="all-users">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-users">All Users</SelectItem>
                        <SelectItem value="all-doctors">All Doctors</SelectItem>
                        <SelectItem value="specific-user">Specific User</SelectItem>
                        <SelectItem value="specific-doctor">Specific Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notification Type</label>
                    <Select defaultValue="general">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="appointment">Appointment Reminder</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="system">System Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Notification title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea 
                      className="w-full p-3 border rounded-md" 
                      rows={4} 
                      placeholder="Notification message"
                    />
                  </div>
                  <Button className="w-full">Send Notification</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Previously sent notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((notif) => (
                      <div key={notif} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">Appointment Reminder</p>
                            <p className="text-xs text-gray-500">Sent to all users</p>
                            <p className="text-xs text-gray-400">2 hours ago</p>
                          </div>
                          <Badge variant="outline" className="text-xs">Sent</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Content Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blog & News Management</CardTitle>
                  <CardDescription>Manage dental blogs and news articles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Blog Posts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    News & Updates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Featured Articles
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal & Policy Management</CardTitle>
                  <CardDescription>Manage terms, privacy policy, and FAQs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    FAQs Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Complaint Reasons
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Help & Support Management</h2>
              <div className="flex items-center space-x-4">
                <Badge variant="destructive">5 Open Tickets</Badge>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard
                title="Open Tickets"
                value="23"
                subtitle="Requires attention"
                icon={Bell}
                color="red"
              />
              <StatsCard
                title="Resolved Today"
                value="12"
                subtitle="Support tickets"
                icon={UserCheck}
                color="green"
              />
              <StatsCard
                title="Average Response"
                value="2.4h"
                subtitle="Response time"
                icon={TrendingUp}
                color="blue"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage user queries and complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((ticket) => (
                    <div key={ticket} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Ticket #{1000 + ticket}</p>
                          <p className="text-sm text-gray-500">Payment issue with appointment booking</p>
                          <p className="text-sm text-gray-500">From: john.doe@email.com</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={ticket % 3 === 0 ? "destructive" : ticket % 2 === 0 ? "secondary" : "default"}>
                          {ticket % 3 === 0 ? "High" : ticket % 2 === 0 ? "Medium" : "Low"}
                        </Badge>
                        <Button variant="ghost" size="sm" title="View Ticket">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Respond">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure general system settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Clinic Name</label>
                      <Input defaultValue="Santepheap Dental Clinic" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input defaultValue="admin@santepheap.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Phone</label>
                      <Input defaultValue="+855123456789" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Default Appointment Duration</label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management Settings</CardTitle>
                  <CardDescription>Configure user registration and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow User Registration</p>
                      <p className="text-sm text-gray-500">Allow new users to register</p>
                    </div>
                    <Button variant="outline">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Phone Verification</p>
                      <p className="text-sm text-gray-500">Require users to verify their phone number</p>
                    </div>
                    <Button variant="outline">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Doctor Auto-Approval</p>
                      <p className="text-sm text-gray-500">Automatically approve new doctor registrations</p>
                    </div>
                    <Button variant="outline">Toggle</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Gateway Settings</CardTitle>
                  <CardDescription>Configure payment methods and gateways</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Online Payments</p>
                      <p className="text-sm text-gray-500">Allow patients to pay online</p>
                    </div>
                    <Button variant="outline">Toggle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Subscription Plans</p>
                      <p className="text-sm text-gray-500">Enable subscription-based services</p>
                    </div>
                    <Button variant="outline">Toggle</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Platform Commission (%)</label>
                      <Input defaultValue="5" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Default Currency</label>
                      <Select defaultValue="USD">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="KHR">KHR (៛)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sub Admin Management</CardTitle>
                  <CardDescription>Manage sub-administrators and their roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Sub Admin Accounts</p>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sub Admin
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Clinic Manager</p>
                        <p className="text-sm text-gray-500">manager@santepheap.com</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Admin</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}