export default function Skeleton({ className = "", animated = true }) {
  return (
    <div
      className={`bg-slate-200 rounded-lg ${animated ? "animate-pulse" : ""} ${className}`}
    />
  );
}
