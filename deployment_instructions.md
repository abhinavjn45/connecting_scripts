# Vercel Deployment Instructions

Since this is a monorepo containing both your frontend (`nextjs-app`) and backend (`backend`) in separate folders, you will deploy them as **two separate projects** in Vercel.

---

## 1. Deploying the Backend (`backend`)

We have added a `vercel.json` configuration inside your `backend/` directory to automatically run your Express server as a Vercel Serverless Function.

### Step-by-Step Vercel Setup:
1. Log in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Select your repository: `abhinavjn45/connecting_scripts`.
3. In the project settings, configure:
   - **Project Name**: `connecting-scripts-backend` (or any name you prefer)
   - **Framework Preset**: Select **Other** (Vercel will auto-detect the `@vercel/node` builder from `vercel.json`).
   - **Root Directory**: Click `Edit` and select the **`backend`** folder.
4. Expand the **Environment Variables** section and add the following keys for your Hostinger Remote SQL Database:
   - `DB_HOST` = `[Hostinger Remote MySQL Hostname]`
   - `DB_USER` = `[Hostinger Database Username]`
   - `DB_PASSWORD` = `[Hostinger Database Password]`
   - `DB_NAME` = `[Hostinger Database Name]`
   - `DB_PORT` = `3306`
   - `JWT_SECRET` = `[Any Random Secure Passphrase]`
   - `CORS_ORIGIN` = `[Your Vercel Next.js Frontend URL, e.g. https://connecting-scripts.vercel.app]`
5. Click **Deploy**. Vercel will build and assign a URL to your backend (e.g., `https://connecting-scripts-backend.vercel.app`).

---

## 2. Deploying the Next.js Frontend (`nextjs-app`)

Your Next.js project is fully compatible with Vercel natively.

### Step-by-Step Vercel Setup:
1. Go back to your Vercel Dashboard, click **Add New** -> **Project**.
2. Select the same repository: `abhinavjn45/connecting_scripts`.
3. In the project settings, configure:
   - **Project Name**: `connecting-scripts` (this will be your primary website domain)
   - **Framework Preset**: Select **Next.js**.
   - **Root Directory**: Click `Edit` and select the **`nextjs-app`** folder.
4. Expand the **Environment Variables** section and add:
   - `NEXT_PUBLIC_API_URL` = `[The URL of your deployed Vercel backend, e.g. https://connecting-scripts-backend.vercel.app]`
5. Click **Deploy**. Vercel will compile the Next.js application, optimize the assets, and publish your site!
