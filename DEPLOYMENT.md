# 🚀 Community Hero — 100% Free Deployment Guide

Since you are deploying this for the **Vibe2Ship Hackathon 2026** and want a completely free stack with **no credit card required**, we are using **Render** for hosting the application and **MongoDB Atlas** for the database.

Follow these exact steps to get your app live on the internet.

---

## Step 1: Set up the Free Database (MongoDB Atlas)
Render does not provide a free MongoDB instance natively, but MongoDB Atlas is the industry standard and offers a generous free tier.

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** and sign up (or log in).
2. Create a **New Cluster** and select the **M0 Free** tier.
3. Choose the region closest to India (e.g., Mumbai `ap-south-1`).
4. Under **Security → Database Access**, create a new database user:
   - Username: `admin`
   - Password: `YourSecurePassword123`
5. Under **Security → Network Access**, click **Add IP Address** and select **Allow Access From Anywhere** (`0.0.0.0/0`).
6. Go back to **Databases**, click **Connect**, select **Drivers**, and copy your connection string.
   - It will look like this: `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - **Crucial:** Replace `<password>` with the password you created in step 4, and add `communityhero` before the `?` so it uses that database.
   - Final string should look like: `mongodb+srv://admin:YourSecurePassword123@cluster0.abcde.mongodb.net/communityhero?retryWrites=true&w=majority`
   - Save this string somewhere safe. You will need it in Step 2.

---

## Step 2: Set up the AI Key (Google AI Studio)
If you haven't already got a key for the issue analysis:
1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Copy the API Key and save it. You will need it in Step 3.

---

## Step 3: Manual Deployment (100% Free Tier)
Because Render Blueprints require a paid plan, we will deploy the 3 services manually.

### 3A. Deploy the Node.js Backend (Web Service)
1. Go to **[Render.com](https://render.com/)** and sign up/log in with your GitHub account.
2. Click the **New +** button in the top right, and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repository: `AbhishekPattnaik124/community-hero`.
4. Fill in the following details:
   - **Name:** `community-hero-server`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install --legacy-peer-deps`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Scroll down to **Environment Variables** and add:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: (Paste the MongoDB string you got from Step 1)
   - `JWT_SECRET`: (Type any random secure string, e.g., `hackathon2026secret`)
   - `GEMINI_API_KEY`: (Paste the key from Step 2)
6. Click **Create Web Service**. Wait for it to build and copy the generated URL (e.g., `https://community-hero-server.onrender.com`).

### 3B. Deploy the ML Service (Web Service)
1. Click the **New +** button in the top right again, and select **Web Service**.
2. Connect the same repository.
3. Fill in the details:
   - **Name:** `community-hero-ml`
   - **Root Directory:** `ml-service`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
4. Add **Environment Variables**:
   - `PYTHON_VERSION`: `3.12.0`
   - `GEMINI_API_KEY`: (Paste the key from Step 2)
5. Click **Create Web Service**. 

### 3C. Deploy the React Frontend (Static Site)
1. Click the **New +** button one last time, and select **Static Site** (this is also 100% free).
2. Connect the same repository.
3. Fill in the details:
   - **Name:** `community-hero-client`
   - **Root Directory:** `client`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory:** `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: (Paste the backend URL you copied in step 3A, e.g., `https://community-hero-server.onrender.com`)
   - `VITE_SOCKET_URL`: (Paste the same backend URL again)
5. Click **Create Static Site**.

---

## Step 4: Watch it Build!
Render is now building your Frontend, Backend, and ML Service manually. It will take about 3–5 minutes. 

Once the `community-hero-client` (Static Site) says **"Live"**, click on its URL.

**🎉 Congratulations! Your Community Hero app is now live for the hackathon!**

---

### Troubleshooting
- **Backend logs:** If you can't log in or see issues, click on `community-hero-server` in the Render dashboard and check the "Logs" tab to ensure it successfully connected to MongoDB.
- **Waking up:** Because it's on a free tier, Render puts the backend to "sleep" after 15 minutes of inactivity. When you (or judges) first load the app tomorrow, the first API request might take ~45 seconds while the backend wakes up. After that, it will be lightning fast.
