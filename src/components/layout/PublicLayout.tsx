import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-theme min-h-screen">{children}</div>;
}
