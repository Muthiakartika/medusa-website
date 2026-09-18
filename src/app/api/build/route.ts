/**
 * Which build is currently serving.
 *
 * One consumer: `.github/workflows/purge-on-deploy.yml`, which has to know
 * when the deployment it just pushed is the one answering before it purges
 * Cloudflare. Purging any earlier only refills the cache with the old pages.
 *
 * Reading it from the site rather than from Vercel's API keeps the workflow to
 * one secret — a Vercel token would be a second, with far more reach than
 * "which commit is live".
 *
 * `force-static`, so the values are stamped in at build and the answer costs
 * nothing to serve; `next.config.ts` sends `no-store` for everything under
 * /api, which is what stops Cloudflare answering with the previous build's.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    builtAt: new Date().toISOString(),
  });
}
