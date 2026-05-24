interface BadgeProps {
  label: string;
}

export default function Badge({ label }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-topbar px-2 py-0.5 text-[10px] font-semibold text-text-on-dark">
      {label}
    </span>
  );
}
