export default function AIPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">🤖 Ask AI</h1>
      <p className="text-gray-600">Type a question like “free food today” or “tech events this week.”</p>
      <input className="border mt-4 rounded-xl px-4 py-2 w-full" placeholder="Ask something..." />
      <button className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-full">Ask</button>
    </div>
  );
}
