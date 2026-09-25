import type { APIRoute } from 'astro';
import { getFollowers } from '../lib/followers';

// Build-time follower report: each platform's count and which source answered (or why it didn't).
// Open /followers.json on a preview to see why a platform is missing from the total.
export const GET: APIRoute = async () => {
  const { counts, total, listeners, log, checkedAt } = await getFollowers();
  return new Response(JSON.stringify({ checkedAt, total, counts, monthlyListeners: listeners, sources: log }, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
};
