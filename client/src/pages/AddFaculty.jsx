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
    <div className="fade-in">
      <div className="page-header flex items-center gap-3">
        <Link to="/admin/faculty" className="btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="page-header-subtitle">Faculty</p>
          <h2 className="page-header-title">Add Faculty</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl section-card">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="form-label">Full name</label>
            <div className="input-group mt-2">
              <UserRound size={16} className="text-slate-400 shrink-0" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="Jane Doe" />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <div className="input-group mt-2">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="jane@school.edu" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Department</label>
            <div className="input-group mt-2">
              <Users size={16} className="text-slate-400 shrink-0" />
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field" placeholder="Computer Science" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn btn-primary">Create Faculty</button>
        </div>
      </form>
    </div>
  );
}
