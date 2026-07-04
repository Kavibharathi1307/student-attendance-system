import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Filter, Search, Sheet, Sparkles } from 'lucide-react';
import { getAttendanceReport, exportReportPdf, exportReportExcel } from '../services/reportApi.js';
import { listFaculty, listStudents } from '../services/attendanceApi.js';

const statusOptions = ['', 'Present', 'Absent', 'Late'];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [department, setDepartment] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [student, setStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({ dateFrom, dateTo, department, facultyId, student, subject, status }),
    [dateFrom, dateTo, department, facultyId, student, subject, status]
  );

  const departments = useMemo(
    () => Array.from(new Set((faculties || []).map((faculty) => faculty.department).filter(Boolean))).sort(),
    [faculties]
  );

  useEffect(() => {
    void initializeReports();
  }, []);

  async function initializeReports() {
    setLoading(true);
    setError('');

    try {
      const [facultyRes, studentRes] = await Promise.all([
        listFaculty({ perPage: 100 }),
        listStudents({ perPage: 100 })
      ]);

      setFaculties(facultyRes.data || []);
      setStudents(studentRes.data || []);
      await loadReport(filters);
    } catch {
      setError('Unable to load report filters and data.');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function loadReport(params = filters) {
    setLoading(true);
    setError('');
    try {
      const res = await getAttendanceReport(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      setError('Could not load report.');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  async function resetFilters() {
    const clearedFilters = {
      dateFrom: '',
      dateTo: '',
      department: '',
      facultyId: '',
      student: '',
      subject: '',
      status: ''
    };

    setDateFrom('');
    setDateTo('');
    setDepartment('');
    setFacultyId('');
    setStudent('');
    setSubject('');
    setStatus('');

    await loadReport(clearedFilters);
  }

  async function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleExportPdf() {
    setLoading(true);
    try {
      const blobData = await exportReportPdf(filters);
      download(blobData, 'attendance-report.pdf');
    } catch {
      setError('PDF export failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportExcel() {
    setLoading(true);
    try {
      const blobData = await exportReportExcel(filters);
      download(blobData, 'attendance-report.xlsx');
    } catch {
      setError('Excel export failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Reports</p>
          <h2 className="text-2xl font-semibold text-slate-900">Attendance Report Center</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          {total} records available
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Filter size={16} />
          <span>Refine by schedule, department, faculty, student, or status</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white">
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-teal-500 focus-within:bg-white">
                <Search size={16} className="mr-2 text-slate-400" />
                <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Name or ID" className="w-full border-0 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Attendance Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white">
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option || 'Any Status'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
              <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-white">
                <option value="">Any Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-teal-500 focus-within:bg-white">
                <Search size={16} className="mr-2 text-slate-400" />
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Search subject" className="w-full border-0 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={() => void loadReport(filters)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20">Apply Filters</button>
              <button type="button" onClick={() => void resetFilters()} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Sparkles size={16} className="text-teal-600" />
          Export your filtered attendance data instantly
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={loading} onClick={() => void handleExportPdf()} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70">
            <FileText size={16} /> PDF
          </button>
          <button disabled={loading} onClick={() => void handleExportExcel()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70">
            <Sheet size={16} /> Excel
          </button>
        </div>
      </div>

      {error && <div className="my-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/80 p-8 text-center text-slate-600 shadow-sm">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <div>Loading report…</div>
        </div>
      ) : data.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 shadow-sm">No attendance records found. Try different filters.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 shadow-sm">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Faculty</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t bg-white/60 hover:bg-slate-50">
                  <td className="px-4 py-3">{row.attendanceDate}</td>
                  <td className="px-4 py-3">{row.studentName} ({row.studentId})</td>
                  <td className="px-4 py-3">{row.facultyDepartment || 'N/A'}</td>
                  <td className="px-4 py-3">{row.facultyName}</td>
                  <td className="px-4 py-3">{row.subject}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{row.status}</span></td>
                  <td className="px-4 py-3">{row.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
