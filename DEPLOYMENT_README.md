# Santepheap Dental Clinic - Complete Source Code & Deployment Guide

## Project Overview

This is a comprehensive dental booking and product marketplace website for Santepheap Dental Clinic, targeting local Cambodians, expatriates, and international tourists in Cambodia. The platform includes:

- **Patient Interface**: Appointment booking, product shopping, OTP-based authentication
- **Doctor Panel**: Appointment management, patient records, prescription management
- **Admin Panel**: Complete clinic management with 12 comprehensive feature sections

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom OTP system for patients, traditional login for doctors/admins
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

## System Architecture

### Three User Interfaces:
1. **Patient Interface** (`/` routes)
   - Landing page with clinic information
   - OTP-based registration and login
   - Appointment booking (in-person only)
   - Product shopping with online payments
   - User dashboard

2. **Doctor Panel** (`/doctor-*` routes)
   - Doctor login and dashboard
   - Appointment management
   - Patient records viewing
   - Prescription management

3. **Admin Panel** (`/admin-*` routes)
   - Super admin dashboard with 12 feature tabs
   - Complete user, doctor, and appointment management
   - Billing and payment oversight
   - Reports and analytics
   - Notification system
   - Content management
   - Support ticket handling

## Database Schema

### Core Tables:
- `users` - Patient accounts with OTP authentication
- `doctor_users` - Doctor accounts with traditional login
- `admin_users` - Admin accounts with role-based permissions
- `dentists` - Doctor profile information
- `appointments` - Booking records
- `time_slots` - Available appointment times
- `products` - E-commerce product catalog
- `orders` - Product purchase records
- `sessions` - Session management

## Key Features

### Patient Features:
- Phone number + OTP authentication
- Comprehensive registration (name, age, gender, address)
- Appointment booking with dentist selection
- Product browsing and purchasing
- Multilingual support (English/Khmer)

### Doctor Features:
- Professional dashboard
- Appointment calendar management
- Patient history access
- Prescription creation and management
- Performance metrics

### Admin Features:
- **Overview**: Real-time statistics and quick actions
- **User Management**: View, edit, block/unblock patients
- **Doctor Management**: Approve, verify, manage doctor accounts
- **Appointment Management**: Schedule, reschedule, monitor bookings
- **Product Management**: Add, edit, remove dental products
- **Billing & Payments**: Transaction tracking, revenue analytics
- **Prescriptions**: View and edit all prescriptions
- **Reports & Analytics**: Generate various business reports
- **Notifications**: Send targeted messages to users/doctors
- **Content Management**: Blogs, news, FAQs, policies
- **Support Center**: Ticket management and customer support
- **Settings**: System configuration, payment gateways, sub-admin management

## Test Accounts

### Admin Accounts:
- **Super Admin**: admin@santepheap.com / admin123
- **Manager**: manager@santepheap.com / manager123

### Doctor Account:
- **Doctor**: dr.smith@santepheap.com / password123

### Patient Registration:
- Use any phone number for OTP-based registration
- Sample: +855123456789

## Installation & Deployment

### Prerequisites:
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Environment Variables:
Create `.env` file with:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
SESSION_SECRET=your-secure-session-secret
```

### Installation Steps:
1. Extract source code to your server
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Configure environment variables
5. Push database schema: `npm run db:push`
6. Start the application: `npm run dev` (development) or `npm start` (production)

### Database Setup:
The application uses Drizzle ORM for database management. After setting up your PostgreSQL database:
1. Update DATABASE_URL in .env file
2. Run `npm run db:push` to create all necessary tables
3. Sample admin accounts will be created automatically

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── drizzle.config.ts       # Database configuration
```

## API Endpoints

### Patient APIs:
- `POST /api/auth/send-otp` - Send OTP for authentication
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/dentists` - Get dentist list
- `POST /api/appointments` - Book appointment
- `GET /api/products` - Get product catalog
- `POST /api/orders` - Place product order

### Doctor APIs:
- `POST /api/doctor/login` - Doctor authentication
- `GET /api/doctor/dashboard/stats` - Dashboard statistics
- `GET /api/doctor/appointments` - Get doctor's appointments
- `PUT /api/doctor/appointments/:id` - Update appointment

### Admin APIs:
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard/stats` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/products` - Get all products

## Design System

### Colors:
- Primary Blue: #0077B6
- White: #FFFFFF  
- Light Gray: #E5E7EB
- Professional medical color scheme

### Components:
- Built with shadcn/ui component library
- Tailwind CSS for styling
- Responsive mobile-first design
- Professional medical aesthetic

## Security Features

- OTP-based authentication for patients
- Password-based authentication for doctors/admins
- Session management with PostgreSQL store
- Role-based access control
- Input validation and sanitization
- CORS protection

## Cambodia-Specific Features

- Multilingual support (English/Khmer)
- Local dentist locations (Phnom Penh, Siem Reap, Battambang, Sihanoukville)
- USD/KHR currency support
- Tourist-friendly booking system
- Cultural adaptation for local market

## Support & Maintenance

This platform is designed for easy maintenance and scalability:
- Modular architecture
- TypeScript for type safety
- Comprehensive error handling
- Database migrations through Drizzle
- Responsive design for all devices

## Production Deployment Notes

1. **Database**: Ensure PostgreSQL is properly configured with sufficient resources
2. **Environment**: Set NODE_ENV=production
3. **Security**: Use HTTPS in production
4. **Monitoring**: Implement logging and monitoring solutions
5. **Backup**: Regular database backups recommended
6. **Performance**: Consider CDN for static assets

## Contact Information

For technical support or questions about deployment:
- Review the code structure and documentation
- Check database schema in `shared/schema.ts`
- Refer to API endpoints in `server/routes.ts`
- UI components are in `client/src/components/`

This is a complete, production-ready dental clinic management system with all specified features implemented and tested.