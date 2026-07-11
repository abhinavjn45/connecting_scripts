# Deploying Next.js Application to Vercel via GitHub

Follow this step-by-step guide to push your Next.js application to GitHub and deploy it on Vercel.

---

## Step 1: Push Your Code to GitHub

### 1. Initialize Git in Your Project Root
If you haven't already initialized git in the main directory `connecting_scripts`, open your terminal and run:
```bash
git init
```

### 2. Configure Your `.gitignore`
Make sure you have a `.gitignore` file in your project root to avoid uploading large folders (like `node_modules` or `.next`) and sensitive configuration credentials (like `.env`). 

Create or edit the `.gitignore` file in your root folder:
```gitignore
# Node dependencies
node_modules/

# Next.js build output
.next/
out/
build/

# Environment configurations
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS files
.DS_Store
Thumbs.db
```

### 3. Commit Your Changes
Stage and commit all your current changes to git:
```bash
git add .
git commit -m "Initialize project and add Next.js frontend with backend configurations"
```

### 4. Create a Repository on GitHub
1. Go to [GitHub](https://github.com/) and log in.
2. Click the **New** button to create a new repository.
3. Give it a name (e.g., `connecting-scripts`) and choose whether it should be **Public** or **Private**.
4. Click **Create repository** (do not initialize with a README, gitignore, or license).

### 5. Push to GitHub
Copy the commands from the GitHub repository setup page and run them in your local terminal:
```bash
# Rename the default branch to main
git branch -M main

# Link your local repository to GitHub (Replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push the code
git push -u origin main
```

---

## Step 2: Deploy the Next.js App to Vercel

Since your Next.js application is nested in the `nextjs-app/` subdirectory (with backend in `backend/` and static site in `frontend/`), you need to tell Vercel to look inside `nextjs-app` for building.

### 1. Log in to Vercel
1. Go to [Vercel](https://vercel.com/) and log in using your **GitHub** account.

### 2. Import Your Project
1. In the Vercel Dashboard, click **Add New** -> **Project**.
2. Under "Import Git Repository", find the repository you just pushed (e.g., `connecting-scripts`) and click **Import**.

### 3. Configure Project Settings (CRITICAL)
Before clicking deploy, adjust the following settings in the configuration panel:

1. **Framework Preset**: Vercel will automatically detect `Next.js`.
2. **Root Directory**:
   - By default, this is set to `./` (repository root).
   - Click **Edit** next to it.
   - Choose the `nextjs-app` folder and click **Save**.
3. **Build & Development Settings**:
   - Vercel handles these automatically (Build Command: `next build`, Output Directory: `.next`).
4. **Environment Variables** (Optional):
   - If you have frontend API endpoints or env vars defined in `nextjs-app/.env.local`, expand this section and add them here.

### 4. Deploy!
1. Click **Deploy**.
2. Vercel will build your Next.js project and deploy it. This usually takes 1-2 minutes.
3. Once finished, you will receive a preview screenshot and a production domain URL (e.g., `https://connecting-scripts.vercel.app`).

---

## Step 3: Future Updates
Whenever you want to update your live website, simply commit and push your changes to GitHub:
```bash
git add .
git commit -m "Update homepage copy"
git push
```
Vercel will detect the new commit on your `main` branch, automatically trigger a new build, and update the live site with zero downtime!
