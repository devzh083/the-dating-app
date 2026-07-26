// src/components/ui/resizable.tsx

import * as React from "react";

/**
 * Temporary no-op resizable components.
 * This keeps the app building until react-resizable-panels
 * is upgraded to a compatible version.
 */

const ResizablePanelGroup = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="flex h-full w-full">{children}</div>;

const ResizablePanel = ({
  children,
}: {
  children: React.ReactNode;
}) => <div className="flex-1">{children}</div>;

const ResizableHandle = () => null;

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
