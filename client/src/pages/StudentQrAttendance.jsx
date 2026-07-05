import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Keyboard, ScanLine, XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useSearchParams } from 'react-router-dom';
import { markAttendanceViaQr } from '../services/qrApi.js';

function extractToken(raw) {
  try {
    const url = new URL(raw);
    const t = url.searchParams.get('token');
    if (t) return t;
  } catch { /* not a URL */ }
  return raw.trim();
}

const QR_READER_ID = 'qr-scanner-reader';

export default function StudentQrAttendance() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [mode, setMode] = useState('scan');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  useEffect(() => {
    if (mode === 'scan') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => { stopScanner(); };
  }, [mode]);

  function startScanner() {
    if (isScanningRef.current) return;

    const element = document.getElementById(QR_READER_ID);
    if (!element) return;

    setCameraError('');
    const scanner = new Html5Qrcode(QR_READER_ID);
    scannerRef.current = scanner;
    isScanningRef.current = true;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        stopScanner();
        const qrToken = extractToken(decodedText);
        setToken(qrToken);
        handleQuickSubmit(qrToken);
      },
      () => {}
    ).catch(() => {
      setCameraError('Camera unavailable. Switch to manual entry.');
      isScanningRef.current = false;
    });
  }

  function stopScanner() {
    if (scannerRef.current && isScanningRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      } catch { /* ignore */ }
      scannerRef.current = null;
      isScanningRef.current = false;
    }
  }

  async function handleQuickSubmit(qrToken) {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await markAttendanceViaQr(qrToken);
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token.trim()) return;
    const qrToken = extractToken(token);
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await markAttendanceViaQr(qrToken);
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">QR Attendance</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Mark Attendance via QR</h2>
        <p className="mt-1 text-sm text-slate-500">Scan the QR code displayed by your faculty or enter the token manually.</p>
      </div>

      <div className="mx-auto max-w-lg">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setMode('scan')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'scan'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Camera size={16} />
              Scan QR
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'manual'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Keyboard size={16} />
              Enter Manually
            </button>
          </div>

          {mode === 'scan' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-teal-50/70 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-700">Scan QR Code</p>
                  <p className="text-sm text-slate-600">Point your camera at the QR code displayed by your faculty.</p>
                </div>
              </div>

              <div
                id={QR_READER_ID}
                className={`overflow-hidden rounded-2xl border ${cameraError ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />

              {cameraError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <XCircle size={18} className="shrink-0 text-amber-600" />
                    <p className="text-sm text-amber-700">{cameraError}</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                  <span className="ml-2 text-sm text-slate-600">Verifying QR code...</span>
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <>
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-teal-50/70 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600">
                  <ScanLine className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-700">Enter QR Token</p>
                  <p className="text-sm text-slate-600">Paste the token from the QR code your faculty shared.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">QR Token</label>
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste QR token here..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Mark Attendance'}
                </button>
              </form>
            </>
          )}

          {result && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Attendance Marked!</p>
                  <p className="text-sm text-emerald-700">Subject: {result.subject}</p>
                  <p className="text-sm text-emerald-700">Date: {result.attendanceDate}</p>
                  <p className="text-sm text-emerald-700">Status: {result.status}</p>
                </div>
              </div>
            </div>
          )}

          {error && !cameraError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
