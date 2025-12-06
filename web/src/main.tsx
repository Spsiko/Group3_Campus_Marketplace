import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

// Auth provider component to handle OAuth callbacks
function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle auth state changes (including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Handle OAuth sign-in (Google, etc.)
        if (session.user.app_metadata?.provider === 'google') {

          try {
            // Check if user profile exists in public.users
            const { data: existingProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .maybeSingle();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Error checking user profile:", profileError);
              return;
            }

            let profile = existingProfile;

            if (!profile) {
              // Try to find by email
              const { data: profileByEmail, error: emailError } = await supabase
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .maybeSingle();

              if (!emailError && profileByEmail) {
                // Use existing profile - don't try to link it to avoid constraint issues
                // If someone logs in with Google using an existing email, they should use that account
                profile = profileByEmail;
              } else {
                // Create new profile
                const meta = session.user.user_metadata || {};
                const { data: newProfile, error: insertError } = await supabase
                  .from('users')
                  .insert([{
                    full_name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email,
                    password: 'oauth_user', // Required by schema
                    auth_user_id: session.user.id,
                  }])
                  .select()
                  .single();

                if (insertError) {
                  console.error("Error creating profile:", insertError);
                  return;
                }
                profile = newProfile;
              }
            }

            // Store user session in localStorage for the app
            const userData = {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role === 'admin' ? 'admin' : 'student',
            };

            localStorage.setItem('cm_user', JSON.stringify(userData));

            // Navigate based on role
            if (profile.role === 'admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/student/dashboard', { replace: true });
            }

          } catch (error) {
            console.error("Error handling OAuth sign-in:", error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('cm_user');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
