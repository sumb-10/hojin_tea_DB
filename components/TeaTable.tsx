"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";

export interface TeaData {
  id: string;
  name_ko: string;
  name_en: string | null;
  origin: string | null;
  year: number;
  category: string;
}

interface TeaTableProps {
  data: TeaData[];
  isLoading?: boolean;
  selectedId?: string;
}

export function TeaTable({ data, isLoading = false, selectedId }: TeaTableProps) {
  const router = useRouter();

  const handleRowClick = (tea: TeaData) => {
    router.push(`/tea/${tea.id}`);
  };

  if (isLoading) {
    return (
      <div className="px-4 md:px-20 py-8">
        <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F7F7F7]">
              <TableRow className="hover:bg-[#F7F7F7]">
                <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">차 이름</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48 bg-[#E5E5E5]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="px-4 md:px-20 py-16 text-center">
        <p className="text-[14px] leading-[22px] text-[#666666]">
          조건에 맞는 차가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-20 py-8">
      <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F7F7F7] z-30">
            <TableRow className="hover:bg-[#F7F7F7]">
              <TableHead className="text-[12px] leading-[18px] text-[#111111] font-medium">차 이름</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((tea) => (
              <TableRow
                key={tea.id}
                onClick={() => handleRowClick(tea)}
                className={`
                  cursor-pointer transition-colors
                  hover:bg-[#F7F7F7]
                  ${selectedId === tea.id ? "border-l-2 border-l-[#111111]" : ""}
                `}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(tea);
                  }
                }}
              >
                <TableCell className="text-[14px] leading-[22px] text-[#111111]">
                  {tea.year} {tea.name_ko}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
