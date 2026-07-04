import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import StudentTable from '../components/StudentTable.jsx';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';
import { deleteStudent, listStudents } from '../services/studentService.js';

function StudentListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState(location.state?.message || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const perPage = 10;

  useEffect(() => {
    loadStudents();
  }, [query, department, status, page]);

  async function loadStudents() {
    setLoading(true);
    try {
      const payload = await listStudents({ q: query, department, status, page });
      setStudents(payload.data || []);
      setTotal(payload.total || 0);
    } catch (error) {
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const departments = useMemo(() => Array.from(new Set(students.map((s) => s.department).filter(Boolean))), [students]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function handleDelete(student) {
    setSelectedStudent(student);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedStudent) return;
    try {
      await deleteStudent(selectedStudent.id);
      setMessage('Student deleted successfully.');
      setConfirmOpen(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (error) {
      setMessage('Unable to delete the selected student.');
      setConfirmOpen(false);
      setSelectedStudent(null);
    }
  }

  function handleView(student) {
    navigate(`/admin/students/${student.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Students</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Student Management</h2>
          <p className="mt-1 text-sm text-slate-500">Search, review, and manage student records from one place.</p>
        </div>
        <Link to="/admin/students/new" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:shadow-xl">
          <Plus size={16} />
          Add student
        </Link>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full border-0 bg-transparent text-sm outline-none"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              value={query}
            />
          </label>

          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"
            onChange={(event) => {
              setDepartment(event.target.value);
              setPage(1);
            }}
            value={department}
          >
            <option value="">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none"
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            value={status}
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <StudentTable students={students} loading={loading} onDelete={handleDelete} onView={handleView} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Page {page} of {totalPages} ({total} total)</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            Prev
          </button>
          <button
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmationDialog
        message={`Delete ${selectedStudent?.fullName || 'this student'}? This action cannot be undone.`}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={confirmDelete}
        open={confirmOpen}
        title="Delete student"
      />
    </div>
  );
}

export default StudentListPage;
