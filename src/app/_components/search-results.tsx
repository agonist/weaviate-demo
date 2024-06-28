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
