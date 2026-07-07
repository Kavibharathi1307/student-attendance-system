import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { BarChart3, CalendarDays, CircleCheckBig, UserRoundPlus, XCircle, QrCode, TrendingUp, Award, AlertTriangle, Activity, GraduationCap, Building2, Medal, UserCheck, School, Sparkles } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const C = {
  present: '#10B981', absent: '#EF4444', late: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6', teal: '#14B8A6',
  indigo: '#6366F1', cyan: '#06B6D4', emerald: '#10B981',
  deptColors: ['#3B82F6', '#8B5CF6', '#14B8A6', '#EC4899', '#F97316', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4', '#10B981']
};

const cardBase = 'rounded-[24px] border border-slate-200 bg-white/80 shadow-sm';
const chartOpts = {
  responsive: true, maintainAspectRatio: true,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } }
};
const barOpts = { ...chartOpts, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } }, x: { ticks: { font: { size: 10 } } } } };
const hBarOpts = { ...chartOpts, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } }, y: { ticks: { font: { size: 10 } } } } };
const lineOpts = {
  responsive: true, maintainAspectRatio: true,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } }, x: { ticks: { font: { size: 10 } } } }
};

const Skeleton = memo(({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
));

const StatCard = memo(({ icon: Icon, accent, label, value, badge }) => (
  <div className={`${cardBase} p-4 transition hover:shadow-md hover:-translate-y-0.5`}>
    <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accent} p-2.5 text-white shadow-sm`}>
      <Icon size={18} />
    </div>
    <div className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 flex items-baseline justify-between">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {badge != null && (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{badge}</span>
      )}
    </div>
  </div>
));

const ChartCard = memo(({ title, icon: Icon, children, className = '' }) => (
  <div className={`${cardBase} p-5 ${className}`}>
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-indigo-500" />}
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
));

const InsightBadge = memo(({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 px-4 py-2.5 shadow-sm">
    <div className={`rounded-xl p-2 ${color.bg}`}>
      <Icon size={16} className={color.text} />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
));

function LoadingState() {
  return (
    <section className="flex items-center justify-center min-h-[60vh]">
      <div className="loading-spinner">Loading analytics data...</div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center empty-state p-20">
      <BarChart3 size={72} className="text-slate-300" />
      <p className="empty-state-title mt-5 text-xl">No attendance data available</p>
      <p className="empty-state-text mt-2 max-w-md">No attendance records match the current filters. Try adjusting your filter criteria or date range.</p>
    </div>
  );
}

const StatusBadge = memo(({ status }) => {
  const styles = {
    Present: 'bg-emerald-100 text-emerald-700',
    Absent: 'bg-red-100 text-red-700',
    Late: 'bg-amber-100 text-amber-700'
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
});

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '', dateTo: '', department: '', facultyId: '', subject: ''
  });

  useEffect(() => {
    setLoading(true);
    const p = {};
    if (filters.dateFrom) p.dateFrom = filters.dateFrom;
    if (filters.dateTo) p.dateTo = filters.dateTo;
    if (filters.department) p.department = filters.department;
    if (filters.facultyId) p.facultyId = filters.facultyId;
    if (filters.subject) p.subject = filters.subject;
    api.get('/analytics', { params: p })
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ dateFrom: '', dateTo: '', department: '', facultyId: '', subject: '' });
  }, []);

  const hasFilters = filters.dateFrom || filters.dateTo || filters.department || filters.facultyId || filters.subject;

  const pieData = useMemo(() => stats && {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{ data: [stats.present.count, stats.absent.count, stats.late.count], backgroundColor: [C.present, C.absent, C.late], borderWidth: 0 }]
  }, [stats]);

  const deptBarData = useMemo(() => stats && {
    labels: stats.departmentWise.map(d => d.department),
    datasets: [
      { label: 'Present', data: stats.departmentWise.map(d => d.present), backgroundColor: C.present, borderRadius: 4 },
      { label: 'Absent', data: stats.departmentWise.map(d => d.absent), backgroundColor: C.absent, borderRadius: 4 },
      { label: 'Late', data: stats.departmentWise.map(d => d.late), backgroundColor: C.late, borderRadius: 4 }
    ]
  }, [stats]);

  const monthlyLineData = useMemo(() => stats && {
    labels: stats.monthly.map(m => m.month),
    datasets: [{
      label: 'Attendance Records', data: stats.monthly.map(m => m.total),
      borderColor: C.indigo, backgroundColor: 'rgba(99,102,241,0.08)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: C.indigo
    }]
  }, [stats]);

  const facultyBarData = useMemo(() => {
    if (!stats) return null;
    const sliced = stats.facultyPerformance?.length > 0 ? stats.facultyPerformance.slice(0, 15) : stats.facultyWise.slice(0, 15);
    const labels = sliced.map(f => f.facultyName?.length > 18 ? f.facultyName.slice(0, 16) + '...' : f.facultyName);
    const data = sliced.map(f => f.attendanceTaken || f.total);
    return { labels, datasets: [{ label: 'Records', data, backgroundColor: C.cyan, borderRadius: 6 }] };
  }, [stats]);

  if (loading) return <LoadingState />;
  if (!stats) return (
    <section className="flex items-center justify-center min-h-[60vh]">
      <div className="error-state p-10"><p className="error-state-title">Could not load analytics data.</p><p className="error-state-text">Check your connection and try again.</p></div>
    </section>
  );

  const isEmpty = stats.totalAttendance === 0;

  return (
    <section className="space-y-6">
      {/* Hero Header */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 p-6 text-white shadow-xl shadow-slate-950/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Analytics Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Performance Overview</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {stats.totalStudents} students &middot; {stats.totalFaculty} faculty &middot; {stats.totalAttendance} total records &middot; {stats.departmentsCount} departments
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      <div className={`${cardBase} p-4`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[130px]">
            <label className="form-label mb-1">From</label>
            <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} className="input-field" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="form-label mb-1">To</label>
            <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} className="input-field" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="form-label mb-1">Department</label>
            <select value={filters.department} onChange={e => handleFilterChange('department', e.target.value)} className="input-field">
              <option value="">All</option>
              {(stats.filterOptions?.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="form-label mb-1">Faculty</label>
            <select value={filters.facultyId} onChange={e => handleFilterChange('facultyId', e.target.value)} className="input-field">
              <option value="">All</option>
              {(stats.filterOptions?.facultyList || []).map(f => (
                <option key={f.id} value={f.id}>{f.fullName}{f.department ? ` (${f.department})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="form-label mb-1">Subject</label>
            <select value={filters.subject} onChange={e => handleFilterChange('subject', e.target.value)} className="input-field">
              <option value="">All</option>
              {(stats.filterOptions?.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={resetFilters} className="btn-ghost rounded-2xl px-4 py-2">Reset</button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} accent="from-cyan-500 to-teal-500" label="Total Students" value={stats.totalStudents} />
        <StatCard icon={UserRoundPlus} accent="from-violet-500 to-fuchsia-500" label="Total Faculty" value={stats.totalFaculty} />
        <StatCard icon={CalendarDays} accent="from-amber-500 to-orange-500" label="Attendance Records" value={stats.totalAttendance} />
        <StatCard icon={CircleCheckBig} accent="from-emerald-500 to-green-500" label="Overall Attendance %" value={`${stats.present.pct}%`} badge={`${stats.present.count} present`} />
        <StatCard icon={UserCheck} accent="from-green-400 to-emerald-600" label="Present Today" value={stats.presentToday} />
        <StatCard icon={XCircle} accent="from-red-400 to-rose-500" label="Absent Today" value={stats.absentToday || stats.absent.count} />
        <StatCard icon={QrCode} accent="from-indigo-500 to-purple-500" label="Active QR Sessions" value={stats.activeQrSessions} />
        <StatCard icon={Building2} accent="from-pink-500 to-rose-500" label="Departments" value={stats.departmentsCount} />
      </div>

      {isEmpty ? <EmptyState /> : (
        <>
          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Status Distribution" icon={CircleCheckBig}>
              <div className="mx-auto max-w-[220px]"><Pie data={pieData} options={chartOpts} /></div>
            </ChartCard>
            <ChartCard title="Attendance by Department" icon={Building2}>
              <Bar data={deptBarData} options={barOpts} />
            </ChartCard>
            <ChartCard title="Monthly Attendance Trend" icon={TrendingUp}>
              <Line data={monthlyLineData} options={lineOpts} />
            </ChartCard>
            <ChartCard title="Faculty-wise Attendance" icon={UserRoundPlus}>
              <Bar data={facultyBarData} options={hBarOpts} />
            </ChartCard>
          </div>

          {/* Content Panels: Recent Activity, Top Students, Faculty Performance */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className={`${cardBase} p-5`}>
              <div className="mb-4 flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Recent Activity</h3>
                <span className="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">Latest 10</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {stats.recentAttendance.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No recent records.</p>
                ) : stats.recentAttendance.map(r => (
                  <div key={r.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 transition hover:bg-slate-100/70">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{r.studentName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {r.registerNumber && <span className="font-mono">{r.registerNumber}</span>}
                        {r.registerNumber && r.subject && <span> &middot; </span>}
                        {r.subject && <span>{r.subject}</span>}
                        <span> &middot; {r.facultyName}</span>
                      </p>
                      <p className="text-xs text-slate-400">{r.attendanceDate}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Students Leaderboard */}
            <div className={`${cardBase} p-5`}>
              <div className="mb-4 flex items-center gap-2">
                <Medal size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Top Students</h3>
              </div>
              {stats.topStudents.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No data available.</p>
              ) : (
                <div className="space-y-1.5">
                  {stats.topStudents.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 transition hover:bg-slate-100/70">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{s.fullName}</p>
                        <p className="truncate text-xs text-slate-500">
                          <span className="font-mono">{s.registerNumber || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-600">{s.attendancePct}%</p>
                        <p className="text-xs text-slate-400">{s.presentCount}/{s.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Faculty Performance */}
            <div className={`${cardBase} p-5`}>
              <div className="mb-4 flex items-center gap-2">
                <School size={16} className="text-cyan-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Faculty Performance</h3>
              </div>
              {stats.facultyPerformance.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No data available.</p>
              ) : (
                <div className="space-y-1.5">
                  {stats.facultyPerformance.map(f => (
                    <div key={f.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 transition hover:bg-slate-100/70">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{f.facultyName}</p>
                        <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700">{f.department}</span>
                      </div>
                      <div className="mt-1.5 flex gap-4 text-xs text-slate-500">
                        <span><span className="font-semibold text-slate-700">{f.subjects}</span> subjects</span>
                        <span><span className="font-semibold text-slate-700">{f.attendanceTaken}</span> records</span>
                        <span><span className="font-semibold text-slate-700">{f.studentsCovered}</span> students</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Department Stats */}
          {stats.departmentStats.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Department Statistics</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stats.departmentStats.map(d => (
                  <div key={d.department} className={`${cardBase} p-4 transition hover:shadow-md`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{d.department}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        d.attendancePct >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        d.attendancePct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>{d.attendancePct}%</span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-slate-400" />
                        <span>{d.studentCount} students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserRoundPlus size={14} className="text-slate-400" />
                        <span>{d.facultyCount} faculty</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all ${
                        d.attendancePct >= 80 ? 'bg-emerald-500' :
                        d.attendancePct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${d.attendancePct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights Bar */}
          <div className={`${cardBase} p-5`}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Attendance Insights</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InsightBadge icon={TrendingUp} label="Best Department" value={`${stats.insights.bestDepartment.name} (${stats.insights.bestDepartment.pct}%)`} color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} />
              <InsightBadge icon={AlertTriangle} label="Lowest Dept" value={`${stats.insights.worstDepartment.name} (${stats.insights.worstDepartment.pct}%)`} color={{ bg: 'bg-red-50', text: 'text-red-600' }} />
              <InsightBadge icon={Award} label="Most Active Faculty" value={stats.insights.mostActiveFaculty.name} color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} />
              <InsightBadge icon={Medal} label="Most Regular Student" value={`${stats.insights.mostRegularStudent.name} (${stats.insights.mostRegularStudent.pct}%)`} color={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
              <InsightBadge icon={CalendarDays} label="Attendance Today" value={stats.attendanceToday} color={{ bg: 'bg-cyan-50', text: 'text-cyan-600' }} />
              <InsightBadge icon={QrCode} label="QR Sessions Today" value={stats.qrSessionsToday} color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} />
              <InsightBadge icon={CircleCheckBig} label="Overall Attendance" value={`${stats.insights.totalAttendancePct}%`} color={{ bg: 'bg-teal-50', text: 'text-teal-600' }} />
              <InsightBadge icon={Activity} label="Avg per Day" value={stats.insights.avgAttendancePerDay} color={{ bg: 'bg-slate-50', text: 'text-slate-600' }} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
