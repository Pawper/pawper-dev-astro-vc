import React from "react";
import { soundClick, soundHover } from "../../context/SoundContext";

type TapProps<T extends React.ElementType = "div"> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
};

export default function Tap<T extends React.ElementType = "div">({
  as,
  className,
  onClick,
  onMouseEnter,
  ...rest
}: TapProps<T>) {
  const Tag = (as ?? "div") as React.ElementType;

  const handleClick = (e: React.MouseEvent) => {
    soundClick();
    (onClick as React.MouseEventHandler)?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    soundHover();
    (onMouseEnter as React.MouseEventHandler)?.(e);
  };

  return (
    <Tag
      className={["pw-tap", className].filter(Boolean).join(" ")}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...rest}
    />
  );
}
