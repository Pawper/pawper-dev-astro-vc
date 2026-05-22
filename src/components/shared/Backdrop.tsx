import React from "react";

interface BackdropProps {
  url: string;
}

export default function Backdrop({ url }: BackdropProps) {
  return (
    <div
      className="pw-backdrop"
      style={{ backgroundImage: `url('${url}')` }}
    />
  );
}
