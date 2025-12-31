import React from "react";
import { Student } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, User } from "lucide-react";

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  enrolled: "bg-teal-500",
  pending: "bg-amber-500",
  graduated: "bg-indigo-500",
};

type SortColumn = "name" | "email" | "phone" | "courseInterested" | "location" | "status" | "registrationDate";
type SortDirection = "asc" | "desc" | null;

interface StudentListTableProps {
  students: Student[];
  expandedRows: Set<string>;
  lastExpandedId: string | null;
  expandedRowRefs: React.MutableRefObject<Record<string, HTMLTableRowElement | null>>;
  offset: number;
  searchName: string;
  searchEmail: string;
  searchPhone: string;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  handleSort: (column: SortColumn) => void;
  toggleRow: (id: string) => void;
  highlightMatch: (text: string, searchTerm: string) => React.ReactNode;
  renderExpandedRow: (student: Student) => React.ReactNode;
}

const getSortIcon = (column: SortColumn, sortColumn: SortColumn | null, sortDirection: SortDirection) => {
  if (sortColumn !== column) {
    return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
  }
  if (sortDirection === "asc") {
    return <ArrowUp className="ml-2 h-4 w-4 inline" />;
  }
  return <ArrowDown className="ml-2 h-4 w-4 inline" />;
};

export function StudentListTable({
  students,
  expandedRows,
  lastExpandedId,
  expandedRowRefs,
  offset,
  searchName,
  searchEmail,
  searchPhone,
  sortColumn,
  sortDirection,
  handleSort,
  toggleRow,
  highlightMatch,
  renderExpandedRow,
}: StudentListTableProps) {
  return (
    <div className="rounded-md border hidden md:block">
      <div className="w-full overflow-y-scroll max-h-[500px]">
        <table className="w-full caption-bottom text-sm table-fixed">
          <thead className="sticky top-0 bg-background [&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Name{getSortIcon("name", sortColumn, sortDirection)}
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("email")}
              >
                Email{getSortIcon("email", sortColumn, sortDirection)}
              </TableHead>
              <TableHead
                className="hidden lg:table-cell cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("phone")}
              >
                Phone{getSortIcon("phone", sortColumn, sortDirection)}
              </TableHead>
              <TableHead
                className="hidden lg:table-cell cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("courseInterested")}
              >
                Course{getSortIcon("courseInterested", sortColumn, sortDirection)}
              </TableHead>
              <TableHead
                className="hidden xl:table-cell cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("location")}
              >
                Location{getSortIcon("location", sortColumn, sortDirection)}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                Status{getSortIcon("status", sortColumn, sortDirection)}
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer select-none hover:bg-muted/50"
                onClick={() => handleSort("registrationDate")}
              >
                Registration Date{getSortIcon("registrationDate", sortColumn, sortDirection)}
              </TableHead>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {students.map((student, index) => (
              <React.Fragment key={student.id}>
                <TableRow
                  ref={(el) => {
                    if (lastExpandedId === student.id) {
                      expandedRowRefs.current[student.id] = el;
                    }
                  }}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    lastExpandedId === student.id
                      ? 'bg-primary/10'
                      : ''
                  }`}
                  onClick={() => toggleRow(student.id)}
                >
                  <TableCell>
                    {expandedRows.has(student.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{offset + index + 1}</TableCell>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {highlightMatch(student.name, searchName)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-bold">
                    {highlightMatch(student.email, searchEmail)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {highlightMatch(student.phone, searchPhone)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{student.courseInterested || "N/A"}</TableCell>
                  <TableCell className="hidden xl:table-cell">{student.location || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[student.status as keyof typeof statusColors]}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{student.registrationDate}</TableCell>
                </TableRow>
                {expandedRows.has(student.id) && (
                  <TableRow>
                    <TableCell colSpan={9} className={`bg-gradient-to-br from-muted/30 to-muted/10 p-0 ${
                      lastExpandedId === student.id ? 'border-2 border-primary' : ''
                    }`}>
                      {renderExpandedRow(student)}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
