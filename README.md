# Easy Vector search with NextJS and Weaviate

It's showcase day! In today's example, we're going to set up Weaviate Vector Search with NextJS, leveraging modern NextJS features like server components.

## Setup

To speed things up, we'll use Shadcn to get basic styled components for our frontend.

1. Follow the [installation steps](https://ui.shadcn.com/docs/installation/next) to get your basic NextJS + Shadcn setup.
2. Create a Weaviate demo cluster for free after [setting up your account](https://console.weaviate.cloud/)
3. Prepare your `.env` file.
   a. `WCD_URL` -> This is the REST endpoint you can find in your Weaviate cluster.
   b. `WCD_API_KEY` -> Click on "API Keys" just under the REST endpoint to reveal your key.
   c. `OPENAI_APIKEY` -> Your OpenAI API Key.

Great! Now that we have our basics, let's create a script to seed our brand new database with sample data.

To keep this example simple, we're going to use the [Quickstart](https://weaviate.io/developers/weaviate/quickstart) dataset from Weaviate documentation.

Create a `src/lib/weaviate.ts` file where we initialize our `WeaviateClient`. We can re-use this both in our app and script.

```
import weaviate, { WeaviateClient } from "weaviate-client";

let client: WeaviateClient;

export async function weaviateClient() {
  if (client) {
    return client;
  }

  client = await weaviate.connectToWeaviateCloud(process.env.WCD_URL!, {
    authCredentials: new weaviate.ApiKey(process.env.WCD_API_KEY!),
    headers: {
      "X-OpenAI-Api-Key": process.env.OPENAI_APIKEY!,
    },
  });

  return client;
}
```

Next, create a `/scripts/seed.ts`. He're we can easily execute code to seed our database with sample data.

```
import { weaviateClient } from "@/lib/weaviate";
import { generative, vectorizer } from "weaviate-client";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  await createCollection();
  await importQuestions();
}

async function createCollection() {
  const c = await weaviateClient();

  const questions = await c.collections.create({
    name: "Question",
    vectorizers: vectorizer.text2VecOpenAI(),
    generative: generative.openAI(),
  });
  console.log(`Collection ${questions.name} created!`);
}

async function getJsonData() {
  const file = await fetch(
    "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json"
  );
  return file.json();
}

async function importQuestions() {
  const c = await weaviateClient();

  const questions = c.collections.get("Question");
  const data = await getJsonData();
  const result = await questions.data.insertMany(data);
  console.log("We just bulk inserted", result);
}

main()
  .then(() => {})
  .catch((err) => {
    console.error(err);
  });

```

Let's break down what's going on here.

First, we call `createCollection()` in order to create our... wait for it... COLLECTION.

> In the Vector DB world, a collection is the place where you store data, similar to how you would use a table in SQL.

`vectorizers` let you define which algorithm to use to transform your data into a Vector, while `generative` lets you choose which model to use for your collection's generative capabilities.

Next, we're importing our sample dataset in our collection with `importQuestions()`. It's a simple array of questions with 3 differents fields:

```
{"Category":"SCIENCE","Question":"This organ removes excess glucose from the blood & stores it as glycogen","Answer":"Liver"}
```

Now that our script is ready let's run it. We need to add two dev dependencies to execute our script/

```
pnpm install tsx dotenv --save-dev
```

Add a `seed` command in your `package.json`

```
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "tsx scripts/seed.ts"
  },
```

And voila. We're finally ready to run our script with `pnpm seed`. Data should be in rerady to be used.

## Sementic search

Now that we've been through the boring setup, we can start searching things!

> _Sementic_ or _Similarity_ search is looking for vectors with the most similarity for a given input.

First we run `pnpm dlx shadcn-ui@latest add button input skeleton` to get the few components that we need.

Now in our `weaviate.ts`, add a `nearTextQuery`. That's how the similarity search is called in the weaviate SDK.

```
export async function nearTextQuery(query: string): Promise<Item[]> {
  const client = await weaviateClient();

  const questions = client.collections.get("Question");

  const result = await questions.query.nearText(query, {
    limit: 3,
  });

  const items = result.objects.map((o) => o.properties as Item);
  return items;
}

type Item = {
  category: string;
  question: string;
  answer: string;
};
```

To query our collection, we simply use the `nearText` function, passing our `query`. `limit` is how many results we want to be returned.

For our search component, nothing fancy just an input with a button.

```
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const Search = () => {
  const [search, setSearch] = useState<string>("");
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  function onSearch() {
    const params = new URLSearchParams(searchParams);
    params.set("search", search);
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex space-x-4">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
};
```

We use the url params for our query string so when searching `?query=somesearch` will be happened to our url.

the query is passed down to `SearchResult` component

```
import { nearTextQuery } from "@/lib/weaviate";

type Props = {
  query: string;
};

export const SearchResults: React.FC<Props> = async ({ query }) => {
  const results = await nearTextQuery(query);

  return (
    <div className="flex flex-col space-y-4">
      {results.map((result) => (
        <div
          key={result.question}
          className="bg-muted p-2 flex flex-col rounded-md"
        >
          <p className="bg-blue-100 text-xs font-semibold w-fit rounded-md px-2">
            {result.category}
          </p>
          <h2 className="text-lg font-semibold">{result.question}</h2>
          <p>{result.answer}</p>
        </div>
      ))}
    </div>
  );
};
```

and our very simple loading component for the suspense fallback

```
import { Skeleton } from "@/components/ui/skeleton";

export const Loading = () => {
  return (
    <div className="flex flex-col space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-3 w-96" />
        </div>
      ))}
    </div>
  );
};
```

All put together in the page

```
import { Search } from "./_components/search";
import { SearchResults } from "./_components/search-results";
import { Suspense } from "react";
import { Loading } from "./_components/loading";

export default function Home({
  searchParams,
}: {
  searchParams?: {
    search?: string;
  };
}) {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-6">
      <h1 className="text-2xl font-medium">Vectorino</h1>
      <Search />
      {searchParams?.search && (
        <Suspense fallback={<Loading />}>
          <SearchResults query={searchParams?.search} />
        </Suspense>
      )}
    </main>
  );
}
```

And thats pretty mnuch it
