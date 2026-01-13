import { createClient } from "@supabase/supabase-js";

// Using process.env with Vite's define in vite.config.ts
// These will be replaced at build time with actual values from .env.local
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
const supabaseAnonKey =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test Supabase connection by making a simple API call
 * @returns Promise<{ connected: boolean; error?: string; url?: string; message: string }>
 */
export async function testSupabaseConnection() {
  try {
    // Method 1: Try to get the current session (this doesn't require any tables)
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // If we get here without an error, we're connected
    // sessionError will be null if connection is successful
    if (sessionError && sessionError.message.includes("Failed to fetch")) {
      return {
        connected: false,
        error: sessionError.message,
        url: supabaseUrl,
        message:
          "Failed to connect to Supabase - check your URL and network connection",
      };
    }

    // Method 2: Try a simple health check via REST API
    try {
      const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      // Any response (even 404) means we reached Supabase
      if (
        healthCheck.status === 200 ||
        healthCheck.status === 404 ||
        healthCheck.status === 401
      ) {
        return {
          connected: true,
          url: supabaseUrl,
          message: "Successfully connected to Supabase! ✅",
        };
      }
    } catch (fetchError: any) {
      // If fetch fails, it's likely a network/connection issue
      if (
        fetchError.message.includes("Failed to fetch") ||
        fetchError.message.includes("network")
      ) {
        return {
          connected: false,
          error: fetchError.message,
          url: supabaseUrl,
          message:
            "Cannot reach Supabase - check your URL and network connection",
        };
      }
    }

    // If session check worked, we're connected
    return {
      connected: true,
      url: supabaseUrl,
      message: "Successfully connected to Supabase! ✅",
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || String(error),
      url: supabaseUrl,
      message: "Failed to connect to Supabase",
    };
  }
}

/**
 * Log connection status to console (useful for debugging)
 */
export async function logConnectionStatus() {
  // console.group("🔍 Supabase Connection Test");
  // console.log("URL:", supabaseUrl || "❌ Not set");
  // console.log(
  //   "Anon Key:",
  //   supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "❌ Not set"
  // );

  const result = await testSupabaseConnection();

  if (result.connected) {
    console.log("✅ Status: Connected");
    // console.log("Message:", result.message);
    // if (result.url) {
    //   console.log("Supabase URL:", result.url);
    // }
  } else {
    console.error("❌ Status: Not Connected");
    console.error("Message:", result.message);
    if (result.error) {
      console.error("Error:", result.error);
    }
    if (result.url) {
      console.log("Attempted URL:", result.url);
    }
  }

  console.groupEnd();
  return result;
}
