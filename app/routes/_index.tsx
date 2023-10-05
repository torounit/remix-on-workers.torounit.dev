import type {
  MetaFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import type { WP_REST_API_Posts , WP_REST_API_Post } from 'wp-types';

const createPostsURL = (url: string, page: number, perPage: number) => {
  return `${url}/wp-json/wp/v2/posts/?_embed&page=${page}&per_page=${perPage}`;
}
const fetchPosts = async (url: string) => {
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
  }
  while (totalPages > currentPage++);
  return posts;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Blog Posts From WP" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {

  const POSTS = context.env.POSTS;
  const posts = await POSTS.get<typeof fetchedPosts>("posts", "json");
  if (posts) {
    return json({ posts });
  }

  const fetchedPosts = await fetchPosts(context.env.WORDPRESS_URL);

  await POSTS.put("posts", JSON.stringify(fetchedPosts), { expirationTtl: 60 * 5 });
  return json({ posts: fetchedPosts });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Posts</h1>
      {data?.posts ? (
        <ul>
          {data?.posts.map((post: WP_REST_API_Post) => (
            <li key={post.id}>{post.title.rendered}</li>
          ))}
        </ul>
      ): <div>Nothing.</div>}

    </div>
  );
}
