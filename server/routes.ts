import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import { db } from "./db";
import { products, orders, orderItems } from "@shared/schema";
import { eq, ilike, asc, desc } from "drizzle-orm";
import { insertAppointmentSchema } from "@shared/schema";

// Custom authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {

  // Custom Auth Routes
  const sendOtpSchema = z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
  });

  const verifyOtpSchema = z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    mode: z.enum(["signin", "signup"]),
    userData: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      age: z.number(),
      gender: z.string(),
      address: z.string(),
    }).optional(),
  });

  const completeSignupSchema = z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
  });

  // Store OTP temporarily in memory (in production, use Redis or database)
  const otpStore = new Map<string, { otp: string; expires: number; userData?: any }>();

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const userData = sendOtpSchema.parse(req.body);
      const { phoneNumber } = userData;
      
      // Generate OTP (for demo, always use 123456)
      const otp = "123456";
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // Store OTP and user data for signup
      otpStore.set(phoneNumber, { otp, expires, userData });
      
      // In production, send SMS here
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(400).json({ message: "Failed to send OTP" });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phoneNumber, otp, mode, userData } = verifyOtpSchema.parse(req.body);
      
      // Check OTP
      const storedData = otpStore.get(phoneNumber);
      if (!storedData || storedData.otp !== otp || storedData.expires < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Remove used OTP
      otpStore.delete(phoneNumber);
      
      if (mode === "signin") {
        // Check if user exists
        const user = await storage.getUserByPhone(phoneNumber);
        if (!user) {
          return res.status(400).json({ message: "No account found with this phone number. Please sign up to create a new account." });
        }
        
        // Create session
        (req.session as any).user = { id: user.id, phoneNumber: user.phoneNumber };
        res.json({ success: true, user });
      } else {
        // Sign up mode - check if user already exists
        const existingUser = await storage.getUserByPhone(phoneNumber);
        if (existingUser) {
          return res.status(400).json({ message: "Account already exists with this phone number" });
        }
        
        // Create user with all the provided data
        if (!userData) {
          return res.status(400).json({ message: "User data is required for signup" });
        }
        
        const user = await storage.createUser({
          phoneNumber,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          address: userData.address,
        });
        
        // Create session
        (req.session as any).user = { id: user.id, phoneNumber: user.phoneNumber };
        res.json({ success: true, user });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(400).json({ message: "Failed to verify OTP" });
    }
  });

  app.post('/api/auth/complete-signup', async (req, res) => {
    try {
      const { phoneNumber, firstName, lastName, email } = completeSignupSchema.parse(req.body);
      
      // Check if there's a pending signup
      const pendingSignup = (req.session as any).pendingSignup;
      if (!pendingSignup || pendingSignup.phoneNumber !== phoneNumber) {
        return res.status(400).json({ message: "Invalid signup session" });
      }
      
      // Create user
      const user = await storage.createUser({
        phoneNumber,
        firstName,
        lastName,
        email,
      });
      
      // Create session
      (req.session as any).user = { id: user.id, phoneNumber: user.phoneNumber };
      delete (req.session as any).pendingSignup;
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error completing signup:", error);
      res.status(400).json({ message: "Failed to complete signup" });
    }
  });



  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Dentist routes
  app.get("/api/dentists", async (req, res) => {
    try {
      const dentists = await storage.getDentists();
      res.json(dentists);
    } catch (error) {
      console.error("Error fetching dentists:", error);
      res.status(500).json({ message: "Failed to fetch dentists" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, sort, search } = req.query;
      const products = await storage.getAllProducts({
        category: category as string,
        sort: sort as string,
        search: search as string,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/dentists/:id", async (req, res) => {
    try {
      const dentistId = parseInt(req.params.id);
      const dentist = await storage.getDentist(dentistId);
      if (!dentist) {
        return res.status(404).json({ message: "Dentist not found" });
      }
      res.json(dentist);
    } catch (error) {
      console.error("Error fetching dentist:", error);
      res.status(500).json({ message: "Failed to fetch dentist" });
    }
  });

  // Time slots routes
  app.get("/api/dentists/:id/timeslots", async (req, res) => {
    try {
      const dentistId = parseInt(req.params.id);
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const timeSlots = await storage.getDentistTimeSlots(dentistId, date);
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Appointment routes
  app.post("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      const appointment = await storage.createAppointment({
        ...appointmentData,
        userId,
      });

      // Mark the time slot as unavailable
      if (appointmentData.dentistId) {
        await storage.markTimeSlotUnavailable(
          appointmentData.dentistId,
          appointmentData.date,
          appointmentData.startTime
        );
      }

      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const appointments = await storage.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const appointment = await storage.updateAppointmentStatus(appointmentId, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  app.delete("/api/appointments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = (req.session as any).user.id;
      
      const success = await storage.cancelAppointment(appointmentId, userId);
      if (!success) {
        return res.status(404).json({ message: "Appointment not found or unauthorized" });
      }

      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, sort } = req.query;
      
      let query = db.select().from(products).where(eq(products.isActive, true));
      
      if (category && category !== "all") {
        query = query.where(eq(products.category, category as string));
      }
      
      if (search) {
        query = query.where(ilike(products.name, `%${search}%`));
      }
      
      // Apply sorting
      if (sort === "price_asc") {
        query = query.orderBy(asc(products.price));
      } else if (sort === "price_desc") {
        query = query.orderBy(desc(products.price));
      } else if (sort === "popular") {
        query = query.orderBy(desc(products.isFeatured));
      } else {
        query = query.orderBy(asc(products.name));
      }
      
      const productList = await query;
      res.json(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const [product] = await db.select().from(products).where(eq(products.id, productId));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Orders routes
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { items, shippingAddress, billingAddress } = req.body;
      
      // Calculate order totals
      let subtotal = 0;
      const orderItemsData = [];
      
      for (const item of items) {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        const itemTotal = parseFloat(product.price) * item.quantity;
        subtotal += itemTotal;
        
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal.toFixed(2),
        });
      }
      
      const shippingFee = 5.99; // Fixed shipping fee
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + shippingFee + tax;
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create order
      const [order] = await db.insert(orders).values({
        userId,
        orderNumber,
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        shippingAddress,
        billingAddress,
        status: "pending",
        paymentStatus: "pending",
      }).returning();
      
      // Create order items
      const orderItemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        orderId: order.id,
      }));
      
      await db.insert(orderItems).values(orderItemsWithOrderId);
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // ============ DOCTOR AUTHENTICATION ROUTES ============
  
  // Doctor login
  app.post("/api/doctor/login", async (req, res) => {
    try {
      const { emailOrPhone, password, rememberMe } = req.body;
      
      // Find doctor by email or phone
      let doctor = await storage.getDoctorByEmail(emailOrPhone);
      if (!doctor) {
        doctor = await storage.getDoctorByPhone(emailOrPhone);
      }
      
      if (!doctor) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password (in production, use bcrypt.compare)
      if (doctor.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!doctor.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Update last login
      await storage.updateDoctorLastLogin(doctor.id);

      // Set session
      (req.session as any).doctorId = doctor.id;
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // Remove password from response
      const { password: _, ...doctorResponse } = doctor;
      res.json({ message: "Login successful", doctor: doctorResponse });
    } catch (error) {
      console.error("Error during doctor login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Doctor logout
  app.post("/api/doctor/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current doctor user
  app.get("/api/doctor/auth/user", async (req, res) => {
    try {
      if (!(req.session as any).doctorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const doctor = await storage.getDoctorById((req.session as any).doctorId);
      if (!doctor) {
        return res.status(401).json({ message: "Doctor not found" });
      }

      const { password: _, ...doctorResponse } = doctor;
      res.json(doctorResponse);
    } catch (error) {
      console.error("Error getting doctor user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Doctor forgot password
  app.post("/api/doctor/forgot-password", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      const doctor = await storage.getDoctorByPhone(phoneNumber);
      if (!doctor) {
        return res.status(404).json({ message: "No account found with this phone number" });
      }

      const otp = otpStore.generate(phoneNumber);
      console.log(`Doctor password reset OTP for ${phoneNumber}: ${otp}`);
      
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending reset OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Verify reset OTP
  app.post("/api/doctor/verify-reset-otp", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      if (!otpStore.verify(phoneNumber, otp)) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      res.json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("Error verifying reset OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Reset password
  app.post("/api/doctor/reset-password", async (req, res) => {
    try {
      const { phoneNumber, newPassword } = req.body;
      
      const doctor = await storage.getDoctorByPhone(phoneNumber);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // In production, hash the password with bcrypt
      await storage.updateDoctorPassword(doctor.id, newPassword);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // ============ DOCTOR DASHBOARD ROUTES ============

  // Doctor middleware
  const requireDoctorAuth = async (req: any, res: any, next: any) => {
    if (!(req.session as any).doctorId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Get dashboard stats
  app.get("/api/doctor/dashboard/stats", requireDoctorAuth, async (req: any, res) => {
    try {
      const stats = await storage.getDoctorStats((req.session as any).doctorId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Get doctor appointments
  app.get("/api/doctor/appointments", requireDoctorAuth, async (req: any, res) => {
    try {
      const { status, date } = req.query;
      const appointments = await storage.getDoctorAppointments((req.session as any).doctorId, { status, date });
      res.json(appointments);
    } catch (error) {
      console.error("Error getting appointments:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });

  // Update appointment status
  app.post("/api/doctor/appointments/:id/:action", requireDoctorAuth, async (req: any, res) => {
    try {
      const { id, action } = req.params;
      const appointmentId = parseInt(id);
      
      let status = action;
      if (action === 'confirm') status = 'confirmed';
      if (action === 'complete') status = 'completed';
      if (action === 'cancel') status = 'cancelled';
      
      await storage.updateDoctorAppointmentStatus(appointmentId, status, (req.session as any).doctorId);
      res.json({ message: `Appointment ${action}ed successfully` });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Get recent activities (placeholder)
  app.get("/api/doctor/activities", requireDoctorAuth, async (req: any, res) => {
    try {
      // This would fetch real activities from the database
      const activities = [
        { description: "Appointment confirmed with John Doe", timestamp: "2 hours ago" },
        { description: "Treatment plan created for Sarah Smith", timestamp: "4 hours ago" },
        { description: "Video consultation completed", timestamp: "1 day ago" }
      ];
      res.json(activities);
    } catch (error) {
      console.error("Error getting activities:", error);
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  // ============ ADMIN AUTHENTICATION ROUTES ============
  
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { emailOrPhone, password, rememberMe } = req.body;
      
      // Find admin by email or phone
      let admin = await storage.getAdminByEmail(emailOrPhone);
      if (!admin) {
        admin = await storage.getAdminByPhone(emailOrPhone);
      }
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password (in production, use bcrypt.compare)
      if (admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!admin.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Update last login
      await storage.updateAdminLastLogin(admin.id);

      // Set session
      (req.session as any).adminId = admin.id;
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      // Remove password from response
      const { password: _, ...adminResponse } = admin;
      res.json({ message: "Login successful", admin: adminResponse });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current admin user
  app.get("/api/admin/auth/user", async (req, res) => {
    try {
      if (!(req.session as any).adminId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const admin = await storage.getAdminById((req.session as any).adminId);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      const { password: _, ...adminResponse } = admin;
      res.json(adminResponse);
    } catch (error) {
      console.error("Error getting admin user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // ============ ADMIN DASHBOARD ROUTES ============

  // Admin middleware
  const requireAdminAuth = async (req: any, res: any, next: any) => {
    if (!(req.session as any).adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Get admin dashboard stats
  app.get("/api/admin/dashboard/stats", requireAdminAuth, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", requireAdminAuth, async (req: any, res) => {
    try {
      const users = await storage.getAllUsersForAdmin();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Get all doctors for admin
  app.get("/api/admin/doctors", requireAdminAuth, async (req: any, res) => {
    try {
      const doctors = await storage.getAllDoctorsForAdmin();
      res.json(doctors);
    } catch (error) {
      console.error("Error getting doctors:", error);
      res.status(500).json({ message: "Failed to get doctors" });
    }
  });

  // Get all appointments for admin
  app.get("/api/admin/appointments", requireAdminAuth, async (req: any, res) => {
    try {
      const appointments = await storage.getAllAppointmentsForAdmin();
      res.json(appointments);
    } catch (error) {
      console.error("Error getting appointments:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });

  // Get all products for admin
  app.get("/api/admin/products", requireAdminAuth, async (req: any, res) => {
    try {
      const products = await storage.getAllProductsForAdmin();
      res.json(products);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
