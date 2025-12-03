import { Session } from '@/types/spotify';
import { useMemo } from 'react';
import { formatDuration, formatNumber } from '@/lib/csvParser';
import { Timer, Zap, TrendingUp, Calendar } from 'lucide-react';

interface SessionInsightsProps {
  sessions: Session[];
}

export function SessionInsights({ sessions }: SessionInsightsProps) {
  const stats = useMemo(() => {
    if (!sessions.length) return null;

    const durations = sessions.map(s => s.duration_minutes).filter(d => d > 0);
    const longest = Math.max(...durations);
    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const total = sessions.length;

    // Sessions per week (rough estimate)
    const sessionsPerWeek = total / 52;

    // Top 5 longest sessions
    const topSessions = [...sessions]
      .sort((a, b) => b.duration_minutes - a.duration_minutes)
      .slice(0, 5);

    return { longest, average, total, sessionsPerWeek, topSessions };
  }, [sessions]);

  if (!stats) return null;

  const statCards = [
    {
      icon: Zap,
      value: formatDuration(stats.longest),
      label: 'Longest Session',
      color: 'text-primary',
    },
    {
      icon: Timer,
      value: formatDuration(stats.average),
      label: 'Average Session',
      color: 'text-accent',
    },
    {
      icon: Calendar,
      value: formatNumber(stats.total),
      label: 'Total Sessions',
      color: 'text-chart-3',
    },
    {
      icon: TrendingUp,
      value: stats.sessionsPerWeek.toFixed(1),
      label: 'Sessions/Week',
      color: 'text-chart-4',
    },
  ];

  return (
    <section className="section-padding border-t border-border/50">
      <div className="container-app">
        <div className="mb-8 animate-fade-up">
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
            Listening Sessions
          </h2>
          <p className="text-muted-foreground">
            Your deep dive listening habits
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className={`card-elevated p-4 md:p-5 animate-fade-up opacity-0 stagger-${index + 1}`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className={`text-xl md:text-2xl font-display ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="card-elevated p-4 md:p-6 animate-fade-up stagger-5">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Marathon Sessions
          </h3>
          <div className="space-y-3">
            {stats.topSessions.map((session, index) => (
              <div
                key={session.session_id || index}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">
                      {session.start_time ? new Date(session.start_time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'Session'}
                    </p>
                    {session.tracks_count && (
                      <p className="text-xs text-muted-foreground">
                        {session.tracks_count} tracks
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-primary font-medium">
                  {formatDuration(session.duration_minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
