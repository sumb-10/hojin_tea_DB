"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

interface Tea {
  id: string;
  name_ko: string;
  name_en: string | null;
  year: number;
  category: string;
  origin: string | null;
  seller: string | null;
}

interface AdminClientProps {
  users: User[];
  teas: Tea[];
}

export function AdminClient({ users: initialUsers, teas }: AdminClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/');
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('사용자 권한이 변경되었습니다');
      router.refresh();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('권한 변경에 실패했습니다');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      // -------- 타입 선언 (함수 내부에 국한) --------
    type Tea = {
      name_ko: string;
      name_en?: string | null;
      year?: number | null;
      category?: string | null;
      origin?: string | null;
      seller?: string | null;
    };

    type RelUser = {
      email: string;
      display_name: string | null;
    };

    type Score = {
      thickness?: number;
      density?: number;
      smoothness?: number;
      clarity?: number;
      granularity?: number;
      aroma_continuity?: number;
      aroma_length?: number;
      refinement?: number;
      delicacy?: number;
      aftertaste?: number;
    };

    type AssessmentRow = {
      id: string;
      assessment_date: string;
      utensils: string | null;
      notes: string | null;
      teas: Tea | Tea[];                        // 👈 배열/객체 모두 허용
      users: RelUser | RelUser[];               // 👈 배열/객체 모두 허용
      assessment_scores: Score[] | null;
    };


      // Fetch all assessments with related data
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select(`
          id,
          assessment_date,
          utensils,
          notes,
          teas!inner(name_ko, name_en, year, category, origin, seller),
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
        .order('assessment_date', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = [
        '품평일',
        '차이름',
        '영문명',
        '생산년도',
        '카테고리',
        '산지',
        '구매처',
        '품평자',
        '사용물',
        '두께감',
        '밀도감',
        '부드러움',
        '맑음',
        '입자감',
        '향의연속성',
        '향의길이',
        '정제감',
        '섬세함',
        '후운',
        '개인감상'
      ];

      const rows = assessments?.map(a => {
        const teaRel = a.teas;
        const tea: Tea | undefined = Array.isArray(teaRel) ? teaRel[0] : teaRel;
        const userRel = a.users;
        const user: RelUser | undefined = Array.isArray(userRel) ? userRel[0] : userRel;
        const score = a.assessment_scores?.[0]; 

        return [
          a.assessment_date,
          tea.name_ko || '',
          tea.name_en || '',
          tea.year,
          tea.category,
          tea.origin || '',
          tea.seller || '',
          user.display_name || user.email,
          a.utensils || '',
          score?.thickness || '',
          score?.density || '',
          score?.smoothness || '',
          score?.clarity || '',
          score?.granularity || '',
          score?.aroma_continuity || '',
          score?.aroma_length || '',
          score?.refinement || '',
          score?.delicacy || '',
          score?.aftertaste || '',
          a.notes || ''
        ];
      }) || [];

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tea_assessments_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('CSV 파일이 다운로드되었습니다');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('CSV 내보내기에 실패했습니다');
    }
  };

  const handleExportJSON = async () => {
    try {
      // Fetch all assessments with related data
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select(`
          id,
          assessment_date,
          utensils,
          notes,
          teas!inner(name_ko, name_en, year, category, origin, seller),
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
        .order('assessment_date', { ascending: false });

      if (error) throw error;

      // Download
      const json = JSON.stringify(assessments, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tea_assessments_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast.success('JSON 파일이 다운로드되었습니다');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('JSON 내보내기에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <div className="px-4 md:px-20 py-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 text-[14px] leading-[22px] text-[#666666] hover:text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        <div className="mb-8">
          <h1 className="text-[24px] leading-[32px] font-bold text-[#111111] mb-2">
            관리자 페이지
          </h1>
          <p className="text-[14px] leading-[22px] text-[#666666]">
            사용자 권한 관리 및 데이터 내보내기
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="teas">차 정보</TabsTrigger>
            <TabsTrigger value="export">데이터 내보내기</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F7F7F7]">
                  <TableRow className="hover:bg-[#F7F7F7]">
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">이메일</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">표시명</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">권한</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">가입일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#111111]">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {user.display_name || '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={updatingUserId === user.id}
                        >
                          <SelectTrigger className="w-[120px] rounded-[10px] border-[#E5E5E5] text-[14px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">관리자</SelectItem>
                            <SelectItem value="panel">패널</SelectItem>
                            <SelectItem value="guest">게스트</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="teas" className="space-y-4">
            <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F7F7F7]">
                  <TableRow className="hover:bg-[#F7F7F7]">
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">차 이름</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">영문명</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">생산년도</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">카테고리</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">산지</TableHead>
                    <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">구매처</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teas.map((tea) => (
                    <TableRow key={tea.id} className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#111111]">
                        {tea.name_ko}
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {tea.name_en || '-'}
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {tea.year}
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {tea.category}
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {tea.origin || '-'}
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        {tea.seller || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="max-w-md space-y-4">
              <div className="p-6 border border-[#E5E5E5] rounded-[10px] space-y-4">
                <div>
                  <h3 className="text-[18px] leading-[26px] text-[#111111] mb-2">CSV 내보내기</h3>
                  <p className="text-[14px] leading-[22px] text-[#666666] mb-4">
                    모든 품평 데이터를 CSV 형식으로 다운로드합니다.
                  </p>
                  <Button
                    onClick={handleExportCSV}
                    className="w-full rounded-[10px] bg-[#111111] text-white hover:bg-[#111111]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV 다운로드
                  </Button>
                </div>
              </div>

              <div className="p-6 border border-[#E5E5E5] rounded-[10px] space-y-4">
                <div>
                  <h3 className="text-[18px] leading-[26px] text-[#111111] mb-2">JSON 내보내기</h3>
                  <p className="text-[14px] leading-[22px] text-[#666666] mb-4">
                    모든 품평 데이터를 JSON 형식으로 다운로드합니다.
                  </p>
                  <Button
                    onClick={handleExportJSON}
                    className="w-full rounded-[10px] bg-[#111111] text-white hover:bg-[#111111]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON 다운로드
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
