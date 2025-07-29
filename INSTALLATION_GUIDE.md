# Santepheap Dental Clinic - Installation & Deployment Guide

## Quick Start

This guide will help you deploy the complete Santepheap Dental Clinic platform on your server.

## Prerequisites

Before installation, ensure you have:
- **Node.js 18+** installed
- **PostgreSQL 12+** database server
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

## Installation Steps

### 1. Extract Source Code
```bash
# Extract the source code archive
tar -xzf santepheap-complete-source-code.tar.gz
cd santepheap-complete-source-code
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install
```

### 3. Database Setup

#### Option A: Manual Database Setup
1. Create a new PostgreSQL database:
```sql
CREATE DATABASE santepheap_clinic;
CREATE USER santepheap_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE santepheap_clinic TO santepheap_user;
```

2. Run the database schema:
```bash
# Connect to your database and run the schema file
psql -U santepheap_user -d santepheap_clinic -f DATABASE_SCHEMA.sql
```

#### Option B: Using Environment Variables
1. Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
NODE_ENV=production
SESSION_SECRET=your-very-secure-session-secret-at-least-32-characters
```

2. Push the schema using Drizzle:
```bash
npm run db:push
```

### 4. Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://santepheap_user:your_secure_password@localhost:5432/santepheap_clinic

# Application Configuration
NODE_ENV=production
SESSION_SECRET=your-very-secure-session-secret-minimum-32-characters

# Optional: Custom Configuration
PORT=5000
HOST=0.0.0.0
```

### 5. Build the Application
```bash
# Build the frontend and backend for production
npm run build
```

### 6. Start the Application

#### Development Mode:
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The application will be available at:
- **Main Application**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin-login
- **Doctor Panel**: http://localhost:5000/doctor-login

## Test Accounts

### Admin Accounts:
- **Super Admin**: 
  - Email: admin@santepheap.com
  - Password: admin123

- **Manager**: 
  - Email: manager@santepheap.com
  - Password: manager123

### Doctor Account:
- **Sample Doctor**: 
  - Email: dr.smith@santepheap.com
  - Password: password123

### Patient Registration:
- Use any valid phone number (e.g., +855123456789)
- The system will generate OTP codes for authentication

## System Features

### Patient Interface (/)
- OTP-based registration and authentication
- Dentist browsing and appointment booking
- Product catalog and e-commerce functionality
- User dashboard and order history

### Doctor Panel (/doctor-*)
- Professional dashboard with statistics
- Appointment management and calendar
- Patient records and history
- Prescription management system

### Admin Panel (/admin-*)
- **Overview**: Real-time statistics and analytics
- **User Management**: Complete patient account management
- **Doctor Management**: Doctor verification and oversight
- **Appointment Management**: System-wide booking oversight
- **Product Management**: E-commerce catalog management
- **Billing & Payments**: Transaction and revenue tracking
- **Prescriptions**: Prescription oversight and management
- **Reports & Analytics**: Business intelligence and reporting
- **Notifications**: System-wide messaging capabilities
- **Content Management**: Website content and policy management
- **Support Center**: Customer support ticket management
- **Settings**: System configuration and admin management

## Production Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "santepheap-clinic" -- start

# Set PM2 to restart on system reboot
pm2 startup
pm2 save
```

### Using Docker (Optional)
```dockerfile
# Create a Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Nginx Configuration (Recommended)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Security**: Use strong passwords and limit database access
3. **Session Secret**: Use a cryptographically secure session secret
4. **HTTPS**: Always use HTTPS in production
5. **Firewall**: Configure proper firewall rules
6. **Updates**: Keep dependencies updated regularly

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists and user has permissions

2. **Port Already in Use**:
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **Build Errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear build cache: `rm -rf dist && npm run build`

4. **Permission Errors**:
   - Check file permissions: `chmod -R 755 .`
   - Run with proper user permissions

### Log Files:
- Console logs will show application status
- Database errors are logged to console
- PM2 logs: `pm2 logs santepheap-clinic`

## Maintenance

### Regular Tasks:
1. **Database Backups**: 
   ```bash
   pg_dump santepheap_clinic > backup_$(date +%Y%m%d).sql
   ```

2. **Update Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

3. **Monitor Performance**:
   - Check server resources
   - Monitor database performance
   - Review application logs

## Support

For technical support:
1. Check the DEPLOYMENT_README.md for detailed architecture information
2. Review database schema in DATABASE_SCHEMA.sql
3. Examine API endpoints in server/routes.ts
4. Check component structure in client/src/

## License

This software is proprietary to Santepheap Dental Clinic. All rights reserved.