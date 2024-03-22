"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

const formSchema = z.object({
  jobDescription: z.string().min(10, {
    message: "Job description must be at least 10 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

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
  isFavorite?: boolean;
}

export default function Page() {
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const updateRating = useMutation(api.jobs.updateUserRating);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const response = await fetch("/api/jobSearch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: data.jobDescription }),
    });
    const jobs = await response.json();
    setRecommendedJobs(jobs);
  };

  const handleFeedback = async (
    jobId: Id<"jobs">,
    feedback: "like" | "dislike" | "neutral"
  ) => {
    await updateRating({ jobId, user_rating: feedback });
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your job description..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of your ideal job.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Get Recommendations</Button>
        </form>
      </Form>
      {recommendedJobs.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recommended Jobs</h2>
          <ul className="space-y-4">
            {recommendedJobs.map((job: Job) => (
              <li key={job._id} className="border border-gray-300 rounded p-4">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="text-gray-500">{job.company}</p>
                <p className="text-gray-500">{job.location}</p>
                <div className="mt-4 space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback(job._id, "like")}
                  >
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback(job._id, "dislike")}
                  >
                    Dislike
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4">Enter a job description to get recommendations.</p>
      )}
    </div>
  );
}
