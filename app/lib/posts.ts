import type { WP_REST_API_Posts } from "wp-types";
import type { Store } from "~/lib/Store/Store";

const createPostsURL = (url: string, page: number, perPage: number) => {
  return `${url}/wp-json/wp/v2/posts/?_embed&page=${page}&per_page=${perPage}`;
};

export const fetchPosts = async (url: string) => {
  const perPage = 100;
  let currentPage = 1;
  let totalPages = 1;
  let posts: WP_REST_API_Posts = [];
  do {
    const request = new Request(createPostsURL(url, currentPage, perPage));
    const response = await fetch(request, {
      cf: {
        cacheKey: request.url,
        cacheEverything: true,
      },
    });
    totalPages = Number(response.headers.get("X-WP-TotalPages"));
    const data = await response.json<WP_REST_API_Posts>();
    posts = posts.concat(data);
  } while (totalPages > currentPage++);
  return posts;
};

export const getAllPosts = async (
  WP_URL: string,
  store: Store | undefined,
): Promise<WP_REST_API_Posts> => {
  if (store) {
    const posts = await store.get<typeof fetchedPosts>("posts");
    if (posts) {
      return posts;
    }
  }

  const fetchedPosts = await fetchPosts(WP_URL);

  if (store) {
    await store.set("posts", fetchedPosts);
  }

  return fetchedPosts;
};
