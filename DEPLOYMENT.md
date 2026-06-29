# ServiceSetu - Deployment Guide (Vercel + Render)

## 🚀 DEPLOYMENT CHECKLIST

### ✅ Prerequisites
- [ ] GitHub account with repo access
- [ ] Vercel account (signup at vercel.com)
- [ ] Render account (signup at render.com)
- [ ] All environment variables ready
- [ ] Code pushed to GitHub

---

## 📦 PART 1: BACKEND DEPLOYMENT (Render)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Deploy: prepare for Render deployment"
git push origin feature/signup-fixed
```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Sign in / Sign up
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select branch: `feature/signup-fixed`
6. Fill in:
   - **Name:** `serviceSetu-backend`
   - **Runtime:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or Paid if you want better performance)

### Step 3: Add Environment Variables in Render
Click **"Environment"** and add:

```
NODE_ENV=production
PORT=8000
MONGO_URL=mongodb+srv://ServiceSetu:gx1KdlpRVrPuRBgJ@cluster0.pwzgzc5.mongodb.net/servicesetu
ACCESS_TOKEN_SECRET=fbejbisvoevsovbeofobv
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=senovnobvoobveobvoe23u8jvo
REFRESH_TOKEN_EXPIRY=10d
RAZORPAY_KEY_ID=rzp_test_T7W6egGDJvGQtp
RAZORPAY_KEY_SECRET=rO50D4BiaiUVfxH7JfU7Ty6G
CLOUDINARY_CLOUD_NAME=daf61w0vx
CLOUDINARY_API_KEY=824984992369262
CLOUDINARY_API_SECRET=aNsloefa-E1ynZEsAokq5eUdWhA
ADMIN_EMAIL=ghadgesoham2006@gmail.com
ADMIN_PHONE=9136801839
ADMIN_PASSWORD=admin123
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

⚠️ **UPDATE CORS_ORIGIN** with your actual Vercel domain (add after Vercel deployment)

### Step 4: Deploy
Click **"Create Web Service"** → Render deploys automatically ✅

**You'll get a backend URL like:** `https://serviceSetu-backend.onrender.com`

---

## 🌐 PART 2: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in / Sign up
3. Click **"Add New..."** → **"Project"**
4. Select your GitHub repository
5. Choose root directory: (leave default)
6. Build settings should auto-detect

### Step 2: Configure Build Settings
In Vercel Dashboard:
- **Framework:** Vite
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables in Vercel
In **Settings → Environment Variables**, add:

```
VITE_API_BASE_URL=https://serviceSetu-backend.onrender.com/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_T7W6egGDJvGQtp
VITE_ENV=production
```

⚠️ **Use your Render backend URL** (get from Render dashboard)

### Step 4: Deploy
Click **"Deploy"** → Vercel deploys automatically ✅

**You'll get a frontend URL like:** `https://serviceSetu.vercel.app`

---

## 🔗 POST-DEPLOYMENT STEPS

### 1. Update Backend CORS
Go back to **Render Dashboard**:
- Edit Environment Variable: `CORS_ORIGIN`
- Set to: `https://your-vercel-domain.vercel.app`
- Redeploy

### 2. Test Payment Flow
1. Open frontend URL
2. Login and book a service
3. Go to payment page
4. Click "Pay Now with Razorpay"
5. Verify QR code displays

### 3. Monitor Logs
- **Vercel:** Settings → Functions → Logs
- **Render:** Dashboard → Logs tab

---

## 📊 DEPLOYMENT SUMMARY

| Component | Platform | URL Format | Status |
|-----------|----------|-----------|--------|
| Frontend  | Vercel   | https://projectname.vercel.app | ✅ |
| Backend   | Render   | https://projectname.onrender.com | ✅ |
| Database  | MongoDB Atlas | (Existing) | ✅ |
| Payment   | Razorpay | (Integrated) | ✅ |

---

## ⚠️ IMPORTANT NOTES

### Development Environment
- `.env` files are local only (in .gitignore)
- Environment variables are set in Vercel/Render dashboards
- Never commit `.env` files

### Razorpay Test Mode
- Current keys are TEST keys
- For production, get LIVE keys from Razorpay
- Update in both Render & production code

### Cold Start Delay (Render Free)
- First request after inactivity may take 30-60 seconds
- Upgrade to paid plan for better performance

### CORS Configuration
- Frontend and Backend must have matching domains
- Update CORS_ORIGIN when Vercel URL changes
- Test with different origins if issues occur

---

## 🆘 TROUBLESHOOTING

### Build Fails on Vercel
```bash
# Clear cache and rebuild
vercel rebuild
```

### Backend 502 Errors
- Check Render logs for errors
- Verify MongoDB connection string
- Check environment variables are set

### Payment Not Working
- Verify Razorpay keys in Render env vars
- Check CORS_ORIGIN is correct
- Test with Razorpay test cards

### QR Code Not Displaying
- Check backend logs for proxy errors
- Verify `/api/v1/payments/qr-image/:bookingId` endpoint
- Test with curl: `curl https://backend-url/api/v1/payments/qr-image/test-id`

---

## 📝 DEPLOYMENT QUICK REFERENCE

```bash
# Local Testing Before Deploy
npm run dev          # Frontend
npm start            # Backend (from backend folder)

# Push to GitHub
git push origin feature/signup-fixed

# Render Deployment
1. Create web service
2. Connect GitHub repo
3. Add env variables
4. Deploy

# Vercel Deployment
1. Import project
2. Configure build settings
3. Add env variables
4. Deploy

# Verify Deployment
Frontend: https://serviceSetu.vercel.app
Backend: https://serviceSetu-backend.onrender.com/api/v1/payments/status
```

---

## 🎉 NEXT STEPS

After deployment:
1. Test complete payment flow
2. Monitor logs for errors
3. Set up error tracking (Sentry recommended)
4. Configure domain names (if applicable)
5. Set up CI/CD for automatic deployments

---

**Questions?** Check Vercel & Render documentation or reach out to support.
