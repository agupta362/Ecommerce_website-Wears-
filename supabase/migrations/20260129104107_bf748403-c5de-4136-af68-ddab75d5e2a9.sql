-- Update estimated delivery days for major branches to "1-2 days"
UPDATE ncm_branches 
SET estimated_days = '1-2 days' 
WHERE branch_name IN (
  'KATHMANDU', 
  'POKHARA', 
  'LALITPUR', 
  'BHAKTAPUR', 
  'BIRATNAGAR', 
  'BIRGUNJ', 
  'BHARATPUR', 
  'HETAUDA', 
  'BUTWAL', 
  'DHARAN', 
  'ITAHARI', 
  'DAMAK', 
  'NEPALGUNJ', 
  'DHANGADHI'
) AND is_active = true;