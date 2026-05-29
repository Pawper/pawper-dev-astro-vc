import React from "react";

interface FormFieldProps {
  label: string;
  placeholder: string;
  name: string;
  multiline?: boolean;
  defaultValue?: string;
}

export default function FormField({ label, placeholder, name, multiline, defaultValue }: FormFieldProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--ink)",
    padding: multiline ? "12px 14px" : "10px 14px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.6)",
    outline: "none",
    width: "100%",
  };

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="pw-eyebrow">{label}</span>
      {multiline ? (
        <textarea name={name} placeholder={placeholder} rows={4} defaultValue={defaultValue} style={{ ...baseStyle, resize: "none" }} />
      ) : (
        <input name={name} placeholder={placeholder} defaultValue={defaultValue} style={baseStyle} />
      )}
    </label>
  );
}
