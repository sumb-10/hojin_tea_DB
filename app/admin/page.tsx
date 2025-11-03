import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { AdminClient } from "./AdminClient";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  // Get user profile with role
  const { data: profileData } = await supabase
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single();

  const userProfile = profileData ? {
    id: user.id,
    email: profileData.email,
    role: profileData.role,
    user_metadata: user.user_metadata,
  } : null;

  // Only admin can access
  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/');
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('users')
    .select('id, email, display_name, role, created_at')
    .order('created_at', { ascending: false });

  // Fetch all teas with seller info
  const { data: teas } = await supabase
    .from('teas')
    .select('id, name_ko, name_en, year, category, origin, seller')
    .order('year', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header user={userProfile} currentPage="admin" />
      <AdminClient users={users || []} teas={teas || []} />
    </div>
  );
}
