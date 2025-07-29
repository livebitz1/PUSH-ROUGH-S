import {
  users,
  dentists,
  appointments,
  timeSlots,
  products,
  doctorUsers,
  doctorAppointments,
  adminUsers,
  orders,
  type User,
  type UpsertUser,
  type Dentist,
  type InsertDentist,
  type Appointment,
  type InsertAppointment,
  type TimeSlot,
  type InsertTimeSlot,
  type AppointmentWithDentist,
  type DentistWithTimeSlots,
  type Product,
  type DoctorUser,
  type InsertDoctorUser,
  type AdminUser,
  type InsertAdminUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, asc, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: string;
    address: string;
  }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Dentist operations
  getDentists(): Promise<Dentist[]>;
  getDentist(id: number): Promise<Dentist | undefined>;
  createDentist(dentist: InsertDentist): Promise<Dentist>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getUserAppointments(userId: number): Promise<AppointmentWithDentist[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  cancelAppointment(id: number, userId: number): Promise<boolean>;
  
  // Time slot operations
  getDentistTimeSlots(dentistId: number, date: string): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  markTimeSlotUnavailable(dentistId: number, date: string, startTime: string): Promise<void>;

  // Product operations
  getAllProducts(filters?: { category?: string; sort?: string; search?: string }): Promise<Product[]>;

  // Doctor operations
  getDoctorById(id: number): Promise<DoctorUser | undefined>;
  getDoctorByEmail(email: string): Promise<DoctorUser | undefined>;
  getDoctorByPhone(phoneNumber: string): Promise<DoctorUser | undefined>;
  createDoctorUser(userData: Omit<InsertDoctorUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DoctorUser>;
  updateDoctorPassword(id: number, hashedPassword: string): Promise<void>;
  updateDoctorLastLogin(id: number): Promise<void>;
  
  // Doctor dashboard
  getDoctorStats(doctorId: number): Promise<any>;
  getDoctorAppointments(doctorId: number, filters?: any): Promise<any[]>;
  updateDoctorAppointmentStatus(appointmentId: number, status: string, doctorId: number): Promise<void>;

  // Admin operations
  getAdminById(id: number): Promise<AdminUser | undefined>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminByPhone(phoneNumber: string): Promise<AdminUser | undefined>;
  createAdminUser(userData: Omit<InsertAdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser>;
  updateAdminPassword(id: number, hashedPassword: string): Promise<void>;
  updateAdminLastLogin(id: number): Promise<void>;
  
  // Admin dashboard
  getAdminStats(): Promise<any>;
  getAllUsersForAdmin(): Promise<any[]>;
  getAllDoctorsForAdmin(): Promise<any[]>;
  getAllAppointmentsForAdmin(): Promise<any[]>;
  getAllProductsForAdmin(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(userData: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: string;
    address: string;
  }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Dentist operations
  async getDentists(): Promise<Dentist[]> {
    return await db.select().from(dentists).orderBy(desc(dentists.rating));
  }

  async getDentist(id: number): Promise<Dentist | undefined> {
    const [dentist] = await db.select().from(dentists).where(eq(dentists.id, id));
    return dentist;
  }

  async createDentist(dentist: InsertDentist): Promise<Dentist> {
    const [newDentist] = await db.insert(dentists).values(dentist).returning();
    return newDentist;
  }

  // Appointment operations
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async getUserAppointments(userId: number): Promise<AppointmentWithDentist[]> {
    return await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        dentistId: appointments.dentistId,
        date: appointments.date,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        consultationType: appointments.consultationType,
        reason: appointments.reason,
        status: appointments.status,
        price: appointments.price,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        dentist: {
          id: dentists.id,
          name: dentists.name,
          specialty: dentists.specialty,
          education: dentists.education,
          location: dentists.location,
          avatar: dentists.avatar,
          rating: dentists.rating,
          reviewCount: dentists.reviewCount,
          priceFrom: dentists.priceFrom,
          offersVideo: dentists.offersVideo,
          offersClinic: dentists.offersClinic,
          bio: dentists.bio,
          createdAt: dentists.createdAt,
        },
      })
      .from(appointments)
      .innerJoin(dentists, eq(appointments.dentistId, dentists.id))
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.date), desc(appointments.startTime));
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async cancelAppointment(id: number, userId: number): Promise<boolean> {
    const result = await db
      .update(appointments)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Time slot operations
  async getDentistTimeSlots(dentistId: number, date: string): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.dentistId, dentistId),
          eq(timeSlots.date, date),
          eq(timeSlots.isAvailable, true)
        )
      )
      .orderBy(asc(timeSlots.startTime));
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [newTimeSlot] = await db.insert(timeSlots).values(timeSlot).returning();
    return newTimeSlot;
  }

  async markTimeSlotUnavailable(dentistId: number, date: string, startTime: string): Promise<void> {
    await db
      .update(timeSlots)
      .set({ isAvailable: false })
      .where(
        and(
          eq(timeSlots.dentistId, dentistId),
          eq(timeSlots.date, date),
          eq(timeSlots.startTime, startTime)
        )
      );
  }

  // Product operations
  async getAllProducts(filters?: { category?: string; sort?: string; search?: string }): Promise<Product[]> {
    // Build where conditions array
    const conditions = [eq(products.isActive, true)];
    
    // Add category filter
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(products.category, filters.category));
    }

    // Add search filter
    if (filters?.search) {
      const searchCondition = or(
        ilike(products.name, `%${filters.search}%`),
        ilike(products.description, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Execute query with combined conditions
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
    let result = await db.select().from(products).where(whereCondition);

    // Apply sorting
    if (filters?.sort) {
      switch (filters.sort) {
        case 'price_asc':
          result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price_desc':
          result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    return result;
  }

  // Doctor operations
  async getDoctorById(id: number): Promise<DoctorUser | undefined> {
    const [doctor] = await db.select().from(doctorUsers).where(eq(doctorUsers.id, id));
    return doctor;
  }

  async getDoctorByEmail(email: string): Promise<DoctorUser | undefined> {
    const [doctor] = await db.select().from(doctorUsers).where(eq(doctorUsers.email, email));
    return doctor;
  }

  async getDoctorByPhone(phoneNumber: string): Promise<DoctorUser | undefined> {
    const [doctor] = await db.select().from(doctorUsers).where(eq(doctorUsers.phoneNumber, phoneNumber));
    return doctor;
  }

  async createDoctorUser(userData: Omit<InsertDoctorUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DoctorUser> {
    const [doctor] = await db.insert(doctorUsers).values(userData).returning();
    return doctor;
  }

  async updateDoctorPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(doctorUsers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(doctorUsers.id, id));
  }

  async updateDoctorLastLogin(id: number): Promise<void> {
    await db
      .update(doctorUsers)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(doctorUsers.id, id));
  }

  // Doctor dashboard operations
  async getDoctorStats(doctorId: number): Promise<any> {
    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await db
      .select()
      .from(doctorAppointments)
      .where(and(
        eq(doctorAppointments.doctorId, doctorId),
        eq(doctorAppointments.appointmentDate, today)
      ));

    // Get pending appointments count
    const pendingAppointments = await db
      .select()
      .from(doctorAppointments)
      .where(and(
        eq(doctorAppointments.doctorId, doctorId),
        eq(doctorAppointments.status, 'pending')
      ));

    // Get total unique patients count
    const totalPatientsResult = await db
      .selectDistinct({ patientId: doctorAppointments.patientId })
      .from(doctorAppointments)
      .where(eq(doctorAppointments.doctorId, doctorId));

    // Get monthly earnings (current month)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    return {
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingAppointments.length,
      totalPatients: totalPatientsResult.length,
      monthlyEarnings: 0, // Calculate from billing records later
    };
  }

  async getDoctorAppointments(doctorId: number, filters?: any): Promise<any[]> {
    const baseQuery = db
      .select({
        id: doctorAppointments.id,
        doctorId: doctorAppointments.doctorId,
        patientId: doctorAppointments.patientId,
        appointmentDate: doctorAppointments.appointmentDate,
        appointmentTime: doctorAppointments.appointmentTime,
        duration: doctorAppointments.duration,
        consultationType: doctorAppointments.consultationType,
        status: doctorAppointments.status,
        reason: doctorAppointments.reason,
        notes: doctorAppointments.notes,
        isEmergency: doctorAppointments.isEmergency,
        totalAmount: doctorAppointments.totalAmount,
        createdAt: doctorAppointments.createdAt,
        patient: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
        }
      })
      .from(doctorAppointments)
      .innerJoin(users, eq(doctorAppointments.patientId, users.id));

    // Build conditions array
    const conditions = [eq(doctorAppointments.doctorId, doctorId)];

    // Add filters if provided
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(doctorAppointments.status, filters.status));
    }

    if (filters?.date) {
      const today = new Date().toISOString().split('T')[0];
      switch (filters.date) {
        case 'today':
          conditions.push(eq(doctorAppointments.appointmentDate, today));
          break;
        // Add more date filters as needed
      }
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    return await baseQuery
      .where(whereCondition)
      .orderBy(desc(doctorAppointments.appointmentDate), desc(doctorAppointments.appointmentTime));
  }

  async updateDoctorAppointmentStatus(appointmentId: number, status: string, doctorId: number): Promise<void> {
    await db
      .update(doctorAppointments)
      .set({ status, updatedAt: new Date() })
      .where(and(
        eq(doctorAppointments.id, appointmentId),
        eq(doctorAppointments.doctorId, doctorId)
      ));
  }

  // Admin operations
  async getAdminById(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin;
  }

  async getAdminByPhone(phoneNumber: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.phoneNumber, phoneNumber));
    return admin;
  }

  async createAdminUser(userData: Omit<InsertAdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const [admin] = await db.insert(adminUsers).values(userData).returning();
    return admin;
  }

  async updateAdminPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(adminUsers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  // Admin dashboard operations
  async getAdminStats(): Promise<any> {
    // Get total users count
    const totalUsersResult = await db.select().from(users);
    
    // Get total doctors count
    const totalDoctorsResult = await db.select().from(doctorUsers).where(eq(doctorUsers.isActive, true));
    
    // Get total appointments count
    const totalAppointmentsResult = await db.select().from(appointments);
    
    // Get orders data
    const ordersResult = await db.select().from(orders);
    const monthlyRevenue = ordersResult.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalRevenue = monthlyRevenue; // In a real app, this would be total all-time revenue
    
    // Get pending approvals (pending appointments)
    const pendingAppointmentsResult = await db
      .select()
      .from(appointments)
      .where(eq(appointments.status, 'pending'));
    
    // Get active products count
    const activeProductsResult = await db.select().from(products).where(eq(products.isActive, true));
    
    return {
      totalUsers: totalUsersResult.length,
      totalDoctors: totalDoctorsResult.length,
      totalAppointments: totalAppointmentsResult.length,
      totalOrders: ordersResult.length,
      monthlyRevenue: monthlyRevenue,
      totalRevenue: totalRevenue,
      pendingApprovals: pendingAppointmentsResult.length,
      activeProducts: activeProductsResult.length,
      supportTickets: 5, // This would come from a support_tickets table
      systemHealth: "Good", // This would be calculated based on system metrics
    };
  }

  async getAllUsersForAdmin(): Promise<any[]> {
    const usersList = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        age: users.age,
        gender: users.gender,
        address: users.address,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
    
    // Add isActive field based on business logic
    return usersList.map(user => ({
      ...user,
      isActive: true
    }));
  }

  async getAllDoctorsForAdmin(): Promise<any[]> {
    return await db
      .select()
      .from(doctorUsers)
      .orderBy(desc(doctorUsers.createdAt));
  }

  async getAllAppointmentsForAdmin(): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        dentistId: appointments.dentistId,
        date: appointments.date,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        consultationType: appointments.consultationType,
        reason: appointments.reason,
        status: appointments.status,
        price: appointments.price,
        createdAt: appointments.createdAt,
        patient: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.phoneNumber,
        },
        doctor: {
          id: dentists.id,
          name: dentists.name,
          specialty: dentists.specialty,
        }
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.userId, users.id))
      .innerJoin(dentists, eq(appointments.dentistId, dentists.id))
      .orderBy(desc(appointments.createdAt));
  }

  async getAllProductsForAdmin(): Promise<any[]> {
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));
  }
}

export const storage = new DatabaseStorage();
