import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Booking from "@/pages/booking";
import Products from "@/pages/products";
import Dentists from "@/pages/dentists";
import DoctorLogin from "@/pages/DoctorLogin";
import DoctorDashboard from "@/pages/DoctorDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Doctor routes - independent of patient auth */}
      <Route path="/doctor-login" component={DoctorLogin} />
      <Route path="/doctor-dashboard" component={DoctorDashboard} />
      
      {/* Admin routes - independent of patient auth */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      
      {/* Patient routes */}
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/products" component={Products} />
          <Route path="/dentists" component={Dentists} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/booking" component={Booking} />
          <Route path="/products" component={Products} />
          <Route path="/dentists" component={Dentists} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
