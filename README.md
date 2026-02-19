# English Program Academic Management Platform (EPAMP) - MVP

A full-stack web application for managing an English language program with role-based access control.

## Features

- **Role-based Authentication**: Admin, Teacher, Student, Parent
- **Admin Dashboard**: User management, level management, statistics
- **Teacher Dashboard**: Grade management, attendance recording
- **Student Dashboard**: View grades, attendance, download reports, request certificates
- **Parent Dashboard**: Monitor child's progress and alerts
- **PDF Reports**: Auto-generated progress reports
- **Certificate System**: Request and download certificates upon level completion
- **Payment Management**: Simple paid/unpaid status tracking

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Chart.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **PDF Generation**: PDFKit

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

## Project Structure

```
epamp-mvp/
├── backend/           # Node.js API
│   ├── config/        # Database configuration
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth middleware
│   ├── models/        # Mongoose schemas
│   ├── routes/       # API routes
│   ├── seeds/        # Database seeder
│   ├── server.js     # Entry point
│   └── .env          # Environment variables
│
└── frontend/         # React application
    ├── src/
    │   ├── components/  # UI components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   ├── services/    # API services
    │   └── App.jsx     # Main app
    └── package.json
```

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd epamp-mvp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create or edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/epamp
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 3. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas and update the MONGODB_URI in .env

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This will create:
- Admin user: admin@epamp.com / admin123
- Teacher: teacher1@epamp.com / teacher123
- Student: student@epamp.com / student123
- Parent: parent@epamp.com / parent123
- All program levels (Kids 1-12, Teens 1-14, Conversation, Kids 4-6)

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
API runs at http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at http://localhost:3000

### 6. Access the Application

Open http://localhost:3000 in your browser and login with any of the demo accounts.

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users` - List users (Admin)
- POST `/api/users` - Create user (Admin)
- GET `/api/users/students` - List students
- PUT `/api/users/:id/payment` - Toggle payment status

### Levels
- GET `/api/levels` - List levels
- POST `/api/levels` - Create level (Admin)

### Grades
- GET `/api/grades` - List grades
- POST `/api/grades` - Add grade (Teacher)
- GET `/api/grades/average/:studentId` - Get average

### Attendance
- GET `/api/attendance` - List attendance
- POST `/api/attendance` - Record attendance (Teacher)

### Certificates
- GET `/api/certificates` - List certificates
- POST `/api/certificates` - Request certificate (Student)
- PUT `/api/certificates/:id/approve` - Approve (Admin)

### Reports
- GET `/api/reports/student/:id` - Generate PDF report

## Color Scheme

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary | Navy Blue | #173686 |
| Secondary | Light Blue | #61ABE0 |
| Success | Yellow | #FAD907 |
| Warning | Orange | #F08E03 |
| Danger | Red | #EF2200 |

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@epamp.com | admin123 |
| Teacher | teacher1@epamp.com | teacher123 |
| Student | student@epamp.com | student123 |
| Parent | parent@epamp.com | parent123 |

## License

MIT
