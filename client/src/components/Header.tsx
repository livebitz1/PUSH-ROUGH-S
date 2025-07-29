import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Stethoscope, ShoppingCart, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
// import logoPath from "@assets/Logo png_1752749850863.png";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const [, setLocation] = useLocation();
  
  // Debug logging (removed to reduce console noise)
  // console.log("Header render - isAuthenticated:", isAuthenticated, "user:", user);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Clear the cache completely
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      // Redirect to landing page
      setLocation("/");
    },
  });

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
  };

  const handleSwitchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <img 
              src="https://via.placeholder.com/40x40?text=Logo" 
              alt="Santepheap Dental Clinic" 
              className="h-10 w-10 mr-3 object-contain"
            />
            <h1 className="text-2xl font-bold text-dark-gray">Santepheap</h1>
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-medium-gray hover:text-medical-blue transition-colors">
                My Appointments
              </Link>
              <Link href="/booking" className="text-medium-gray hover:text-medical-blue transition-colors">
                Book Appointment
              </Link>
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dentists">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Find Dentist
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="flex items-center gap-2 relative">
                    <ShoppingCart className="h-4 w-4" />
                    Shop Products
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.firstName || "User"} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-dark-gray font-medium">
                    {user?.fullName || user?.firstName || "User"}
                  </span>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="km">🇰🇭 ខ្មែរ</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Link href="/products">
                  <Button variant="outline" className="flex items-center gap-2 bg-white border-2 border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white relative">
                    <ShoppingCart className="h-4 w-4" />
                    Shop Products
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/dentists">
                  <Button variant="outline" className="flex items-center gap-2 bg-white border-2 border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
                    <Stethoscope className="h-4 w-4" />
                    Find Dentist
                  </Button>
                </Link>
                <Button onClick={handleSignIn} className="bg-medical-blue hover:bg-medical-blue-dark text-white">
                  Sign In
                </Button>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="km">🇰🇭 ខ্মែរ</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={handleSwitchAuthMode}
      />
    </header>
  );
}
