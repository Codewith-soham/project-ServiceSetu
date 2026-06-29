# ServiceSetu Production Deployment Checklist

## 🚀 Critical Before Deployment (MUST FIX)

### 1. Add Helmet.js for Security Headers
```bash
npm install helmet
```

**backend/src/app.js** - Add after imports:
```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 2. Add Input Validation with Joi
```bash
npm install joi
```

### 3. Add Logging with Winston
```bash
npm install winston
```

### 4. Environment Variables - Create .env template
Backend `.env`:
```
NODE_ENV=production
PORT=8000
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/serviceSetuprod
ACCESS_TOKEN_SECRET=<strong-secret-key-here>
REFRESH_TOKEN_SECRET=<strong-secret-key-here>
CORS_ORIGIN=https://yourdomain.com
CLOUDINARY_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_SECRET=<your-secret>
```

Frontend `.env`:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### 5. Add Production Start Script
**backend/package.json**:
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "build": "echo 'No build needed for Node backend'"
  }
}
```

### 6. Add Sensitive Field Filtering
Create `backend/src/utils/sanitize.js`:
```javascript
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  return userObj;
};
```

## 📋 Important Configurations

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Configure IP whitelist for your AWS IP
- [ ] Create dedicated database user (not admin)
- [ ] Enable encryption at rest
- [ ] Enable automatic backups

### 2. AWS Setup (Recommended: EC2 + RDS)
- [ ] Create EC2 instance (t3.medium minimum)
- [ ] Setup security groups (port 443, 80, 8000)
- [ ] Use MongoDB Atlas or AWS DocumentDB
- [ ] Configure SSL/TLS certificates (use AWS Certificate Manager)

### 3. Frontend Deployment
- [ ] Build: `npm run build`
- [ ] Deploy to AWS S3 + CloudFront OR Vercel/Netlify
- [ ] Configure CORS on backend to allow frontend domain

### 4. Environment Secrets
- [ ] Use AWS Secrets Manager or .env in production server
- [ ] Never commit secrets to git
- [ ] Rotate JWT secrets every 90 days

## ✅ Code Quality Checks

```bash
# Frontend build
cd frontend && npm run build

# Check for console.logs (remove in production)
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# Check for hardcoded URLs
grep -r "localhost" src/ --include="*.ts" --include="*.tsx"
```

## 🔐 Security Hardening

- [ ] Enable HTTPS/TLS
- [ ] Set secure cookies (httpOnly, secure, sameSite)
- [ ] Implement CSRF protection for forms
- [ ] Add request size limits
- [ ] Enable compression (gzip)
- [ ] Setup WAF (AWS WAF)
- [ ] Monitor API usage and anomalies

## 📊 Monitoring & Observability

- [ ] Setup CloudWatch for AWS resources
- [ ] Configure application logging to CloudWatch
- [ ] Setup alerts for error rates > 1%
- [ ] Monitor database connection pool
- [ ] Track Socket.IO connection stability
- [ ] Setup uptime monitoring (StatusPage/UptimeRobot)

## 🚦 Load Testing Before Production

```bash
# Use Apache Bench or k6 for load testing
ab -n 1000 -c 100 https://yourdomain.com/api/v1/healthCheck
```

## 📱 Final Checklist

- [ ] All environment variables configured
- [ ] Database indexes created
- [ ] Helmet.js added
- [ ] Error tracking (Sentry) setup
- [ ] SSL certificate installed
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Logging system active
- [ ] Backup strategy documented
- [ ] Rollback plan documented
- [ ] Team access to AWS/MongoDB configured

## 🎯 AWS Deployment Architecture Recommended

```
Frontend:           S3 + CloudFront
Backend:            EC2 (Node.js)
Database:           MongoDB Atlas
Real-time:          Socket.IO on same EC2
Storage:            Cloudinary (already using)
Payments:           Razorpay (already using)
DNS:                Route 53
SSL:                AWS Certificate Manager
Monitoring:         CloudWatch + Alerts
```

---

**Risk Assessment:** ⚠️ **MODERATE** - Deployable with fixes above
**Estimated Time to Fix:** 2-4 hours
**Recommended Go-Live Date:** After implementing all critical fixes above
