import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: { label?: React.ReactNode };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within ChartContainer");
  return ctx;
}

const ChartContainer = ({
  config,
  children,
}: {
  config: ChartConfig;
  children: React.ReactNode;
}) => (
  <ChartContext.Provider value={{ config }}>
    <RechartsPrimitive.ResponsiveContainer>
      {children}
    </RechartsPrimitive.ResponsiveContainer>
  </ChartContext.Provider>
);

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = (props: any) => {
  const { active } = props;
  const payload = props.payload as any[];
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-2 py-1 text-xs shadow-xl">
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? index);
        return (
          <div key={key} className="flex justify-between gap-2">
            <span>{config[key]?.label ?? item.name}</span>
            <span className="font-mono">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
};
