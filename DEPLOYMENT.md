# 🚀 Deployment Guide - Kahit Saan Restaurant System

## Overview
This guide provides step-by-step instructions for deploying the Kahit Saan restaurant management system in production environments.

## 📋 Pre-Deployment Checklist

### Required Services & Accounts
- [ ] MongoDB Atlas account (or self-hosted MongoDB)
- [ ] Cloudinary account for image management
- [ ] Domain name for production deployment
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Cloud hosting platform (Heroku, DigitalOcean, AWS, etc.)

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] Git repository access
- [ ] Environment variables configured
- [ ] Database seeded with initial data

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kahit_saan

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Settings (update with your domain)
FRONTEND_URL=https://your-domain.com
```

### Frontend Environment Variables (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com

# Application Settings
VITE_APP_NAME=Kahit Saan
VITE_APP_VERSION=1.0.0
```

## 🌐 Production Deployment Options

### Option 1: Heroku Deployment

#### Backend Deployment
1. **Prepare the backend**
   ```bash
   cd Server
   # Create Procfile
   echo "web: node index.js" > Procfile
   
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI and login
   heroku login
   
   # Create Heroku app
   heroku create kahit-saan-api
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
   heroku config:set CLOUDINARY_API_KEY="your_api_key"
   heroku config:set CLOUDINARY_API_SECRET="your_api_secret"
   
   # Deploy
   git push heroku main
   ```

#### Frontend Deployment
1. **Build and deploy frontend**
   ```bash
   cd Kahit-Saan
   
   # Update API URL in .env
   echo "VITE_API_BASE_URL=https://kahit-saan-api.herokuapp.com" > .env
   
   # Build for production
   npm run build
   
   # Deploy to Heroku (or Netlify/Vercel)
   heroku create kahit-saan-client
   heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
   
   # Create static.json for proper routing
   echo '{"root": "dist/", "routes": {"/**": "index.html"}}' > static.json
   
   git add .
   git commit -m "Frontend deployment"
   git push heroku main
   ```

### Option 2: DigitalOcean Droplet

#### Server Setup
1. **Create and configure droplet**
   ```bash
   # SSH into your droplet
   ssh root@your_server_ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   
   # Install Nginx
   apt install nginx -y
   ```

2. **Deploy application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/kahit-saan.git
   cd kahit-saan
   
   # Setup backend
   cd Server
   npm install --production
   
   # Setup frontend
   cd ../Kahit-Saan
   npm install
   npm run build
   
   # Copy built files to Nginx directory
   cp -r dist/* /var/www/html/
   ```

3. **Configure PM2**
   ```bash
   # Create PM2 ecosystem file
   cd Server
   cat > ecosystem.config.js << 'EOF'
   module.exports = {
     apps: [{
       name: 'kahit-saan-api',
       script: 'index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   }
   EOF
   
   # Start application with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```bash
   # Create Nginx configuration
   cat > /etc/nginx/sites-available/kahit-saan << 'EOF'
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
       
       # API
       location /api {
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
       
       # Socket.IO
       location /socket.io/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   EOF
   
   # Enable site
   ln -s /etc/nginx/sites-available/kahit-saan /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

### Option 3: Docker Deployment

#### Create Dockerfiles

**Backend Dockerfile (Server/Dockerfile)**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

EXPOSE 5000

USER node

CMD ["node", "index.js"]
```

**Frontend Dockerfile (Kahit-Saan/Dockerfile)**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose (docker-compose.yml)**
```yaml
version: '3.8'

services:
  backend:
    build: ./Server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    depends_on:
      - mongodb

  frontend:
    build: ./Kahit-Saan
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongodb_data:
```

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Free)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Obtain certificate
certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 🗄️ Database Setup

### MongoDB Atlas Configuration
1. Create a new cluster on MongoDB Atlas
2. Set up database user and password
3. Configure network access (add your server IP)
4. Get connection string and update MONGO_URI

### Initial Data Seeding
```bash
cd Server
node scripts/seedInventory.js
```

## 📊 Monitoring & Maintenance

### Log Management
```bash
# PM2 logs
pm2 logs kahit-saan-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# Install monitoring tools
pm2 install pm2-server-monit

# Set up log rotation
pm2 install pm2-logrotate
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="/backups/kahit_saan_$DATE"
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify FRONTEND_URL in backend environment
   - Check allowed origins in server configuration

2. **Socket.IO Connection Issues**
   - Ensure WebSocket support in load balancer
   - Check firewall settings for Socket.IO ports

3. **Image Upload Problems**
   - Verify Cloudinary credentials
   - Check file size limits and formats

4. **Database Connection Errors**
   - Verify MongoDB URI format
   - Check network access settings in MongoDB Atlas

### Performance Optimization

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

2. **Set Up CDN**
   - Use Cloudflare or similar CDN
   - Configure caching headers

3. **Database Indexing**
   ```javascript
   // Add to your MongoDB
   db.menuitems.createIndex({ "category": 1, "isAvailable": 1 })
   db.orders.createIndex({ "createdAt": -1 })
   ```

## 📈 Post-Deployment Steps

1. **Test all functionality**
   - Admin login and dashboard
   - Menu management
   - Order processing
   - Real-time notifications

2. **Set up monitoring**
   - Application performance monitoring
   - Error tracking (Sentry recommended)
   - Uptime monitoring

3. **Configure backups**
   - Daily database backups
   - Code repository backups

4. **Security hardening**
   - Regular security updates
   - Firewall configuration
   - Rate limiting implementation

## 🎯 Go-Live Checklist

- [ ] All environment variables configured
- [ ] SSL certificate installed and working
- [ ] Database properly seeded
- [ ] Admin account created and tested
- [ ] All features tested in production environment
- [ ] Monitoring and alerting configured
- [ ] Backup systems in place
- [ ] Domain DNS properly configured
- [ ] Performance optimization applied
- [ ] Security measures implemented

---

**Ready for Production!** 🚀

Your Kahit Saan restaurant management system is now ready to serve customers and help restaurant owners manage their operations efficiently.
