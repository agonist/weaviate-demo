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
