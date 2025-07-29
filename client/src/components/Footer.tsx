import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Santepheap Dental Clinic</h3>
            <p className="text-gray-300 text-sm mb-4">
              ISO 9001:2015 certified dental clinic serving locals, expatriates, and international tourists across Cambodia.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>Cambodia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dentists" className="text-gray-300 hover:text-white transition-colors">
                  Find Dentist
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  Dental Products
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-gray-300 hover:text-white transition-colors">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+855 XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>info@santepheap.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Clock className="h-4 w-4" />
                <span>Mon-Fri: 8:00-17:00</span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>General Dentistry</li>
              <li>Orthodontics</li>
              <li>Cosmetic Dentistry</li>
              <li>Oral Surgery</li>
              <li>Video Consultations</li>
              <li>Emergency Care</li>
            </ul>
            <div className="mt-4 space-y-2">
              <Link 
                href="/doctor-login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors block"
                data-testid="link-doctor-login"
              >
                <User size={16} />
                Doctor Login
              </Link>
              <Link 
                href="/admin-login"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors block"
                data-testid="link-admin-login"
              >
                <User size={16} />
                Admin Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2025 Santepheap Dental Clinic. All rights reserved. | ISO 9001:2015 Certified
          </p>
        </div>
      </div>
    </footer>
  );
}