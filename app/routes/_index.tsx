import type {
  MetaFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';

declare const POSTS: KVNamespace;

const createPostsURL = (url: string, page: number, perPage: number) => {
  return `${url}/wp-json/wp/v2/posts/?_embed&page=${page}&per_page=${perPage}`;
}
const fetchPosts = async (url: string) => {
  const perPage = 100;
  let currentPage = 1;
  let totalPages = 1;
  let posts: any[] = [];
  do {
    const request = new Request(createPostsURL(url, currentPage, perPage));
    const response = await fetch(request, {
      cf: {
        cacheKey: request.url,
        cacheEverything: true,
      },
    });
    console.log(Array.from(response.headers.entries()).flatMap(e => e));
    totalPages = Number(response.headers.get("X-WP-TotalPages"));
    const data = await response.json<any[]>();
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
  const posts = await POSTS.get<typeof data>("posts", "json");
  if (posts) {
    return json({ posts });
  }

  // @ts-ignore
  const data = await fetchPosts(context.env.WORDPRESS_URL);

  await POSTS.put("posts", JSON.stringify(data), { expirationTtl: 60 * 5 });
  return json({ posts });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Posts</h1>
      {data?.posts ? (
        <ul>
          {data?.posts.map((post) => (
            <li key={post.id}>{post.title.rendered}</li>
          ))}
        </ul>
      ): <div />}

    </div>
  );
}
