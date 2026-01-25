import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export function StorageUsageIndicator() {
  const { data: storageInfo, isLoading } = trpc.storage.getUsage.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 30000,
    }
  );

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (!storageInfo) return null;

  const usedGB = (storageInfo.usedBytes / (1024 ** 3)).toFixed(2);
  const totalGB = (storageInfo.quotaBytes / (1024 ** 3)).toFixed(2);
  const percentUsed = (storageInfo.usedBytes / storageInfo.quotaBytes) * 100;
  const isNearLimit = percentUsed > 80;

  return (
    <Card className={`${isNearLimit ? 'border-orange-500' : ''}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Storage</span>
          {isNearLimit && (
            <AlertTriangle className="w-4 h-4 text-orange-500 ml-auto" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usedGB} GB used</span>
            <span>{totalGB} GB total</span>
          </div>
          <Progress 
            value={percentUsed} 
            className="h-2"
            indicatorClassName={isNearLimit ? 'bg-orange-500' : ''}
          />
          {isNearLimit && (
            <p className="text-xs text-orange-600 mt-1">
              Approaching storage limit. Consider upgrading your plan.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
