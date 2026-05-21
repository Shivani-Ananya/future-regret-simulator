"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Simulate" },
  ];

  return (
    <nav
      style={{
        background: "rgba(11,15,20,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #1F2937",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 h-[72px] flex items-center justify-between max-md:gap-2 max-md:w-full">

        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="flex items-center gap-[10px] max-md:gap-2">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--accent-dim)",
                border: "1px solid var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx="7" cy="7" r="2" fill="#22C55E" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              FRS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 max-md:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: pathname === link.href ? "var(--accent)" : "var(--text-secondary)",
                background: pathname === link.href ? "var(--accent-dim)" : "rgba(34,197,94,0.08)",
                textDecoration: "none",
                transition: "all 0.15s",
                border: "1px solid rgba(34,197,94,0.2)",
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  );
}
