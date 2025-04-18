// src/routes/auth/callback/+server.js
import { redirect } from "@sveltejs/kit"
import { isAuthApiError } from "@supabase/supabase-js"

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code")
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      // If you open in another browser, need to redirect to login.
      // Should not display error
      if (isAuthApiError(error)) {
        throw redirect(303, "/giris/giris-yap?verified=true")
      } else {
        throw error
      }
    }
  }

  const next = url.searchParams.get("next")
  if (next) {
    throw redirect(303, next)
  }

  throw redirect(303, "/hesap")
}
