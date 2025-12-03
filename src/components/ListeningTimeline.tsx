import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySummary } from '@/types/spotify';
import { useMemo } from 'react';

interface ListeningTimelineProps {
  data: DailySummary[];
}

export function ListeningTimeline({ data }: ListeningTimelineProps) {
  const chartData = useMemo(() => {
    // Group by week for cleaner visualization
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const formatDate = (dateStr: string, showYear: boolean) => {
      const d = new Date(dateStr);
      if (showYear) {
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatFullDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    if (sorted.length <= 60) {
      return sorted.map(d => ({
        date: formatDate(d.date, false),
        fullDate: formatFullDate(d.date),
        minutes: Math.round(d.minutes_listened),
      }));
    }

    // Weekly aggregation for larger datasets - include year when it changes
    const weekly: { date: string; fullDate: string; minutes: number }[] = [];
    let weekMinutes = 0;
    let weekStartDate = '';
    let lastYear = -1;

    sorted.forEach((d, i) => {
      const currentYear = new Date(d.date).getFullYear();
      const yearChanged = lastYear !== -1 && currentYear !== lastYear;
      
      if (i % 7 === 0) {
        if (weekStartDate) {
          weekly.push({ 
            date: formatDate(weekStartDate, yearChanged || weekly.length % 12 === 0),
            fullDate: formatFullDate(weekStartDate),
            minutes: Math.round(weekMinutes / 7) 
          });
        }
        weekStartDate = d.date;
        weekMinutes = d.minutes_listened;
        lastYear = currentYear;
      } else {
        weekMinutes += d.minutes_listened;
      }
    });

    if (weekStartDate) {
      weekly.push({ 
        date: formatDate(weekStartDate, true),
        fullDate: formatFullDate(weekStartDate),
        minutes: Math.round(weekMinutes / 7) 
      });
    }

    return weekly;
  }, [data]);

  if (!data.length) return null;

  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
            Listening Timeline
          </h2>
          <p className="text-muted-foreground">
            Your daily listening patterns over time
          </p>
        </div>

        <div className="card-elevated p-6 animate-fade-up stagger-1">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
                formatter={(value: number) => [`${value} minutes`, 'Listened']}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#timelineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
