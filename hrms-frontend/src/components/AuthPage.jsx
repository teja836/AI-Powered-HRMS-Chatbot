
import { useState } from "react";
import { loginUser, signupUser } from "../services/authApi";
import { Bot, Mail, Lock, User, ArrowRight, X } from "lucide-react";

function AuthPage({ prompt, onLogin, onClose }) {
  const [isSignup, setIsSignup] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignup) {
        await signupUser(formData);

        setSuccess("Account created successfully! Please login.");

        setFormData({
          username: "",
          full_name: "",
          email: "",
          password: ""
        });

        setIsSignup(false);
      } else {
        const data = await loginUser({
          email: formData.email,
          password: formData.password
        });

        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="fixed inset-0 z-[60] flex min-h-0 items-center justify-center overflow-y-auto bg-black/50 px-4 py-8">

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="mb-7 text-center">

          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <Bot size={30} />
          </div>

          <h1 id="auth-dialog-title" className="text-2xl font-bold text-gray-900">
            HRMS AI
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isSignup
              ? "Create your account to get started"
              : "Welcome back! Please login to continue"}
          </p>

          <p className="mt-2 text-sm text-gray-600">{prompt}</p>

        </div>

        {/* Login / Signup Toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">

          <button
            type="button"
            onClick={() => {
              setIsSignup(false);
              setError("");
              setSuccess("");
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              !isSignup
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignup(true);
              setError("");
              setSuccess("");
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              isSignup
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignup && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />

                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />

                  <input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={inputClass}
                minLength={8}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Secure authentication powered by Node.js and JWT
        </p>

      </div>
    </div>
  );
}

export default AuthPage;
