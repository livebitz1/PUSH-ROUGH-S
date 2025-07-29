-- Santepheap Dental Clinic Database Schema
-- Generated for PostgreSQL

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Create users table for patient accounts
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar UNIQUE NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"email" varchar,
	"age" integer,
	"gender" varchar,
	"address" text,
	"is_verified" boolean DEFAULT false,
	"otp_code" varchar(6),
	"otp_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create dentists table for dentist profiles
CREATE TABLE IF NOT EXISTS "dentists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"specialty" varchar NOT NULL,
	"location" varchar NOT NULL,
	"experience_years" integer NOT NULL,
	"languages" text[],
	"bio" text,
	"profile_image_url" varchar,
	"consultation_fee" numeric(10, 2),
	"is_available" boolean DEFAULT true,
	"rating" numeric(3, 2) DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

-- Create time_slots table for appointment scheduling
CREATE TABLE IF NOT EXISTS "time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"dentist_id" integer NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

-- Create appointments table for booking records
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dentist_id" integer NOT NULL,
	"time_slot_id" integer NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" time NOT NULL,
	"consultation_type" varchar NOT NULL,
	"notes" text,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create products table for e-commerce
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"category" varchar NOT NULL,
	"image_url" varchar,
	"stock_quantity" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create orders table for product purchases
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending',
	"items" jsonb NOT NULL,
	"shipping_address" text,
	"payment_method" varchar,
	"payment_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create doctor_users table for doctor authentication
CREATE TABLE IF NOT EXISTS "doctor_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar UNIQUE NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"phone_number" varchar,
	"specialization" varchar,
	"license_number" varchar,
	"years_experience" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"profile_image_url" varchar,
	"bio" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp
);

-- Create doctor_appointments table for doctor-specific appointment data
CREATE TABLE IF NOT EXISTS "doctor_appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" time NOT NULL,
	"status" varchar DEFAULT 'scheduled',
	"notes" text,
	"prescription" text,
	"follow_up_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar UNIQUE NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"phone_number" varchar,
	"role" varchar DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	"permissions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp
);

-- Add foreign key constraints
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_dentist_id_dentists_id_fk" FOREIGN KEY ("dentist_id") REFERENCES "dentists"("id") ON DELETE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_dentist_id_dentists_id_fk" FOREIGN KEY ("dentist_id") REFERENCES "dentists"("id") ON DELETE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_time_slot_id_time_slots_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_doctor_id_doctor_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctor_users"("id") ON DELETE CASCADE;
ALTER TABLE "doctor_appointments" ADD CONSTRAINT "doctor_appointments_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Insert sample data

-- Insert sample dentists
INSERT INTO "dentists" ("name", "specialty", "location", "experience_years", "languages", "bio", "consultation_fee", "rating") VALUES
('Dr. Sophea Chan', 'General Dentistry', 'Phnom Penh', 8, ARRAY['English', 'Khmer'], 'Experienced general dentist with expertise in preventive care and cosmetic dentistry.', 45.00, 4.8),
('Dr. Kimhak Lim', 'Orthodontics', 'Siem Reap', 12, ARRAY['English', 'Khmer', 'French'], 'Specialized in orthodontics and dental alignment treatments.', 65.00, 4.9),
('Dr. Bopha Srun', 'Oral Surgery', 'Battambang', 15, ARRAY['English', 'Khmer'], 'Expert oral surgeon with focus on complex dental procedures.', 85.00, 4.7),
('Dr. Mealea Kang', 'Pediatric Dentistry', 'Sihanoukville', 6, ARRAY['English', 'Khmer'], 'Gentle pediatric dentist specializing in children''s dental care.', 40.00, 4.9);

-- Insert sample products
INSERT INTO "products" ("name", "description", "price", "category", "stock_quantity") VALUES
('Professional Electric Toothbrush', 'Advanced sonic toothbrush with multiple cleaning modes', 89.99, 'Oral Care', 50),
('Whitening Toothpaste Set', 'Professional grade whitening toothpaste pack of 3', 24.99, 'Oral Care', 100),
('Dental Floss Premium', 'High-quality dental floss for daily cleaning', 12.99, 'Oral Care', 200),
('Mouthwash Antibacterial', 'Clinical strength antibacterial mouthwash', 16.99, 'Oral Care', 75),
('Tooth Sensitivity Relief', 'Specialized toothpaste for sensitive teeth', 19.99, 'Oral Care', 80),
('Dental Care Travel Kit', 'Complete travel dental care essentials', 34.99, 'Oral Care', 40),
('Professional Teeth Whitening Kit', 'At-home professional whitening system', 149.99, 'Cosmetic', 25),
('Custom Mouth Guard', 'Professional custom-fitted mouth guard', 89.99, 'Protection', 30);

-- Insert sample doctor users
INSERT INTO "doctor_users" ("email", "password", "first_name", "last_name", "phone_number", "specialization", "license_number", "years_experience", "is_verified") VALUES
('dr.smith@santepheap.com', 'password123', 'John', 'Smith', '+855123456789', 'General Dentistry', 'DDS-2024-001', 10, true),
('dr.wong@santepheap.com', 'password123', 'Lisa', 'Wong', '+855987654321', 'Orthodontics', 'DDS-2024-002', 8, true),
('dr.johnson@santepheap.com', 'password123', 'Michael', 'Johnson', '+855555666777', 'Oral Surgery', 'DDS-2024-003', 12, true);

-- Insert sample admin users
INSERT INTO "admin_users" ("email", "password", "first_name", "last_name", "phone_number", "role") VALUES
('admin@santepheap.com', 'admin123', 'Super', 'Admin', '+855999888777', 'super_admin'),
('manager@santepheap.com', 'manager123', 'Clinic', 'Manager', '+855888777666', 'admin');

-- Insert sample time slots for dentists
INSERT INTO "time_slots" ("dentist_id", "date", "start_time", "end_time") VALUES
(1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '09:30:00'),
(1, CURRENT_DATE + INTERVAL '1 day', '09:30:00', '10:00:00'),
(1, CURRENT_DATE + INTERVAL '1 day', '10:00:00', '10:30:00'),
(1, CURRENT_DATE + INTERVAL '1 day', '10:30:00', '11:00:00'),
(2, CURRENT_DATE + INTERVAL '1 day', '14:00:00', '14:30:00'),
(2, CURRENT_DATE + INTERVAL '1 day', '14:30:00', '15:00:00'),
(2, CURRENT_DATE + INTERVAL '1 day', '15:00:00', '15:30:00'),
(3, CURRENT_DATE + INTERVAL '2 days', '08:00:00', '08:30:00'),
(3, CURRENT_DATE + INTERVAL '2 days', '08:30:00', '09:00:00'),
(4, CURRENT_DATE + INTERVAL '2 days', '16:00:00', '16:30:00');