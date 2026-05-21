"use client";
import React from "react";

// ─── CARD ───────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}

export function Card({ children, className = "", style, hover = false }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "24px 28px",
        transition: hover ? "border-color 0.2s, transform 0.2s" : undefined,
        cursor: hover ? "pointer" : undefined,
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                "rgba(34,197,94,0.3)";
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(-2px)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--border)";
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(0)";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

// ─── BUTTON ─────────────────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  fullWidth = false,
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--accent)",
      color: "#0B0F14",
      border: "1px solid var(--accent)",
    },
    secondary: {
      background: "var(--bg-card)",
      color: "var(--text-primary)",
      border: "1px solid var(--border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent",
    },
    danger: {
      background: "rgba(239,68,68,0.1)",
      color: "#EF4444",
      border: "1px solid rgba(239,68,68,0.3)",
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 14px", fontSize: 12, borderRadius: 6 },
    md: { padding: "10px 20px", fontSize: 14, borderRadius: 8 },
    lg: { padding: "14px 28px", fontSize: 15, borderRadius: 10 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        ...sizes[size],
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        width: fullWidth ? "100%" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: "-0.01em",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            (e.currentTarget as HTMLButtonElement).style.filter =
              "brightness(1.1)";
          } else if (variant === "secondary") {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "rgba(34,197,94,0.3)";
          }
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          styles[variant].border?.toString().replace("1px solid ", "") || "";
      }}
    >
      {children}
    </button>
  );
}

// ─── SLIDER ─────────────────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  description?: string;
  deltaValue?: number;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  description,
  deltaValue,
}: SliderProps) {
  const isDelta = deltaValue !== undefined;
  const getDeltaColor = (v: number) => v > 0 ? "#22C55E" : v < 0 ? "#EF4444" : "var(--text-disabled)";
  const getDeltaText = (v: number) => v > 0 ? `+${v}` : v < 0 ? `${v}` : "0";

  // Track gradient: delta mode uses two-tone (red←0→green), normal uses accent fill
  const trackPercent = ((value - min) / (max - min)) * 100;
  let trackBg: string;
  if (isDelta) {
    const centerPercent = ((0 - min) / (max - min)) * 100;
    if (value >= 0) {
      trackBg = `linear-gradient(to right, var(--border) 0%, var(--border) ${centerPercent}%, #22C55E ${centerPercent}%, #22C55E ${trackPercent}%, var(--border) ${trackPercent}%, var(--border) 100%)`;
    } else {
      trackBg = `linear-gradient(to right, var(--border) 0%, var(--border) ${trackPercent}%, #EF4444 ${trackPercent}%, #EF4444 ${centerPercent}%, var(--border) ${centerPercent}%, var(--border) 100%)`;
    }
  } else {
    trackBg = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${trackPercent}%, var(--border) ${trackPercent}%, var(--border) 100%)`;
  }

  // Tick marks
  const ticks = isDelta
    ? [
        { pos: 0, label: "-50" },
        { pos: 25, label: "|" },
        { pos: 50, label: "0" },
        { pos: 75, label: "|" },
        { pos: 100, label: "+50" },
      ]
    : [
        { pos: 0, label: "0" },
        { pos: 25, label: "|" },
        { pos: 50, label: "|" },
        { pos: 75, label: "|" },
        { pos: 100, label: "100" },
      ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <label
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {label}
          {isDelta && (
            <span style={{
              color: getDeltaColor(deltaValue),
              fontWeight: 700,
              fontSize: 12,
              padding: "1px 6px",
              borderRadius: 4,
              background: deltaValue !== 0 ? (deltaValue > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "transparent",
            }}>
              {getDeltaText(deltaValue)}
            </span>
          )}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
            {isDelta ? "Precision (-50 to +50)" : "Precision (0–100)"}
          </label>
          <input
            type="number"
            min={min}
            max={max}
            value={value === 0 && isNaN(value) ? "" : value}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : parseInt(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            onBlur={(e) => {
              const val = parseInt(e.target.value);
              if (isNaN(val) || val < min) onChange(min);
              else if (val > max) onChange(max);
            }}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: isDelta ? getDeltaColor(value) : "var(--accent)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              width: 56,
              textAlign: "center",
              padding: "6px",
              outline: "none",
              MozAppearance: "textfield"
            }}
          />
        </div>
      </div>
      {description && (
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", opacity: 0.9, marginTop: -4 }}>
          {description}
        </p>
      )}
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", fontStyle: "italic", marginTop: -4 }}>
        {isDelta ? "-50 = decrease, +50 = increase" : "0 = lowest, 100 = highest"}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ background: trackBg }}
      />
    </div>
  );
}

// ─── INPUT FIELD ────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  hint?: string;
}

export function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
}: InputFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--text-primary)",
          outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
          fontFamily: "DM Sans, sans-serif",
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "var(--accent)";
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "var(--border)";
        }}
      />
      {hint && (
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{hint}</p>
      )}
    </div>
  );
}

// ─── SELECT FIELD ───────────────────────────────────────────────────
interface SelectFieldProps {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--text-primary)",
          outline: "none",
          cursor: "pointer",
          width: "100%",
          fontFamily: "DM Sans, sans-serif",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── SECTION HEADER ─────────────────────────────────────────────────
export function SectionHeader({
  step,
  title,
  subtitle,
}: {
  step?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      {step && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          {step}
        </span>
      )}
      <h2
        style={{
          fontSize: 22,
          color: "var(--text-primary)",
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          marginBottom: subtitle ? 8 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", opacity: 0.85 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── CHART WRAPPER ───────────────────────────────────────────────────
export function ChartWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: 20,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {title}
      </h3>
      {children}
    </Card>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────
export function Badge({
  children,
  color = "green",
}: {
  children: React.ReactNode;
  color?: "green" | "yellow" | "red" | "gray";
}) {
  const colorMap = {
    green: { bg: "rgba(34,197,94,0.1)", text: "#22C55E", border: "rgba(34,197,94,0.2)" },
    yellow: { bg: "rgba(234,179,8,0.1)", text: "#EAB308", border: "rgba(234,179,8,0.2)" },
    red: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
    gray: { bg: "rgba(107,114,128,0.1)", text: "#9CA3AF", border: "rgba(107,114,128,0.2)" },
  };
  const c = colorMap[color];

  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}
