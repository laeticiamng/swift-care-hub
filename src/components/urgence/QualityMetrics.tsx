import { useI18n } from '@/i18n/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const DTAS_DATA = MONTHS.map((m, i) => ({ month: m, actual: 65 + Math.round(Math.random() * 15 + i * 0.5), benchmark: 75 }));
const FOUR_HOUR_DATA = MONTHS.map((m, i) => ({ month: m, actual: 70 + Math.round(Math.random() * 12 + i * 0.8), benchmark: 95 }));
const READMISSION_DATA = MONTHS.map((m) => ({ month: m, actual: Math.round(3 + Math.random() * 4), benchmark: 5 }));
const SATISFACTION_DATA = MONTHS.map((m, i) => ({ month: m, actual: 60 + Math.round(Math.random() * 10 + i * 1.2), benchmark: 80 }));

interface MetricConfig {
  key: string;
  data: typeof DTAS_DATA;
  color: string;
  unit: string;
  target: number;
  higherIsBetter: boolean;
}

export function QualityMetrics() {
  const { t } = useI18n();

  const metrics: MetricConfig[] = [
    { key: 'dtasRate', data: DTAS_DATA, color: '#f97316', unit: '%', target: 75, higherIsBetter: true },
    { key: 'fourHourTarget', data: FOUR_HOUR_DATA, color: '#3b82f6', unit: '%', target: 95, higherIsBetter: true },
    { key: 'readmission72h', data: READMISSION_DATA, color: '#ef4444', unit: '%', target: 5, higherIsBetter: false },
    { key: 'satisfaction', data: SATISFACTION_DATA, color: '#22c55e', unit: '%', target: 80, higherIsBetter: true },
  ];

  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      dtasRate: t.quality.dtasRate,
      fourHourTarget: t.quality.fourHourTarget,
      readmission72h: t.quality.readmission72h,
      satisfaction: t.quality.satisfaction,
    };
    return map[key] || key;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t.quality.title}
        </h2>
        <p className="text-xs text-muted-foreground">{t.quality.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const latest = metric.data[metric.data.length - 1];
          const prev = metric.data[metric.data.length - 2];
          const trending = metric.higherIsBetter
            ? latest.actual > prev.actual
            : latest.actual < prev.actual;

          return (
            <Card key={metric.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{getLabel(metric.key)}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs gap-1">
                      {trending ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {latest.actual}{metric.unit}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value: number, name: string) => [
                          `${value}${metric.unit}`,
                          name === 'actual' ? t.quality.actual : t.quality.benchmark,
                        ]}
                      />
                      <ReferenceLine y={metric.target} stroke="#9ca3af" strokeDasharray="6 3" label={{ value: t.quality.benchmark, fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke={metric.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: metric.color }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
