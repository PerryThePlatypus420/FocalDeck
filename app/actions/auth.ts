"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Validation helpers
 */
function validateEmail(email: string): boolean {
  // RFC 5322 compliant email regex that supports +, ., -, etc.
  const emailRegex =
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return emailRegex.test(email.toLowerCase());
}

function validatePassword(password: string): boolean {
  // Minimum 8 characters
  return password.length >= 8;
}

// Only ever redirect to a same-origin path (e.g. "/invite/abc123") -- this
// comes from a URL query param, so without this an attacker could craft a
// link like ?redirect=https://evil.com or ?redirect=//evil.com.
function sanitizeRedirect(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
  redirectTo?: string,
) {
  // Validate inputs
  if (!email || !password || !confirmPassword || !fullName) {
    return { success: false, error: "All fields are required" };
  }

  if (!validateEmail(email)) {
    return { success: false, error: "Please enter a valid email address" };
  }

  if (!validatePassword(password)) {
    return {
      success: false,
      error: "Password must be at least 8 characters long",
    };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    const supabase = await createClient();

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to create account" };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }

  // Redirect on success (outside try-catch so it's not caught)
  redirect(sanitizeRedirect(redirectTo));
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string,
  redirectTo?: string,
) {
  // Validate inputs
  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  if (!validateEmail(email)) {
    return { success: false, error: "Please enter a valid email address" };
  }

  try {
    const supabase = await createClient();

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Failed to sign in" };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }

  // Redirect on success (outside try-catch so it's not caught)
  redirect(sanitizeRedirect(redirectTo));
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  try {
    const supabase = await createClient();

    // Get the redirect URL for Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.url) {
      return { success: false, error: "Failed to start Google sign-in" };
    }

    // Store URL for redirect outside try-catch
    return { success: true, data: { url: data.url } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: message };
  }
}
