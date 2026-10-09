"use client";

import { useEffect, useId, useState } from "react";
import { CalendarBlank, CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function pretty(value: Date | null): string {
  if (!value) return "Pick a date";
  const day = value.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = value.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

export function SchedulePicker({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (d: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [viewYear, setViewYear] = useState((value ?? now).getFullYear());
  const [viewMonth, setViewMonth] = useState((value ?? now).getMonth());
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const today = startOfDay(new Date());
  // Monday-first offset for the 1st of the month.
  const leadBlanks = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: { date: Date; disabled: boolean }[] = [];
  for (let i = 0; i < leadBlanks; i++) cells.push({ date: new Date(viewYear, viewMonth, 1 - leadBlanks + i), disabled: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    cells.push({ date, disabled: startOfDay(date).getTime() < today.getTime() });
  }

  const moveMonth = (dir: 1 | -1) => {
    const next = new Date(viewYear, viewMonth + dir, 1);
    // Never browse before the current month.
    if (startOfDay(next).getTime() < startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).getTime()) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const pickDay = (date: Date) => {
    if (value && sameDay(value, date)) return;
    const next = new Date(date);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      next.setHours(10, 0, 0, 0);
    }
    onChange(next);
  };

  const setTime = (part: "hour12" | "minute" | "ampm", raw: string) => {
    const base = value ?? new Date();
    const next = new Date(base);
    const h24 = next.getHours();
    const isPm = h24 >= 12;
    if (part === "hour12") {
      const h = parseInt(raw, 10) % 12;
      next.setHours(h + (isPm ? 12 : 0));
    } else if (part === "minute") {
      next.setMinutes(parseInt(raw, 10));
    } else {
      const h = h24 % 12;
      next.setHours(h + (raw === "PM" ? 12 : 0));
    }
    next.setSeconds(0, 0);
    onChange(next);
  };

  const hour12 = value ? value.getHours() % 12 || 12 : 10;
  const minute = value ? value.getMinutes() : 0;
  const ampm = value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="kali-press kali-focus flex w-full items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white"
      >
        <CalendarBlank className="h-5 w-5 shrink-0 text-kali-pink" weight="bold" />
        <span className={cn("flex-1 truncate", !value && "text-white/60")}>{pretty(value)}</span>
        <CaretDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 cursor-default bg-transparent"
          />
          <div
            id={panelId}
            className="absolute z-30 mt-2 w-[320px] max-w-[calc(100vw-3rem)] rounded-3xl bg-white p-5 text-kali-ink shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="Previous month"
                className="kali-press rounded-full bg-kali-pink-pale p-2"
              >
                <CaretLeft className="h-4 w-4" weight="bold" />
              </button>
              <p className="font-bold">{monthLabel}</p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                aria-label="Next month"
                className="kali-press rounded-full bg-kali-pink-pale p-2"
              >
                <CaretRight className="h-4 w-4" weight="bold" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-kali-ink/50">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map(({ date, disabled }, i) => {
                const inMonth = date.getMonth() === viewMonth;
                const selected = value !== null && sameDay(value, date);
                const isToday = sameDay(date, new Date());
                return (
                  <button
                    key={`${date.getTime()}-${i}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickDay(date)}
                    aria-label={date.toLocaleDateString()}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-full text-sm font-bold transition-colors",
                      !inMonth && "invisible",
                      selected
                        ? "bg-kali-ink text-white"
                        : disabled
                          ? "text-kali-ink/25"
                          : "hover:bg-kali-pink-pale",
                      !selected && !disabled && isToday && "ring-2 ring-kali-pink ring-inset"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 mb-1.5 text-[11px] font-bold tracking-widest text-kali-ink/50 uppercase">
              Time
            </p>
            <div className="grid grid-cols-3 gap-2">
              <TimeSelect
                ariaLabel="Hour"
                value={String(hour12)}
                onChange={(v) => setTime("hour12", v)}
                options={HOURS.map(String)}
              />
              <TimeSelect
                ariaLabel="Minute"
                value={String(minute)}
                onChange={(v) => setTime("minute", v)}
                options={MINUTES.map((m) => String(m).padStart(2, "0"))}
                display={(v) => v.padStart(2, "0")}
              />
              <TimeSelect
                ariaLabel="AM or PM"
                value={ampm}
                onChange={(v) => setTime("ampm", v)}
                options={["AM", "PM"]}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="kali-press flex-1 rounded-full bg-kali-pink-pale py-2.5 text-sm font-bold"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="kali-press flex-1 rounded-full bg-kali-ink py-2.5 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TimeSelect({
  ariaLabel,
  value,
  onChange,
  options,
  display,
}: {
  ariaLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  display?: (v: string) => string;
}) {
  return (
    <span className="relative block">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="kali-focus w-full appearance-none rounded-2xl bg-kali-pink-pale/60 px-3 py-2.5 pr-8 text-center text-sm font-bold outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {display ? display(o) : o}
          </option>
        ))}
      </select>
      <CaretDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-kali-ink/50" />
    </span>
  );
}
