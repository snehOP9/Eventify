const LoadingSkeleton = ({ cards = 6 }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={`skeleton-${index + 1}`}
          className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="shimmer h-52 rounded-[1.25rem]" />
          <div className="mt-4 space-y-3">
            <div className="shimmer h-4 w-24 rounded-full" />
            <div className="shimmer h-8 rounded-full" />
            <div className="shimmer h-4 rounded-full" />
            <div className="shimmer h-4 w-4/5 rounded-full" />
            <div className="mt-6 flex gap-3">
              <div className="shimmer h-12 flex-1 rounded-full" />
              <div className="shimmer h-12 w-32 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
