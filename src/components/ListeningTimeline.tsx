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
    
    if (sorted.length <= 60) {
      return sorted.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: Math.round(d.minutes_listened),
      }));
    }

    // Weekly aggregation for larger datasets
    const weekly: { date: string; minutes: number }[] = [];
    let weekMinutes = 0;
    let weekStart = '';

    sorted.forEach((d, i) => {
      if (i % 7 === 0) {
        if (weekStart) {
          weekly.push({ date: weekStart, minutes: Math.round(weekMinutes / 7) });
        }
        weekStart = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weekMinutes = d.minutes_listened;
      } else {
        weekMinutes += d.minutes_listened;
      }
    });

    if (weekStart) {
      weekly.push({ date: weekStart, minutes: Math.round(weekMinutes / 7) });
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
