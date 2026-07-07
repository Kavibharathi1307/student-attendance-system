import { useEffect, useState } from 'react';
import { ArrowLeft, PencilLine, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import StudentCard from '../components/StudentCard.jsx';
import { getStudent } from '../services/studentService.js';

function StudentDetailsPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      try {
        const payload = await getStudent(id);
        setStudent(payload?.student || payload);
      } catch (error) {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    }

    void loadStudent();
  }, [id]);

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (!student) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><UserRound size={20} /></div>
        <p className="empty-state-title">Student not found</p>
        <p className="empty-state-text">The requested student could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/students" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-teal-700">
            <ArrowLeft size={16} />
            Back to students
          </Link>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Student details</h2>
          <p className="mt-1 text-sm text-slate-500">A full view of the selected student profile.</p>
        </div>
        <Link to={`/admin/students/${id}/edit`} className="btn-primary rounded-full px-4 py-2.5">
          <PencilLine size={16} />
          Edit student
        </Link>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-cyan-50 px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-teal-600/10 p-3 text-teal-700">
              <UserRound size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Student profile</p>
              <h3 className="text-xl font-semibold text-slate-900">{student.fullName}</h3>
            </div>
          </div>
        </div>

        <StudentCard student={student} />
      </div>
    </div>
  );
}

export default StudentDetailsPage;
