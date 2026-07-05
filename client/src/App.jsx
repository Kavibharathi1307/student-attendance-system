import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleRedirect from './components/RoleRedirect.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx';
import FacultyList from './pages/FacultyList.jsx';
import AddFaculty from './pages/AddFaculty.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import EditFaculty from './pages/EditFaculty.jsx';
import FacultyDetails from './pages/FacultyDetails.jsx';
import FacultyDashboard from './pages/FacultyDashboard.jsx';
import AttendanceList from './pages/AttendanceList.jsx';
import MarkAttendance from './pages/MarkAttendance.jsx';
import EditAttendance from './pages/EditAttendance.jsx';
import AttendanceDetails from './pages/AttendanceDetails.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentListPage from './pages/StudentListPage.jsx';
import StudentForm from './pages/StudentForm.jsx';
import StudentDetailsPage from './pages/StudentDetailsPage.jsx';
import FacultyQrAttendance from './pages/FacultyQrAttendance.jsx';
import StudentQrAttendance from './pages/StudentQrAttendance.jsx';
import AdminQrSessions from './pages/AdminQrSessions.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route
            element={<DashboardLayout role="admin" title="Admin Dashboard" />}
            path="/admin"
          >
            <Route index element={<Navigate replace to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="faculty" element={<FacultyList />} />
            <Route path="faculty/add" element={<AddFaculty />} />
            <Route path="faculty/:id" element={<FacultyDetails />} />
            <Route path="faculty/:id/edit" element={<EditFaculty />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/new" element={<StudentForm />} />
            <Route path="students/:id" element={<StudentDetailsPage />} />
            <Route path="students/:id/edit" element={<StudentForm />} />
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="attendance/mark" element={<MarkAttendance />} />
            <Route path="attendance/:id" element={<AttendanceDetails />} />
            <Route path="attendance/:id/edit" element={<EditAttendance />} />
            <Route path="qr-sessions" element={<AdminQrSessions />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
          <Route
            element={<DashboardLayout role="faculty" title="Faculty Dashboard" />}
            path="/faculty"
          >
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="qr" element={<FacultyQrAttendance />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route
            element={<DashboardLayout role="student" title="Student Dashboard" />}
            path="/student"
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="qr" element={<StudentQrAttendance />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
