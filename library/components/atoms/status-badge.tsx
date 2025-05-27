// src/components/atoms/StatusBadge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/library/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        positive: "bg-green-100 text-green-800",
        negative: "bg-red-100 text-red-800",
        warning: "bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  value: number;
}

export function StatusBadge({ className, variant, value, ...props }: StatusBadgeProps) {
  // Determine if positive, negative, or neutral
  const displayVariant = 
    value > 0 ? "positive" : 
    value < 0 ? "negative" : 
    "outline";
  
  // Format the value with + or - sign
  const formattedValue = value > 0 
    ? `+${value}%` 
    : value < 0 
    ? `${value}%` 
    : "0%";

  return (
    <div
      className={cn(badgeVariants({ variant: variant || displayVariant }), className)}
      {...props}
    >
      {formattedValue}
    </div>
  );
}