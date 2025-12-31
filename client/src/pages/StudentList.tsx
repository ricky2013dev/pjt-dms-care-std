import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Student, type StudentNote } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Plus } from "lucide-react";
import { StudentFilter } from "@/components/student/StudentFilter";
import { StudentListTable } from "@/components/student/StudentListTable";
import { StudentListCards } from "@/components/student/StudentListCards";
import { StudentDetail } from "@/components/student/StudentDetail";
import { PageControl } from "@/components/common/PageControl";

type SortColumn = "name" | "email" | "phone" | "courseInterested" | "location" | "status" | "registrationDate";
type SortDirection = "asc" | "desc" | null;

// Helper function to highlight matching text
const highlightMatch = (text: string, searchTerm: string) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <span key={index} className="bg-yellow-300 dark:bg-yellow-600 font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

export default function StudentList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();

  // Initialize state from sessionStorage if available
  const [initialized, setInitialized] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterCourse, setFilterCourse] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [lastExpandedId, setLastExpandedId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [limit, setLimit] = useState(300);

  // Ref to track expanded row elements for scrolling
  const expandedRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // Restore state from sessionStorage and URL query parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasUrlFilters = searchParams.has('courseInterested') ||
                          searchParams.has('location') ||
                          searchParams.has('status') ||
                          searchParams.has('name') ||
                          searchParams.has('email') ||
                          searchParams.has('phone') ||
                          searchParams.has('registrationDateFrom') ||
                          searchParams.has('registrationDateTo') ||
                          searchParams.has('view');

    // Only restore from sessionStorage if there are NO URL parameters
    if (!hasUrlFilters) {
      const savedState = sessionStorage.getItem('studentListState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setSearchName(state.searchName || "");
          setSearchEmail(state.searchEmail || "");
          setSearchPhone(state.searchPhone || "");
          setFilterCourse(state.filterCourse || []);
          setFilterLocation(state.filterLocation || "");
          setFilterStatus(state.filterStatus || []);
          setDateFrom(state.dateFrom || "");
          setDateTo(state.dateTo || "");
          setOffset(state.offset || 0);
          setLimit(state.limit || 300);
          setSortColumn(state.sortColumn || null);
          setSortDirection(state.sortDirection || null);

          // Restore expanded row
          if (state.expandedStudentId) {
            setExpandedRows(new Set([state.expandedStudentId]));
          }
        } catch (e) {
          console.error('Failed to restore state:', e);
        }
      }
    }

    // Apply URL query parameters
    if (searchParams.has('courseInterested')) {
      const courseParam = searchParams.get('courseInterested') || "";
      setFilterCourse(courseParam ? courseParam.split(',').map(c => c.trim()).filter(Boolean) : []);
    }
    if (searchParams.has('location')) {
      setFilterLocation(searchParams.get('location') || "");
    }
    if (searchParams.has('status')) {
      const statusParam = searchParams.get('status') || "";
      setFilterStatus(statusParam ? statusParam.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (searchParams.has('name')) {
      setSearchName(searchParams.get('name') || "");
    }
    if (searchParams.has('email')) {
      setSearchEmail(searchParams.get('email') || "");
    }
    if (searchParams.has('phone')) {
      setSearchPhone(searchParams.get('phone') || "");
    }
    if (searchParams.has('registrationDateFrom')) {
      setDateFrom(searchParams.get('registrationDateFrom') || "");
    }
    if (searchParams.has('registrationDateTo')) {
      setDateTo(searchParams.get('registrationDateTo') || "");
    }

    setInitialized(true);
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (!initialized) return;

    const state = {
      searchName,
      searchEmail,
      searchPhone,
      filterCourse,
      filterLocation,
      filterStatus,
      dateFrom,
      dateTo,
      offset,
      limit,
      sortColumn,
      sortDirection,
    };
    sessionStorage.setItem('studentListState', JSON.stringify(state));
  }, [initialized, searchName, searchEmail, searchPhone, filterCourse, filterLocation, filterStatus, dateFrom, dateTo, offset, limit, sortColumn, sortDirection]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchName) params.append("name", searchName);
    if (searchEmail) params.append("email", searchEmail);
    if (searchPhone) params.append("phone", searchPhone);
    if (filterCourse.length > 0) params.append("courseInterested", filterCourse.join(','));
    if (filterLocation) params.append("location", filterLocation);
    if (filterStatus.length > 0) {
      const statusParam = filterStatus.join(',');
      console.log('Sending status filter:', filterStatus, 'as:', statusParam);
      params.append("status", statusParam);
    }
    if (dateFrom) params.append("registrationDateFrom", dateFrom);
    if (dateTo) params.append("registrationDateTo", dateTo);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    return params.toString();
  };

  const { data, isLoading } = useQuery<{ students: Student[]; total: number }>({
    queryKey: ["/api/students", searchName, searchEmail, searchPhone, filterCourse, filterLocation, filterStatus, dateFrom, dateTo, offset, limit],
    queryFn: async () => {
      const res = await fetch(`/api/students?${buildQueryString()}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  const students = data?.students || [];
  const total = data?.total || 0;

  // Fetch notes for expanded students
  const expandedStudentIds = Array.from(expandedRows);
  const { data: notesData } = useQuery<Record<string, StudentNote[]>>({
    queryKey: ["/api/students/notes", expandedStudentIds],
    queryFn: async () => {
      if (expandedStudentIds.length === 0) return {};

      const notesMap: Record<string, StudentNote[]> = {};
      await Promise.all(
        expandedStudentIds.map(async (studentId) => {
          const res = await fetch(`/api/students/${studentId}/notes`);
          if (res.ok) {
            notesMap[studentId] = await res.json();
          } else {
            notesMap[studentId] = [];
          }
        })
      );
      return notesMap;
    },
    enabled: expandedStudentIds.length > 0,
  });

  const getStudentNotes = (studentId: string) => {
    const notes = notesData?.[studentId] || [];
    return {
      userNotes: notes.filter(note => !note.isSystemGenerated),
      systemLogs: notes.filter(note => note.isSystemGenerated),
    };
  };

  // Mutations for student operations
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: "Student updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete student");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: "Student deleted successfully" });
      setExpandedRows(new Set());
    },
    onError: () => {
      toast({ title: "Failed to delete student", variant: "destructive" });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async ({ studentId, content }: { studentId: string; content: string }) => {
      const res = await fetch(`/api/students/${studentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create note");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/notes"] });
      toast({ title: "Note added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update note");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/notes"] });
      toast({ title: "Note updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete note");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/notes"] });
      toast({ title: "Note deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStudents = React.useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return students;
    }

    return [...students].sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [students, sortColumn, sortDirection]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    const isExpanding = !newExpanded.has(id);

    if (newExpanded.has(id)) {
      newExpanded.delete(id);
      if (lastExpandedId === id) {
        setLastExpandedId(null);
      }
    } else {
      newExpanded.add(id);
      setLastExpandedId(id);
    }
    setExpandedRows(newExpanded);

    // Scroll to center the expanded row
    if (isExpanding) {
      setTimeout(() => {
        const rowElement = expandedRowRefs.current[id];
        if (rowElement) {
          rowElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchEmail("");
    setSearchPhone("");
    setFilterCourse([]);
    setFilterLocation("");
    setFilterStatus([]);
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  };

  const hasFilters = !!(searchName || searchEmail || searchPhone || filterCourse.length > 0 || filterLocation || filterStatus.length > 0 || dateFrom || dateTo);

  // Get unique courses from actual student data
  const { data: allStudentsData } = useQuery<{ students: Student[]; total: number }>({
    queryKey: ["/api/students/all-for-filters"],
    queryFn: async () => {
      const res = await fetch(`/api/students?limit=10000`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });

  // Extract unique course values from the actual data
  const availableCourses = React.useMemo(() => {
    if (!allStudentsData?.students) return [];
    const uniqueCourses = new Set<string>();
    allStudentsData.students.forEach(student => {
      if (student.courseInterested) {
        uniqueCourses.add(student.courseInterested);
      }
    });
    return Array.from(uniqueCourses).sort().map(course => ({
      id: course.toLowerCase().replace(/\s+/g, '-'),
      name: course,
      abbr: course
    }));
  }, [allStudentsData]);

  // Extract unique location values from the actual data
  const availableLocations = React.useMemo(() => {
    if (!allStudentsData?.students) return [];
    const uniqueLocations = new Set<string>();
    allStudentsData.students.forEach(student => {
      if (student.location) {
        uniqueLocations.add(student.location);
      }
    });
    return Array.from(uniqueLocations).sort();
  }, [allStudentsData]);

  // Extract unique status values from the actual data
  const availableStatuses = React.useMemo(() => {
    if (!allStudentsData?.students) return [];
    const uniqueStatuses = new Set<string>();
    allStudentsData.students.forEach(student => {
      if (student.status) {
        uniqueStatuses.add(student.status);
      }
    });
    return Array.from(uniqueStatuses).sort();
  }, [allStudentsData]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/students?${buildQueryString()}&limit=10000`);
      const data = await res.json();
      const studentsToExport = data.students;

      const headers = ["Name", "Email", "Phone", "Course Interested", "Location", "Status", "Citizenship Status", "Current Situation", "Registration Date"];
      const csv = [
        headers.join(","),
        ...studentsToExport.map((s: Student) => [
          s.name,
          s.email,
          s.phone,
          s.courseInterested || "",
          s.location || "",
          s.status,
          s.citizenshipStatus || "",
          s.currentSituation || "",
          s.registrationDate,
        ].join(","))
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({ title: "Export successful", description: `Exported ${studentsToExport.length} students` });
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const renderExpandedRow = (student: Student) => {
    const { userNotes, systemLogs } = getStudentNotes(student.id);
    return (
      <StudentDetail
        student={student}
        lastExpandedId={lastExpandedId}
        userNotes={userNotes}
        systemLogs={systemLogs}
        searchEmail={searchEmail}
        searchPhone={searchPhone}
        highlightMatch={highlightMatch}
        toggleRow={toggleRow}
        user={user || null}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        createNoteMutation={createNoteMutation}
        updateNoteMutation={updateNoteMutation}
        deleteNoteMutation={deleteNoteMutation}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="w-[90%] mx-auto px-4 md:px-6 py-6 flex-1">
        <StudentFilter
          searchName={searchName}
          setSearchName={setSearchName}
          searchEmail={searchEmail}
          setSearchEmail={setSearchEmail}
          searchPhone={searchPhone}
          setSearchPhone={setSearchPhone}
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          setOffset={setOffset}
          availableCourses={availableCourses}
          availableLocations={availableLocations}
          availableStatuses={availableStatuses}
          hasFilters={hasFilters}
          handleClearFilters={handleClearFilters}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>
                   {sortedStudents.length} of {total}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => window.location.href = '/students/new'}>
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="md:hidden">Add</span>
                  <span className="hidden md:inline">Add Student</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sortedStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No students found</p>
                {hasFilters && (
                  <Button variant="ghost" onClick={handleClearFilters} className="mt-2">
                    Clear filters to see all students
                  </Button>
                )}
              </div>
            ) : (
              <>
                <StudentListCards
                  students={sortedStudents}
                  expandedRows={expandedRows}
                  lastExpandedId={lastExpandedId}
                  searchName={searchName}
                  searchEmail={searchEmail}
                  searchPhone={searchPhone}
                  toggleRow={toggleRow}
                  highlightMatch={highlightMatch}
                />

                <StudentListTable
                  students={sortedStudents}
                  expandedRows={expandedRows}
                  lastExpandedId={lastExpandedId}
                  expandedRowRefs={expandedRowRefs}
                  offset={offset}
                  searchName={searchName}
                  searchEmail={searchEmail}
                  searchPhone={searchPhone}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                  toggleRow={toggleRow}
                  highlightMatch={highlightMatch}
                  renderExpandedRow={renderExpandedRow}
                />

                <PageControl
                  total={total}
                  offset={offset}
                  limit={limit}
                  onOffsetChange={setOffset}
                  onLimitChange={setLimit}
                />
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
