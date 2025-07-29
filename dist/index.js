var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/static.ts
var static_exports = {};
__export(static_exports, {
  log: () => log,
  serveStatic: () => serveStatic
});
import express from "express";
import fs from "fs";
import path from "path";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
var init_static = __esm({
  "server/static.ts"() {
    "use strict";
  }
});

// server/index.ts
import dotenv from "dotenv";
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  appointments: () => appointments,
  appointmentsRelations: () => appointmentsRelations,
  billingRecords: () => billingRecords,
  chatMessages: () => chatMessages,
  corporateEmployees: () => corporateEmployees,
  corporatePartners: () => corporatePartners,
  dentists: () => dentists,
  dentistsRelations: () => dentistsRelations,
  doctorAppointments: () => doctorAppointments,
  doctorUsers: () => doctorUsers,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertDentistSchema: () => insertDentistSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductReviewSchema: () => insertProductReviewSchema,
  insertProductSchema: () => insertProductSchema,
  insertTimeSlotSchema: () => insertTimeSlotSchema,
  insertUserSchema: () => insertUserSchema,
  medicalRecords: () => medicalRecords,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  productReviews: () => productReviews,
  productReviewsRelations: () => productReviewsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  sessions: () => sessions,
  timeSlots: () => timeSlots,
  timeSlotsRelations: () => timeSlotsRelations,
  treatmentPackages: () => treatmentPackages,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  numeric,
  time,
  date,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number").unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  age: integer("age"),
  gender: varchar("gender"),
  address: text("address"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dentists = pgTable("dentists", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  specialty: varchar("specialty").notNull(),
  education: varchar("education"),
  location: varchar("location"),
  avatar: varchar("avatar"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  priceFrom: integer("price_from"),
  // price in cents
  offersVideo: boolean("offers_video").default(true),
  offersClinic: boolean("offers_clinic").default(true),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow()
});
var timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  dentistId: integer("dentist_id").references(() => dentists.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  dentistId: integer("dentist_id").references(() => dentists.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  consultationType: varchar("consultation_type").notNull(),
  // 'video' or 'clinic'
  reason: text("reason"),
  status: varchar("status").default("pending"),
  // 'pending', 'confirmed', 'cancelled', 'completed'
  price: integer("price"),
  // price in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  // 'toothbrush', 'toothpaste', 'mouthwash', 'dental_floss', 'whitening', 'accessories'
  brand: varchar("brand"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  // price in USD
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  // for discounts
  currency: varchar("currency").default("USD"),
  stockQuantity: integer("stock_quantity").default(0),
  images: text("images").array(),
  // array of image URLs
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isRecommended: boolean("is_recommended").default(false),
  // recommended by doctors
  specifications: jsonb("specifications"),
  // JSON object for product specs
  tags: text("tags").array(),
  // search tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderNumber: varchar("order_number").unique().notNull(),
  status: varchar("status").default("pending"),
  // 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  paymentMethod: varchar("payment_method"),
  // 'stripe', 'paypal', 'bank_transfer'
  paymentStatus: varchar("payment_status").default("pending"),
  // 'pending', 'paid', 'failed', 'refunded'
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  shippingAddress: jsonb("shipping_address"),
  // JSON object with address details
  billingAddress: jsonb("billing_address"),
  // JSON object with address details
  notes: text("notes"),
  estimatedDelivery: date("estimated_delivery"),
  trackingNumber: varchar("tracking_number"),
  shippingProvider: varchar("shipping_provider"),
  // 'fedex', 'dhl', 'ups', 'local_delivery'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  userId: integer("user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  // 1-5 stars
  title: varchar("title"),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  orders: many(orders),
  productReviews: many(productReviews)
}));
var dentistsRelations = relations(dentists, ({ many }) => ({
  appointments: many(appointments),
  timeSlots: many(timeSlots)
}));
var appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id]
  }),
  dentist: one(dentists, {
    fields: [appointments.dentistId],
    references: [dentists.id]
  })
}));
var timeSlotsRelations = relations(timeSlots, ({ one }) => ({
  dentist: one(dentists, {
    fields: [timeSlots.dentistId],
    references: [dentists.id]
  })
}));
var productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  reviews: many(productReviews)
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems)
}));
var orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
var productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id]
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDentistSchema = createInsertSchema(dentists).omit({
  id: true,
  createdAt: true
});
var insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
  createdAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true
});
var insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true
});
var doctorUsers = pgTable("doctor_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }).unique(),
  yearsOfExperience: integer("years_of_experience").default(0),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  availability: jsonb("availability"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  rememberToken: varchar("remember_token", { length: 255 }),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var treatmentPackages = pgTable("treatment_packages", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctorUsers.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  services: jsonb("services").notNull(),
  // Array of services included
  estimatedDuration: integer("estimated_duration"),
  // in minutes
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var doctorAppointments = pgTable("doctor_appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctorUsers.id).notNull(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  packageId: integer("package_id").references(() => treatmentPackages.id),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  duration: integer("duration").default(30),
  // in minutes
  consultationType: varchar("consultation_type", { length: 50 }).default("clinic"),
  // clinic, video
  status: varchar("status", { length: 50 }).default("pending"),
  // pending, confirmed, completed, cancelled, rescheduled
  reason: text("reason"),
  notes: text("notes"),
  prescriptions: jsonb("prescriptions"),
  treatmentPlan: text("treatment_plan"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  isEmergency: boolean("is_emergency").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctorUsers.id).notNull(),
  appointmentId: integer("appointment_id").references(() => doctorAppointments.id),
  recordType: varchar("record_type", { length: 50 }).notNull(),
  // consultation, treatment, prescription, note
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments"),
  // file URLs and metadata
  isConfidential: boolean("is_confidential").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var corporatePartners = pgTable("corporate_partners", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var corporateEmployees = pgTable("corporate_employees", {
  id: serial("id").primaryKey(),
  corporateId: integer("corporate_id").references(() => corporatePartners.id).notNull(),
  employeeId: varchar("employee_id", { length: 100 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => doctorAppointments.id).notNull(),
  senderId: integer("sender_id").notNull(),
  // can be doctor or patient
  senderType: varchar("sender_type", { length: 20 }).notNull(),
  // doctor, patient
  messageType: varchar("message_type", { length: 20 }).default("text"),
  // text, file, image
  content: text("content"),
  attachments: jsonb("attachments"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var billingRecords = pgTable("billing_records", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctorUsers.id).notNull(),
  appointmentId: integer("appointment_id").references(() => doctorAppointments.id),
  patientId: integer("patient_id").references(() => users.id).notNull(),
  serviceDescription: varchar("service_description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  // admin, super_admin
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, asc, or, ilike } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByPhone(phoneNumber) {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Dentist operations
  async getDentists() {
    return await db.select().from(dentists).orderBy(desc(dentists.rating));
  }
  async getDentist(id) {
    const [dentist] = await db.select().from(dentists).where(eq(dentists.id, id));
    return dentist;
  }
  async createDentist(dentist) {
    const [newDentist] = await db.insert(dentists).values(dentist).returning();
    return newDentist;
  }
  // Appointment operations
  async createAppointment(appointment) {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }
  async getUserAppointments(userId) {
    return await db.select({
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
        createdAt: dentists.createdAt
      }
    }).from(appointments).innerJoin(dentists, eq(appointments.dentistId, dentists.id)).where(eq(appointments.userId, userId)).orderBy(desc(appointments.date), desc(appointments.startTime));
  }
  async updateAppointmentStatus(id, status) {
    const [appointment] = await db.update(appointments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(appointments.id, id)).returning();
    return appointment;
  }
  async cancelAppointment(id, userId) {
    const result = await db.update(appointments).set({ status: "cancelled", updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(appointments.id, id), eq(appointments.userId, userId))).returning();
    return result.length > 0;
  }
  // Time slot operations
  async getDentistTimeSlots(dentistId, date2) {
    return await db.select().from(timeSlots).where(
      and(
        eq(timeSlots.dentistId, dentistId),
        eq(timeSlots.date, date2),
        eq(timeSlots.isAvailable, true)
      )
    ).orderBy(asc(timeSlots.startTime));
  }
  async createTimeSlot(timeSlot) {
    const [newTimeSlot] = await db.insert(timeSlots).values(timeSlot).returning();
    return newTimeSlot;
  }
  async markTimeSlotUnavailable(dentistId, date2, startTime) {
    await db.update(timeSlots).set({ isAvailable: false }).where(
      and(
        eq(timeSlots.dentistId, dentistId),
        eq(timeSlots.date, date2),
        eq(timeSlots.startTime, startTime)
      )
    );
  }
  // Product operations
  async getAllProducts(filters) {
    const conditions = [eq(products.isActive, true)];
    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters?.search) {
      const searchCondition = or(
        ilike(products.name, `%${filters.search}%`),
        ilike(products.description, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
    let result = await db.select().from(products).where(whereCondition);
    if (filters?.sort) {
      switch (filters.sort) {
        case "price_asc":
          result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case "price_desc":
          result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }
    return result;
  }
  // Doctor operations
  async getDoctorById(id) {
    const [doctor] = await db.select().from(doctorUsers).where(eq(doctorUsers.id, id));
    return doctor;
  }
  async getDoctorByEmail(email) {
    const [doctor] = await db.select().from(doctorUsers).where(eq(doctorUsers.email, email));
    return doctor;
  }
  async getDoctorByPhone(phoneNumber) {
    const [doctor] = await db.select().from(doctorUsers).where(eq(doctorUsers.phoneNumber, phoneNumber));
    return doctor;
  }
  async createDoctorUser(userData) {
    const [doctor] = await db.insert(doctorUsers).values(userData).returning();
    return doctor;
  }
  async updateDoctorPassword(id, hashedPassword) {
    await db.update(doctorUsers).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(doctorUsers.id, id));
  }
  async updateDoctorLastLogin(id) {
    await db.update(doctorUsers).set({ lastLoginAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(doctorUsers.id, id));
  }
  // Doctor dashboard operations
  async getDoctorStats(doctorId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayAppointments = await db.select().from(doctorAppointments).where(and(
      eq(doctorAppointments.doctorId, doctorId),
      eq(doctorAppointments.appointmentDate, today)
    ));
    const pendingAppointments = await db.select().from(doctorAppointments).where(and(
      eq(doctorAppointments.doctorId, doctorId),
      eq(doctorAppointments.status, "pending")
    ));
    const totalPatientsResult = await db.selectDistinct({ patientId: doctorAppointments.patientId }).from(doctorAppointments).where(eq(doctorAppointments.doctorId, doctorId));
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    return {
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingAppointments.length,
      totalPatients: totalPatientsResult.length,
      monthlyEarnings: 0
      // Calculate from billing records later
    };
  }
  async getDoctorAppointments(doctorId, filters) {
    const baseQuery = db.select({
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
        phoneNumber: users.phoneNumber
      }
    }).from(doctorAppointments).innerJoin(users, eq(doctorAppointments.patientId, users.id));
    const conditions = [eq(doctorAppointments.doctorId, doctorId)];
    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(doctorAppointments.status, filters.status));
    }
    if (filters?.date) {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      switch (filters.date) {
        case "today":
          conditions.push(eq(doctorAppointments.appointmentDate, today));
          break;
      }
    }
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
    return await baseQuery.where(whereCondition).orderBy(desc(doctorAppointments.appointmentDate), desc(doctorAppointments.appointmentTime));
  }
  async updateDoctorAppointmentStatus(appointmentId, status, doctorId) {
    await db.update(doctorAppointments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(doctorAppointments.id, appointmentId),
      eq(doctorAppointments.doctorId, doctorId)
    ));
  }
  // Admin operations
  async getAdminById(id) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin;
  }
  async getAdminByEmail(email) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin;
  }
  async getAdminByPhone(phoneNumber) {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.phoneNumber, phoneNumber));
    return admin;
  }
  async createAdminUser(userData) {
    const [admin] = await db.insert(adminUsers).values(userData).returning();
    return admin;
  }
  async updateAdminPassword(id, hashedPassword) {
    await db.update(adminUsers).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(adminUsers.id, id));
  }
  async updateAdminLastLogin(id) {
    await db.update(adminUsers).set({ lastLoginAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(adminUsers.id, id));
  }
  // Admin dashboard operations
  async getAdminStats() {
    const totalUsersResult = await db.select().from(users);
    const totalDoctorsResult = await db.select().from(doctorUsers).where(eq(doctorUsers.isActive, true));
    const totalAppointmentsResult = await db.select().from(appointments);
    const ordersResult = await db.select().from(orders);
    const monthlyRevenue = ordersResult.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalRevenue = monthlyRevenue;
    const pendingAppointmentsResult = await db.select().from(appointments).where(eq(appointments.status, "pending"));
    const activeProductsResult = await db.select().from(products).where(eq(products.isActive, true));
    return {
      totalUsers: totalUsersResult.length,
      totalDoctors: totalDoctorsResult.length,
      totalAppointments: totalAppointmentsResult.length,
      totalOrders: ordersResult.length,
      monthlyRevenue,
      totalRevenue,
      pendingApprovals: pendingAppointmentsResult.length,
      activeProducts: activeProductsResult.length,
      supportTickets: 5,
      // This would come from a support_tickets table
      systemHealth: "Good"
      // This would be calculated based on system metrics
    };
  }
  async getAllUsersForAdmin() {
    const usersList = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      age: users.age,
      gender: users.gender,
      address: users.address,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).orderBy(desc(users.createdAt));
    return usersList.map((user) => ({
      ...user,
      isActive: true
    }));
  }
  async getAllDoctorsForAdmin() {
    return await db.select().from(doctorUsers).orderBy(desc(doctorUsers.createdAt));
  }
  async getAllAppointmentsForAdmin() {
    return await db.select({
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
        phoneNumber: users.phoneNumber
      },
      doctor: {
        id: dentists.id,
        name: dentists.name,
        specialty: dentists.specialty
      }
    }).from(appointments).innerJoin(users, eq(appointments.userId, users.id)).innerJoin(dentists, eq(appointments.dentistId, dentists.id)).orderBy(desc(appointments.createdAt));
  }
  async getAllProductsForAdmin() {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
import { eq as eq2, ilike as ilike2, asc as asc2, desc as desc2 } from "drizzle-orm";
var isAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
async function registerRoutes(app2) {
  const sendOtpSchema = z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    address: z.string().optional()
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
      address: z.string()
    }).optional()
  });
  const completeSignupSchema = z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required")
  });
  const otpStore = /* @__PURE__ */ new Map();
  app2.post("/api/auth/send-otp", async (req, res) => {
    try {
      const userData = sendOtpSchema.parse(req.body);
      const { phoneNumber } = userData;
      const otp = "123456";
      const expires = Date.now() + 5 * 60 * 1e3;
      otpStore.set(phoneNumber, { otp, expires, userData });
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(400).json({ message: "Failed to send OTP" });
    }
  });
  app2.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otp, mode, userData } = verifyOtpSchema.parse(req.body);
      const storedData = otpStore.get(phoneNumber);
      if (!storedData || storedData.otp !== otp || storedData.expires < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      otpStore.delete(phoneNumber);
      if (mode === "signin") {
        const user = await storage.getUserByPhone(phoneNumber);
        if (!user) {
          return res.status(400).json({ message: "No account found with this phone number. Please sign up to create a new account." });
        }
        req.session.user = { id: user.id, phoneNumber: user.phoneNumber };
        res.json({ success: true, user });
      } else {
        const existingUser = await storage.getUserByPhone(phoneNumber);
        if (existingUser) {
          return res.status(400).json({ message: "Account already exists with this phone number" });
        }
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
          address: userData.address
        });
        req.session.user = { id: user.id, phoneNumber: user.phoneNumber };
        res.json({ success: true, user });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(400).json({ message: "Failed to verify OTP" });
    }
  });
  app2.post("/api/auth/complete-signup", async (req, res) => {
    try {
      const { phoneNumber, firstName, lastName, email } = completeSignupSchema.parse(req.body);
      const pendingSignup = req.session.pendingSignup;
      if (!pendingSignup || pendingSignup.phoneNumber !== phoneNumber) {
        return res.status(400).json({ message: "Invalid signup session" });
      }
      const user = await storage.createUser({
        phoneNumber,
        firstName,
        lastName,
        email
      });
      req.session.user = { id: user.id, phoneNumber: user.phoneNumber };
      delete req.session.pendingSignup;
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error completing signup:", error);
      res.status(400).json({ message: "Failed to complete signup" });
    }
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });
  app2.get("/api/dentists", async (req, res) => {
    try {
      const dentists2 = await storage.getDentists();
      res.json(dentists2);
    } catch (error) {
      console.error("Error fetching dentists:", error);
      res.status(500).json({ message: "Failed to fetch dentists" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, sort, search } = req.query;
      const products2 = await storage.getAllProducts({
        category,
        sort,
        search
      });
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/dentists/:id", async (req, res) => {
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
  app2.get("/api/dentists/:id/timeslots", async (req, res) => {
    try {
      const dentistId = parseInt(req.params.id);
      const date2 = req.query.date;
      if (!date2) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      const timeSlots2 = await storage.getDentistTimeSlots(dentistId, date2);
      res.json(timeSlots2);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });
  app2.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment({
        ...appointmentData,
        userId
      });
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
  app2.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const appointments2 = await storage.getUserAppointments(userId);
      res.json(appointments2);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  app2.patch("/api/appointments/:id/status", isAuthenticated, async (req, res) => {
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
  app2.delete("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = req.session.user.id;
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
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, search, sort } = req.query;
      let query = db.select().from(products).where(eq2(products.isActive, true));
      if (category && category !== "all") {
        query = query.where(eq2(products.category, category));
      }
      if (search) {
        query = query.where(ilike2(products.name, `%${search}%`));
      }
      if (sort === "price_asc") {
        query = query.orderBy(asc2(products.price));
      } else if (sort === "price_desc") {
        query = query.orderBy(desc2(products.price));
      } else if (sort === "popular") {
        query = query.orderBy(desc2(products.isFeatured));
      } else {
        query = query.orderBy(asc2(products.name));
      }
      const productList = await query;
      res.json(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const [product] = await db.select().from(products).where(eq2(products.id, productId));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { items, shippingAddress, billingAddress } = req.body;
      let subtotal = 0;
      const orderItemsData = [];
      for (const item of items) {
        const [product] = await db.select().from(products).where(eq2(products.id, item.productId));
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        const itemTotal = parseFloat(product.price) * item.quantity;
        subtotal += itemTotal;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal.toFixed(2)
        });
      }
      const shippingFee = 5.99;
      const tax = subtotal * 0.1;
      const total = subtotal + shippingFee + tax;
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        paymentStatus: "pending"
      }).returning();
      const orderItemsWithOrderId = orderItemsData.map((item) => ({
        ...item,
        orderId: order.id
      }));
      await db.insert(orderItems).values(orderItemsWithOrderId);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const userOrders = await db.select().from(orders).where(eq2(orders.userId, userId));
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/doctor/login", async (req, res) => {
    try {
      const { emailOrPhone, password, rememberMe } = req.body;
      let doctor = await storage.getDoctorByEmail(emailOrPhone);
      if (!doctor) {
        doctor = await storage.getDoctorByPhone(emailOrPhone);
      }
      if (!doctor) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (doctor.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!doctor.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      await storage.updateDoctorLastLogin(doctor.id);
      req.session.doctorId = doctor.id;
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1e3;
      }
      const { password: _, ...doctorResponse } = doctor;
      res.json({ message: "Login successful", doctor: doctorResponse });
    } catch (error) {
      console.error("Error during doctor login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/doctor/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/doctor/auth/user", async (req, res) => {
    try {
      if (!req.session.doctorId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const doctor = await storage.getDoctorById(req.session.doctorId);
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
  app2.post("/api/doctor/forgot-password", async (req, res) => {
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
  app2.post("/api/doctor/verify-reset-otp", async (req, res) => {
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
  app2.post("/api/doctor/reset-password", async (req, res) => {
    try {
      const { phoneNumber, newPassword } = req.body;
      const doctor = await storage.getDoctorByPhone(phoneNumber);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      await storage.updateDoctorPassword(doctor.id, newPassword);
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  const requireDoctorAuth = async (req, res, next) => {
    if (!req.session.doctorId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
  app2.get("/api/doctor/dashboard/stats", requireDoctorAuth, async (req, res) => {
    try {
      const stats = await storage.getDoctorStats(req.session.doctorId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });
  app2.get("/api/doctor/appointments", requireDoctorAuth, async (req, res) => {
    try {
      const { status, date: date2 } = req.query;
      const appointments2 = await storage.getDoctorAppointments(req.session.doctorId, { status, date: date2 });
      res.json(appointments2);
    } catch (error) {
      console.error("Error getting appointments:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });
  app2.post("/api/doctor/appointments/:id/:action", requireDoctorAuth, async (req, res) => {
    try {
      const { id, action } = req.params;
      const appointmentId = parseInt(id);
      let status = action;
      if (action === "confirm") status = "confirmed";
      if (action === "complete") status = "completed";
      if (action === "cancel") status = "cancelled";
      await storage.updateDoctorAppointmentStatus(appointmentId, status, req.session.doctorId);
      res.json({ message: `Appointment ${action}ed successfully` });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  app2.get("/api/doctor/activities", requireDoctorAuth, async (req, res) => {
    try {
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
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { emailOrPhone, password, rememberMe } = req.body;
      let admin = await storage.getAdminByEmail(emailOrPhone);
      if (!admin) {
        admin = await storage.getAdminByPhone(emailOrPhone);
      }
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!admin.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      await storage.updateAdminLastLogin(admin.id);
      req.session.adminId = admin.id;
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1e3;
      }
      const { password: _, ...adminResponse } = admin;
      res.json({ message: "Login successful", admin: adminResponse });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/admin/auth/user", async (req, res) => {
    try {
      if (!req.session.adminId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const admin = await storage.getAdminById(req.session.adminId);
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
  const requireAdminAuth = async (req, res, next) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
  app2.get("/api/admin/dashboard/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });
  app2.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const users2 = await storage.getAllUsersForAdmin();
      res.json(users2);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  app2.get("/api/admin/doctors", requireAdminAuth, async (req, res) => {
    try {
      const doctors = await storage.getAllDoctorsForAdmin();
      res.json(doctors);
    } catch (error) {
      console.error("Error getting doctors:", error);
      res.status(500).json({ message: "Failed to get doctors" });
    }
  });
  app2.get("/api/admin/appointments", requireAdminAuth, async (req, res) => {
    try {
      const appointments2 = await storage.getAllAppointmentsForAdmin();
      res.json(appointments2);
    } catch (error) {
      console.error("Error getting appointments:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });
  app2.get("/api/admin/products", requireAdminAuth, async (req, res) => {
    try {
      const products2 = await storage.getAllProductsForAdmin();
      res.json(products2);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
init_static();
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || "development-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    const { setupVite } = await import("../server/vite.ts");
    await setupVite(app, server);
  } else {
    const { serveStatic: serveStatic2 } = await Promise.resolve().then(() => (init_static(), static_exports));
    serveStatic2(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5e3;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
