import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit("my-rate-limit");

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    // Never block requests if the rate limiter backend is misconfigured/unavailable.
    console.log("Rate limit error (skipping)", error?.message || error);
    next();
  }
};

export default rateLimiter;
