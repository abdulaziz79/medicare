import { config } from "dotenv";
import { resolve } from "path";
import { createClient, type User as SupabaseUser } from "@supabase/supabase-js";
import * as readline from "readline";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✅" : "❌");
  console.error("\nPlease set these in your .env.local file.");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setPassword(email: string, password: string) {
  try {
    console.log(`\n🔍 Looking for user with email: ${email}...`);

    // List all users to find the one with matching email
    const {
      data: { users },
      error: listError,
    } = await adminClient.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    if (!users || users.length === 0) {
      throw new Error("No users found in the system.");
    }

    const user = (users as SupabaseUser[]).find((u) => u.email === email);

    if (!user) {
      console.error(`\n❌ User with email ${email} not found.`);
      console.error(`\nAvailable users:`);
      (users as SupabaseUser[]).forEach((u) => {
        console.error(`   - ${u.email} (ID: ${u.id})`);
      });
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`\n🔐 Setting password...`);

    // Update user password
    const { data, error: updateError } =
      await adminClient.auth.admin.updateUserById(user.id, {
        password: password,
      });

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    console.log(`\n✅ Password set successfully!`);
    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`\n⚠️  Please save this password securely.`);
    console.log(`\n✅ You can now login at: http://localhost:3000/login`);

    // Also check if user exists in database and update supabaseId if needed
    try {
      const { createClient: createSupabaseClient } = await import(
        "@supabase/supabase-js"
      );
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

      if (supabaseAnonKey) {
        const client = createSupabaseClient(supabaseUrl, supabaseAnonKey);

        // Check if user exists in database
        const { data: dbUser, error: dbError } = await client
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (!dbError && dbUser) {
          // Update supabaseId if it's not set
          if (!dbUser.supabaseId) {
            const { error: updateDbError } = await client
              .from("users")
              .update({ supabaseId: user.id })
              .eq("email", email);

            if (updateDbError) {
              console.warn(
                `\n⚠️  Warning: Could not update database with supabaseId: ${updateDbError.message}`
              );
            } else {
              console.log(`\n✅ Updated database user record with supabaseId`);
            }
          }
        } else {
          console.warn(
            `\n⚠️  Warning: User not found in database. Make sure to run Prisma migrations first.`
          );
        }
      }
    } catch (dbError) {
      console.warn(`\n⚠️  Warning: Could not update database: ${dbError}`);
    }

    return true;
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  console.log("\n🔐 Set Admin Password Utility");
  console.log("==============================\n");

  const args = process.argv.slice(2);

  let email: string;
  let password: string;

  if (args.length >= 2) {
    // Use command line arguments
    email = args[0];
    password = args[1];
  } else {
    // Interactive mode
    email = await question("Enter user email: ");
    password = await question("Enter new password: ");
  }

  if (!email || !password) {
    console.error("\n❌ Email and password are required.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\n❌ Password must be at least 8 characters long.");
    process.exit(1);
  }

  await setPassword(email, password);
  rl.close();
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  rl.close();
  process.exit(1);
});
