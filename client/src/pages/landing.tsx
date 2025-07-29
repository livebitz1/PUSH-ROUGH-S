import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import DentistCard from "@/components/DentistCard";
import DentalEducation from "@/components/DentalEducation";
import ServicesGrid from "@/components/ServicesGrid";
import PatientTestimonials from "@/components/PatientTestimonials";
import BookingFlow from "@/components/BookingFlow";
import AuthModal from "@/components/AuthModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { Stethoscope, Search, Calendar, UserRound, Facebook, Twitter, Instagram, MapPin, Globe, Users, ShoppingCart } from "lucide-react";
import logoPath from "@assets/Logo png_1752749850863.png";
// import bannerImagePath from "@assets/young-female-patient-having-dental-procedure-orthodontist_1752754804062.jpg";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const { data: dentists, isLoading } = useQuery({
    queryKey: ["/api/dentists"],
  });

  const handleSignIn = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  const handleSwitchAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Search:", { searchLocation, selectedSpecialty });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-light-bg">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-medical-blue to-medical-blue-dark text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80"
            alt="Professional dental care at Santepheap Clinic"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-medical-blue bg-opacity-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Create Your Beautiful Smile in Cambodia</h2>
              <p className="text-xl mb-8 text-blue-100 max-w-2xl lg:mx-0 mx-auto">
                ISO 9001:2015 Certified dental clinic providing world-class dental care. Serving locals, expats, and international tourists with professional multilingual support.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl lg:mx-0 mx-auto bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter city (Phnom Penh, Siem Reap, Battambang...)"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full text-dark-gray"
                    />
                  </div>
                  <div className="flex-1">
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger className="w-full text-dark-gray">
                        <SelectValue placeholder="All Specialties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        <SelectItem value="general">General Dentistry</SelectItem>
                        <SelectItem value="orthodontics">Orthodontics</SelectItem>
                        <SelectItem value="implant">Dental Implants</SelectItem>
                        <SelectItem value="veneer">Veneers</SelectItem>
                        <SelectItem value="whitening">Teeth Whitening</SelectItem>
                        <SelectItem value="oral-surgery">Oral Surgery</SelectItem>
                        <SelectItem value="emergency">Emergency Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSearch} className="bg-medical-blue hover:bg-medical-blue-dark">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <Stethoscope className="text-white text-4xl" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Why Choose Santepheap?</h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    ISO 9001:2015 Certified Clinic
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    English & Khmer Speaking Staff
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    Tourist-Friendly Scheduling
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    Modern Equipment & Facilities
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    Convenient Online Product Store
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-dark-gray mb-4">Why Choose Santepheap?</h3>
            <p className="text-medium-gray text-lg">Trusted by locals, expats, and international visitors</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="bg-medical-blue rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-dark-gray mb-2">Multilingual Support</h4>
              <p className="text-medium-gray">English and Khmer speaking dentists available. Perfect for expats and tourists.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-success-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-dark-gray mb-2">Nationwide Coverage</h4>
              <p className="text-medium-gray">Dental clinics in Phnom Penh, Siem Reap, Battambang, and other major cities.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-warning-amber rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-white text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-dark-gray mb-2">Tourist-Friendly</h4>
              <p className="text-medium-gray">Flexible scheduling and international payment options for visitors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dentist Listings */}
      <section className="py-16 bg-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-dark-gray mb-4">Featured Dental Professionals</h3>
            <p className="text-medium-gray text-lg">Verified dentists with excellent patient reviews across Cambodia</p>
          </div>

          {/* Dentist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center mb-4">
                    <Skeleton className="w-16 h-16 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </Card>
              ))
            ) : (
              dentists?.map((dentist) => (
                <DentistCard key={dentist.id} dentist={dentist} />
              ))
            )}
          </div>
        </div>
      </section>



      {/* Services Grid */}
      <ServicesGrid />

      {/* Dental Education */}
      <DentalEducation />

      {/* Patient Testimonials */}
      <PatientTestimonials />

      {/* Booking Flow */}
      <BookingFlow />



      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={handleSwitchAuthMode}
      />
      </div>
      <Footer />
    </>
  );
}
