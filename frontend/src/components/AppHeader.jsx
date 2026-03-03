import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-sky-700">ServiceSetu</Link>
        <nav className="flex items-center gap-3 text-sm">
          {!user ? (
            <>
              <Link to="/login" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100">Login</Link>
              <Link to="/register" className="rounded-md bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700">Register</Link>
            </>
          ) : (
            <>
              <span className="text-slate-600">{user.fullname}</span>
              <button onClick={handleLogout} className="rounded-md bg-slate-900 px-3 py-1.5 text-white">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
