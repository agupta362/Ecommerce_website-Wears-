Babal Wears

A vintage streetwear e-commerce storefront built with React and TypeScript, connected to Supabase for product data and image storage. Live on Vercel.

Live site: https://clothing-store-demo-work.vercel.app


What it does


Browse a product catalog with category-based filtering, size selection, and price range filtering
Product images and data served from Supabase storage and database
Filtering updates the view in real time without any page reloads
Fully responsive layout that works on mobile and desktop
Deployed to Vercel with automatic builds on every push to main



Stack

LayerTechFrontendReact, TypeScript, ViteStylingTailwind CSS, shadcn/uiDatabase & StorageSupabaseDeploymentVercel


Run locally

bashgit clone https://github.com/agupta362/Ecommerce_website-Wears-.git
cd Ecommerce_website-Wears-
npm install

Create a .env file in the root:

envVITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

You can get these from your Supabase project settings under API.

Then:

bashnpm run dev

Open http://localhost:5173


Project structure

src/
  components/     reusable UI components
  pages/          page-level components
  lib/            Supabase client and utility functions
  types/          TypeScript type definitions


Deployment

The project is deployed on Vercel. Any push to main triggers an automatic build and deployment. Environment variables are set in the Vercel dashboard under project settings.
