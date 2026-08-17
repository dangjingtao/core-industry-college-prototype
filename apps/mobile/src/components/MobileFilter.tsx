import { RotateCcw, Search, X } from "lucide-react";

export interface MobileFilterOption<T extends string = string> {
  value: T;
  label: string;
}

export interface MobileFilterProps<T extends string = string> {
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder: string;
  searchAriaLabel?: string;
  options: readonly MobileFilterOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  defaultValue: T;
  filterAriaLabel?: string;
  resultCount?: number;
  resultLabel?: string;
  className?: string;
}

export function MobileFilter<T extends string>({
  query,
  onQueryChange,
  searchPlaceholder,
  searchAriaLabel = searchPlaceholder,
  options,
  value,
  onValueChange,
  defaultValue,
  filterAriaLabel = "筛选条件",
  resultCount,
  resultLabel = "条结果",
  className = "",
}: MobileFilterProps<T>) {
  const hasFilters = query.trim().length > 0 || value !== defaultValue;
  const reset = () => {
    onQueryChange("");
    onValueChange(defaultValue);
  };

  return (
    <section className={`space-y-3 ${className}`} aria-label={filterAriaLabel}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          className="min-h-touch w-full rounded-control border border-border bg-surface py-2 pl-10 pr-10 text-sm text-text-primary outline-none transition placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary-container"
        />
        {query && <button type="button" className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-text-tertiary active:bg-surface-pressed" aria-label="清空搜索" onClick={() => onQueryChange("")}><X size={18} aria-hidden="true" /></button>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label={filterAriaLabel}>
          {options.map(option => {
            const selected = value === option.value;
            return <button key={option.value} type="button" aria-pressed={selected} onClick={() => onValueChange(option.value)} className={`min-h-touch shrink-0 rounded-control border px-3 text-sm font-medium transition ${selected ? "border-primary bg-primary-container text-text-brand" : "border-transparent bg-surface text-text-secondary active:bg-surface-pressed"}`}>{option.label}</button>;
          })}
        </div>
        {hasFilters && <button type="button" onClick={reset} className="flex min-h-touch shrink-0 items-center gap-1 rounded-control px-2 text-xs font-medium text-text-brand active:bg-surface-pressed" aria-label="重置筛选"><RotateCcw size={15} aria-hidden="true" />重置</button>}
      </div>

      {typeof resultCount === "number" && <p className="text-xs text-text-tertiary" role="status" aria-live="polite">共 {resultCount} {resultLabel}</p>}
    </section>
  );
}
