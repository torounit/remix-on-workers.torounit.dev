import type {
  MetaFunction,
  LoaderFunctionArgs, HeadersFunction,
} from "@remix-run/cloudflare";

import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';

const createPostsURL = (url: string, page: number, perPage: number) => {
  return `${url}/wp-json/wp/v2/posts/?_embed&page=${page}&per_page=${perPage}`;
}
const fetchPosts = async (url: string) => {
  const perPage = 100;
  let currentPage = 1;
  let totalPages = 1;
  let posts: any[] = [];
  do {
    const response = await fetch(createPostsURL(url, currentPage, perPage), {});
    totalPages = Number(response.headers.get("X-WP-TotalPages"));
    const data = await response.json<any[]>();
    posts = posts.concat(data);
  }
  while (totalPages > currentPage++);
  return posts;
}

export const headers: HeadersFunction = () => {
  return {
    "X-Stretchy-Pants": "its for fun",
    "Cache-Control": "max-age=0, s-maxage=300, stale-while-revalidate=300",
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Blog Posts From WP" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  // @ts-ignore
  const posts = await fetchPosts(context.env.WORDPRESS_URL);
  return json({ posts });
};

export default function Index() {
  const posts = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.posts.map((post) => (
          <li key={post.id}>{post.title.rendered}</li>
        ))}
      </ul>
    </div>
  );
}
