import { Id } from "@/../convex/_generated/dataModel";

export interface Job {
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
  descriptionId: Id<"jobDescriptions">;
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
