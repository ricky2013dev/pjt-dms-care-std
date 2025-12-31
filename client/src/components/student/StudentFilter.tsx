import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronDown, ChevronUp, Filter, X } from "lucide-react";

interface StudentFilterProps {
  searchName: string;
  setSearchName: (value: string) => void;
  searchEmail: string;
  setSearchEmail: (value: string) => void;
  searchPhone: string;
  setSearchPhone: (value: string) => void;
  filterCourse: string[];
  setFilterCourse: (value: string[]) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
  filterStatus: string[];
  setFilterStatus: (value: string[]) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  setOffset: (value: number) => void;
  availableCourses: { id: string; name: string; abbr: string }[];
  availableLocations: string[];
  availableStatuses: string[];
  hasFilters: boolean;
  handleClearFilters: () => void;
}

const abbreviateCourseName = (courseName: string): string => {
  const match = courseName.match(/^([^(]+)/);
  if (match) {
    const abbr = match[1].trim();
    return abbr.length > 20 ? abbr.substring(0, 17) + '...' : abbr;
  }
  return courseName.length > 20 ? courseName.substring(0, 17) + '...' : courseName;
};

export function StudentFilter({
  searchName,
  setSearchName,
  searchEmail,
  setSearchEmail,
  searchPhone,
  setSearchPhone,
  filterCourse,
  setFilterCourse,
  filterLocation,
  setFilterLocation,
  filterStatus,
  setFilterStatus,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  setOffset,
  availableCourses,
  availableLocations,
  availableStatuses,
  hasFilters,
  handleClearFilters,
}: StudentFilterProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </span>
          {isFiltersOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent className={`space-y-4 ${!isFiltersOpen ? 'hidden md:block' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${searchName ? 'text-primary' : ''}`}>
              Name
              {searchName && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setOffset(0);
                }}
                className={`pl-9 ${searchName ? 'border-primary border-2 bg-primary/5' : ''}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${searchEmail ? 'text-primary' : ''}`}>
              Email
              {searchEmail && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setOffset(0);
                }}
                className={`pl-9 ${searchEmail ? 'border-primary border-2 bg-primary/5' : ''}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${searchPhone ? 'text-primary' : ''}`}>
              Phone
              {searchPhone && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone..."
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value);
                  setOffset(0);
                }}
                className={`pl-9 ${searchPhone ? 'border-primary border-2 bg-primary/5' : ''}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${filterCourse.length > 0 ? 'text-primary' : ''}`}>
              Course
              {filterCourse.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal h-10 ${filterCourse.length > 0 ? 'border-primary border-2 bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-1 flex-wrap w-full">
                    {filterCourse.length === 0 ? (
                      <span className="text-muted-foreground">All courses</span>
                    ) : (
                      <>
                        {filterCourse.map((course) => (
                          <Badge
                            key={course}
                            variant="secondary"
                            className="mr-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterCourse(filterCourse.filter(c => c !== course));
                              setOffset(0);
                            }}
                          >
                            {abbreviateCourseName(course)}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                  {availableCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={filterCourse.includes(course.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilterCourse([...filterCourse, course.name]);
                          } else {
                            setFilterCourse(filterCourse.filter(c => c !== course.name));
                          }
                          setOffset(0);
                        }}
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {course.name}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${filterLocation && filterLocation.trim() ? 'text-primary' : ''}`}>
              Location
              {filterLocation && filterLocation.trim() && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <Select value={filterLocation} onValueChange={(v) => { setFilterLocation(v); setOffset(0); }}>
              <SelectTrigger className={filterLocation && filterLocation.trim() ? 'border-primary border-2 bg-primary/5' : ''}>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All locations</SelectItem>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${filterStatus.length > 0 ? 'text-primary' : ''}`}>
              Status
              {filterStatus.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal h-10 ${filterStatus.length > 0 ? 'border-primary border-2 bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-1 flex-wrap w-full">
                    {filterStatus.length === 0 ? (
                      <span className="text-muted-foreground">All statuses</span>
                    ) : (
                      <>
                        {filterStatus.map((status) => (
                          <Badge
                            key={status}
                            variant="secondary"
                            className="mr-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterStatus(filterStatus.filter(s => s !== status));
                              setOffset(0);
                            }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-2 space-y-2">
                  {availableStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filterStatus.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilterStatus([...filterStatus, status]);
                          } else {
                            setFilterStatus(filterStatus.filter(s => s !== status));
                          }
                          setOffset(0);
                        }}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${dateFrom ? 'text-primary' : ''}`}>
              Registration From
              {dateFrom && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setOffset(0);
              }}
              className={dateFrom ? 'border-primary border-2 bg-primary/5' : ''}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${dateTo ? 'text-primary' : ''}`}>
              Registration To
              {dateTo && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                  ✓
                </span>
              )}
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setOffset(0);
              }}
              className={dateTo ? 'border-primary border-2 bg-primary/5' : ''}
            />
          </div>
        </div>

        {hasFilters && (
          <Button variant="outline" onClick={handleClearFilters} className="w-full md:w-auto">
            <span className="md:hidden">Clear</span>
            <span className="hidden md:inline">Clear All Filters</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
