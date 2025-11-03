"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Radar5 } from "@/components/Radar5";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeaDetailClientProps {
  tea: any;
  assessments: any[];
  userRole: string;
  isAdmin: boolean;
}

export function TeaDetailClient({ tea, assessments, userRole, isAdmin }: TeaDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/');
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setDeletingId(assessmentId);
    
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;

      toast.success('품평이 삭제되었습니다');
      router.refresh();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('품평 삭제에 실패했습니다');
    } finally {
      setDeletingId(null);
    }
  };

  const canShowIndividualAssessments = userRole === 'panel' || userRole === 'admin';

  const avgBody = {
    thickness: tea.avg_thickness || 0,
    density: tea.avg_density || 0,
    smoothness: tea.avg_smoothness || 0,
    clarity: tea.avg_clarity || 0,
    granularity: tea.avg_granularity || 0,
  };

  const avgAroma = {
    aroma_continuity: tea.avg_aroma_continuity || 0,
    aroma_length: tea.avg_aroma_length || 0,
    refinement: tea.avg_refinement || 0,
    delicacy: tea.avg_delicacy || 0,
    aftertaste: tea.avg_aftertaste || 0,
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[24px] leading-[32px] font-bold text-[#111111] mb-2">
            {tea.name_ko}
          </h1>
          <div className="text-[14px] leading-[22px] text-[#666666] space-y-1">
            {tea.name_en && <p>{tea.name_en}</p>}
            <p>{tea.origin} · {tea.year} · {tea.category}</p>
            {tea.assessment_count > 0 && (
              <p className="text-[12px] text-[#999999]">
                총 {tea.assessment_count}개의 품평
              </p>
            )}
          </div>
        </div>

        {/* Radar Charts */}
        {tea.assessment_count > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Radar5
              title="주요 품평 요소 (평균)"
              labels={["두께감", "밀도감", "부드러움", "맑음", "입자감"]}
              values={[
                Number(avgBody.thickness) || 0,
                Number(avgBody.density) || 0,
                Number(avgBody.smoothness) || 0,
                Number(avgBody.clarity) || 0,
                Number(avgBody.granularity) || 0,
              ]}
              max={10}
            />
            <Radar5
              title="부가 품평 요소 (평균)"
              labels={["향의 연속성", "향의 길이", "정제감", "섬세함", "후운"]}
              values={[
                Number(avgAroma.aroma_continuity) || 0,
                Number(avgAroma.aroma_length) || 0,
                Number(avgAroma.refinement) || 0,
                Number(avgAroma.delicacy) || 0,
                Number(avgAroma.aftertaste) || 0,
              ]}
              max={5}
            />
          </div>
        )}

        {/* Individual Assessments (Panel and Admin only) */}
        {canShowIndividualAssessments && assessments.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-[18px] leading-[26px] text-[#111111]">품평 기록</h2>

            {assessments.map((assessment) => {
              const score = assessment.assessment_scores?.[0];
              const reviewer = isAdmin 
                ? (assessment.users?.display_name || assessment.users?.email)
                : '익명';

              return (
                <div key={assessment.id} className="space-y-4 pb-6 border-b border-[#E5E5E5] last:border-b-0">
                  {/* Note Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[14px] leading-[22px] text-[#111111]">
                        {reviewer}
                      </p>
                      <p className="text-[12px] leading-[18px] text-[#666666]">
                        {assessment.assessment_date}
                      </p>
                      {assessment.utensils && (
                        <p className="text-[12px] leading-[18px] text-[#666666]">
                          사용물: {assessment.utensils}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === assessment.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>품평 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 품평을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  {/* Scores Tables */}
                  {score && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Body Scores */}
                      <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
                        <div className="bg-[#F7F7F7] px-4 py-2">
                          <h3 className="text-[12px] leading-[18px] text-[#111111] font-medium">
                            주요 품평 요소
                          </h3>
                        </div>
                        <Table>
                          <TableBody>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">두께감</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.thickness?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">밀도감</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.density?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">부드러움</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.smoothness?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">맑음</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.clarity?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">입자감</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.granularity?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Aroma Scores */}
                      <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
                        <div className="bg-[#F7F7F7] px-4 py-2">
                          <h3 className="text-[12px] leading-[18px] text-[#111111] font-medium">
                            부가 품평 요소
                          </h3>
                        </div>
                        <Table>
                          <TableBody>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">향의 연속성</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.aroma_continuity?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">향의 길이</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.aroma_length?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">정제감</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.refinement?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">섬세함</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.delicacy?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-[#F7F7F7]">
                              <TableCell className="text-[12px] leading-[18px] text-[#666666]">후운</TableCell>
                              <TableCell className="text-[12px] leading-[18px] text-[#111111] text-right font-mono">
                                {score.aftertaste?.toFixed(1) || '-'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {assessment.notes && (
                    <div className="p-4 bg-[#F7F7F7] rounded-[10px]">
                      <p className="text-[14px] leading-[22px] text-[#111111]">{assessment.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!canShowIndividualAssessments && tea.assessment_count === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px] leading-[22px] text-[#666666]">
              아직 품평이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
