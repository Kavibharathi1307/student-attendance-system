import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, UserRound } from 'lucide-react';
import { getFaculty, updateFaculty } from '../services/facultyApi.js';

export default function EditFaculty() {
  const { id } = useParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getFaculty(id)
      .then((res) => {
        const f = res.faculty;
        setFullName(f.fullName || '');
        setEmail(f.email || '');
        setDepartment(f.department || '');
      })
      .catch(() => alert('Failed to load'));
  }, [id]);

  function handleSubmit(e) {
    e.preventDefault();

    updateFaculty(id, { fullName, email, department })
      .then(() => {
        alert('Faculty updated');
        navigate('/admin/faculty');
      })
      .catch((err) => alert(err?.response?.data?.message || 'Update failed'));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-indigo-600">Edit faculty</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Update faculty profile</h2>
        <p className="mt-1 text-sm text-slate-500">Edit the core faculty information and save the updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-indigo-50/70 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-700">Faculty profile</p>
            <p className="text-sm text-slate-600">Keep faculty records consistent across the system.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700">
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
