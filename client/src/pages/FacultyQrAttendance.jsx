import { useEffect, useState } from 'react';
import { QrCode, RefreshCw, Clock } from 'lucide-react';
import QRCode from 'qrcode';
import { generateQrCode } from '../services/qrApi.js';

export default function FacultyQrAttendance() {
  const [subject, setSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(2);
  const [session, setSession] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceDate(today);
  }, []);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setSecondsLeft((s) => {
      if (s <= 1) return 0;
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [session]);

  useEffect(() => {
    if (secondsLeft <= 0 && session) {
      setSession(null);
      setQrDataUrl('');
    }
  }, [secondsLeft, session]);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!subject || !attendanceDate) return;
    setLoading(true);
    try {
      const res = await generateQrCode({ subject, attendanceDate, expiryMinutes });
      setSession(res);
      setSecondsLeft(expiryMinutes * 60);

      const url = `${window.location.origin}/student/qr?token=${res.token}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">QR Attendance</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Generate QR Code</h2>
        <p className="mt-1 text-sm text-slate-500">Create a time-limited QR code for students to scan and mark attendance.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <form onSubmit={handleGenerate} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-teal-50/70 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-teal-700">New QR session</p>
              <p className="text-sm text-slate-600">Set the subject, date, and expiry time for the QR code.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Attendance Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Expiry (minutes)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <QrCode size={16} />
              )}
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">QR Preview</h3>
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <img src={qrDataUrl} alt="QR Code" className="h-64 w-64" />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                <Clock size={16} />
                Expires in {formatTime(secondsLeft)}
              </div>
              <p className="text-center text-xs text-slate-400">
                Students can scan this QR code or enter the token manually.
              </p>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
              <div className="text-center">
                <QrCode size={48} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm text-slate-400">No QR code generated yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
