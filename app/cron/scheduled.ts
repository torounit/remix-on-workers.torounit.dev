import { loadPostsToStore } from "~/lib/posts";
import KVStore from "~/lib/Store/KVStore";

export async function scheduled(
  event: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
) {
  ctx.waitUntil(
    (async () => {
      console.log( "cron start" );
      const store = new KVStore(env.POSTS);
      await loadPostsToStore(env.WORDPRESS_URL, store);
      console.log( "cron precessed" );
    })(),
  );
}
