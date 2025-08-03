@echo off
title Kahit Saan Restaurant System - Quick Setup

echo 🍽️  Kahit Saan Restaurant System - Quick Setup
echo =============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

echo ✅ Node.js is installed: 
node --version

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd Server

if not exist package.json (
    echo ❌ Backend package.json not found. Are you in the correct directory?
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed successfully

REM Check if .env exists
if not exist .env (
    echo ⚠️  No .env file found. Creating a sample .env file...
    (
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo MONGO_URI=mongodb+srv://LuisShih:IPT2LUIS1634@cluster0.flqplku.mongodb.net/
        echo.
        echo # Authentication
        echo JWT_SECRET=Kahit-SaanIPT2
        echo.
        echo # Cloudinary Configuration ^(for image uploads^)
        echo CLOUDINARY_CLOUD_NAME=dafua9rck
        echo CLOUDINARY_API_KEY=658929421152568
        echo CLOUDINARY_API_SECRET=2XT_sSkEk1GMYStAIAIxIEiSfzE
        echo.
        echo # CORS Settings
        echo FRONTEND_URL=http://localhost:5173
    ) > .env
    echo ⚠️  Please update the .env file with your actual credentials
) else (
    echo ✅ .env file already exists
)

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd ..\Kahit-Saan

if not exist package.json (
    echo ❌ Frontend package.json not found. Are you in the correct directory?
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed successfully

REM Check if frontend .env exists
if not exist .env (
    echo ⚠️  Creating frontend .env file...
    (
        echo # API Configuration
        echo VITE_API_BASE_URL=http://localhost:5000
        echo.
        echo # Application Information
        echo VITE_APP_NAME=Kahit Saan
        echo VITE_APP_VERSION=1.0.0
    ) > .env
    echo ✅ Frontend .env file created
) else (
    echo ✅ Frontend .env file already exists
)

REM Go back to root directory
cd ..

REM Create startup scripts
echo.
echo 📜 Creating startup scripts...

REM Create start-backend script
(
    echo @echo off
    echo title Kahit Saan Backend
    echo echo 🚀 Starting Kahit Saan Backend Server...
    echo cd Server
    echo echo 📡 Backend will be available at: http://localhost:5000
    echo echo 📖 API Documentation: http://localhost:5000/api
    echo echo.
    echo call npm run dev
    echo pause
) > start-backend.bat

REM Create start-frontend script
(
    echo @echo off
    echo title Kahit Saan Frontend
    echo echo 🎨 Starting Kahit Saan Frontend...
    echo cd Kahit-Saan
    echo echo 🌐 Frontend will be available at: http://localhost:5173
    echo echo 👨‍💼 Admin Panel: http://localhost:5173/admin/login
    echo echo.
    echo call npm run dev
    echo pause
) > start-frontend.bat

REM Create start-both script
(
    echo @echo off
    echo title Kahit Saan System
    echo echo 🍽️  Starting Complete Kahit Saan System
    echo echo ======================================
    echo echo.
    echo echo 🚀 Starting Backend Server...
    echo start "Kahit Saan Backend" cmd /k "cd Server && npm run dev"
    echo echo.
    echo echo ⏳ Waiting for backend to start...
    echo timeout /t 5 /nobreak ^>nul
    echo echo.
    echo echo 🎨 Starting Frontend...
    echo cd Kahit-Saan
    echo call npm run dev
    echo pause
) > start-system.bat

echo ✅ Startup scripts created

REM Create demo data seeding script
echo.
echo 🌱 Creating demo data seeding script...

(
    echo @echo off
    echo title Seed Demo Data
    echo echo 🌱 Seeding Demo Data for Kahit Saan
    echo echo ==================================
    echo echo.
    echo cd Server
    echo.
    echo if exist scripts\seedInventory.js ^(
    echo     echo 📦 Seeding inventory data...
    echo     node scripts\seedInventory.js
    echo     echo ✅ Demo data seeded successfully!
    echo ^) else ^(
    echo     echo ⚠️  Seeding script not found. Manual setup required.
    echo ^)
    echo.
    echo echo.
    echo echo 🎯 Demo Credentials:
    echo echo ===================
    echo echo Admin Login:
    echo echo   Username: admin
    echo echo   Password: admin123
    echo echo.
    echo echo 💡 Access the admin panel at: http://localhost:5173/admin/login
    echo echo.
    echo pause
) > seed-demo-data.bat

echo ✅ Demo data seeding script created

REM Final setup summary
echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 💡 Your Kahit Saan Restaurant System is ready for demonstration!
echo.
echo 📋 Next Steps:
echo 1. Update .env files with your actual credentials ^(if needed^)
echo 2. Run 'seed-demo-data.bat' to populate demo data
echo 3. Run 'start-system.bat' to start both frontend and backend
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    Admin:    http://localhost:5173/admin/login
echo.
echo 📖 Documentation:
echo    README.md - System overview
echo    API_DOCUMENTATION.md - Technical API details
echo    CLIENT_PRESENTATION.md - Business presentation
echo    FEATURES_SHOWCASE.md - Feature demonstrations
echo    DEPLOYMENT.md - Production deployment guide
echo.
echo ✅ Ready to impress your clients! 🚀
echo.
pause
