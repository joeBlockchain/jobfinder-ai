import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  jobs: defineTable({
    company: v.string(),
    salary_range: v.string(),
    salary_midpoint: v.optional(v.number()),
    title: v.string(),
    location: v.string(),
    department: v.string(),
    posting_link: v.string(),
    apply_link: v.string(),
    posting_id: v.string(),
    years_of_experience: v.string(),
    status: v.union(v.literal("open"), v.literal("closed")),
    isNew: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    descriptionId: v.optional(v.id("jobDescriptions")),
    lastUpdated: v.optional(v.string()),
    user_rating: v.optional(
      v.union(
        v.literal("like"),
        v.literal("dislike"),
        v.literal("neutral"),
        v.literal("unknown")
      )
    ),
    predicted_user_rating: v.optional(
      v.union(
        v.literal("like"),
        v.literal("dislike"),
        v.literal("neutral"),
        v.literal("unknown")
      )
    ),
    embeddingId: v.optional(v.id("jobEmbeddings")),
    embeddedJobMatches: v.optional(
      v.array(
        v.object({
          matchingJobId: v.id("jobs"),
          embeddingId: v.id("jobEmbeddings"),
          score: v.number(),
        })
      )
    ),
  })
    .index("by_posting_id", ["posting_id"])
    .index("by_embedding", ["embeddingId"]),
  jobDescriptions: defineTable({
    full_description: v.string(),
  }),
  jobEmbeddings: defineTable({
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 3072,
  }),
  userSubscriptions: defineTable({
    userId: v.string(),
    stripePriceId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),
});
