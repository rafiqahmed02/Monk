import React, { ReactNode } from "react";

interface LinkWrapperProps {
  url: string;
  children: ReactNode;
  style?: {};
}

const LinkWrapper: React.FC<LinkWrapperProps> = ({
  url,
  children,
  style = {},
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...style, color: "#000" }}
    >
      {children}
    </a>
  );
};

export default LinkWrapper;
