import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'wouter';

interface TrendsChartProps {
  monthlyData: Array<{ period: string; count: number }>;
  weeklyData: Array<{ period: string; count: number }>;
}

export function TrendsChart({ monthlyData, weeklyData }: TrendsChartProps) {
  const [viewType, setViewType] = useState<'monthly' | 'weekly'>('monthly');
  const trendData = viewType === 'monthly' ? monthlyData : weeklyData;
  const [, setLocation] = useLocation();

  // Helper to get date range from period string
  const getDateRangeFromPeriod = (period: string, type: 'monthly' | 'weekly'): { from: string; to: string } => {
    if (type === 'monthly') {
      // Format: "2024-12" -> from: 2024-12-01, to: 2024-12-31
      const [year, month] = period.split('-');
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      return {
        from: `${year}-${month}-01`,
        to: `${year}-${month}-${lastDay.toString().padStart(2, '0')}`
      };
    } else {
      // Format: "2024-W51" -> calculate week start and end
      const [year, week] = period.split('-W');
      const jan1 = new Date(parseInt(year), 0, 1);
      const daysOffset = (parseInt(week) - 1) * 7;
      const weekStart = new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      return {
        from: weekStart.toISOString().split('T')[0],
        to: weekEnd.toISOString().split('T')[0]
      };
    }
  };

  const handlePeriodClick = (data: any) => {
    console.log('Chart clicked:', data);
    // Recharts onClick provides data in activePayload or activeLabel
    if (data && data.activePayload && data.activePayload.length > 0) {
      const period = data.activePayload[0].payload.period;
      if (period) {
        const { from, to } = getDateRangeFromPeriod(period, viewType);
        setLocation(`/students?registrationDateFrom=${from}&registrationDateTo=${to}`);
      }
    } else if (data && data.activeLabel) {
      // Sometimes the period is in activeLabel
      const { from, to } = getDateRangeFromPeriod(data.activeLabel, viewType);
      setLocation(`/students?registrationDateFrom=${from}&registrationDateTo=${to}`);
    }
  };

  if (!trendData || trendData.length === 0) {
    return (
      <div className="h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  const chartConfig = {
    count: {
      label: "Students",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="flex justify-end">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'monthly' | 'weekly')}>
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-2">
            <TabsTrigger value="monthly" className="text-xs sm:text-sm px-2 sm:px-3">Monthly</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs sm:text-sm px-2 sm:px-3">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] md:h-[300px]">
        <AreaChart data={trendData} onClick={handlePeriodClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={50}
            tick={{ fontSize: 8 }}
            className="sm:text-[9px] md:text-xs"
          />
          <YAxis tick={{ fontSize: 8 }} className="sm:text-[9px] md:text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            fill="var(--color-count)"
            fillOpacity={0.2}
            strokeWidth={2}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
