import { getLogsForCategory } from "../../data/content";
import CategoryGrid from "./CategoryGrid";
import CXLogCard from "./CXLogCard";

interface CXLogsGridProps {
  onOpen: (id: string) => void;
  category?: string;
}

export default function CXLogsGrid({ onOpen, category }: CXLogsGridProps) {
  const allLogs = getLogsForCategory(category ?? "latest");
  return (
    <CategoryGrid
      items={allLogs}
      getMatchTags={(a) => a.tags ?? []}
      renderCard={(a) => (
        <CXLogCard
          key={a.id}
          log={a}
          onClick={() => onOpen(a.id)}
          seriesTotal={a.series?.total}
        />
      )}
      emptyMessage="No entries match all selected filters"
      resetKey={category}
    />
  );
}
