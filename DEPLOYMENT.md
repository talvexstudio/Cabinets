# Deployment Guide

This project is a modern React application built with Vite. You can deploy it easily to platforms like Vercel or Netlify.

## Option 1: Deploy with Vercel (Recommended)
Vercel is the easiest way to deploy Vite apps.

1.  **Open your terminal** (or use the one in your IDE).
2.  **Install Vercel CLI** (if you haven't already):
    ```powershell
    npm install -g vercel
    ```
3.  **Login** (if required):
    ```powershell
    vercel login
    ```
4.  **Deploy**:
    Run the following command in the project root:
    ```powershell
    vercel
    ```
    -   Follow the prompts (say `Y` to defaults).
    -   It will automatically detect `vite` and configure the build settings.
    -   Once done, it will give you a `Production` URL (e.g., `https://cabinets-app.vercel.app`).

## Option 2: Deploy to Netlify (Drag & Drop)
If you don't want to use the command line for deployment:

1.  **Build the project locally**:
    Run this command in your terminal:
    ```powershell
    npm run build
    ```
    This will create a `dist` folder in your project directory containing the production-ready files.

2.  **Upload to Netlify**:
    -   Go to [app.netlify.com/drop](https://app.netlify.com/drop).
    -   Drag and drop the newly created `dist` folder onto the page.
    -   Netlify will instantly host your website and give you a public URL.

## Option 3: GitHub Pages
If you are pushing this code to GitHub:

1.  Update `vite.config.ts` to set the base path to your repository name:
    ```typescript
    export default defineConfig({
      plugins: [react()],
      base: '/your-repo-name/'
    })
    ```
2.  Push to GitHub and configure GitHub Pages to serve from the `dist` folder.
