import dotenv from "dotenv";

dotenv.config();

const upstashUrl = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const upstashToken = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
const useUpstash = upstashUrl.length > 0 && upstashToken.length > 0;

let ratelimitPromise = null;

async function getRatelimit() {
  if (!useUpstash) return null;
  if (ratelimitPromise) return ratelimitPromise;
  ratelimitPromise = (async () => {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    return new Ratelimit({
      redis: new Redis({ url: upstashUrl, token: upstashToken }),
      limiter: Ratelimit.slidingWindow(100, "60 s"),
    });
  })();
  return ratelimitPromise;
}

const rateLimiter = async (req, res, next) => {
  try {
    const rl = await getRatelimit();
    if (!rl) {
      return next();
    }

    const { success } = await rl.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error (skipping)", error?.message || error);
    next();
  }
};

export default rateLimiter;
