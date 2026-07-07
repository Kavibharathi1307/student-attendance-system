import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpenCheck, Save } from 'lucide-react';
import { getAttendance, updateAttendance, listStudents, listFaculty } from '../services/attendanceApi.js';

export default function EditAttendance() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAttendance(id).then((r) => setRecord(r.attendance)).catch(() => alert('Failed'));
    listStudents({}).then((r) => setStudents(r.data || [])).catch(() => {});
    listFaculty({}).then((r) => setFaculties(r.data || [])).catch(() => {});
  }, [id]);

  function handleSubmit(e) {
    e.preventDefault();
    updateAttendance(id, record)
      .then(() => {
        alert('Updated');
        navigate('/admin/attendance');
      })
      .catch((err) => alert(err?.response?.data?.message || 'Failed'));
  }

  if (!record) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-cyan-600">Edit record</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Update attendance details</h2>
        <p className="mt-1 text-sm text-slate-500">Adjust the selected attendance record and save the changes.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-cyan-50/70 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600/10 text-cyan-600">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-700">Attendance update</p>
            <p className="text-sm text-slate-600">Keep student attendance records accurate and up to date.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Student</label>
            <select value={record.studentId} onChange={(e) => setRecord({ ...record, studentId: Number(e.target.value) })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100">
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
            <select value={record.facultyId} onChange={(e) => setRecord({ ...record, facultyId: Number(e.target.value) })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100">
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
            <input value={record.subject} onChange={(e) => setRecord({ ...record, subject: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
            <input type="date" value={record.attendanceDate} onChange={(e) => setRecord({ ...record, attendanceDate: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select value={record.status} onChange={(e) => setRecord({ ...record, status: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100">
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
            <textarea value={record.remarks || ''} onChange={(e) => setRecord({ ...record, remarks: e.target.value })} rows="4" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
