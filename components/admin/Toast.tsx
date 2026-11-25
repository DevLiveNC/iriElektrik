export default function Toast({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className="mb-6 rounded-xl border border-petrol/20 bg-lime px-5 py-4 font-semibold text-petrol"
    >
      {message}
    </p>
  );
}
