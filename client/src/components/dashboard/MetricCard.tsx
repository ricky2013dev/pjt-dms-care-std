import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  onClick?: () => void;
}

export function MetricCard({ title, value, icon: Icon, trend, onClick }: MetricCardProps) {
  return (
    <Card
      className={onClick ? "cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200" : ""}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 md:px-6 md:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="text-xl sm:text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}
