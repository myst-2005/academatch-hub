
-- Create a function to set up the admin_login table
CREATE OR REPLACE FUNCTION create_admin_login_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_login') THEN
    -- Create the admin_login table
    CREATE TABLE public.admin_login (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );
    
    -- Enable RLS on the table
    ALTER TABLE public.admin_login ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for the admin_login table
    CREATE POLICY "Only super admins can select admin_login" 
      ON public.admin_login 
      FOR SELECT 
      TO authenticated 
      USING (
        (SELECT is_super_admin FROM auth.users WHERE id = auth.uid())
      );
    
    -- Allow anyone to query admin_login table for login purposes
    CREATE POLICY "Anyone can check admin username" 
      ON public.admin_login 
      FOR SELECT 
      USING (TRUE);
  END IF;
END;
$$;
