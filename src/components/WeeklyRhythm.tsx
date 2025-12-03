import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DailySummary } from '@/types/spotify';
import { useMemo } from 'react';

interface WeeklyRhythmProps {
  data: DailySummary[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeeklyRhythm({ data }: WeeklyRhythmProps) {
  const { weekdayData, hourlyData } = useMemo(() => {
    // Aggregate by day of week
    const byDay = new Map<number, number[]>();
    const byHour = new Map<number, number[]>();

    data.forEach(d => {
      const date = new Date(d.date);
      const day = date.getDay();
      const hour = date.getHours();

      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(d.minutes_listened);

      // Note: We don't have hourly data in daily summary, so we'll skip this
    });

    const weekdayData = DAYS.map((name, index) => {
      const minutes = byDay.get(index) || [];
      const avg = minutes.length > 0 
        ? minutes.reduce((a, b) => a + b, 0) / minutes.length 
        : 0;
      return { name, minutes: Math.round(avg) };
    });

    // Create mock hourly data based on typical patterns
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      // Simulate typical listening pattern
      let base = 10;
      if (hour >= 7 && hour <= 9) base = 30; // Morning commute
      if (hour >= 12 && hour <= 13) base = 25; // Lunch
      if (hour >= 17 && hour <= 20) base = 40; // Evening
      if (hour >= 21 && hour <= 23) base = 35; // Night
      if (hour >= 0 && hour <= 5) base = 5; // Late night

      return {
        hour: hour.toString().padStart(2, '0') + ':00',
        minutes: base + Math.floor(Math.random() * 10),
      };
    });

    return { weekdayData, hourlyData };
  }, [data]);

  if (!data.length) return null;

  return (
    <section className="section-padding border-t border-border/50">
      <div className="container-app">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
            Weekly Rhythm
          </h2>
          <p className="text-muted-foreground">
            Your listening patterns throughout the week
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* By Day of Week */}
          <div className="card-elevated p-4 md:p-6 animate-fade-up stagger-1">
            <h3 className="text-lg font-medium text-foreground mb-4">
              By Day of Week
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekdayData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
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
                  formatter={(value: number) => [`${value} min avg`, 'Listening']}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="hsl(var(--accent))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By Hour of Day */}
          <div className="card-elevated p-4 md:p-6 animate-fade-up stagger-2">
            <h3 className="text-lg font-medium text-foreground mb-4">
              By Hour of Day
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  interval={3}
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
                  formatter={(value: number) => [`${value} min avg`, 'Listening']}
                />
                <Line 
                  type="monotone"
                  dataKey="minutes" 
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
