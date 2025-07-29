import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Calendar } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Dentist {
  id: number;
  name: string;
  specialty: string;
  education: string | null;
  location: string | null;
  avatar: string | null;
  rating: string | null;
  reviewCount: number | null;
  priceFrom: number | null;
  offersVideo: boolean | null;
  offersClinic: boolean | null;
  bio: string | null;
  createdAt: Date | null;
}

export default function Dentists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: dentists, isLoading } = useQuery<Dentist[]>({
    queryKey: ["/api/dentists"],
  });

  const filteredDentists = dentists?.filter(dentist => {
    const matchesSearch = dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dentist.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === "all" || dentist.location === locationFilter;
    const matchesSpecialty = specialtyFilter === "all" || dentist.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesSpecialty;
  }) || [];

  const handleBookAppointment = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setIsBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Your Dentist</h1>
              <p className="text-gray-600 mt-2">
                Book appointments with qualified dental professionals across Cambodia
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="hidden sm:inline-flex"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Phnom Penh">Phnom Penh</SelectItem>
                <SelectItem value="Siem Reap">Siem Reap</SelectItem>
                <SelectItem value="Battambang">Battambang</SelectItem>
                <SelectItem value="Sihanoukville">Sihanoukville</SelectItem>
              </SelectContent>
            </Select>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="general">General Dentistry</SelectItem>
                <SelectItem value="orthodontics">Orthodontics</SelectItem>
                <SelectItem value="oral surgery">Oral Surgery</SelectItem>
                <SelectItem value="pediatric">Pediatric Dentistry</SelectItem>
                <SelectItem value="cosmetic">Cosmetic Dentistry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDentists.length} of {dentists?.length || 0} dentists
          </p>
        </div>

        {/* Dentist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDentists.map((dentist) => (
            <Card key={dentist.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <img
                    src={dentist.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop"}
                    alt={dentist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{dentist.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {dentist.specialty}
                    </CardDescription>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{dentist.rating || "4.8"}</span>
                      <span className="text-sm text-gray-500">({dentist.reviewCount || 25} reviews)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {dentist.location || "Phnom Penh"}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Mon-Fri: 8:00-17:00
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Languages:</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">English</Badge>
                    <Badge variant="secondary" className="text-xs">Khmer</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Consultation Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {dentist.offersVideo && (
                      <Badge variant="outline" className="text-xs">Video</Badge>
                    )}
                    {dentist.offersClinic && (
                      <Badge variant="outline" className="text-xs">Clinic</Badge>
                    )}
                  </div>
                </div>
                
                <div className="pt-3">
                  <Button 
                    onClick={() => handleBookAppointment(dentist)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDentists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dentists found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all available dentists.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
                setSpecialtyFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDentist && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedDentist(null);
          }}
          dentist={selectedDentist}
        />
      )}
      </div>
      <Footer />
    </>
  );
}