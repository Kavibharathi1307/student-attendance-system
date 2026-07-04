import { useState } from 'react';
import { ArrowLeft, Mail, UserRound, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createFaculty } from '../services/facultyApi.js';

export default function AddFaculty() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    createFaculty({ fullName, email, department })
      .then(() => {
        alert('Faculty created');
        navigate('/admin/faculty');
      })
      .catch((err) => alert(err?.response?.data?.message || 'Create failed'));
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/faculty" className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Faculty</p>
          <h2 className="text-2xl font-semibold text-slate-900">Add Faculty</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl rounded-[24px] border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <UserRound size={16} className="mr-2 text-slate-400" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Jane Doe" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <Mail size={16} className="mr-2 text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-0 bg-transparent text-sm outline-none" placeholder="jane@school.edu" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <Users size={16} className="mr-2 text-slate-400" />
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Computer Science" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20">Create Faculty</button>
        </div>
      </form>
    </div>
  );
}
