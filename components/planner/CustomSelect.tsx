"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
export function CustomSelect({
  label,
  value,
  options,
  onChange,
  name,
  disabled = false,
  className = "",
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(0);
  const id = useId(),
    root = useRef<HTMLDivElement>(null),
    button = useRef<HTMLButtonElement>(null);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);
  function choose(i: number) {
    if (options[i]) onChange(options[i].value);
    setOpen(false);
    button.current?.focus();
  }
  return (
    <div
      ref={root}
      className={`custom-select ${className}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={id}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        disabled={disabled}
        className="custom-select-trigger"
        onClick={() => {
          setActive(index);
          setOpen(!open);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
            setActive(
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? options.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        options.length - 1,
                        (open ? active : index) +
                          (e.key === "ArrowDown" ? 1 : -1),
                      ),
                    ),
            );
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (open) choose(active);
            else {
              setActive(index);
              setOpen(true);
            }
          }
        }}
      >
        <span className="truncate">{options[index]?.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          id={id}
          role="listbox"
          aria-label={label}
          className="custom-options"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`custom-option ${active === i ? "highlighted" : ""}`}
              onPointerMove={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span className="break-words">{o.label}</span>
              {o.value === value && (
                <Check size={16} className="ml-auto shrink-0 text-blue-600" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
