import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { TeaListClient } from "./TeaListClient";

export default async function Home() {
  const supabase = await createClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log("=== Home Page Server Debug ===");
  console.log("Raw user from auth:", user);
  
  // Get user profile with role
  let userProfile = null;
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', user.id)
      .single();
    
    console.log("User profile from DB:", data);
    console.log("Error (if any):", error);
    
    if (data) {
      userProfile = {
        id: user.id,
        email: data.email,
        role: data.role,
        user_metadata: user.user_metadata,
      };
      console.log("Final userProfile:", userProfile);
    }
  }
  console.log("==============================");

  // Fetch all teas
  const { data: teas, error } = await supabase
    .from('teas')
    .select('id, name_ko, name_en, year, category, origin')
    .order('year', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header user={userProfile} currentPage="home" />
      <TeaListClient initialTeas={teas || []} />
    </div>
  );
}
