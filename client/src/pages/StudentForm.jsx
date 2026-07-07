import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createStudent, getStudent, updateStudent } from '../services/studentService.js';

const defaults = {
  fullName: '',
  email: '',
  studentId: '',
  department: '',
  status: 'Active',
  phone: '',
  address: ''
};

function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;

    async function loadStudent() {
      setLoading(true);
      try {
        const payload = await getStudent(id);
        const student = payload?.student || payload;
        setForm({
          ...defaults,
          ...student
        });
      } catch (error) {
        setErrors({ submit: 'Unable to load the selected student.' });
      } finally {
        setLoading(false);
      }
    }

    void loadStudent();
  }, [id, isEdit]);

  function validate() {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Please enter a valid email address.';
    if (!form.department.trim()) nextErrors.department = 'Department is required.';
    if (!form.status) nextErrors.status = 'Status is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        await updateStudent(id, form);
        navigate('/admin/students', { state: { message: 'Student updated successfully.' } });
      } else {
        await createStudent(form);
        navigate('/admin/students', { state: { message: 'Student created successfully.' } });
      }
    } catch (error) {
      setErrors({ submit: error?.response?.data?.message || 'Something went wrong while saving the student.' });
    }
  }

  if (loading) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="fade-in space-y-6">
      <div className="page-header flex items-center gap-3">
        <Link to="/admin/students" className="btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="page-header-subtitle">Students</p>
          <h2 className="page-header-title">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl section-card">
        <div className="mb-6 rounded-2xl bg-teal-50/70 p-4">
          <p className="text-sm font-medium text-teal-700">Student profile</p>
          <p className="mt-1 text-sm text-slate-600">Capture the details needed to keep the student directory accurate and up to date.</p>
        </div>

        {errors.submit ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.submit}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Full name</label>
            <input
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              value={form.fullName}
            />
            {errors.fullName ? <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p> : null}
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              value={form.email}
            />
            {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
          </div>

          <div>
            <label className="form-label">Student ID</label>
            <input
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, studentId: event.target.value })}
              value={form.studentId}
            />
          </div>

          <div>
            <label className="form-label">Department</label>
            <input
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              value={form.department}
            />
            {errors.department ? <p className="mt-1 text-xs text-rose-600">{errors.department}</p> : null}
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              value={form.status}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
            {errors.status ? <p className="mt-1 text-xs text-rose-600">{errors.status}</p> : null}
          </div>

          <div>
            <label className="form-label">Phone</label>
            <input
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              value={form.phone}
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <textarea
              className="input-field mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              rows="4"
              value={form.address}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn btn-primary" type="submit">
            <Save size={16} />
            {isEdit ? 'Save changes' : 'Create student'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;
