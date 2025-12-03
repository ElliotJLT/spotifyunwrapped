import { Clock, Users, Disc, Calendar, Music } from 'lucide-react';
import { formatNumber } from '@/lib/csvParser';

interface HeroStatsProps {
  totalHours: number;
  uniqueArtists: number;
  longestSession: number;
  totalTracks: number;
  averageDaily: number;
}

export function HeroStats({ totalHours, uniqueArtists, longestSession, totalTracks, averageDaily }: HeroStatsProps) {
  const stats = [
    {
      icon: Clock,
      value: formatNumber(totalHours),
      label: 'Hours Listened',
      suffix: 'hrs',
      color: 'text-primary',
    },
    {
      icon: Users,
      value: formatNumber(uniqueArtists),
      label: 'Unique Artists',
      suffix: '',
      color: 'text-accent',
    },
    {
      icon: Disc,
      value: formatNumber(totalTracks),
      label: 'Tracks Played',
      suffix: '',
      color: 'text-chart-3',
    },
    {
      icon: Music,
      value: formatNumber(longestSession),
      label: 'Longest Session',
      suffix: 'min',
      color: 'text-chart-4',
    },
    {
      icon: Calendar,
      value: formatNumber(averageDaily),
      label: 'Daily Average',
      suffix: 'min',
      color: 'text-chart-5',
    },
  ];

  return (
    <section className="section-padding">
      <div className="container-app">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-3">
            Your Year in Sound
          </h2>
          <p className="text-muted-foreground">
            A snapshot of your listening journey
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`
                card-elevated p-4 md:p-6 text-center animate-fade-up opacity-0
                stagger-${index + 1}
              `}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className={`text-2xl md:text-3xl font-display ${stat.color}`}>
                  {stat.value}
                  {stat.suffix && <span className="text-lg ml-1">{stat.suffix}</span>}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
