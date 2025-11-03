"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Tea {
  id: string;
  name_ko: string;
  name_en: string | null;
  year: number;
  category: string;
  origin: string | null;
  seller: string | null;
}

interface AssessmentFormProps {
  teas: Tea[];
  userId: string;
  isAdmin: boolean;
}

export function AssessmentForm({ teas: initialTeas, userId, isAdmin }: AssessmentFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [teaList, setTeaList] = useState<Tea[]>(initialTeas);
  const [selectedTea, setSelectedTea] = useState("");
  
  // New tea dialog
  const [isAddTeaOpen, setIsAddTeaOpen] = useState(false);
  const [newTeaName, setNewTeaName] = useState("");
  const [newTeaNameEn, setNewTeaNameEn] = useState("");
  const [newTeaCategory, setNewTeaCategory] = useState("");
  const [newTeaYear, setNewTeaYear] = useState("");
  const [newTeaOrigin, setNewTeaOrigin] = useState("");
  const [newTeaSeller, setNewTeaSeller] = useState("");
  
  // Core attributes (0-10, 0.5 step)
  const [thickness, setThickness] = useState("");
  const [density, setDensity] = useState("");
  const [smoothness, setSmoothness] = useState("");
  const [clarity, setClarity] = useState("");
  const [granularity, setGranularity] = useState("");
  
  // Additional attributes (0-5, 0.5 step)
  const [continuity, setContinuity] = useState("");
  const [aromaLength, setAromaLength] = useState("");
  const [refinement, setRefinement] = useState("");
  const [delicacy, setDelicacy] = useState("");
  const [aftertaste, setAftertaste] = useState("");
  
  // Other fields
  const [utensils, setUtensils] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNumberInput = (
    value: string,
    setter: (val: string) => void,
    max: number = 10
  ) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const num = parseFloat(value);
      if (value === "" || (num >= 0 && num <= max)) {
        setter(value);
      }
    }
  };

  const handleAddNewTea = async () => {
    if (!newTeaName || !newTeaCategory || !newTeaYear) {
      toast.error("차 이름, 카테고리, 생산년도는 필수입니다");
      return;
    }

    const yearNum = parseInt(newTeaYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      toast.error("올바른 생산년도를 입력해주세요");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teas')
        .insert({
          name_ko: newTeaName,
          name_en: newTeaNameEn || null,
          category: newTeaCategory,
          year: yearNum,
          origin: newTeaOrigin || null,
          seller: newTeaSeller || null,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setTeaList([...teaList, data]);
      setSelectedTea(data.id);
      
      // Reset form
      setNewTeaName("");
      setNewTeaNameEn("");
      setNewTeaCategory("");
      setNewTeaYear("");
      setNewTeaOrigin("");
      setNewTeaSeller("");
      setIsAddTeaOpen(false);
      
      toast.success(`${newTeaName}가 추가되었습니다`);
    } catch (error) {
      console.error('Error adding tea:', error);
      toast.error("차 추가에 실패했습니다");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTea) {
      toast.error("차를 선택해주세요");
      return;
    }

    // Validate all fields are filled
    if (!thickness || !density || !smoothness || !clarity || !granularity ||
        !continuity || !aromaLength || !refinement || !delicacy || !aftertaste) {
      toast.error("모든 품평 요소를 입력해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          tea_id: selectedTea,
          user_id: userId,
          assessment_date: new Date().toISOString().split('T')[0],
          utensils: utensils || null,
          notes: personalNotes || null,
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Insert scores
      const { error: scoresError } = await supabase
        .from('assessment_scores')
        .insert({
          assessment_id: assessment.id,
          thickness: parseFloat(thickness),
          density: parseFloat(density),
          smoothness: parseFloat(smoothness),
          clarity: parseFloat(clarity),
          granularity: parseFloat(granularity),
          aroma_continuity: parseFloat(continuity),
          aroma_length: parseFloat(aromaLength),
          refinement: parseFloat(refinement),
          delicacy: parseFloat(delicacy),
          aftertaste: parseFloat(aftertaste),
        });

      if (scoresError) throw scoresError;

      toast.success("품평이 저장되었습니다");
      
      setTimeout(() => {
        router.push(`/tea/${selectedTea}`);
      }, 1000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error("품평 저장에 실패했습니다");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/');
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

        <div className="max-w-3xl">
          <h1 className="text-[24px] leading-[32px] font-bold text-[#111111] mb-2">
            품평 작성하기
          </h1>
          <p className="text-[14px] leading-[22px] text-[#666666] mb-8">
            차에 대한 상세한 품평을 작성해주세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tea Selection */}
            <div className="space-y-3 pb-8 border-b border-[#E5E5E5]">
              <Label className="text-[14px] leading-[22px] text-[#111111]">차 선택</Label>
              <div className="flex gap-3">
                <Select value={selectedTea} onValueChange={setSelectedTea}>
                  <SelectTrigger className="flex-1 rounded-[10px] border-[#E5E5E5]">
                    <SelectValue placeholder="평가할 차를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {teaList.map((tea) => (
                      <SelectItem key={tea.id} value={tea.id}>
                        {tea.year} {tea.name_ko}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isAdmin && (
                  <Dialog open={isAddTeaOpen} onOpenChange={setIsAddTeaOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-[10px] border-[#E5E5E5] hover:bg-[#F7F7F7]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#FFFFFF] sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-[18px] leading-[26px] text-[#111111]">
                          새 차 추가
                        </DialogTitle>
                        <DialogDescription className="text-[14px] leading-[22px] text-[#666666]">
                          데이터베이스에 새로운 차를 추가합니다.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label className="text-[14px] leading-[22px] text-[#111111]">이름 (한글)</Label>
                          <Input
                            value={newTeaName}
                            onChange={(e) => setNewTeaName(e.target.value)}
                            placeholder="예: 동방미인"
                            className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
                          />
                        </div>
                        
                        {/*
                        <div className="space-y-2">
                          <Label className="text-[14px] leading-[22px] text-[#111111]">이름 (영문)</Label>
                          <Input
                            value={newTeaNameEn}
                            onChange={(e) => setNewTeaNameEn(e.target.value)}
                            placeholder="예: Oriental Beauty"
                            className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
                          />
                        </div>
                        */}

                        <div className="space-y-2">
                          <Label className="text-[14px] leading-[22px] text-[#111111]">카테고리</Label>
                          <Select value={newTeaCategory} onValueChange={setNewTeaCategory}>
                            <SelectTrigger className="rounded-[10px] border-[#E5E5E5]">
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="녹차">녹차</SelectItem>
                              <SelectItem value="백차">백차</SelectItem>
                              <SelectItem value="청차">청차</SelectItem>
                              <SelectItem value="황차">황차</SelectItem>
                              <SelectItem value="홍차">홍차</SelectItem>
                              <SelectItem value="흑차">흑차</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-[14px] leading-[22px] text-[#111111]">생산년도</Label>
                          <Input
                            type="number"
                            value={newTeaYear}
                            onChange={(e) => setNewTeaYear(e.target.value)}
                            placeholder="예: 2022"
                            className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-[14px] leading-[22px] text-[#111111]">생산지</Label>
                          <Input
                            value={newTeaOrigin}
                            onChange={(e) => setNewTeaOrigin(e.target.value)}
                            placeholder="예: 대만"
                            className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-[14px] leading-[22px] text-[#111111]">구매처</Label>
                          <Input
                            value={newTeaSeller}
                            onChange={(e) => setNewTeaSeller(e.target.value)}
                            placeholder="예: 티하우스"
                            className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddTeaOpen(false)}
                          className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
                        >
                          취소
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddNewTea}
                          className="rounded-[10px] bg-[#111111] text-white hover:bg-[#111111]/90 text-[14px] leading-[22px]"
                        >
                          추가
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            
            {/*
            {/* Utensils
            <div className="space-y-3 pb-8 border-b border-[#E5E5E5]">
              <Label className="text-[14px] leading-[22px] text-[#111111]">사용물 (선택)</Label>
              <Input
                value={utensils}
                onChange={(e) => setUtensils(e.target.value)}
                placeholder="예: 자사호, 개완 등"
                className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
              />
            </div>
            */}

            {/* Assessment Scores Table */}
            <div className="space-y-4 pb-8 border-b border-[#E5E5E5]">
              <h2 className="text-[18px] leading-[26px] text-[#111111]">
                품평 요소
              </h2>
              
              <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#F7F7F7]">
                    <TableRow className="hover:bg-[#F7F7F7]">
                      <TableHead className="text-[12px] leading-[18px] text-[#111111] w-1/2">주요 품평 요소 (0-10)</TableHead>
                      <TableHead className="text-[12px] leading-[18px] text-[#111111] w-[100px]">점수</TableHead>
                      <TableHead className="text-[12px] leading-[18px] text-[#111111] w-1/2">부가 품평 요소 (0-5)</TableHead>
                      <TableHead className="text-[12px] leading-[18px] text-[#111111] w-[100px]">점수</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        두께감
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={thickness}
                          onChange={(e) => handleNumberInput(e.target.value, setThickness, 10)}
                          placeholder=""
                          className="h-9 w-[6ch] rounded-[10px] border border-[#E5E5E5] px-3 text-[14px] leading-[22px] text-center [font-variant-numeric:tabular-nums]"
                        />
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        향의 연속성
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={continuity}
                          onChange={(e) => handleNumberInput(e.target.value, setContinuity, 5)}
                          placeholder=""
                          className="h-8 w-[6ch] rounded-[10px] border border-[#E5E5E5] px-3 text-[14px] leading-[22px] text-center [font-variant-numeric:tabular-nums]"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        밀도감
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={density}
                          onChange={(e) => handleNumberInput(e.target.value, setDensity, 10)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        향의 길이
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={aromaLength}
                          onChange={(e) => handleNumberInput(e.target.value, setAromaLength, 5)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        부드러움
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={smoothness}
                          onChange={(e) => handleNumberInput(e.target.value, setSmoothness, 10)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        정제감
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={refinement}
                          onChange={(e) => handleNumberInput(e.target.value, setRefinement, 5)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        맑음
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={clarity}
                          onChange={(e) => handleNumberInput(e.target.value, setClarity, 10)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        섬세함
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={delicacy}
                          onChange={(e) => handleNumberInput(e.target.value, setDelicacy, 5)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="hover:bg-[#F7F7F7]">
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        입자감
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={granularity}
                          onChange={(e) => handleNumberInput(e.target.value, setGranularity, 10)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                      <TableCell className="text-[14px] leading-[22px] text-[#666666]">
                        후운
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={aftertaste}
                          onChange={(e) => handleNumberInput(e.target.value, setAftertaste, 5)}
                          placeholder=""
                          className="h-9 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px] text-center"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <p className="text-[12px] leading-[18px] text-[#666666]">
                * 주요 품평 요소는 0-10, 부가 품평 요소는 0-5 범위에서 0.5 단위로 입력 가능합니다
              </p>
            </div>

            {/* Personal Notes */}
            <div className="space-y-3 pb-8 border-b border-[#E5E5E5]">
              <Label className="text-[14px] leading-[22px] text-[#111111]">개인 감상 (선택)</Label>
              <Textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="차에 대한 감상, 향미 노트, 특징 등을 자유롭게 작성해주세요..."
                className="rounded-[10px] border-[#E5E5E5] min-h-[160px] resize-none text-[14px] leading-[22px]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[10px] bg-[#111111] text-white hover:bg-[#111111]/90 text-[14px] leading-[22px]"
              >
                {isSubmitting ? '저장 중...' : '품평 저장'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
