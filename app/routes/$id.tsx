import type {
  MetaFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import type { WP_REST_API_Post } from 'wp-types';
import { getAllPosts } from '~/lib/posts';
import KVStore from '~/lib/Store/KVStore';

export const meta: MetaFunction<typeof loader> = ({
                                                    data
                                                  }) => {
  const post = data?.post as WP_REST_API_Post | undefined;
  return [
    { title: post ? post.title.rendered: "not found" },
  ];
};

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const store = new KVStore((context.env as Env).POSTS);
  const posts = await getAllPosts((context.env as Env).WORDPRESS_URL, store);
  const post = posts.find((post: WP_REST_API_Post) => {
    return post.id === parseInt(params.id || "0", 10);
  });
  return json({ post });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const post = data?.post as WP_REST_API_Post | undefined;

  if (!post) {
    return (
      <div>
        <div>Not found.</div>
      </div>
    );
  }

  return (
    <div>
      <article>
        <h2>{post.title.rendered}</h2>
        <div dangerouslySetInnerHTML={{ __html: post.content.rendered }}/>
      </article>
    </div>
  );
}
