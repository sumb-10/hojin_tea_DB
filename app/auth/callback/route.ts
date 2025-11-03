import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log("=== Auth Callback Debug ===");
    console.log("Session exchange result:", data);
    console.log("Error (if any):", error);
    
    // If user successfully logged in, check if they exist in users table
    if (data?.user) {
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      console.log("Existing user check:", existingUser);
      console.log("Select error (if any):", selectError);
      
      // If user doesn't exist in users table, create them with guest role
      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            role: 'guest', // Default role is guest
          })
          .select()
          .single();
        
        console.log("New user created:", newUser);
        console.log("Insert error (if any):", insertError);
      }
    }
    console.log("===========================");
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/`)
}
