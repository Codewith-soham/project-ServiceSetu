import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { registerUser } from "../services/auth.api";

const initialForm = {
  fullname: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Object.keys(initialForm).map((field) => (
              <div key={field} className={field === "address" ? "md:col-span-2" : ""}>
                <label className="block text-sm capitalize">{field}</label>
                <input
                  required
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={form[field]}
                  onChange={(e) => onChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button disabled={loading} className="mt-6 w-full rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-70">
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="mt-4 text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-sky-700">Login</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default RegisterPage;
