export default function ExampleBadge({ label = "Örnek veri — doğrulanacak" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-petrol/40 bg-paper-2 px-3 py-1 text-xs font-semibold text-petrol">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-petrol/60" />
      {label}
    </span>
  );
}
