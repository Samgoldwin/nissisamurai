
# How to Deploy Nissi Samurai Online (Free)

Since this game uses **WebSockets** for real-time multiplayer, you cannot deploy the **Backend Server** to Vercel (standard Vercel is for static sites and serverless functions, which don't support persistent game connections).

However, you can use a **Hybrid Approach**:
1.  **Frontend (Game UI)** -> Deployed on **Vercel**.
2.  **Backend (Game Logic)** -> Deployed on **Render** (Free tier supports WebSockets).

---

## Step 1: Prepare Your Code
1.  Ensure your code is pushed to a **GitHub Repository**.

## Step 2: Deploy the Backend (Render)
1.  Go to [Render.com](https://render.com) and sign up/login.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Name**: `nissi-samurai-server`
    *   **Root Directory**: `server` (This is important! Tell Render the code is in the server folder)
    *   **Environment**: Node
    *   **Build Command**: `npm install` (Or just leave default if it auto-detects)
    *   **Start Command**: `node index.js`
    *   **Plan**: Free
5.  Click **Create Web Service**.
6.  Wait for deployment. Once finished, Render will give you a URL (e.g., `https://nissi-samurai-server.onrender.com`). **Copy this URL.**

## Step 3: Deploy the Frontend (Vercel)
1.  Go to [Vercel.com](https://vercel.com) and sign up/login.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `./` (Default)
    *   **Environment Variables**:
        *   Key: `VITE_SERVER_URL`
        *   Value: `YOUR_RENDER_URL_FROM_STEP_2` (e.g., `https://nissi-samurai-server.onrender.com`)
        *   *Note: Do not add a trailing slash `/` at the end of the URL.*
5.  Click **Deploy**.

## Step 4: Play!
Visit the domain Vercel assigns you (e.g., `https://nissi-samurai.vercel.app`).
*   Open it on your computer.
*   Send the link to a friend.
*   Create a room and play!

---
**Note:** The Render free tier spins down after 15 minutes of inactivity. The first time you connect after a break, it might take ~1 minute for the server to wake up. This is normal for the free tier.
