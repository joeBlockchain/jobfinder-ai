"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  ChevronUp,
  ChevronDown,
  Heart,
  ThumbsDown,
  ThumbsUp,
  Search,
  PlusIcon,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Job {
  _id: Id<"jobs">;
  _creationTime: number;
  posting_link: string;
  posting_id: string;
  apply_link: string;
  company: string;
  salary_range: string;
  salary_midpoint?: number | null; // Make salary_midpoint optional
  title: string;
  location: string;
  department: string;
  descriptionId?: Id<"jobDescriptions">;
  years_of_experience: string;
  status?: "open" | "closed";
  isNew?: boolean;
  user_rating?: "like" | "dislike" | "neutral" | "unknown";
  predicted_user_rating?: "like" | "dislike" | "neutral" | "unknown";
  embeddedJobMatches?: {
    matchingJobId: Id<"jobs">;
    embeddingId: Id<"jobEmbeddings">;
    score: number;
  }[];
}

export default function Page() {
  const jobs = useQuery(api.jobs.getJobs);
  const updateUserRating = useMutation(api.jobs.updateUserRating);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [salaryMidpointFilter, setSalaryMidpointFilter] = useState<
    number | null
  >(null);
  const [yearsOfExperienceFilter, setYearsOfExperienceFilter] = useState<
    string | null
  >(null);
  const [userRatingFilter, setUserRatingFilter] = useState<
    "like" | "dislike" | "neutral" | "unknown" | null
  >(null);
  const [predictedUserRatingFilter, setPredictedUserRatingFilter] = useState<
    "like" | "dislike" | "neutral" | "unknown" | null
  >(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const resetFilters = () => {
    setLocationFilter(null);
    setSalaryMidpointFilter(null);
    setYearsOfExperienceFilter(null);
    setUserRatingFilter(null);
    setPredictedUserRatingFilter(null);
    setCompanyFilter(null);
  };

  const AppliedFilters = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {locationFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>Location: </span>
              <span>{`${locationFilter}`}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setLocationFilter(null)}
              />
            </Badge>
          </div>
        )}
        {salaryMidpointFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>Salary Midpoint: </span>
              <span>{`$${salaryMidpointFilter / 1000}K`}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setSalaryMidpointFilter(null)}
              />
            </Badge>
          </div>
        )}
        {yearsOfExperienceFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>Years of Experience: </span>
              <span>{yearsOfExperienceFilter}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setYearsOfExperienceFilter(null)}
              />
            </Badge>
          </div>
        )}
        {userRatingFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>User Rating: </span>
              <span>{userRatingFilter}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setUserRatingFilter(null)}
              />
            </Badge>
          </div>
        )}
        {predictedUserRatingFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>AI Rating: </span>
              <span>{predictedUserRatingFilter}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setPredictedUserRatingFilter(null)}
              />
            </Badge>
          </div>
        )}
        {companyFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>Company: </span>
              <span>{companyFilter}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setCompanyFilter(null)}
              />
            </Badge>
          </div>
        )}
        {searchQuery && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="py-2 px-3 space-x-2">
              <span>Search: </span>
              <span>{`"${searchQuery}"`}</span>
              <X
                className="cursor-pointer w-4 h-4 ml-10"
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const handleToggle = async (
    jobId: Id<"jobs">,
    new_user_rating: "like" | "dislike" | "neutral" | "unknown"
  ) => {
    console.log(new_user_rating);
    if (!new_user_rating) {
      await updateUserRating({ jobId, user_rating: "unknown" });
    } else {
      await updateUserRating({ jobId, user_rating: new_user_rating });
    }
  };

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<keyof Job>("salary_midpoint");

  const handleSortClick = (column: keyof Job) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  //for filter
  const getUniqueValues = (column: keyof Job): (string | number)[] => {
    const values = jobs?.map((job) => job[column]);
    // Filter out undefined values and convert to string or number
    return Array.from(new Set(values)).filter(
      (value): value is string | number => value !== undefined
    ) as (string | number)[];
  };

  const getValueCount = (column: keyof Job, value: string | number) => {
    return jobs?.filter((job) => job[column] === value).length || 0;
  };

  const getUniqueCount = (column: keyof Job) => {
    const uniqueValues = new Set(jobs?.map((job) => job[column]));
    return uniqueValues.size;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const sortedJobs = jobs
    ? [...jobs]
        .sort((a, b) => {
          const valueA = a[sortColumn];
          const valueB = b[sortColumn];
          if (typeof valueA === "string" && typeof valueB === "string") {
            return sortOrder === "asc"
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          } else if (typeof valueA === "number" && typeof valueB === "number") {
            return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
          }
          return 0;
        })
        .filter((job) => {
          if (locationFilter && job.location !== locationFilter) return false;
          if (
            salaryMidpointFilter &&
            job.salary_midpoint !== salaryMidpointFilter
          )
            return false;
          if (
            yearsOfExperienceFilter &&
            job.years_of_experience !== yearsOfExperienceFilter
          )
            return false;
          if (userRatingFilter && job.user_rating !== userRatingFilter)
            return false;
          if (
            predictedUserRatingFilter &&
            job.predicted_user_rating !== predictedUserRatingFilter
          )
            return false;
          if (companyFilter && job.company !== companyFilter) return false;

          // Add search query filtering
          if (searchQuery) {
            const searchTerms = searchQuery.toLowerCase().split(" ");
            const jobInfo =
              `${job.company} ${job.title} ${job.department} ${job.location} ${job.salary_range} ${job.salary_midpoint} ${job.years_of_experience} ${job.status}`.toLowerCase();
            return searchTerms.every((term) => jobInfo.includes(term));
          }

          return true;
        })
    : [];

  const handleRowClick = (job: Job) => {
    setSelectedJob(job);
    setIsAlertDialogOpen(true);
  };

  return (
    <div className="mt-4 mx-5">
      {selectedJob && (
        <AlertDialog
          open={isAlertDialogOpen}
          onOpenChange={setIsAlertDialogOpen}
        >
          <AlertDialogContent className="p-0">
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedJob.title}</CardTitle>
                  {selectedJob.isNew && <Badge>New</Badge>}
                </div>
                <CardDescription>{selectedJob.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedJob.location}
                  </div>
                  <div className="text-sm">{selectedJob.department}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedJob.salary_range}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedJob.years_of_experience} years
                </div>
                <p className="text-sm">
                  About the role:{" "}
                  {
                    // selectedJob.description /* You'll need to fetch and display the job description here */
                  }
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href={selectedJob.posting_link}
                    className="underline text-sm"
                  >
                    Posting Link
                  </Link>
                  <Link
                    href={selectedJob.apply_link}
                    className="underline text-sm"
                  >
                    Apply Link
                  </Link>
                </div>
                <div className="text-sm text-gray-500">
                  Job Status: {selectedJob.status}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    User Rating: {selectedJob.user_rating}
                  </div>
                  <div className="text-sm">
                    Predicted User Rating: {selectedJob.predicted_user_rating}
                  </div>
                </div>
                {/* You can add the Embedded Job Matches section here if applicable */}
              </CardContent>
            </Card>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="flex flex-row space-x-4 items-end mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-[300px] pl-10"
          />
          <Search className="absolute top-2.5 left-3 h-5 w-5 text-muted-foreground" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filters
              <PlusIcon className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Badge variant="outline" className="mr-3">
                  {getUniqueCount("predicted_user_rating")}
                </Badge>
                AI Rating
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={predictedUserRatingFilter === null}
                  onCheckedChange={() => setPredictedUserRatingFilter(null)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {getUniqueValues("predicted_user_rating")?.map((rating) => (
                  <DropdownMenuCheckboxItem
                    key={String(rating)}
                    checked={predictedUserRatingFilter === rating}
                    onCheckedChange={() =>
                      setPredictedUserRatingFilter(
                        rating as "like" | "dislike" | "neutral" | "unknown"
                      )
                    }
                  >
                    <Badge variant="outline" className="mr-3">
                      {getValueCount("predicted_user_rating", rating)}
                    </Badge>
                    {rating}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Badge variant="outline" className="mr-3">
                  {getUniqueCount("company")}
                </Badge>
                Company
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={companyFilter === null}
                  onCheckedChange={() => setCompanyFilter(null)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {getUniqueValues("company")?.map((company) => (
                  <DropdownMenuCheckboxItem
                    key={String(company)}
                    checked={companyFilter === company}
                    onCheckedChange={() => setCompanyFilter(String(company))}
                  >
                    <Badge variant="outline" className="mr-3">
                      {getValueCount("company", company)}
                    </Badge>
                    {company}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Badge variant="outline" className="mr-3">
                  {getUniqueCount("location")}
                </Badge>
                Location
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={locationFilter === null}
                  onCheckedChange={() => setLocationFilter(null)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {getUniqueValues("location")?.map((location) => (
                  <DropdownMenuCheckboxItem
                    key={String(location)}
                    checked={locationFilter === location}
                    onCheckedChange={() => setLocationFilter(String(location))}
                  >
                    <Badge variant="outline" className="mr-3">
                      {getValueCount("location", location)}
                    </Badge>
                    {location}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Badge variant="outline" className="mr-3">
                  {getUniqueCount("salary_midpoint")}
                </Badge>
                Midpoint
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={salaryMidpointFilter === null}
                  onCheckedChange={() => setSalaryMidpointFilter(null)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {getUniqueValues("salary_midpoint")?.map((midpoint) => (
                  <DropdownMenuCheckboxItem
                    key={String(midpoint)}
                    checked={salaryMidpointFilter === midpoint}
                    onCheckedChange={() =>
                      setSalaryMidpointFilter(Number(midpoint))
                    }
                  >
                    <Badge variant="outline" className="mr-3">
                      {getValueCount("salary_midpoint", midpoint)}
                    </Badge>
                    {typeof midpoint === "number"
                      ? `$${midpoint / 1000}K`
                      : "N/A"}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Badge variant="outline" className="mr-3">
                  {getUniqueCount("years_of_experience")}
                </Badge>
                Years of Experience
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={yearsOfExperienceFilter === null}
                  onCheckedChange={() => setYearsOfExperienceFilter(null)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {getUniqueValues("years_of_experience")?.map((years) => (
                  <DropdownMenuCheckboxItem
                    key={String(years)}
                    checked={yearsOfExperienceFilter === years}
                    onCheckedChange={() =>
                      setYearsOfExperienceFilter(String(years))
                    }
                  >
                    <Badge variant="outline" className="mr-3">
                      {getValueCount("years_of_experience", years)}
                    </Badge>
                    {years}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Badge variant="outline" className="mr-3">
                  {getUniqueCount("user_rating")}
                </Badge>
                User Rating
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  checked={userRatingFilter === null}
                  onCheckedChange={() => setUserRatingFilter(null)}
                >
                  All
                </DropdownMenuCheckboxItem>
                {getUniqueValues("user_rating")?.map((rating) => (
                  <DropdownMenuCheckboxItem
                    key={String(rating)}
                    checked={userRatingFilter === rating}
                    onCheckedChange={() =>
                      setUserRatingFilter(
                        rating as "like" | "dislike" | "neutral" | "unknown"
                      )
                    }
                  >
                    <Badge variant="outline" className="mr-3">
                      {getValueCount("user_rating", rating)}
                    </Badge>
                    {rating}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="secondary" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
      <AppliedFilters />
      {jobs ? (
        <Table className="">
          <TableHeader className="">
            <TableRow>
              <TableHead
                className=""
                onClick={() => handleSortClick("user_rating")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">My Rating</span>
                  {sortColumn === "user_rating" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("predicted_user_rating")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">AI Rating</span>
                  {sortColumn === "predicted_user_rating" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead className="" onClick={() => handleSortClick("status")}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Status</span>
                  {sortColumn === "status" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("company")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Company</span>
                  {sortColumn === "company" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead className="" onClick={() => handleSortClick("title")}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Title</span>
                  {sortColumn === "title" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("department")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Department</span>
                  {sortColumn === "department" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("location")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Location</span>
                  {sortColumn === "location" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("salary_range")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Salary Range</span>
                  {sortColumn === "salary_range" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("salary_midpoint")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Salary Midpoint</span>
                  {sortColumn === "salary_midpoint" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>
              <TableHead
                className=""
                onClick={() => handleSortClick("years_of_experience")}
              >
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                >
                  <span className="mr-2">Years of Exp</span>
                  {sortColumn === "years_of_experience" ? (
                    sortOrder === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    ""
                  )}
                </Button>
              </TableHead>

              <TableHead className="">Posting</TableHead>
              <TableHead className="">Apply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {sortedJobs?.map((job: Job) => (
              <TableRow
                key={job._id}
                onClick={() => handleRowClick(job)}
                className="cursor-pointer"
              >
                <TableCell className="px-1">
                  <ToggleGroup
                    type="single"
                    value={job.user_rating}
                    onValueChange={(value) => {
                      handleToggle(job._id, value as "like" | "dislike");
                    }}
                  >
                    <ToggleGroupItem value="like" size="sm">
                      <ThumbsUp className="w-4 h-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="dislike" size="sm">
                      <ThumbsDown className="w-4 h-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </TableCell>
                <TableCell className="">
                  <div className="flex flex-row px-4 space-x-2 capitalize">
                    <div>{job.predicted_user_rating}</div>
                    <div className="">
                      {job.embeddedJobMatches
                        ?.sort((a, b) => b.score - a.score)
                        .slice(0, 1)
                        .map((match) => (
                          <Badge
                            variant="outline"
                            key={match.matchingJobId.toString()}
                            className={
                              match.score > 0.8
                                ? "bg-green-600 text-white"
                                : match.score < 0.2
                                ? "bg-red-600 text-white"
                                : ""
                            }
                          >
                            {(match.score * 100).toFixed(0)}%
                          </Badge>
                        ))}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="">
                  <div className="px-4">
                    {!job.isNew ? (
                      <Badge className="capitalize">New</Badge>
                    ) : (
                      <span className="capitalize">{job.status}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">{job.company}</div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">{job.title}</div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">{job.department}</div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">{job.location}</div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">{job.salary_range}</div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">
                    {job.salary_midpoint
                      ? `$${job.salary_midpoint / 1000}K`
                      : "N/A"}
                  </div>
                </TableCell>
                <TableCell className="">
                  <div className="px-4">{job.years_of_experience}</div>
                </TableCell>

                <TableCell className="">
                  <Button variant="outline">
                    <a href={job.posting_link} className="">
                      View
                    </a>
                  </Button>
                </TableCell>
                <TableCell className="">
                  <Button variant="outline">
                    <a href={job.apply_link} className="">
                      Apply
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>Loading jobs...</p>
      )}
    </div>
  );
}
