import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Papa from "papaparse";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText, Copy, Check, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BulkImport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      // Parse CSV with proper handling of quoted fields
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().replace(/\s+/g, ""),
      });

      if (parseResult.errors.length > 0) {
        const parseErrors = parseResult.errors.map(
          (err) => `Line ${err.row !== undefined ? err.row + 2 : '?'}: ${err.message}`
        );
        setErrors(parseErrors);
        throw new Error(`Found ${parseErrors.length} parsing errors in CSV`);
      }

      const students = parseResult.data as any[];
      const importErrors: string[] = [];

      if (students.length === 0) {
        throw new Error("CSV file must contain at least one student record");
      }

      setErrors(importErrors);
      setPreview(students.slice(0, 5));

      if (importErrors.length > 0) {
        throw new Error(`Found ${importErrors.length} errors in CSV`);
      }

      const results = await Promise.allSettled(
        students.map(async (student, index) => {
          // Helper to convert empty strings to undefined
          const cleanValue = (val: any) => (val === "" || val === null || val === undefined) ? undefined : val;

          // Helper to parse date from MM/DD/YYYY format to YYYY-MM-DD
          const parseDate = (dateStr: string | undefined): string => {
            if (!dateStr) return new Date().toISOString().split("T")[0];

            // Try MM/DD/YYYY HH:MM:SS format first
            const mmddyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (mmddyyyyMatch) {
              const [, month, day, year] = mmddyyyyMatch;
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            // If already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              return dateStr;
            }

            // Default to current date
            return new Date().toISOString().split("T")[0];
          };

          const registrationDate = parseDate(
            cleanValue(student.timestamp) ||
            cleanValue(student.register_date) ||
            cleanValue(student.registrationdate)
          );

          const response = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: cleanValue(student.name) || "Unknown",
              email: cleanValue(student.email) || `unknown_${Date.now()}_${Math.random()}@example.com`,
              phone: cleanValue(student.phone) || "0000000000",
              courseInterested: cleanValue(student.interested_medical_professions) || cleanValue(student.courseinterested) || cleanValue(student.course),
              location: cleanValue(student.location),
              status: cleanValue(student.status) || "pending",
              citizenshipStatus: cleanValue(student.current_status_citizenship) || cleanValue(student.citizenshipstatus),
              currentSituation: cleanValue(student.current_situation) || cleanValue(student.currentsituation),
              registrationDate,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: "Unknown error" }));
            const errorMsg = error.details
              ? `${error.error}: ${JSON.stringify(error.details)}`
              : error.error || `HTTP ${response.status}`;
            throw new Error(errorMsg);
          }

          return response.json();
        })
      );

      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      // Log failures for debugging
      const failures = results.filter(r => r.status === "rejected") as PromiseRejectedResult[];
      if (failures.length > 0) {
        console.error("Import failures:", failures.map(f => f.reason.message));
      }

      return { succeeded, failed, total: students.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Import completed",
        description: `Successfully imported ${data.succeeded} students. ${data.failed} failed.`,
      });
      if (data.succeeded > 0) {
        setTimeout(() => setLocation("/students"), 1500);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast({ title: "Invalid file type", description: "Please select a CSV file", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      setPreview([]);
      setErrors([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      importMutation.mutate(text);
    };
    reader.readAsText(file);
  };

  const sampleCSV = `name,email,phone,interested_medical_professions,location,status,current_status_citizenship,current_situation,timestamp
John Smith,john.smith@email.com,555-010-1001,Nursing,New York,pending,Citizen,Student,01/15/2024
Maria Garcia,maria.garcia@email.com,555-010-1002,Medical Assistant,Los Angeles,active,Permanent Resident,Employed Part-time,01/16/2024
David Chen,david.chen@email.com,555-010-1003,Dental Assistant,Chicago,enrolled,Work Visa,Unemployed,01/17/2024
Sarah Johnson,sarah.j@email.com,555-010-1004,Pharmacy Technician,Houston,enrolled,Citizen,Career Change,01/18/2024
Ahmed Hassan,ahmed.h@email.com,555-010-1005,Physical Therapy Assistant,Miami,inactive,Asylum Seeker,Student,01/19/2024`;

  const generateLargeCSV = () => {
    const firstNames = ["John", "Maria", "David", "Sarah", "Ahmed", "Lisa", "Michael", "Jennifer", "Carlos", "Emily", "Robert", "Patricia", "James", "Linda", "William", "Barbara", "Richard", "Elizabeth", "Joseph", "Susan", "Thomas", "Jessica", "Charles", "Karen", "Daniel", "Nancy", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah"];
    const lastNames = ["Smith", "Garcia", "Chen", "Johnson", "Hassan", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins"];
    const professions = ["Nursing", "Medical Assistant", "Dental Assistant", "Pharmacy Technician", "Physical Therapy Assistant", "Radiology Technician", "Medical Billing Specialist", "Phlebotomy Technician", "Occupational Therapy Assistant", "Respiratory Therapist", "Surgical Technician", "Medical Transcriptionist", "Clinical Laboratory Technician", "Home Health Aide", "EMT/Paramedic"];
    const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver"];
    const statuses = ["pending", "active", "enrolled", "inactive", "graduated"];
    const citizenshipStatuses = ["Citizen", "Permanent Resident", "Work Visa", "Student Visa", "Asylum Seeker", "Refugee Status", "Temporary Protected Status"];
    const situations = ["Student", "Employed Part-time", "Unemployed", "Career Change", "Recent Graduate", "Military Veteran", "Full-time Employee", "Self-employed", "Homemaker"];

    let csv = "name,email,phone,interested_medical_professions,location,status,current_status_citizenship,current_situation,timestamp\n";

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
      const phone = `555-${String(100 + Math.floor(i / 100)).padStart(3, '0')}-${String(1000 + (i % 100)).padStart(4, '0')}`;
      const profession = professions[i % professions.length];
      const city = cities[i % cities.length];
      const status = statuses[i % statuses.length];
      const citizenship = citizenshipStatuses[i % citizenshipStatuses.length];
      const situation = situations[i % situations.length];

      // Generate dates spread across January-March 2024
      const day = (i % 28) + 1;
      const month = ((i % 3) + 1);
      const timestamp = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/2024`;

      csv += `${name},${email},${phone},${profession},${city},${status},${citizenship},${situation},${timestamp}\n`;
    }

    return csv;
  };

  const handleCopyCSV = () => {
    navigator.clipboard.writeText(sampleCSV);
    setCopied(true);
    toast({ title: "Copied!", description: "Sample CSV copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csvContent = generateLargeCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_students_50_records.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Downloaded!", description: "Sample CSV with 50 records downloaded" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="w-[90%] mx-auto px-4 md:px-6 py-6 space-y-6 flex-1">
        <Button variant="ghost" onClick={() => setLocation("/students")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import Students</CardTitle>
            <CardDescription>Upload a CSV file to import multiple student records at once</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div>CSV Format: name, email, phone, interested_medical_professions, location, status, current_status_citizenship, current_situation, timestamp</div>
                  <div className="text-xs mt-2">Valid status values: pending, active, enrolled, inactive, graduated</div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>

              {file && (
                <div className="flex gap-2">
                  <Button onClick={handleImport} disabled={importMutation.isPending}>
                    <Upload className="w-4 h-4 mr-2" />
                    {importMutation.isPending ? "Importing..." : "Import Students"}
                  </Button>
                </div>
              )}
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="font-semibold mb-2">Errors found:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.slice(0, 10).map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                    {errors.length > 10 && <li className="text-sm">...and {errors.length - 10} more</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {preview.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Preview (first 5 records):</h3>
                <div className="border rounded-md overflow-auto">
                  <pre className="p-4 text-xs">{JSON.stringify(preview, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample CSV File</CardTitle>
            <CardDescription>Copy this template and modify it for your import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs border">
                {sampleCSV}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopyCSV}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Copy the above 5 sample records to quickly test the import, or download a full CSV file with 50 records for comprehensive testing.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                className="whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-2" />
                Download 50 Records
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
