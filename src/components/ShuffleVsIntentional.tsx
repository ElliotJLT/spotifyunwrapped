import { useMemo } from 'react';
import { Shuffle, ListMusic } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ShuffleStats } from '@/types/insights';

interface ShuffleVsIntentionalProps {
  stats: ShuffleStats[];
  overallPercent: number;
}

export function ShuffleVsIntentional({ stats, overallPercent }: ShuffleVsIntentionalProps) {
  const chartData = useMemo(() => {
    return stats.map((s) => ({
      year: s.year.toString(),
      shuffle: s.shufflePercent,
      intentional: 100 - s.shufflePercent,
    }));
  }, [stats]);

  const personality = useMemo(() => {
    if (overallPercent > 70) return { label: 'Shuffle Enthusiast', desc: 'You love surprises' };
    if (overallPercent > 40) return { label: 'Balanced Listener', desc: 'Mix of both styles' };
    return { label: 'Intentional Curator', desc: 'You choose every track' };
  }, [overallPercent]);

  const trend = useMemo(() => {
    if (stats.length < 2) return null;
    const first = stats[0].shufflePercent;
    const last = stats[stats.length - 1].shufflePercent;
    const diff = last - first;
    
    if (Math.abs(diff) < 10) return null;
    return diff > 0 ? 'more shuffle' : 'more intentional';
  }, [stats]);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-t border-border/50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Shuffle className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl text-foreground">Shuffle vs. Intentional</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Do you curate or let the algorithm decide?
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Stat */}
          <div className="lg:col-span-1 bg-card/50 border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <Shuffle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-display text-foreground">{overallPercent}%</p>
                <p className="text-sm text-muted-foreground">Shuffle</p>
              </div>
              <div className="text-2xl text-muted-foreground">/</div>
              <div className="text-center">
                <ListMusic className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
                <p className="text-3xl font-display text-foreground">{100 - overallPercent}%</p>
                <p className="text-sm text-muted-foreground">Intentional</p>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-border/30">
              <p className="text-foreground font-medium">{personality.label}</p>
              <p className="text-sm text-muted-foreground">{personality.desc}</p>
            </div>

            {trend && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                You've become {trend} over time
              </p>
            )}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 bg-card/30 border border-border/50 rounded-xl p-5">
            <h3 className="text-foreground font-medium mb-4">Year by Year</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="horizontal">
                  <XAxis 
                    dataKey="year" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === 'shuffle' ? 'Shuffle' : 'Intentional',
                    ]}
                  />
                  <Bar dataKey="shuffle" stackId="a" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                  <Bar dataKey="intentional" stackId="a" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--muted))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
