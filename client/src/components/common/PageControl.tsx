import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageControlProps {
  total: number;
  offset: number;
  limit: number;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}

export function PageControl({
  total,
  offset,
  limit,
  onOffsetChange,
  onLimitChange,
  limitOptions = [10, 20, 50, 100, 200, 300],
}: PageControlProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const handlePrevious = () => {
    onOffsetChange(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    if (offset + limit < total) {
      onOffsetChange(offset + limit);
    }
  };

  const handleLimitChange = (value: string) => {
    onLimitChange(Number(value));
    onOffsetChange(0); // Reset to first page when changing limit
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        <Select value={limit.toString()} onValueChange={handleLimitChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={offset === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={offset + limit >= total}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
