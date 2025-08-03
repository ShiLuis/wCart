#!/bin/bash

# Kahit Saan Restaurant System - Quick Setup Script
# This script sets up the development environment for demonstration

echo "🍽️  Kahit Saan Restaurant System - Quick Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) is installed"

# Check if MongoDB is running (optional check)
if command -v mongosh &> /dev/null; then
    print_status "MongoDB CLI tools are available"
else
    print_warning "MongoDB CLI tools not found. Make sure you have a MongoDB connection string ready."
fi

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd Server

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found. Are you in the correct directory?"
    exit 1
fi

print_info "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating a sample .env file..."
    cat > .env << EOL
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://LuisShih:IPT2LUIS1634@cluster0.flqplku.mongodb.net/

# Authentication
JWT_SECRET=Kahit-SaanIPT2

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=dafua9rck
CLOUDINARY_API_KEY=658929421152568
CLOUDINARY_API_SECRET=2XT_sSkEk1GMYStAIAIxIEiSfzE

# CORS Settings
FRONTEND_URL=http://localhost:5173
EOL
    print_warning "Please update the .env file with your actual credentials"
else
    print_status ".env file already exists"
fi

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../Kahit-Saan

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found. Are you in the correct directory?"
    exit 1
fi

print_info "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    print_warning "Creating frontend .env file..."
    cat > .env << EOL
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Application Information
VITE_APP_NAME=Kahit Saan
VITE_APP_VERSION=1.0.0
EOL
    print_status "Frontend .env file created"
else
    print_status "Frontend .env file already exists"
fi

# Go back to root directory
cd ..

# Create startup scripts
echo ""
echo "📜 Creating startup scripts..."

# Create start-backend script
cat > start-backend.sh << 'EOL'
#!/bin/bash
echo "🚀 Starting Kahit Saan Backend Server..."
cd Server
echo "📡 Backend will be available at: http://localhost:5000"
echo "📖 API Documentation: http://localhost:5000/api"
echo ""
npm run dev
EOL

# Create start-frontend script
cat > start-frontend.sh << 'EOL'
#!/bin/bash
echo "🎨 Starting Kahit Saan Frontend..."
cd Kahit-Saan
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "👨‍💼 Admin Panel: http://localhost:5173/admin/login"
echo ""
npm run dev
EOL

# Create start-both script
cat > start-system.sh << 'EOL'
#!/bin/bash
echo "🍽️  Starting Complete Kahit Saan System"
echo "======================================"

# Function to start backend in background
start_backend() {
    echo "🚀 Starting Backend Server..."
    cd Server
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend..."
    sleep 3  # Wait for backend to start
    cd Kahit-Saan
    npm run dev
}

# Trap to kill backend when script exits
trap 'kill $BACKEND_PID 2>/dev/null' EXIT

# Start both services
start_backend
start_frontend
EOL

# Make scripts executable
chmod +x start-backend.sh
chmod +x start-frontend.sh
chmod +x start-system.sh

print_status "Startup scripts created"

# Create demo data seeding script
echo ""
echo "🌱 Creating demo data seeding script..."

cat > seed-demo-data.sh << 'EOL'
#!/bin/bash
echo "🌱 Seeding Demo Data for Kahit Saan"
echo "=================================="

cd Server

# Check if seeding script exists
if [ -f "scripts/seedInventory.js" ]; then
    echo "📦 Seeding inventory data..."
    node scripts/seedInventory.js
    echo "✅ Demo data seeded successfully!"
else
    echo "⚠️  Seeding script not found. Creating basic admin user..."
    # You can add more seeding logic here
fi

echo ""
echo "🎯 Demo Credentials:"
echo "==================="
echo "Admin Login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "💡 Access the admin panel at: http://localhost:5173/admin/login"
EOL

chmod +x seed-demo-data.sh

print_status "Demo data seeding script created"

# Final setup summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_info "Your Kahit Saan Restaurant System is ready for demonstration!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env files with your actual credentials (if needed)"
echo "2. Run './seed-demo-data.sh' to populate demo data"
echo "3. Run './start-system.sh' to start both frontend and backend"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   Admin:    http://localhost:5173/admin/login"
echo ""
echo "📖 Documentation:"
echo "   README.md - System overview"
echo "   API_DOCUMENTATION.md - Technical API details"
echo "   CLIENT_PRESENTATION.md - Business presentation"
echo "   FEATURES_SHOWCASE.md - Feature demonstrations"
echo "   DEPLOYMENT.md - Production deployment guide"
echo ""
print_status "Ready to impress your clients! 🚀"
EOL
