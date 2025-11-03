"use client"

import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="px-4 md:px-20 py-6 border-b border-[#E5E5E5]">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
        <Input
          type="text"
          placeholder="차 이름으로 검색..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 rounded-[10px] border-[#E5E5E5] text-[14px] leading-[22px]"
        />
      </div>
    </div>
  );
}
