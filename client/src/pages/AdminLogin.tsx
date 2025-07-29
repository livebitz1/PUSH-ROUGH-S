import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiRequest("GET", "/api/admin/auth/user");
        setLocation("/admin-dashboard");
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/admin/login", formData);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      
      setLocation("/admin-dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4 text-gray-600 hover:text-gray-800"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Login</CardTitle>
            <CardDescription className="text-gray-600">
              Access the administrative panel
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
                <Input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  placeholder="Enter email or phone number"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                  data-testid="input-email-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  data-testid="checkbox-remember-me"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me for 30 days
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    // Handle forgot password logic here
                    toast({
                      title: "Contact Administrator",
                      description: "Please contact the system administrator to reset your password.",
                    });
                  }}
                  data-testid="button-forgot-password"
                >
                  Forgot Password?
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Santepheap Dental Clinic</p>
          <p>Administrative Access Only</p>
        </div>
      </div>
    </div>
  );
}