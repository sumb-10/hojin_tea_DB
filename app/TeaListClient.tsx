"use client"

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TeaTable, TeaData } from "@/components/TeaTable";

interface TeaListClientProps {
  initialTeas: TeaData[];
}

export function TeaListClient({ initialTeas }: TeaListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<TeaData[]>(initialTeas);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      let data = [...initialTeas];

      // Filter by search query (prefix matching)
      if (searchQuery.trim()) {
        data = data.filter((tea) =>
          tea.name_ko.startsWith(searchQuery.trim())
        );
      }

      // Sort by year descending (default)
      data.sort((a, b) => b.year - a.year);

      setFilteredData(data);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, initialTeas]);

  return (
    <>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <main className="pb-8">
        <TeaTable data={filteredData} isLoading={isLoading} />
      </main>
    </>
  );
}
