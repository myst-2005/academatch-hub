
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, check if admin user already exists
    const { data: adminUsers, error: checkError } = await supabase
      .from('admin_login')
      .select('*')
      .eq('username', 'admin');

    if (checkError) {
      // If the table doesn't exist, create it
      await supabase.rpc('create_admin_login_table');
    }

    if (!adminUsers || adminUsers.length === 0) {
      // Create admin user in auth.users
      const adminEmail = 'admin@haca.example.com';
      const adminPassword = 'admin@1234';

      // Create admin user in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        app_metadata: { is_super_admin: true },
      });

      if (authError) {
        throw authError;
      }

      // Store admin credentials in admin_login table for reference
      const { error: insertError } = await supabase
        .from('admin_login')
        .insert([
          {
            username: 'admin',
            email: adminEmail,
            user_id: authUser.user.id
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Admin user created' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Admin user already exists' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
