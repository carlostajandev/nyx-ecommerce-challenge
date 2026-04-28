export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full bg-gray-200"
            />
          ))}
        </div>
        <div className="h-9 w-full animate-pulse rounded-xl bg-gray-200 sm:max-w-xs" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="h-52 w-full animate-pulse rounded-xl bg-gray-200" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-gray-200" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 w-16 animate-pulse rounded-md bg-gray-200" />
              <div className="h-7 w-16 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
