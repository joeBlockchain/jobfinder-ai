import { query, mutation, action, internalAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const getJobs = query({
  handler: async ({ db }) => {
    return await db.query("jobs").collect();
  },
});

// Mutation to toggle the favorite status of a job
export const toggleFavorite = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async ({ db }, { jobId }) => {
    const job = await db.get(jobId);
    if (job !== null) {
      await db.patch(jobId, { isFavorite: !job.isFavorite });
    }
  },
});

export const updateUserRating = mutation({
  args: {
    jobId: v.id("jobs"),
    user_rating: v.union(
      v.literal("like"),
      v.literal("dislike"),
      v.literal("neutral"),
      v.literal("unknown")
    ),
  },
  handler: async (ctx, { jobId, user_rating }) => {
    const job = await ctx.db.get(jobId);
    if (job) {
      await ctx.db.patch(jobId, { user_rating });
    } else {
      throw new Error(`Job with id ${jobId} not found`);
    }
  },
});

export const createJob = mutation({
  args: {
    company: v.string(),
    salary_range: v.string(),
    salary_midpoint: v.number(),
    title: v.string(),
    location: v.string(),
    department: v.string(),
    posting_link: v.string(),
    apply_link: v.string(),
    full_description: v.string(),
    posting_id: v.string(),
    years_of_experience: v.string(),
    description_embedding: v.array(v.float64()),
    predicted_user_rating: v.union(
      v.literal("like"),
      v.literal("dislike"),
      v.literal("neutral"),
      v.literal("unknown")
    ),
    embeddedJobMatches: v.optional(
      v.array(
        v.object({
          matchingJobId: v.id("jobs"),
          embeddingId: v.id("jobEmbeddings"),
          score: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Insert the full description into separate table first

    // Check if the job already exists in the database
    // update predicted_user_rating and lastUpdated
    // update predicted_uer_rating to pick up any user ratings since last time the job ran
    const existingJob = await ctx.db
      .query("jobs")
      .withIndex("by_posting_id", (q) => q.eq("posting_id", args.posting_id))
      .first();
    if (existingJob) {
      await ctx.db.patch(existingJob._id, {
        predicted_user_rating: args.predicted_user_rating,
        embeddedJobMatches: args.embeddedJobMatches,
        lastUpdated: new Date().toISOString(),
      });
      return existingJob._id;
    }

    const descriptionId = await ctx.db.insert("jobDescriptions", {
      full_description: args.full_description,
    });

    const embeddingId = await ctx.db.insert("jobEmbeddings", {
      embedding: args.description_embedding,
    });

    console.log("args.embeddedJobMatches:", args.embeddedJobMatches);

    // Insert the job into the database, using the descriptionId
    const jobId = await ctx.db.insert("jobs", {
      company: args.company,
      salary_range: args.salary_range,
      salary_midpoint: args.salary_midpoint,
      title: args.title,
      location: args.location,
      department: args.department,
      posting_link: args.posting_link,
      apply_link: args.apply_link,
      descriptionId: descriptionId as Id<"jobDescriptions">,
      posting_id: args.posting_id,
      years_of_experience: args.years_of_experience,
      embeddingId: embeddingId as Id<"jobEmbeddings">,
      user_rating: "unknown",
      status: "open",
      isNew: true,
      isFavorite: false,
      lastUpdated: new Date().toISOString(),
      predicted_user_rating: args.predicted_user_rating,
      embeddedJobMatches: args.embeddedJobMatches || [],
    });

    return jobId;
  },
});

export const similarJobs = action({
  args: {
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("jobEmbeddings", "by_embedding", {
      vector: args.embedding,
      limit: 5,
    });
    // Return the relevant embeddingId if a match is found
    if (results.length > 0) {
      return results;
    }
    return null;
  },
});

export const fetchJobsByEmbeddingId = query({
  args: {
    ids: v.array(v.id("jobEmbeddings")),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db
        .query("jobs")
        .withIndex("by_embedding", (q) => q.eq("embeddingId", id))
        .unique();
      if (doc === null) {
        continue;
      }
      results.push(doc);
    }
    return results;
  },
});

export const getJobDescription = query({
  args: {
    descriptionId: v.id("jobDescriptions"),
  },
  handler: async (ctx, args) => {
    const description = await ctx.db.get(args.descriptionId);
    return description;
  },
});
