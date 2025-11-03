import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { AssessmentForm } from "./AssessmentForm";
import { redirect } from "next/navigation";

export default async function NewAssessmentPage() {
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

  // Only panel and admin can create assessments
  if (!userProfile || (userProfile.role !== 'panel' && userProfile.role !== 'admin')) {
    redirect('/');
  }

  // Fetch all teas for selection
  const { data: teas } = await supabase
    .from('teas')
    .select('id, name_ko, name_en, year, category, origin, seller')
    .order('year', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header user={userProfile} currentPage="assessment" />
      <AssessmentForm 
        teas={teas || []} 
        userId={user.id}
        isAdmin={userProfile.role === 'admin'}
      />
    </div>
  );
}
