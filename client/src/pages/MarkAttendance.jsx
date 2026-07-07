import { useEffect, useState } from 'react';
import { BookOpenCheck, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createAttendance, listStudents, listFaculty } from '../services/attendanceApi.js';

export default function MarkAttendance() {
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [subject, setSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [status, setStatus] = useState('Present');
  const [remarks, setRemarks] = useState('');
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    listStudents({}).then((r) => setStudents(r.data || [])).catch(() => {});
    listFaculty({}).then((r) => setFaculties(r.data || [])).catch(() => {});
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    createAttendance({ studentId, facultyId, subject, attendanceDate, status, remarks })
      .then(() => {
        alert('Attendance recorded');
        navigate('/admin/attendance');
      })
      .catch((err) => alert(err?.response?.data?.message || 'Failed'));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Attendance</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Mark Attendance</h2>
        <p className="mt-1 text-sm text-slate-500">Capture a new attendance entry with consistent, polished form controls.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-teal-50/70 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-700">New attendance entry</p>
            <p className="text-sm text-slate-600">Capture attendance details without leaving the dashboard workflow.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100">
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.userId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Faculty</label>
            <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100">
              <option value="">Select faculty</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100">
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows="4" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            Save attendance
          </button>
        </div>
      </form>
    </div>
  );
}
