/** Bölüm geçişlerinde kullanılan tek dekoratif motif: kablo izi. */
export default function CableDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>
      <svg viewBox="0 0 800 40" className="h-10 w-full" fill="none">
        <path
          d="M8 20c120-14 240-14 360 0s240 14 360 0"
          stroke="#102A2A"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
        />
        <circle cx="8" cy="20" r="5" fill="#D9F34A" stroke="#102A2A" strokeWidth="2" />
        <circle cx="792" cy="20" r="5" fill="#D9F34A" stroke="#102A2A" strokeWidth="2" />
      </svg>
    </div>
  );
}
