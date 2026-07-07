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
      <div className="page-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="page-header-subtitle">Reports</p>
          <h2 className="page-header-title">Attendance Report Center</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          {total} records available
        </div>
      </div>

      <div className="section-card p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Filter size={16} />
          <span>Refine by schedule, department, faculty, student, or status</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="form-label">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-500 focus:bg-white" />
            </div>
            <div>
              <label className="form-label">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-500 focus:bg-white">
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Student</label>
              <div className="input-group mt-2">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Name or ID" className="input-field" />
              </div>
            </div>
            <div>
              <label className="form-label">Attendance Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-500 focus:bg-white">
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option || 'Any Status'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-500 focus:bg-white" />
            </div>
            <div>
              <label className="form-label">Faculty</label>
              <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-500 focus:bg-white">
                <option value="">Any Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Subject</label>
              <div className="input-group mt-2">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Search subject" className="input-field" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={() => void loadReport(filters)} className="btn btn-primary">Apply Filters</button>
              <button type="button" onClick={() => void resetFilters()} className="btn-ghost rounded-2xl px-4 py-2.5">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Sparkles size={16} className="text-teal-600" />
          Export your filtered attendance data instantly
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={loading} onClick={() => void handleExportPdf()} className="btn gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
            <FileText size={16} /> PDF
          </button>
          <button disabled={loading} onClick={() => void handleExportExcel()} className="btn-ghost gap-2 rounded-2xl px-4 py-2">
            <Sheet size={16} /> Excel
          </button>
        </div>
      </div>

      {error && <div className="error-state my-4 flex-row justify-start px-4 py-3"><p className="error-state-text">{error}</p></div>}

      {loading ? (
        <div className="loading-spinner mt-6">Loading report...</div>
      ) : data.length === 0 ? (
        <div className="empty-state mt-6"><p className="empty-state-title">No records found</p><p className="empty-state-text">No attendance records match the current filters.</p></div>
      ) : (
        <div className="mt-6 table-wrap">
          <table className="table-base">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Faculty</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const badgeClass = row.status === 'Present' ? 'badge badge-present' : row.status === 'Late' ? 'badge badge-late' : row.status === 'Absent' ? 'badge badge-absent' : 'badge';
                return (
                  <tr key={row.id} className="border-t border-slate-100 bg-white transition-all duration-200 hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 text-slate-600">{row.attendanceDate}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{row.studentName} <span className="text-slate-400">({row.studentId})</span></td>
                    <td className="px-4 py-3.5 text-slate-600">{row.facultyDepartment || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.facultyName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.subject}</td>
                    <td className="px-4 py-3.5"><span className={badgeClass}>{row.status}</span></td>
                    <td className="px-4 py-3.5 text-slate-400">{row.remarks || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
