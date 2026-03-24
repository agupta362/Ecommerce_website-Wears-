-- Add image_url column to sale_banners for background images
ALTER TABLE public.sale_banners 
ADD COLUMN image_url text NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.sale_banners.image_url IS 'Optional background image URL for the banner';