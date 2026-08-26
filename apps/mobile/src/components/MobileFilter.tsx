import { useState, type KeyboardEvent } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Dialog } from "@core/shared";
import { Button, GhostButton } from "./ui";

export interface MobileFilterOption {
  value: string;
  label: string;
}

export interface MobileFilterGroup {
  key: string;
  label: string;
  options: readonly MobileFilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface MobileFilterProps {
  keywords: readonly string[];
  onKeywordsChange: (next: readonly string[]) => void;
  inputPlaceholder: string;
  inputAriaLabel?: string;
  inputId?: string;
  filterAriaLabel?: string;
  groups: readonly MobileFilterGroup[];
  showGroupChips?: boolean;
  resultCount?: number;
  resultLabel?: string;
  className?: string;
}

const isActive = (value: string) => value !== "all";

function useFilterSheet(groups: readonly MobileFilterGroup[]) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const openSheet = () => {
    setDraft(Object.fromEntries(groups.map(group => [group.key, group.value])));
    setOpen(true);
  };

  const applyDraft = () => {
    groups.forEach(group => {
      const next = draft[group.key] ?? "all";
      if (next !== group.value) group.onChange(next);
    });
    setOpen(false);
  };

  const resetDraft = () => setDraft(Object.fromEntries(groups.map(group => [group.key, "all"])));

  return { open, setOpen, draft, setDraft, openSheet, applyDraft, resetDraft };
}

function FilterConditionsDialog({ sheet, groups }: { sheet: ReturnType<typeof useFilterSheet>; groups: readonly MobileFilterGroup[] }) {
  return (
    <Dialog open={sheet.open} onOpenChange={sheet.setOpen} title="筛选条件" showCloseButton={false} footer={<>
      <GhostButton onClick={sheet.resetDraft}>重置</GhostButton>
      <Button onClick={sheet.applyDraft}>确定</Button>
    </>}>
      <div className="space-y-5">
        {groups.map(group => (
          <fieldset key={group.key}>
            <legend className="text-sm font-semibold text-text-primary">{group.label}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map(option => {
                const selected = sheet.draft[group.key] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => sheet.setDraft(current => ({ ...current, [group.key]: option.value }))}
                    className={`min-h-touch rounded-control border px-3 text-sm font-medium transition active:bg-surface-pressed ${selected ? "border-primary bg-primary-container text-text-brand" : "border-transparent bg-surface-subtle text-text-secondary"}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Dialog>
  );
}

export function FilterSheetIconButton({ groups, ariaLabel = "筛选", className = "" }: {
  groups: readonly MobileFilterGroup[];
  ariaLabel?: string;
  className?: string;
}) {
  const sheet = useFilterSheet(groups);
  const activeCount = groups.filter(group => isActive(group.value)).length;
  const hasFilters = activeCount > 0;
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={sheet.open}
        aria-label={hasFilters ? `${ariaLabel}，已选 ${activeCount} 项条件` : ariaLabel}
        onClick={sheet.openSheet}
        className={`flex size-11 items-center justify-center rounded-full transition active:bg-surface-pressed ${hasFilters ? "bg-primary-container text-text-brand" : "text-text-primary"} ${className}`}
      >
        <SlidersHorizontal size={20} aria-hidden="true" />
      </button>
      <FilterConditionsDialog sheet={sheet} groups={groups} />
    </>
  );
}

export function MobileFilter({
  keywords,
  onKeywordsChange,
  inputPlaceholder,
  inputAriaLabel = inputPlaceholder,
  inputId,
  filterAriaLabel = "列表筛选",
  groups,
  showGroupChips = true,
  resultCount,
  resultLabel = "条结果",
  className = "",
}: MobileFilterProps) {
  const [pending, setPending] = useState("");
  const sheet = useFilterSheet(groups);

  const activeGroups = groups.filter(group => isActive(group.value));
  const activeCount = keywords.length + activeGroups.length;
  const hasFilters = activeCount > 0;
  const chipGroups = showGroupChips ? activeGroups : [];
  const hasChips = keywords.length + chipGroups.length > 0;

  const commitPending = () => {
    const term = pending.trim();
    if (!term) return;
    setPending("");
    if (!keywords.some(keyword => keyword.toLowerCase() === term.toLowerCase())) onKeywordsChange([...keywords, term]);
  };

  const openSheet = () => {
    commitPending();
    sheet.openSheet();
  };

  const resetAll = () => {
    onKeywordsChange([]);
    groups.forEach(group => group.onChange("all"));
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitPending();
    }
  };

  const groupLabel = (group: MobileFilterGroup) => group.options.find(option => option.value === group.value)?.label ?? group.value;

  return (
    <section className={`space-y-3 ${className}`} aria-label={filterAriaLabel}>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} aria-hidden="true" />
          <input
            type="search"
            id={inputId}
            value={pending}
            onChange={event => setPending(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={inputPlaceholder}
            aria-label={inputAriaLabel}
            enterKeyHint="search"
            className="min-h-touch w-full rounded-control border border-border bg-surface py-2 pl-10 pr-10 text-sm text-text-primary outline-none transition placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary-container"
          />
          {pending && (
            <button
              type="button"
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-text-tertiary active:bg-surface-pressed"
              aria-label="清空搜索"
              onClick={() => setPending("")}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={sheet.open}
          aria-label={hasFilters ? `筛选，已选 ${activeCount} 项条件` : "筛选"}
          onClick={openSheet}
          className={`flex min-h-touch shrink-0 items-center gap-1 rounded-control border px-3 text-sm font-medium transition active:bg-surface-pressed ${hasFilters ? "border-primary bg-primary-container text-text-brand" : "border-border bg-surface text-text-primary"}`}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          筛选
          {hasFilters && <span className="flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-4 text-on-primary" aria-hidden="true">{activeCount}</span>}
        </button>
      </div>

      {hasChips && (
        <div className="flex flex-wrap items-center gap-2">
          {keywords.map(term => (
            <span key={term} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-primary-container py-1 pl-2.5 pr-1 text-sm font-medium text-text-brand">
              {term}
              <button type="button" aria-label={`移除关键词 ${term}`} onClick={() => onKeywordsChange(keywords.filter(keyword => keyword !== term))} className="flex size-6 items-center justify-center rounded-full text-text-brand active:bg-surface-pressed">
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ))}
          {chipGroups.map(group => (
            <span key={group.key} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-primary-container py-1 pl-2.5 pr-1 text-sm font-medium text-text-brand">
              {groupLabel(group)}
              <button type="button" aria-label={`移除筛选 ${groupLabel(group)}`} onClick={() => group.onChange("all")} className="flex size-6 items-center justify-center rounded-full text-text-brand active:bg-surface-pressed">
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ))}
          <button type="button" onClick={resetAll} className="flex min-h-8 items-center gap-1 rounded-control px-2 text-xs font-medium text-text-brand active:bg-surface-pressed" aria-label="重置筛选">
            <RotateCcw size={15} aria-hidden="true" />
            重置
          </button>
        </div>
      )}

      {typeof resultCount === "number" && <p className="text-xs text-text-tertiary" role="status" aria-live="polite">共 {resultCount} {resultLabel}</p>}

      <FilterConditionsDialog sheet={sheet} groups={groups} />
    </section>
  );
}