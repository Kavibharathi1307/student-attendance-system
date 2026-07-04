import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-[28px] border border-slate-200 bg-white/80 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <Compass size={24} />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Page not found</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          The page you’re looking for doesn’t exist or may have moved. Return to the dashboard to continue.
        </p>
        <Link className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800" to="/">
          <ArrowLeft size={16} />
          Return home
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
