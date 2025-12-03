import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TopArtist } from '@/types/spotify';
import { useMemo } from 'react';

interface ArtistLoyaltyProps {
  artists: TopArtist[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ArtistLoyalty({ artists }: ArtistLoyaltyProps) {
  const chartData = useMemo(() => {
    return [...artists]
      .sort((a, b) => b.total_minutes - a.total_minutes)
      .slice(0, 10)
      .map(a => ({
        name: a.artist.length > 15 ? a.artist.substring(0, 15) + '...' : a.artist,
        fullName: a.artist,
        hours: Math.round(a.total_minutes / 60),
        plays: a.play_count || 0,
      }));
  }, [artists]);

  if (!chartData.length) return null;

  return (
    <section className="section-padding border-t border-border/50">
      <div className="container-app">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
            Artist Loyalty
          </h2>
          <p className="text-muted-foreground">
            The artists you kept coming back to
          </p>
        </div>

        <div className="card-elevated p-4 md:p-6 animate-fade-up stagger-1">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <XAxis 
                type="number" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v) => `${v}h`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                formatter={(value: number, name: string, props: { payload: { plays: number } }) => {
                  const plays = props.payload.plays;
                  return [
                    <span key="value">
                      {value} hours{plays > 0 ? ` • ${plays} plays` : ''}
                    </span>,
                    'Listened',
                  ];
                }}
                labelFormatter={(label: string, payload: Array<{ payload: { fullName: string } }>) => 
                  payload[0]?.payload.fullName || label
                }
              />
              <Bar 
                dataKey="hours" 
                radius={[0, 8, 8, 0]}
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={1 - (index * 0.06)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
