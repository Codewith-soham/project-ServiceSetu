# ServiceSetu - AWS Deployment Guide

## 📋 Pre-Deployment Checklist

### Before Deployment
- [ ] All critical fixes from PRODUCTION_CHECKLIST.md implemented
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates obtained (use AWS Certificate Manager - FREE)
- [ ] Domain name purchased and configured (optional, can use AWS IP)
- [ ] Team members have AWS IAM access

---

## 🚀 Step-by-Step Deployment on AWS

### Phase 1: AWS Infrastructure Setup (15-20 minutes)

#### 1.1 Create EC2 Instance
```bash
1. Go to AWS Console → EC2 → Launch Instance
2. Select: Ubuntu 22.04 LTS (Free tier eligible)
3. Instance Type: t3.medium (or t3.small for testing)
4. Storage: 20GB gp3
5. Security Group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP 8000 from anywhere (for backend)
```

#### 1.2 Create Security Group
```
Inbound Rules:
- SSH (22): 0.0.0.0/0 (restrict to your IP in production)
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- TCP 8000: 0.0.0.0/0 (backend API)
```

#### 1.3 Create Elastic IP (Optional but recommended)
```bash
# Keep same IP even if instance stops
AWS Console → Network & Security → Elastic IPs → Allocate
Associate with your EC2 instance
```

### Phase 2: Database Setup (10-15 minutes)

#### 2.1 MongoDB Atlas Setup (Recommended)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Create database user (NOT admin)
4. Whitelist AWS security group IP (get EC2 public IP)
5. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

OR

#### 2.2 AWS DocumentDB (AWS alternative)
```bash
# More expensive but managed by AWS
AWS Console → DocumentDB → Create cluster
```

### Phase 3: EC2 Instance Configuration (10-15 minutes)

#### 3.1 Connect to EC2
```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager for Node)
sudo npm install -g pm2

# Install nginx (reverse proxy)
sudo apt install -y nginx
```

#### 3.2 Clone Your Repository
```bash
cd /home/ubuntu
git clone https://github.com/yourusername/ServiceSetu.git
cd ServiceSetu
```

#### 3.3 Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file with production values
nano .env
# Paste your production environment variables

# Test backend
npm start
# Should see: "Server is running on port 8000"

# Kill process (Ctrl+C) and start with PM2
pm2 start server.js --name "serviceSetu-api"

# Make it restart on reboot
pm2 startup
pm2 save
```

### Phase 4: Frontend Deployment

#### 4.1 Build Frontend
```bash
cd ../frontend

npm install

# Build for production
npm run build

# Build output is in dist/ folder
```

#### 4.2 Option A: Deploy Frontend on Same EC2 (Simple)
```bash
# Copy dist to nginx
sudo cp -r dist/* /var/www/html/

# Update nginx config to serve from dist
sudo nano /etc/nginx/sites-available/default
```

Update nginx config:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Enable nginx auto-start
sudo systemctl enable nginx
```

#### 4.2 Option B: Deploy Frontend on S3 + CloudFront (Recommended)
```bash
# Create S3 bucket
AWS Console → S3 → Create bucket → serviceSetu-frontend

# Upload dist folder
aws s3 sync dist/ s3://serviceSetu-frontend/ --delete

# Create CloudFront distribution pointing to S3
AWS Console → CloudFront → Create distribution → Origin: S3 bucket
```

### Phase 5: SSL/TLS Certificate Setup (5-10 minutes)

#### 5.1 Using Let's Encrypt (FREE)
```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot certonly --nginx -d yourdomain.com

# Update nginx to use cert
sudo nano /etc/nginx/sites-available/default
# Add SSL paths from certbot output

sudo systemctl restart nginx

# Auto-renew
sudo certbot renew --dry-run
```

#### 5.2 Using AWS Certificate Manager (FREE)
```
AWS Console → Certificate Manager → Request certificate
Domain: yourdomain.com, *.yourdomain.com
Validation: DNS
Configure in CloudFront
```

### Phase 6: Configure Environment Variables

#### 6.1 Backend .env
```bash
nano /home/ubuntu/ServiceSetu/backend/.env

NODE_ENV=production
PORT=8000
MONGO_URL=mongodb+srv://prod_user:password@cluster.mongodb.net/serviceSetu
ACCESS_TOKEN_SECRET=<your-strong-secret-32-chars>
REFRESH_TOKEN_SECRET=<your-strong-secret-32-chars>
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
# ... other vars
```

### Phase 7: Verify Deployment

```bash
# Check if backend is running
curl http://localhost:8000/api/v1/healthCheck

# Check nginx status
sudo systemctl status nginx

# Check PM2 processes
pm2 list

# Check logs
pm2 logs serviceSetu-api
```

---

## 🔍 Post-Deployment Verification

### Health Checks
```bash
# Health endpoint
curl https://yourdomain.com/api/v1/healthCheck

# Check Socket.IO connection
# Open browser console and check for socket connection logs
```

### Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check MongoDB connection
# Test via API endpoint that queries database
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Cannot connect to database"
```bash
# Check MongoDB Atlas IP whitelist
# Add your EC2 public IP to MongoDB Atlas security

# Verify connection string in .env
mongo --version  # Check MongoDB CLI
```

### Issue: "Socket connection refused"
```bash
# Ensure TCP 8000 is open in security group
# Check PM2 is running: pm2 list
# Check logs: pm2 logs
```

### Issue: "Frontend loading but API calls fail"
```bash
# Check CORS_ORIGIN matches your frontend domain
# Clear browser cache (Ctrl+Shift+Delete)
# Check browser console for errors
```

### Issue: "High CPU/Memory usage"
```bash
# Check for memory leaks in logs
pm2 logs

# Restart backend
pm2 restart serviceSetu-api

# Monitor performance
pm2 monit
```

---

## 📊 Cost Estimation (AWS)

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| EC2 | t3.medium | ~$30 |
| Elastic IP | 1 IP | Free (if used) |
| MongoDB Atlas | Shared | Free-$57 |
| **Total** | | **~$30-90/month** |

---

## 🔐 Security Hardening Post-Deployment

```bash
# 1. Update security group to restrict SSH
# Only allow from your IP, not 0.0.0.0/0

# 2. Enable CloudWatch monitoring
AWS Console → CloudWatch → Create alarms

# 3. Setup AWS Backup for EC2
AWS Console → Backup → Create backup plan

# 4. Monitor logs
# SSH logs: sudo tail -f /var/log/auth.log
# App logs: pm2 logs

# 5. Regular backups
# MongoDB: Enable automated backups in Atlas
# EC2: Create snapshots weekly
```

---

## 📈 Scaling for Production

### When you get more traffic:
1. **Database**: Upgrade MongoDB Atlas cluster
2. **Backend**: Switch to load balancer + multiple EC2 instances
3. **Frontend**: Already scaled (using CloudFront)
4. **Real-time**: Add Redis for Socket.IO scaling

---

## 🚨 Emergency Rollback

```bash
# If something goes wrong:

# Stop PM2
pm2 stop serviceSetu-api

# Revert code
git revert HEAD

# Reinstall dependencies if needed
npm install

# Restart
pm2 start server.js --name "serviceSetu-api"

# Verify
curl http://localhost:8000/api/v1/healthCheck
```

---

## 📞 Support & Documentation

- **Node.js**: https://nodejs.org/en/docs/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **AWS EC2**: https://docs.aws.amazon.com/ec2/
- **Nginx**: https://nginx.org/en/docs/
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## ✅ Final Checklist

- [ ] EC2 instance running
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend running on PM2
- [ ] Frontend built and deployed
- [ ] SSL certificate configured
- [ ] Domain pointing to your server
- [ ] Environment variables set
- [ ] Health check endpoint responding
- [ ] Socket.IO connecting
- [ ] Database backups enabled
- [ ] Monitoring alerts configured
- [ ] Team access configured

**Ready for production! 🎉**
