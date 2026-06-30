import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Globe, 
  Clock, 
  Activity,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SupabaseService } from '../../services/supabase.service';
import { VisitorLog, ChartDataPoint, AnalyticsMetrics } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Period = '7' | '30' | '90';
type SortField = 'date' | 'country' | 'city' | 'page' | 'duration';
type SortOrder = 'asc' | 'desc';

export function Analytics() {
  const [period, setPeriod] = useState<Period>('7');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Table state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [chart, metricsData, logsData] = await Promise.all([
        SupabaseService.getAnalyticsChart(period),
        SupabaseService.getAnalyticsMetrics(),
        SupabaseService.getVisitorLogs()
      ]);
      setChartData(chart);
      setMetrics(metricsData);
      setLogs(logsData);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const sortedLogs = [...logs].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'duration') {
      comparison = a.duration - b.duration;
    } else {
      comparison = a[sortField].localeCompare(b[sortField]);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2)
      return '🌍';
    return countryCode
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4 opacity-80" />
        <h3 className="font-space text-xl font-bold mb-2">Impossible de charger les analytics</h3>
        <p className="text-text-muted">Vérifiez votre connexion Supabase ou réessayez plus tard.</p>
        <button 
          onClick={loadData}
          className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const CustomTooltip = (context: any) => {
    const { chart, tooltip } = context;

    // Créer ou récupérer le div tooltip
    let tooltipEl = chart.canvas.parentNode.querySelector('#chartjs-tooltip');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.style.cssText = `
        background: #141B22;
        border: 1px solid rgba(139,148,163,0.3);
        border-radius: 8px;
        padding: 8px 12px;
        position: absolute;
        pointer-events: none;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: #EDEFF2;
        transition: all 0.1s ease;
      `;
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    const dataPoint = tooltip.dataPoints?.[0];
    if (dataPoint) {
      tooltipEl.innerHTML = `
        <div style="color:#8B94A3;margin-bottom:2px">
          ${dataPoint.label}
        </div>
        <div style="color:#2DD4BF;font-weight:bold">
          ${dataPoint.raw} vues
        </div>
      `;
    }

    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = tooltip.caretX + 'px';
    tooltipEl.style.top = tooltip.caretY + 'px';
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-space text-2xl font-bold text-text-primary mb-2">Analytics</h2>
          <p className="text-text-muted">Suivez la fréquentation de votre portfolio.</p>
        </div>

        <div className="flex bg-[var(--bg-card)] border border-white/10 rounded-lg p-1 font-mono">
          {(['7', '30', '90'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                period === p 
                  ? 'bg-accent-cyan/10 text-accent-cyan font-bold' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {p} Jours
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-80 bg-bg-card border border-white/5 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-bg-card border border-white/5 rounded-xl animate-pulse" />)}
          </div>
          <div className="bg-bg-card border border-white/5 rounded-xl p-6">
            <div className="h-8 w-1/4 bg-white/5 rounded mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
            </div>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-card border border-white/5 rounded-xl">
          <BarChart2 size={48} className="text-text-muted mb-4 opacity-50" />
          <p className="text-lg text-text-primary font-medium mb-1">Aucune donnée encore</p>
          <p className="text-text-muted">Les statistiques apparaîtront après les premières visites.</p>
        </div>
      ) : (
        <>
          {/* Main Chart */}
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-6">
            <h3 className="font-space text-lg font-bold mb-6">Évolution des visites</h3>
            <div className="h-[300px] w-full">
              <Line 
                data={{
                  labels: chartData.map(d => d.date),
                  datasets: [{
                    data: chartData.map(d => d.views),
                    borderColor: '#2DD4BF',
                    backgroundColor: 'rgba(45, 212, 191, 0.1)',
                    tension: 0.4,
                    pointBackgroundColor: '#2DD4BF',
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      enabled: false,
                      external: CustomTooltip
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: '#9BA4B5',
                        font: { family: 'JetBrains Mono' }
                      },
                      grid: { color: 'rgba(139, 148, 163, 0.2)' }
                    },
                    y: {
                      ticks: { color: '#9BA4B5' },
                      grid: { color: 'rgba(139, 148, 163, 0.2)' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Secondary Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-text-muted mb-4">
                  <Activity size={18} />
                  <span className="font-medium">Page la plus visitée</span>
                </div>
                <div>
                  <div className="font-space text-2xl font-bold text-text-primary">{metrics.topPage}</div>
                </div>
              </div>
              <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-text-muted mb-4">
                  <Globe size={18} />
                  <span className="font-medium">Pays #1</span>
                </div>
                <div>
                  <div className="font-space text-2xl font-bold text-text-primary">{metrics.topCountry}</div>
                </div>
              </div>
              <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-text-muted mb-4">
                  <Clock size={18} />
                  <span className="font-medium">Durée moy. session</span>
                </div>
                <div>
                  <div className="font-space text-2xl font-bold text-text-primary">{formatDuration(metrics.avgDuration)}</div>
                </div>
              </div>
              <div className="bg-bg-card border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-text-muted mb-4">
                  <BarChart2 size={18} />
                  <span className="font-medium">Taux de rebond</span>
                </div>
                <div className="flex items-end gap-3">
                  <div className="font-space text-2xl font-bold text-text-primary">{metrics.bounceRate}%</div>
                  {metrics.bounceRate < 50 ? (
                    <span className="flex items-center text-sm font-medium text-accent-cyan mb-1">
                      <ArrowDown size={14} className="mr-1" /> Bon
                    </span>
                  ) : (
                    <span className="flex items-center text-sm font-medium text-red-400 mb-1">
                      <ArrowUp size={14} className="mr-1" /> Élevé
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-space text-lg font-bold">Logs Visiteurs</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-text-muted text-sm border-b border-white/10">
                    <th className="font-medium py-3 px-6 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onClick={() => handleSort('date')}>
                      <div className="flex items-center">
                        <span className="font-mono">Date/Heure</span>
                        <ArrowUpDown size={14} className="ml-2 opacity-50" />
                      </div>
                    </th>
                    <th className="font-medium py-3 px-6 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onClick={() => handleSort('country')}>
                      <div className="flex items-center">
                        Pays
                        <ArrowUpDown size={14} className="ml-2 opacity-50" />
                      </div>
                    </th>
                    <th className="font-medium py-3 px-6 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onClick={() => handleSort('city')}>
                      <div className="flex items-center">
                        Ville
                        <ArrowUpDown size={14} className="ml-2 opacity-50" />
                      </div>
                    </th>
                    <th className="font-medium py-3 px-6 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onClick={() => handleSort('page')}>
                      <div className="flex items-center">
                        Page visitée
                        <ArrowUpDown size={14} className="ml-2 opacity-50" />
                      </div>
                    </th>
                    <th className="font-medium py-3 px-6 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap" onClick={() => handleSort('duration')}>
                      <div className="flex items-center">
                        Durée
                        <ArrowUpDown size={14} className="ml-2 opacity-50" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6 font-mono text-text-muted whitespace-nowrap">
                        {new Date(log.date).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="mr-2">
                          {getFlagEmoji(log.countryCode)}
                        </span>
                        <span className="font-[Inter] text-[var(--text-primary)]">
                          {log.country || 'Inconnu'}
                        </span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap text-[var(--text-muted)] font-[Inter]">
                        {log.city || '—'}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="px-2 py-1 bg-white/5 rounded font-mono text-xs text-text-primary">{log.page}</span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap text-text-muted">{formatDuration(log.duration)}</td>
                    </tr>
                  ))}
                  {paginatedLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted">
                        Aucun log disponible pour cette période.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm">
                <span className="text-text-muted">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, sortedLogs.length)} sur {sortedLogs.length}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-mono px-2 text-text-muted">{currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
