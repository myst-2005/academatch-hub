
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Run the setup SQL to create admin_login table
    await supabase.rpc('create_admin_login_table');

    // Check if admin user exists
    const { data: adminUser, error: adminUserError } = await supabase.auth.admin.getUserByEmail("admin@example.com");

    if (adminUserError && adminUserError.message !== "User not found") {
      throw adminUserError;
    }

    // If admin doesn't exist, create it
    if (!adminUser) {
      const { data: user, error } = await supabase.auth.admin.createUser({
        email: "admin@example.com",
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
        throw error;
      }

      // Insert admin details into admin_login table
      const { error: adminLoginError } = await supabase
        .from("admin_login")
        .insert({
          username: "admin",
          email: "admin@example.com",
          user_id: user.user.id
        });

      if (adminLoginError) {
        throw adminLoginError;
      }
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
