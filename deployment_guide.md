# 🚀 ToolWala AI - Next.js Production Deployment Guide

This guide describes how to deploy your Next.js application properly on **Aqua Host** (or any cPanel shared hosting environment utilizing LiteSpeed/Apache and Phusion Passenger).

---

## ⚠️ Why standard FTP static upload fails
By default, standard shared hosting only serves static HTML files. Since your application has **dynamic API routes** (like `/api/admin/auth`, `/api/admin/blogs`, `/api/admin/stats`), a filesystem-based JSON database for CMS operations, and Prisma ORM integration, **a static HTML upload (like copy-pasting `out/*`) will not support these backend features, resulting in 404 errors on refreshes or backend actions.**

To make all dynamic and administrative routes work seamlessly, the app must run as a **live Node.js process** managed by cPanel's Node.js selector.

---

## 🛠️ Step-by-Step Deployment Steps

### Step 1: Prepare Files for Upload
To deploy your application, you need to upload the codebase *without* unnecessary files like `node_modules` or `.git`. 

1. Create a zip archive of the project folder containing the following items:
   * `.next/` (created when running `npm run build` locally)
   * `public/`
   * `src/` (required because dynamic tools/blogs read from `src/data/`)
   * `prisma/`
   * `package.json`
   * `package-lock.json`
   * `server.js` (our production server script)
   * `.htaccess` (pre-configured Passenger & static rewrite rules)
   * `next.config.ts`
   * `tsconfig.json`
   * `.env` (your production database and credentials file)

---

### Step 2: Upload and Extract on Aqua Host
1. Log in to your **Aqua Host cPanel**.
2. Open the **File Manager** and navigate to your domain's folder (typically `public_html`).
3. Upload the zip archive you created in Step 1.
4. Extract the zip file directly into the directory.

---

### Step 3: Configure the Node.js App in cPanel
1. In cPanel, search for the **"Setup Node.js App"** tool and open it.
2. Click **"Create Application"**.
3. Fill in the configuration fields:
   * **Node.js version:** Select `20.x` or `18.x` (Next.js requires Node.js >= 18.17.0).
   * **Application Mode:** Select `production`.
   * **Application Root:** Enter the path to your folder (e.g., `public_html` or `/home/yourusername/public_html`).
   * **Application URL:** Select `https://toolwala.co`.
   * **Application Startup File:** Enter `server.js`.
4. Click the **"Create"** button at the top right.

---

### Step 4: Run Package Install & Build on Server
Once the Node.js application is initialized:
1. Copy the **Virtual Environment command** shown at the top of the Node.js App page. It looks like this:
   ```bash
   source /home/yourusername/nodevenv/public_html/20/bin/activate && cd /home/yourusername/public_html
   ```
2. In cPanel, open the **Terminal** tool (or connect to your hosting via SSH).
3. Paste the command you copied and press Enter to load the virtual environment.
4. Install all dependencies (including devDependencies needed for compiling tailwind/typescript):
   ```bash
   npm install --production=false
   ```
5. Build the production application bundle:
   ```bash
   npm run build
   ```
   *(Note: This compiles the optimized pages and server-side routes inside the `.next/` folder).*

---

### Step 5: Start & Run the Application
1. Return to the cPanel **"Setup Node.js App"** screen.
2. Click the **"Restart"** button to load your newly compiled build.
3. Click the **"Start Application"** button if it isn't already running.
4. Phusion Passenger will now keep your Next.js server (`server.js`) running in the background 24/7. If the app encounters an error or restarts, Passenger will automatically boot it back up.

---

## 🔒 Securing Environment Variables
Instead of committing credentials to Git, define your production configuration inside the **Environment Variables** section in the **Setup Node.js App** page:
* `DATABASE_URL`: Your Supabase connection string.
* `ADMIN_USERNAME`: `toolwala_admin`
* `ADMIN_PASSWORD`: `tg_admin_secure_9845x#` (or your custom password)
* `JWT_SECRET`: A secure random secret key string.

---

## 🔄 Fixing 404 Routing Issues on Refresh
Our custom [server.js](file:///Users/technicul-akash/Documents/ToolWala-AI/server.js) script boots Next.js programmatically. Phusion Passenger redirects all inbound traffic on `toolwala.co/*` to `server.js`. Next.js then parses the URL request and loads the matching Page or API endpoint. This completely resolves the 404 refresh error on deep URLs (like `/admin/login`).
