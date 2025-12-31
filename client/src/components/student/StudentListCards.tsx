import { Student } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  enrolled: "bg-teal-500",
  pending: "bg-amber-500",
  graduated: "bg-indigo-500",
};

interface StudentListCardsProps {
  students: Student[];
  expandedRows: Set<string>;
  lastExpandedId: string | null;
  searchName: string;
  searchEmail: string;
  searchPhone: string;
  toggleRow: (id: string) => void;
  highlightMatch: (text: string, searchTerm: string) => React.ReactNode;
}

export function StudentListCards({
  students,
  expandedRows,
  lastExpandedId,
  searchName,
  searchEmail,
  searchPhone,
  toggleRow,
  highlightMatch,
}: StudentListCardsProps) {
  return (
    <div className="space-y-4 md:hidden">
      {students.map((student) => (
        <Card
          key={student.id}
          className={`cursor-pointer ${
            lastExpandedId === student.id
              ? 'bg-primary/5'
              : ''
          }`}
          onClick={() => toggleRow(student.id)}
        >
          <CardHeader className="pb-2">
            <div>
              <span className="font-bold text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                {highlightMatch(student.name, searchName)}
              </span>
              <div className="text-sm text-muted-foreground">
                {highlightMatch(student.email, searchEmail)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Phone:</span>
                <div className="text-muted-foreground">
                  {highlightMatch(student.phone, searchPhone)}
                </div>
              </div>
              <div>
                <span className="font-medium">Course:</span>
                <div className="text-muted-foreground">{student.courseInterested || "N/A"}</div>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <div className="text-muted-foreground">{student.location || "N/A"}</div>
              </div>
              <div>
                <span className="font-medium">Reg. Date:</span>
                <div className="text-muted-foreground">{student.registrationDate}</div>
              </div>
            </div>
            <div className="pt-2 flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRow(student.id);
                }}
              >
                {expandedRows.has(student.id) ? "Hide Details" : "Show Details"}
              </Button>
              <Badge className={`${statusColors[student.status as keyof typeof statusColors]} shrink-0 px-2 py-1 text-xs`}>
                {student.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
