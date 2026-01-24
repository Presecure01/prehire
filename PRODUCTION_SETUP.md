# PreHire - Production Setup Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables

Copy `.env.example` to `.env` in the backend directory and configure:

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your production values
```

**Required Variables:**
- `NODE_ENV=production`
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `SESSION_SECRET` - Strong random secret
- `FRONTEND_URL` - Your production frontend URL
- `EMAIL_SERVICE` - Choose: `smtp`, `sendgrid`, or `mailgun`
- Email service credentials (SMTP/SendGrid/Mailgun)

**Optional Variables:**
- AWS S3 credentials (if using S3 for file storage)
- OAuth credentials (Google, Facebook, LinkedIn)

### 2. Frontend Environment Variables

Create `.env` in frontend directory:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_AI_SERVICE_URL=https://ai-service.yourdomain.com
```

### 3. Database Setup

1. **Create MongoDB indexes** (already defined in models, will be created automatically)
2. **Backup strategy**: Set up MongoDB Atlas backups or manual backup scripts
3. **Connection pooling**: MongoDB Atlas handles this automatically

### 4. File Storage

**Option A: Local Storage (Development/Testing)**
- Ensure `backend/uploads/` directory exists
- Set proper permissions: `chmod 755 backend/uploads`

**Option B: AWS S3 (Production Recommended)**
- Create S3 bucket
- Configure IAM user with S3 access
- Set `USE_S3=true` in `.env`
- Update upload routes to use S3 service

### 5. Email Service Configuration

**Recommended: SendGrid**
1. Sign up at sendgrid.com
2. Verify sender domain
3. Create API key
4. Set in `.env`:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_api_key
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=PreHire
   ```

**Alternative: SMTP (Gmail/Outlook)**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 6. Security Checklist

- [ ] Change all default secrets
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly (restrict to your domain)
- [ ] Set secure session cookies (`secure: true` in production)
- [ ] Enable rate limiting (already implemented)
- [ ] Review and restrict file upload types/sizes
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets

### 7. Build & Deploy

**Backend:**
```bash
cd backend
npm install --production
npm start
# Or use PM2: pm2 start src/server.js --name prehire-backend
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve build/ directory with nginx or similar
```

**AI Service:**
```bash
cd ai-service
npm install --production
npm start
# Or use PM2: pm2 start server.js --name prehire-ai-service
```

### 8. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Start all services
pm2 start backend/src/server.js --name prehire-backend
pm2 start ai-service/server.js --name prehire-ai-service

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions for auto-start on reboot
```

### 9. Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 10. Monitoring & Logging

**Recommended Tools:**
- **PM2 Monitoring**: `pm2 monit`
- **Application Monitoring**: New Relic, Datadog, or Sentry
- **Error Tracking**: Sentry
- **Log Aggregation**: Winston + Loggly or similar

### 11. Database Migrations

The application uses Mongoose which automatically creates indexes. For manual migrations:

```javascript
// Run in MongoDB shell or migration script
db.users.createIndex({ email: 1 });
db.jobs.createIndex({ recruiterId: 1, status: 1 });
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
```

### 12. Testing Production Build

1. **Health Check**: `GET /api/health/db`
2. **Test Authentication**: Register and login
3. **Test File Upload**: Upload resume and photo
4. **Test Email**: Trigger welcome email
5. **Test Job Posting**: Create a job posting
6. **Test Search**: Search for candidates/jobs

### 13. Performance Optimization

**Backend:**
- Enable MongoDB connection pooling (default in Mongoose)
- Use Redis for caching (future enhancement)
- Enable compression middleware
- Set up CDN for static assets

**Frontend:**
- Enable gzip compression
- Use CDN for React build
- Implement lazy loading for routes
- Optimize images

### 14. Backup Strategy

**Database:**
- MongoDB Atlas: Automatic daily backups
- Manual: `mongodump` scheduled via cron

**Files:**
- If using local storage: Regular backups of `uploads/` directory
- If using S3: Enable S3 versioning and lifecycle policies

### 15. SSL/HTTPS Setup

**Using Let's Encrypt (Certbot):**
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Update Nginx config to redirect HTTP to HTTPS:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📋 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connected and indexes created
- [ ] Email service tested and working
- [ ] File uploads working (local or S3)
- [ ] SSL certificates installed
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Documentation updated

## 🔧 Troubleshooting

### Email Not Sending
1. Check email service credentials
2. Verify sender email is verified (SendGrid/Mailgun)
3. Check SMTP settings if using SMTP
4. Review server logs for email errors

### File Upload Issues
1. Check directory permissions (`chmod 755 uploads/`)
2. Verify file size limits in code
3. Check disk space
4. If using S3, verify credentials and bucket permissions

### Database Connection Issues
1. Verify MongoDB URI format
2. Check network connectivity
3. Verify MongoDB authentication credentials
4. Check MongoDB logs

### CORS Errors
1. Update CORS configuration in `server.js`
2. Verify `FRONTEND_URL` environment variable
3. Check browser console for specific CORS errors

## 📞 Support

For issues:
1. Check application logs
2. Review error tracking (Sentry)
3. Check MongoDB logs
4. Review PM2 logs: `pm2 logs`

---

**Note**: Payment gateway integration is not included in this setup. Refer to payment gateway documentation when ready to integrate.
