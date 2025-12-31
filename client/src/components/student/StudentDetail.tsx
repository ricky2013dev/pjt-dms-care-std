import { useState } from "react";
import { Student, insertStudentSchema, type StudentNote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Edit, Save, Trash2, Clock, User, Plus, X } from "lucide-react";
import { courses } from "@/data/courses";
import { useToast } from "@/hooks/use-toast";
import { UseMutationResult } from "@tanstack/react-query";

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  enrolled: "bg-teal-500",
  pending: "bg-amber-500",
  graduated: "bg-indigo-500",
};

interface StudentDetailProps {
  student: Student;
  lastExpandedId: string | null;
  userNotes: StudentNote[];
  systemLogs: StudentNote[];
  searchEmail: string;
  searchPhone: string;
  highlightMatch: (text: string, searchTerm: string) => React.ReactNode;
  toggleRow: (id: string) => void;
  user: { id: string } | null;
  updateMutation: UseMutationResult<any, Error, { id: string; data: Partial<Student> }, unknown>;
  deleteMutation: UseMutationResult<void, Error, string, unknown>;
  createNoteMutation: UseMutationResult<any, Error, { studentId: string; content: string }, unknown>;
  updateNoteMutation: UseMutationResult<any, Error, { id: string; content: string }, unknown>;
  deleteNoteMutation: UseMutationResult<void, Error, string, unknown>;
}

export function StudentDetail({
  student,
  lastExpandedId,
  userNotes,
  systemLogs,
  searchEmail,
  searchPhone,
  highlightMatch,
  toggleRow,
  user,
  updateMutation,
  deleteMutation,
  createNoteMutation,
  updateNoteMutation,
  deleteNoteMutation,
}: StudentDetailProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "log">("details");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudentNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const handleEdit = () => {
    setFormData(student);
    setEditingStudentId(student.id);
  };

  const handleSave = () => {
    try {
      const validated = insertStudentSchema.partial().parse(formData);
      updateMutation.mutate(
        { id: student.id, data: validated },
        {
          onSuccess: () => {
            setEditingStudentId(null);
            setFormData({});
          },
        }
      );
    } catch (error: any) {
      toast({ title: "Validation error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(student.id, {
      onSuccess: () => {
        setDeletingStudentId(null);
      },
    });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      toast({ title: "Note content cannot be empty", variant: "destructive" });
      return;
    }
    createNoteMutation.mutate(
      { studentId: student.id, content: noteContent },
      {
        onSuccess: () => {
          setIsAddNoteOpen(false);
          setNoteContent("");
        },
      }
    );
  };

  const handleEditNote = () => {
    if (!editingNote || !noteContent.trim()) {
      toast({ title: "Note content cannot be empty", variant: "destructive" });
      return;
    }
    updateNoteMutation.mutate(
      { id: editingNote.id, content: noteContent },
      {
        onSuccess: () => {
          setEditingNote(null);
          setNoteContent("");
        },
      }
    );
  };

  const openEditDialog = (note: StudentNote) => {
    setEditingNote(note);
    setNoteContent(note.content);
  };

  return (
    <div className="p-5">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5" />
            <h3 className="text-xl font-bold tracking-tight">{student.name}</h3>
            <Badge className={`${statusColors[student.status as keyof typeof statusColors]} text-white px-2.5 py-0.5 text-xs`}>
              {student.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{student.email}</p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={editingStudentId === student.id}
            onOpenChange={(open) => {
              if (!open) {
                setEditingStudentId(null);
                setFormData({});
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogDescription>
                  Update information for {student.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`modal-name-${student.id}`}>Name *</Label>
                    <Input
                      id={`modal-name-${student.id}`}
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-email-${student.id}`}>Email *</Label>
                    <Input
                      id={`modal-email-${student.id}`}
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-phone-${student.id}`}>Phone *</Label>
                    <Input
                      id={`modal-phone-${student.id}`}
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-status-${student.id}`}>Status *</Label>
                    <Select
                      value={formData.status || ""}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-course-${student.id}`}>Course Interested</Label>
                    <Select
                      value={formData.courseInterested || ""}
                      onValueChange={(v) => setFormData({ ...formData, courseInterested: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.abbr}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-location-${student.id}`}>Location</Label>
                    <Select
                      value={formData.location || ""}
                      onValueChange={(v) => setFormData({ ...formData, location: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toronto">Toronto</SelectItem>
                        <SelectItem value="Mississauga">Mississauga</SelectItem>
                        <SelectItem value="Brampton">Brampton</SelectItem>
                        <SelectItem value="Ottawa">Ottawa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-citizenship-${student.id}`}>Citizenship Status</Label>
                    <Input
                      id={`modal-citizenship-${student.id}`}
                      value={formData.citizenshipStatus || ""}
                      onChange={(e) => setFormData({ ...formData, citizenshipStatus: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`modal-registrationDate-${student.id}`}>Registration Date *</Label>
                    <Input
                      id={`modal-registrationDate-${student.id}`}
                      type="date"
                      value={formData.registrationDate || ""}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`modal-situation-${student.id}`}>Current Situation</Label>
                  <Textarea
                    id={`modal-situation-${student.id}`}
                    value={formData.currentSituation || ""}
                    onChange={(e) => setFormData({ ...formData, currentSituation: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingStudentId(null);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingStudentId(student.id);
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleRow(student.id);
            }}
          >
            Close
          </Button>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "notes" | "log")}>
        <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted/50 p-1 text-muted-foreground w-full">
          <TabsTrigger
            value="details"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Notes
            <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs font-semibold">
              {userNotes.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="log"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Log
            <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs font-semibold">
              {systemLogs.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="mt-4">
          <div className="rounded-lg border bg-card p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              {/* Row 1 */}
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Email</Label>
                <p className="font-medium truncate">{highlightMatch(student.email, searchEmail)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Phone</Label>
                <p className="font-medium">{highlightMatch(student.phone, searchPhone)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Location</Label>
                <p className="font-medium">{student.location || "N/A"}</p>
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-3 md:col-span-2">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Course</Label>
                <p className="font-medium">{student.courseInterested || "N/A"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Reg. Date</Label>
                <p className="font-medium">{student.registrationDate}</p>
              </div>

              {/* Row 3 */}
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Citizenship</Label>
                <p className="font-medium">{student.citizenshipStatus || "N/A"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Created</Label>
                <p className="font-medium text-xs">{student.createdAt}</p>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground min-w-[100px] shrink-0">Updated</Label>
                <p className="font-medium text-xs">{student.updatedAt}</p>
              </div>

              {/* Current Situation - Full Width */}
              {student.currentSituation && (
                <div className="flex gap-3 md:col-span-3 pt-2 border-t">
                  <Label className="text-muted-foreground min-w-[100px] shrink-0">Situation</Label>
                  <p className="font-medium leading-relaxed">{student.currentSituation}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-semibold">Student Notes</h4>
            <Dialog
              open={isAddNoteOpen}
              onOpenChange={setIsAddNoteOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={(e) => e.stopPropagation()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Add Note</DialogTitle>
                  <DialogDescription>
                    Add a note for {student.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`note-content-${student.id}`}>Note Content</Label>
                    <Textarea
                      id={`note-content-${student.id}`}
                      placeholder="Enter your note here..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={5}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {noteContent.length}/5000 characters
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNote}
                    disabled={createNoteMutation.isPending || !noteContent.trim()}
                  >
                    {createNoteMutation.isPending ? "Adding..." : "Add Note"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {userNotes.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">
              <div className="text-center text-muted-foreground">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium mb-1">No notes yet</p>
                <p className="text-xs">Click "Add Note" to create the first one.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {userNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(note.createdAt).toLocaleString()} {note.createdByName}
                          </span>
                          {note.updatedAt !== note.createdAt && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">edited</span>
                          )}
                        </div>
                      </div>
                      {user?.id === note.createdBy && (
                        <div className="flex gap-1.5">
                          <Dialog
                            open={!!editingNote && editingNote.id === note.id}
                            onOpenChange={(open) => !open && setEditingNote(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(note);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent onClick={(e) => e.stopPropagation()}>
                              <DialogHeader>
                                <DialogTitle>Edit Note</DialogTitle>
                                <DialogDescription>
                                  Update your note for {student.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-note-content-${note.id}`}>Note Content</Label>
                                  <Textarea
                                    id={`edit-note-content-${note.id}`}
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    rows={5}
                                    maxLength={5000}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {noteContent.length}/5000 characters
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingNote(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleEditNote}
                                  disabled={updateNoteMutation.isPending || !noteContent.trim()}
                                >
                                  {updateNoteMutation.isPending ? "Updating..." : "Update Note"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog
                            open={deletingNoteId === note.id}
                            onOpenChange={(open) => !open && setDeletingNoteId(null)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingNoteId(note.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this note? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteNoteMutation.mutate(note.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* LOG TAB */}
        <TabsContent value="log" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-semibold">System Logs</h4>
          </div>

          {systemLogs.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed bg-muted/20 p-8">
              <div className="text-center text-muted-foreground">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium mb-1">No system logs yet</p>
                <p className="text-xs">Status changes and system events will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {systemLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{log.createdByName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
                        System Log
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                      {log.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Student Confirmation Dialog */}
      <AlertDialog open={!!deletingStudentId} onOpenChange={(open) => !open && setDeletingStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student record.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
