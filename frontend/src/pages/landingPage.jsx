import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 inline-block rounded-full bg-sky-500/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-sky-300">
            Local Service Marketplace
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Find trusted professionals or grow your service business.</h1>
          <p className="mt-4 text-slate-300">
            ServiceSetu connects users with verified providers. Book services quickly, track requests, and manage work from dedicated dashboards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-lg bg-sky-500 px-5 py-3 font-medium hover:bg-sky-400">Create account</Link>
            <Link to="/login" className="rounded-lg border border-slate-500 px-5 py-3 font-medium hover:bg-slate-800">Login</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <h2 className="text-xl font-semibold">Built for both sides</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            <li>• User dashboard to discover providers and book services.</li>
            <li>• Provider dashboard to review and manage bookings.</li>
            <li>• Token-based authentication integrated with your backend.</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
