export default function Toast({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" aria-live="polite" className="toast">
      {message}
    </p>
  );
}
