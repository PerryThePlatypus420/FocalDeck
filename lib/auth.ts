import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { Database } from "@/types/database.types";

// Cached per request: the shared (app) layout and each page both need the
// current user, so this runs the auth check once and reuses it everywhere.
export const getAuthenticatedUser = cache(
  async (supabase: SupabaseClient<Database>): Promise<User> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/signin");
    }

    return user;
  },
);
