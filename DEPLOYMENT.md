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

## Step 3: Deploy to Render (1-Click Blueprint)
The code repository already contains a `render.yaml` file, which is a blueprint that tells Render exactly how to build and link the Frontend, Backend, and AI Service automatically.

1. Go to **[Render.com](https://render.com/)** and sign up/log in with your GitHub account.
2. Click the **New +** button in the top right, and select **Blueprint**.
3. Connect your GitHub repository: `AbhishekPattnaik124/community-hero`.
4. Render will scan the repository and detect the `render.yaml` file.
5. You will be prompted to provide two missing environment variables:
   - `MONGO_URI`: Paste the string you got from Step 1.
   - `GEMINI_API_KEY`: Paste the key you got from Step 2.
6. Click **Apply** or **Deploy**.

---

## Step 4: Watch it Build!
Render will now start building three separate services simultaneously:
1. **`community-hero-server`**: Your Node.js backend.
2. **`community-hero-ml`**: Your Python AI service.
3. **`community-hero-client`**: Your React frontend.

It will take about 3–5 minutes for all three to build. 

Once the `community-hero-client` says **"Live"**, click on its URL (e.g., `https://community-hero-client.onrender.com`).

**🎉 Congratulations! Your Community Hero app is now live for the hackathon!**

---

### Troubleshooting
- **Backend logs:** If you can't log in or see issues, click on `community-hero-server` in the Render dashboard and check the "Logs" tab to ensure it successfully connected to MongoDB.
- **Waking up:** Because it's on a free tier, Render puts the backend to "sleep" after 15 minutes of inactivity. When you (or judges) first load the app tomorrow, the first API request might take ~45 seconds while the backend wakes up. After that, it will be lightning fast.
