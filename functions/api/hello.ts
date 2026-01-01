export const onRequest = async () => {
  return new Response(
    JSON.stringify({ message: "Hello!" }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
};