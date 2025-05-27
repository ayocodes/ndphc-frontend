// src/components/molecules/MetricCard.tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/library/components/atoms/card";
import { StatusBadge } from "../atoms/status-badge";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  percentageChange?: number;
  icon?: React.ReactNode;
  colorClass?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  percentageChange,
  icon,
  colorClass = "text-blue-500",
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-gray-100 py-2 pb-4">
      <CardHeader className="bg-white py-2 px-3 pb-0 flex flex-col items-center justify-center relative min-h-[40px]">
        {/* Icon in top-right */}
        {icon && (
          <div className="absolute right-3 text-gray-400">{icon}</div>
        )}
        <CardTitle className="text-xs font-medium text-gray-500 pl-0 pr-6 w-full whitespace-normal break-words leading-tight min-h-[32px] flex items-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 pb-0 px-3">
        <div className="flex flex-col items-start w-full">
          <div className="flex items-baseline w-full">
            <span className={`text-2xl font-bold ${colorClass}`}>{new Intl.NumberFormat().format(value)}</span>
            <span className="ml-1 text-xs text-gray-500">({unit})</span>
          </div>
          {percentageChange != null && (
            <div className="mt-3 flex items-center w-full">
              <StatusBadge value={percentageChange} />
              <span className="ml-2 text-[10px] text-gray-500">from yesterday</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
