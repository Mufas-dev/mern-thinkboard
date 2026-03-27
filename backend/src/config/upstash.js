import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import dotenv from "dotenv";

dotenv.config();

const upstashUrl = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const upstashToken = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
const hasUpstashEnv = upstashUrl.length > 0 && upstashToken.length > 0;

// If Upstash isn't configured (common in local dev), fall back to a no-op limiter.
const ratelimit = hasUpstashEnv
  ? new Ratelimit({
      redis: new Redis({ url: upstashUrl, token: upstashToken }),
      limiter: Ratelimit.slidingWindow(100, "60 s"),
    })
  : {
      limit: async () => {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "Upstash env not set; rate limiting is disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable."
          );
        }
        return { success: true };
      },
    };

export default ratelimit;
