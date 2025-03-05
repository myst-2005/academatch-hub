
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Run the setup SQL to create admin_login table
    await supabase.rpc('create_admin_login_table');

    // Check if admin user exists - UPDATED EMAIL to match what's expected in AuthContext.tsx
    const { data: adminUser, error: adminUserError } = await supabase.auth.admin.getUserByEmail("admin@admin.com");

    if (adminUserError && adminUserError.message !== "User not found") {
      throw adminUserError;
    }

    // If admin doesn't exist, create it with the correct email
    if (!adminUser) {
      console.log("Creating admin user admin@admin.com");
      
      const { data: user, error } = await supabase.auth.admin.createUser({
        email: "admin@admin.com",
        password: "admin@1234",
        email_confirm: true,
        user_metadata: {
          name: "Admin User"
        },
        app_metadata: {
          is_super_admin: true
        },
      });

      if (error) {
        console.error("Failed to create admin user:", error);
        throw error;
      }

      console.log("Admin user created successfully:", user.user.id);

      // Insert admin details into admin_login table
      const { error: adminLoginError } = await supabase
        .from("admin_login")
        .insert({
          username: "admin",
          email: "admin@admin.com",
          user_id: user.user.id
        });

      if (adminLoginError) {
        console.error("Failed to insert admin login record:", adminLoginError);
        throw adminLoginError;
      }
      
      console.log("Admin login record created successfully");
    } else {
      console.log("Admin user already exists:", adminUser.id);
    }

    return new Response(JSON.stringify({ success: true, message: "Admin setup completed successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Setup error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
