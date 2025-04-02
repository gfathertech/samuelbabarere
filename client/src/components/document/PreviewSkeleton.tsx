import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-[100px]" />
        <Skeleton className="h-9 w-[100px]" />
      </div>
    </div>
  );
}
