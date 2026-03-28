import type { NextConfig } from "next";
import z from "zod";

const envValidationResult = z
  .object({
    LIVEBLOCKS_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
  })
  .safeParse(process.env);

if (!envValidationResult.success) {
  console.error(
    "Invalid or missing environment variables",
    envValidationResult.error.issues.map((i) => i.path.join(".")),
  );
  process.exit(1);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
