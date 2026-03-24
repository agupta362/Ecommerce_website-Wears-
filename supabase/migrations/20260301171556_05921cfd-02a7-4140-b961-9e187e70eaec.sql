-- Drop the legacy decrease_product_stock function (stock is now managed by trigger_decrease_stock_on_order_item)
REVOKE EXECUTE ON FUNCTION public.decrease_product_stock FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.decrease_product_stock FROM anon;
DROP FUNCTION IF EXISTS public.decrease_product_stock(UUID, TEXT, INTEGER);