import { Check } from "@/components/AppIcon";

export function SuccessNotice({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700" role="status">
      <Check aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </p>
  );
}
