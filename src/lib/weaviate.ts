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

export async function nearTextQuery(query: string): Promise<Item[]> {
  const client = await weaviateClient();

  const questions = client.collections.get("Question");

  const result = await questions.query.nearText(query, {
    limit: 4,
  });

  const items = result.objects.map((o) => o.properties as Item);
  return items;
}

type Item = {
  category: string;
  question: string;
  answer: string;
};
