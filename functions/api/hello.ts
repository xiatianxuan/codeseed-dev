export const onRequest = async () => {
  return new Response(
    JSON.stringify({ message: "Hello from Pages Function!" }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
};