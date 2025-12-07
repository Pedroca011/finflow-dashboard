import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "text" | "avatar";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        {
          "h-4 w-full": variant === "text",
          "h-32 w-full rounded-xl": variant === "card",
          "h-10 w-10 rounded-full": variant === "avatar",
        },
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
