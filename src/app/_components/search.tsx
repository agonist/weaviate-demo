"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const Search = () => {
  const [search, setSearch] = useState<string>("");
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  function onSearch() {
    const params = new URLSearchParams(searchParams);
    params.set("search", search);
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex space-x-4">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
};
