import { createClient } from "@supabase/supabase-js";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export async function validateSupabaseConnection(
  url: string,
  key: string,
): Promise<ValidationResult> {
  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { error } = await supabase
      .from("__supabase_keeper_health_check__")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (
      !error ||
      error.code === "PGRST204" || // not found (single)
      error.code === "PGRST205" || // relation does not exist (in cache)
      error.code === "42P01" || // relation does not exist
      error.message.includes("relation") || // Table not found
      error.message.includes("does not exist")
    ) {
      return { isValid: true, message: "Connection verified!" };
    } else if (error.code === "401" || error.message.includes("401")) {
      return {
        isValid: false,
        message: "Unauthorized (Check your Publishable Key)",
      };
    } else if (
      error.message.includes("fetch failed") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("TypeError: fetch failed")
    ) {
      return {
        isValid: false,
        message: `Network error: ${error.message} (Check your Supabase URL)`,
      };
    } else {
      // We consider it valid if it's not a connection/auth error
      return {
        isValid: true,
        message: `Validation warning: ${error.message} (${error.code})`,
      };
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("fetch failed") || errMsg.includes("ENOTFOUND")) {
      return {
        isValid: false,
        message: `Network error: ${errMsg} (Check your Supabase URL)`,
      };
    } else {
      return { isValid: false, message: `Unexpected error: ${errMsg}` };
    }
  }
}
