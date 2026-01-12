import { supabase } from "./supabase";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "DOCTOR";
  supabaseId: string | null;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: "ADMIN" | "DOCTOR";
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Login failed - no user returned");
    }

    // Get user from database using Supabase client
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("supabaseId", authData.user.id)
      .single();

    if (userError || !userData || !userData.isActive) {
      throw new Error("User not found or inactive");
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        supabaseId: userData.supabaseId,
        isActive: userData.isActive,
      },
      session: authData.session,
    };
  } catch (error: any) {
    throw new Error(error.message || "Login failed");
  }
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    return true;
  } catch (error: any) {
    throw new Error(error.message || "Logout failed");
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Get user from database using Supabase client
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("supabaseId", session.user.id)
      .single();

    if (userError || !userData || !userData.isActive) {
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      supabaseId: userData.supabaseId,
      isActive: userData.isActive,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Request password reset (sends email to user)
 */
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error: any) {
    throw new Error(error.message || "Failed to send password reset email");
  }
}

/**
 * Update user password (requires authenticated session)
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update password");
  }
}

/**
 * Set initial password for a user via admin (requires service role or admin session)
 * Note: This requires admin privileges. In production, use Supabase Admin API with service role key.
 */
export async function setUserPassword(email: string, password: string): Promise<boolean> {
  try {
    // Method 1: Try using Supabase Admin API (requires service role key)
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || "";
    
    if (serviceRoleKey) {
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
      if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
      }

      // Use admin client to update user password
      const { createClient } = await import("@supabase/supabase-js");
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Get user by email first
      const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      const user = users.find((u) => u.email === email);
      
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }

      // Update user password
      const { data, error: updateError } = await adminClient.auth.admin.updateUserById(
        user.id,
        {
          password: password,
        }
      );

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      return true;
    } else {
      // Method 2: Use password reset flow (user must click email link)
      // For initial setup, request password reset
      await requestPasswordReset(email);
      
      throw new Error(
        "Service role key not configured. Please use Supabase Dashboard to set password, or configure SUPABASE_SERVICE_ROLE_KEY."
      );
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to set password");
  }
}

/**
 * Create a new user (admin only)
 * 
 * NOTE: This function requires admin privileges and should ideally be done via:
 * - A backend API endpoint (Express, Next.js API routes, etc.)
 * - Supabase Edge Function with service role key
 * - Supabase Database Webhook
 * 
 * For client-side usage, this will attempt to create the user via Supabase Edge Function
 * or return the user data for manual creation via admin dashboard.
 * 
 * The password should be generated and sent via email separately.
 */
export async function createUser(userData: CreateUserData): Promise<{ user: User; password: string }> {
  try {
    // Generate a secure temporary password
    const tempPassword = userData.password || generateTempPassword();
    
    // Try to call a Supabase Edge Function (if available)
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || "";
    
    // If we have service role key, use admin API
    if (serviceRoleKey && supabaseUrl) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        // Create user in Supabase Auth using admin API
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: userData.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email since admin is creating
        });

        if (authError) {
          throw new Error(`Supabase auth error: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error("Failed to create user in Supabase Auth");
        }

        // Create user in database using Supabase client
        const { data: dbUser, error: dbError } = await supabase
          .from("users")
          .insert({
            email: userData.email,
            name: userData.name,
            role: userData.role || "DOCTOR",
            supabaseId: authData.user.id,
            isActive: true,
          })
          .select()
          .single();

        if (dbError || !dbUser) {
          // If database creation fails, try to delete the Supabase user
          await adminClient.auth.admin.deleteUser(authData.user.id).catch(console.error);
          throw new Error(`Database error: ${dbError?.message || "Failed to create user"}`);
        }

        return {
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            supabaseId: dbUser.supabaseId,
            isActive: dbUser.isActive,
          },
          password: tempPassword,
        };
      } catch (adminError: any) {
        console.warn("Admin API failed, using fallback:", adminError.message);
      }
    }
    
    // Fallback: Create user record in database (Supabase Auth user must be created separately)
    // This assumes the user already exists in Supabase Auth
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        name: userData.name,
        role: userData.role || "DOCTOR",
        isActive: true,
        // Note: supabaseId will be null until user is created in Supabase Auth
        // This should be updated after user confirms email/sets password
      })
      .select()
      .single();

    if (dbError || !dbUser) {
      throw new Error(`Database error: ${dbError?.message || "Failed to create user"}`);
    }

    // Return user with password for email sending
    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        supabaseId: dbUser.supabaseId,
        isActive: dbUser.isActive,
      },
      password: tempPassword,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || !session?.user) {
      callback(null);
      return;
    }
    
    if (session?.user) {
      try {
        const user = await getCurrentUser();
        callback(user);
      } catch (error) {
        console.error("Error getting user on auth state change:", error);
        callback(null);
      }
    }
  });
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === "ADMIN";
}

/**
 * Check if user has doctor role
 */
export function isDoctor(user: User | null): boolean {
  return user?.role === "DOCTOR";
}

/**
 * Generate a temporary password for new users
 */
function generateTempPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
