import { supabase } from "../lib/supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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


export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if(data.user) {
      return data.user;
    } else {
      return error
      throw new Error(error?.message || "Login failed. Please check your credentials.");
    }

  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    throw new Error(error.message || "Failed to get current user");
  }
}

/**
 * Logout current user
 */
export async function logout() {
  // return true;
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

      // const user = users.find((u) => u.email === email);
      
      // if (!user) {
      //   throw new Error(`User with email ${email} not found`);
      // }

      // Update user password
      // const { data, error: updateError } = await adminClient.auth.admin.updateUserById(
      //   user.id,
      //   {
      //     password: password,
      //   }
      // );

      // if (updateError) {
      //   throw new Error(`Failed to update password: ${updateError.message}`);
      // }

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
export async function createUser(
  userData: CreateUserData
): Promise<{ user: User; password: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  const password = userData.password ?? generateTempPassword();

  const adminClient: SupabaseClient = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: userData.email,
      password,
      email_confirm: true,
      user_metadata: {
        role: userData.role ?? "DOCTOR",
        name: userData.name,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.user) {
      throw new Error("Supabase returned no user");
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: userData.name,
        role: userData.role ?? "DOCTOR",
        supabaseId: data.user.id,
        isActive: true,
      },
      password,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error creating user";
    console.error("createUser failed:", message);
    throw new Error(message);
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
        // callback(user);
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
// export function isAdmin(user: User | null): boolean {
//   return user?.role === "ADMIN";
// }

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
