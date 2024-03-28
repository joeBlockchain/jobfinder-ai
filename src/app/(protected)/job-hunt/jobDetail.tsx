// JobDetailAlert.tsx
import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Job } from "@/lib/interfaces";

interface JobDetailAlertProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export const JobDetailAlert: React.FC<JobDetailAlertProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  const jobDes = useQuery(api.jobs.getJobDescription, {
    descriptionId: job?.descriptionId,
  });

  if (!job) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="p-0">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{job.title}</CardTitle>
              {job.isNew && <Badge>New</Badge>}
            </div>
            <CardDescription>{job.company}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm ">{job.location}</div>
              <div className="text-sm">{job.department}</div>
            </div>
            <div className="text-sm ">{job.salary_range}</div>
            <div className="text-sm ">{job.years_of_experience} years</div>
            <ScrollArea className="h-72 rounded-md border">
              <p className="text-sm p-5">
                About the role:{" "}
                {
                  // Display Job Descirption
                  jobDes?.full_description
                  // selectedJob.description /* You'll need to fetch and display the job description here */
                }
              </p>
            </ScrollArea>
            <div className="flex items-center justify-between">
              <Link href={job.posting_link} className="underline text-sm">
                Posting Link
              </Link>
              <Link href={job.apply_link} className="underline text-sm">
                Apply Link
              </Link>
            </div>
            <div className="text-sm">Job Status: {job.status}</div>
            <div className="flex items-center justify-between">
              <div className="text-sm">User Rating: {job.user_rating}</div>
              <div className="text-sm">
                Predicted User Rating: {job.predicted_user_rating}
              </div>
            </div>
          </CardContent>
        </Card>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
