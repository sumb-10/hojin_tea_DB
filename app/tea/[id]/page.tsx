import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { TeaDetailClient } from "./TeaDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// --- 관계/행 타입 선언 ---
type RelUser = { email: string; display_name: string | null };
type Score = {
  thickness?: number; density?: number; smoothness?: number; clarity?: number; granularity?: number;
  aroma_continuity?: number; aroma_length?: number; refinement?: number; delicacy?: number; aftertaste?: number;
};

type AssessmentRow = {
  id: string;
  assessment_date: string;
  notes: string | null;
  utensils: string | null;
  user_id: string;
  users: RelUser | RelUser[];
  assessment_scores: Score[] | null;
};

export default async function TeaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user profile with role
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', user.id)
      .single();
    
    if (data) {
      userProfile = {
        id: user.id,
        email: data.email,
        role: data.role,
        user_metadata: user.user_metadata,
      };
    }
  }

  // Fetch tea details from average view (accessible to all)
  const { data: teaAvg, error: avgError } = await supabase
    .from('tea_average_scores')
    .select('*')
    .eq('id', id)
    .single();

  if (avgError || !teaAvg) {
    notFound();
  }

  // Fetch individual assessments (only for panel and admin)
  let assessments: AssessmentRow[] = [];
  if (userProfile && (userProfile.role === 'panel' || userProfile.role === 'admin')) {
    const { data: assessmentData } = await supabase
      .from('assessments')
      .select(`
        id,
        assessment_date,
        notes,
        utensils,
        user_id,
        users!inner(email, display_name),
        assessment_scores(
          thickness,
          density,
          smoothness,
          clarity,
          granularity,
          aroma_continuity,
          aroma_length,
          refinement,
          delicacy,
          aftertaste
        )
      `)
      .eq('tea_id', id)
      .order('assessment_date', { ascending: false });

    assessments = assessmentData || [];
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header user={userProfile} currentPage="home" />
      <TeaDetailClient 
        tea={teaAvg} 
        assessments={assessments}
        userRole={userProfile?.role || 'guest'}
        isAdmin={userProfile?.role === 'admin'}
      />
    </div>
  );
}
