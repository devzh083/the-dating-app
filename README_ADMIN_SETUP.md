# Dating App - Admin Panel Setup Guide

**Repository:** https://github.com/devzh083/dating-webapp  
**Branch:** `vikas-profile`

Complete setup guide for the Dating App with Admin Panel feature and MySQL database.

---

## 📋 Prerequisites

Install these before starting:

- **Python 3.8+** → [Download](https://www.python.org/downloads/)
- **Node.js 16+** → [Download](https://nodejs.org/)
- **MySQL 8.0+** → [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** → [Download](https://git-scm.com/downloads/)

**Verify installations:**
```bash
python --version    # Should show 3.8 or higher
node --version      # Should show v16 or higher
mysql --version     # Should show 8.0 or higher
git --version       # Should show installed version
```

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Clone Repository
```bash
git clone https://github.com/devzh083/dating-webapp.git
cd dating-webapp
git checkout vikas-profile
```

### Step 2: Setup MySQL Database

**Open MySQL Command Line or MySQL Workbench:**
```bash
mysql -u root -p
# Enter your MySQL root password
```

**Run these commands:**
```sql
-- Create database
CREATE DATABASE dating_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (recommended for security)
CREATE USER 'dating_app_user'@'localhost' IDENTIFIED BY 'secure_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON dating_app_db.* TO 'dating_app_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify database created
SHOW DATABASES;

-- Exit
EXIT;
```

**⚠️ Important:** Remember these credentials - you'll need them in Step 3!

### Step 3: Run Auto Setup Script

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

The script will:
- ✅ Install Python dependencies
- ✅ Configure database connection
- ✅ Run migrations
- ✅ Create admin superuser
- ✅ Install frontend dependencies
- ✅ Setup environment files

---

## 📖 Manual Setup (Detailed)

If auto-setup fails or you prefer manual setup:

### Backend Setup

**1. Navigate to backend:**
```bash
cd backend
```

**2. Create virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**3. Install MySQL client:**

**Windows:**
```bash
pip install mysqlclient
```

**macOS:**
```bash
brew install mysql-client pkg-config
export PKG_CONFIG_PATH="/usr/local/opt/mysql-client/lib/pkgconfig"
pip install mysqlclient
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential pkg-config
pip install mysqlclient
```

**If mysqlclient installation fails:**
```bash
pip install pymysql
```
Then add to `backend/settings.py` (top of file):
```python
import pymysql
pymysql.install_as_MySQLdb()
```

**4. Install all dependencies:**
```bash
pip install -r requirements.txt
```

**5. Create `.env` file in `backend/` directory:**
```env
# Database Configuration
DB_NAME=dating_app_db
DB_USER=dating_app_user
DB_PASSWORD=secure_password_123
DB_HOST=localhost
DB_PORT=3306

# Django Settings
SECRET_KEY=django-insecure-change-this-in-production-xyz123abc
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

**6. Apply migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**7. Create superuser:**
```bash
python manage.py createsuperuser
```

Example:
```
Username: admin
Email: admin@example.com (optional)
Password: admin123
Password (again): admin123
Superuser created successfully.
```

**⚠️ Remember these credentials - you'll use them to login to admin panel!**

**8. Start backend server:**
```bash
python manage.py runserver
```

✅ Backend running at: http://localhost:8000

---

### Frontend Setup

**1. Open NEW terminal (keep backend running):**
```bash
cd front-end
```

**2. Install dependencies:**
```bash
npm install
```

If you get dependency errors:
```bash
npm install --legacy-peer-deps
```

**3. Create `.env` file in `front-end/` directory:**
```env
VITE_API_URL=http://localhost:8000/api
```

**4. Start frontend server:**
```bash
npm run dev
```

✅ Frontend running at: http://localhost:5173

---

## 🎯 Access the Application

### 1. Regular User Login
**URL:** http://localhost:5173/login

**Features:**
- Email/password authentication
- OTP verification
- Google OAuth login

### 2. Admin Panel Login ⭐
**URL:** http://localhost:5173/admin/login

**Credentials:** Use superuser account you created
```
Username: admin
Password: admin123
```

### 3. Admin Dashboard
**URL:** http://localhost:5173/admin/dashboard

**Features:**
- 📊 Real-time statistics dashboard
- 👥 User management (view, suspend, ban, activate, verify, delete)
- 🔍 Advanced search & filtering
- 📋 User reports management
- 📝 Admin action logs
- 📤 Export data to CSV
- 🔄 Bulk operations

---

## 🔧 Common Issues & Solutions

### MySQL Issues

**Issue: "Can't connect to MySQL server"**

Solution:
```bash
# Check if MySQL is running

# Windows - Check Services
services.msc
# Find "MySQL80" and ensure it's running

# macOS
brew services list
brew services start mysql

# Linux
sudo systemctl status mysql
sudo systemctl start mysql
```

**Issue: "Access denied for user"**

Solution:
```sql
-- Reset user password
mysql -u root -p
ALTER USER 'dating_app_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

-- Update backend/.env with new password
```

**Issue: "Unknown database 'dating_app_db'"**

Solution:
```sql
mysql -u root -p
CREATE DATABASE dating_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Issue: "mysql_config not found" during mysqlclient installation**

Solution:
```bash
# macOS
brew install mysql-client
export PATH="/usr/local/opt/mysql-client/bin:$PATH"

# Linux
sudo apt-get install libmysqlclient-dev

# Or use pymysql as alternative
pip install pymysql
# Add to settings.py: import pymysql; pymysql.install_as_MySQLdb()
```

---

### Backend Issues

**Issue: "ModuleNotFoundError: No module named 'corsheaders'"**

Solution:
```bash
pip install django-cors-headers
```

**Issue: "django.db.utils.OperationalError: (2003)"**

Solution:
1. Verify MySQL is running
2. Check credentials in `backend/.env`
3. Test MySQL connection:
```bash
mysql -u dating_app_user -p
# Enter password from .env
# If this works, Django should work too
```

**Issue: "No such table: admin_panel_userreport"**

Solution:
```bash
python manage.py makemigrations admin_panel
python manage.py migrate admin_panel
python manage.py migrate
```

**Issue: Port 8000 already in use**

Solution:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
```

---

### Frontend Issues

**Issue: "Cannot find module '@/components/ui/button'"**

Solution:
```bash
npm install
# or
npm install --legacy-peer-deps
```

**Issue: "CORS policy error"**

Solution:
1. Ensure `django-cors-headers` is installed
2. Check `CORS_ALLOWED_ORIGINS` in `backend/settings.py`
3. Restart Django server

**Issue: "401 Unauthorized" on admin endpoints**

Solution:
```bash
# Verify user is staff/superuser
python manage.py shell
```
```python
from django.contrib.auth.models import User
user = User.objects.get(username='admin')
print(f"is_staff: {user.is_staff}")      # Should be True
print(f"is_superuser: {user.is_superuser}")  # Should be True

# If False, fix it:
user.is_staff = True
user.is_superuser = True
user.save()
```

**Issue: Port 5173 already in use**

Solution:
```bash
npm run dev -- --port 3000
```

---

## 📊 Database Schema

### New Admin Panel Tables

**admin_panel_userreport**
```sql
- id (Primary Key)
- reporter_id (Foreign Key → User)
- reported_user_id (Foreign Key → User)
- reason (VARCHAR: spam, harassment, inappropriate, fake, other)
- description (TEXT)
- status (VARCHAR: pending, reviewed, resolved, dismissed)
- created_at (DATETIME)
- reviewed_at (DATETIME, nullable)
- reviewed_by_id (Foreign Key → User, nullable)
- admin_notes (TEXT)
```

**admin_panel_adminaction**
```sql
- id (Primary Key)
- admin_id (Foreign Key → User)
- target_user_id (Foreign Key → User)
- action_type (VARCHAR: suspend, ban, activate, delete, verify, warn)
- reason (TEXT)
- created_at (DATETIME)
```

**authtoken_token**
```sql
- key (Primary Key)
- user_id (Foreign Key → User)
- created (DATETIME)
```

---

## 🧪 Testing Guide

### 1. Quick Functionality Test
```bash
# Test backend API
curl http://localhost:8000/api/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return: {"token": "...", "user": {...}}
```

### 2. Create Test Data

**Method 1: Django Shell**
```bash
python manage.py shell
```
```python
from django.contrib.auth.models import User
from profiles.models import UserProfile

# Create 5 test users
for i in range(1, 6):
    user = User.objects.create_user(
        username=f'testuser{i}',
        email=f'test{i}@example.com',
        password='test123'
    )
    
    UserProfile.objects.create(
        user=user,
        first_name=f'Test User {i}',
        gender='male' if i % 2 == 0 else 'female',
        status=['online', 'away', 'offline'][i % 3],
        account_status='active'
    )
    print(f'Created: testuser{i}')

print('✅ Test data created!')
```

**Method 2: Django Admin Interface**
```
1. Go to http://localhost:8000/admin
2. Login with superuser credentials
3. Manually create users and profiles
```

### 3. Admin Panel Feature Testing

**Dashboard:**
- [ ] View total users count
- [ ] See active users
- [ ] Check suspended/banned counts
- [ ] View user growth chart

**User Management:**
- [ ] List all users
- [ ] Search by username/email
- [ ] Filter by status (online/away/offline)
- [ ] Filter by account status (active/suspended/banned)
- [ ] Sort by join date, last active, matches
- [ ] View user details
- [ ] Suspend a user
- [ ] Ban a user
- [ ] Activate suspended user
- [ ] Verify a user
- [ ] Delete a user
- [ ] Select multiple users (bulk action)
- [ ] Bulk suspend/ban/activate
- [ ] Export to CSV

**Reports:**
- [ ] View all reports
- [ ] Filter by status
- [ ] Review report (resolve/dismiss)
- [ ] Bulk review

**Admin Actions Log:**
- [ ] View all admin actions
- [ ] Filter by admin or target user
- [ ] See action history

---

## 📁 Project Structure
```
dating-webapp/
├── backend/
│   ├── admin_panel/              # 🆕 Admin Panel App
│   │   ├── __init__.py
│   │   ├── models.py             # UserReport, AdminAction
│   │   ├── views.py              # API endpoints
│   │   ├── serializers.py        # DRF serializers
│   │   ├── urls.py               # URL routing
│   │   ├── admin.py              # Django admin config
│   │   └── migrations/
│   ├── profiles/                 # User Profiles App
│   ├── dating_webapp/            # Main Project
│   │   ├── settings.py           # ⚠️ MySQL configuration
│   │   └── urls.py
│   ├── .env                      # 🆕 Environment variables
│   ├── manage.py
│   └── requirements.txt          # 🆕 Python dependencies
│
├── front-end/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminLogin.tsx         # 🆕 Admin login
│   │   │   ├── AdminPanel.tsx         # 🆕 Admin dashboard
│   │   │   └── LoginPage.tsx          # User login
│   │   ├── services/
│   │   │   └── profileService.ts      # 🆕 adminService added
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   └── ui/
│   │   └── App.tsx                    # 🆕 Admin routes
│   ├── .env                           # 🆕 Frontend config
│   └── package.json
│
├── README_ADMIN_SETUP.md         # 📘 This file
├── setup.bat                     # 🪟 Windows auto-setup
└── setup.sh                      # 🐧 macOS/Linux auto-setup
```

---

## 🔐 Security Checklist

### Development (Current):
- ✅ Separate admin authentication
- ✅ Token-based auth for admin
- ✅ CORS restricted to localhost
- ✅ Admin restricted to `is_staff=True`
- ✅ All admin actions logged
- ✅ MySQL user with limited privileges

### Production (Before Deployment):
- [ ] Change `SECRET_KEY` in settings
- [ ] Set `DEBUG=False`
- [ ] Update `ALLOWED_HOSTS`
- [ ] Update `CORS_ALLOWED_ORIGINS`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Use strong passwords (20+ characters)
- [ ] Implement rate limiting
- [ ] Setup database backups
- [ ] Enable MySQL SSL
- [ ] Use production WSGI server (gunicorn)
- [ ] Setup logging and monitoring
- [ ] Regular security audits

---

## 📝 API Documentation

### Admin Authentication

**Login**
```http
POST /api/admin/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response 200:
{
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "is_staff": true,
    "is_superuser": true
  }
}
```

### Dashboard

**Get Statistics**
```http
GET /api/admin/dashboard/stats/
Authorization: Token abc123...

Response 200:
{
  "totalUsers": 150,
  "activeUsers": 45,
  "suspendedUsers": 5,
  "bannedUsers": 2,
  "newUsersToday": 3,
  "totalMatches": 450,
  "totalMessages": 3200,
  "pendingReports": 8,
  "accountStatusDistribution": {...},
  "userGrowth": [...]
}
```

### User Management

**List Users**
```http
GET /api/admin/users/?page=1&search=john&status=online&account_status=active
Authorization: Token abc123...

Response 200:
{
  "count": 150,
  "next": "http://localhost:8000/api/admin/users/?page=2",
  "previous": null,
  "results": [...]
}
```

**Get User Details**
```http
GET /api/admin/users/1/detail_view/
Authorization: Token abc123...

Response 200:
{
  "profile": {...},
  "reports_made": [...],
  "reports_received": [...],
  "admin_actions": [...]
}
```

**User Action**
```http
POST /api/admin/users/1/user_action/
Authorization: Token abc123...
Content-Type: application/json

{
  "action": "suspend",
  "reason": "Violation of community guidelines"
}

Response 200:
{
  "message": "User suspended successfully",
  "user": {...}
}
```

**Bulk Action**
```http
POST /api/admin/users/bulk_action/
Authorization: Token abc123...
Content-Type: application/json

{
  "user_ids": [1, 2, 3],
  "action": "suspend",
  "reason": "Mass policy violation"
}

Response 200:
{
  "message": "Bulk action completed",
  "success_count": 3,
  "skipped_count": 0,
  "total_requested": 3
}
```

**Export Users**
```http
GET /api/admin/users/export/
Authorization: Token abc123...

Response 200:
{
  "data": [...],
  "count": 150
}
```

### Reports

**List Reports**
```http
GET /api/admin/reports/?status=pending&reason=harassment
Authorization: Token abc123...

Response 200:
{
  "count": 8,
  "results": [...]
}
```

**Review Report**
```http
POST /api/admin/reports/1/review/
Authorization: Token abc123...
Content-Type: application/json

{
  "action": "resolve",
  "admin_notes": "Verified and took action"
}

Response 200:
{
  "message": "Report resolved successfully",
  "report": {...}
}
```

### Admin Actions

**List Actions**
```http
GET /api/admin/actions/?user_id=1
Authorization: Token abc123...

Response 200:
{
  "count": 5,
  "results": [...]
}
```

---

## 🚀 Quick Commands
```bash
# Backend
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
python manage.py runserver

# Frontend  
cd front-end
npm run dev

# MySQL
mysql -u dating_app_user -p
USE dating_app_db;
SHOW TABLES;
SELECT * FROM auth_user WHERE is_staff=1;

# Django Management
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
python manage.py dbshell

# Git
git status
git pull origin vikas-profile
git checkout vikas-profile

# Check Python packages
pip list
pip freeze > requirements.txt

# Check Node packages
npm list
```

---

## ✅ Setup Verification Checklist

### Initial Setup:
- [ ] Repository cloned
- [ ] On `vikas-profile` branch
- [ ] MySQL installed and running
- [ ] Database created (`dating_app_db`)
- [ ] Database user created

### Backend:
- [ ] Virtual environment created
- [ ] All dependencies installed
- [ ] `.env` file created with correct credentials
- [ ] Migrations applied successfully
- [ ] Superuser created
- [ ] Backend running on port 8000
- [ ] Can access http://localhost:8000/admin

### Frontend:
- [ ] Dependencies installed
- [ ] `.env` file created
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173

### Admin Panel:
- [ ] Can access http://localhost:5173/admin/login
- [ ] Can login with superuser credentials
- [ ] Dashboard loads with statistics
- [ ] Can view users list
- [ ] Can perform user actions
- [ ] Admin actions are logged

---

## 🎓 Additional Resources

- **Django:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **MySQL:** https://dev.mysql.com/doc/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Vite:** https://vitejs.dev/

---

## 📞 Support

**Repository:** https://github.com/devzh083/dating-webapp  
**Branch:** vikas-profile  
**Developer:** Vikas

**Having issues?**
1. Check Troubleshooting section above
2. Verify all prerequisites are installed
3. Check console logs (browser F12 + terminal)
4. Ensure MySQL is running
5. Verify you're on correct branch: `git branch`

---

## 🎉 Success!

If you can:
- ✅ Login at `/admin/login`
- ✅ See dashboard with real statistics
- ✅ Manage users (search, filter, actions)
- ✅ View admin action logs

**You're all set! 🚀**

---

**Last Updated:** January 2025  
**Version:** 1.0.0