import React from "react";
import { getProjectsForCategory } from "../../data/content";
import CXProjectCard from "./CXProjectCard";
import CategoryGrid from "./CategoryGrid";

interface CXProjectsGridProps {
  onOpen: (id: string) => void;
  category?: string;
}

export default function CXProjectsGrid({ onOpen, category }: CXProjectsGridProps) {
  const allProjects = getProjectsForCategory(category ?? "all");
  return (
    <CategoryGrid
      items={allProjects}
      getMatchTags={(p) => p.topics}
      renderCard={(p, i) => (
        <CXProjectCard key={p.id} p={p} index={i} onClick={() => onOpen(p.id)} />
      )}
      emptyMessage="No projects match all selected filters"
      resetKey={category}
    />
  );
}
