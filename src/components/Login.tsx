import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Theme } from "../types";
import { login } from "../services/auth";

interface LoginProps {
  theme: Theme;
}

const Login: React.FC<LoginProps> = ({ theme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isDark = theme === "dark";

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // await login({ email, password });
      const result = await login(email, password);

      // console.log("ress", result);

      if(result && "id" in result) {
        navigate("/dashboard");
      } else {
        setError(error?.message || "Login failed. Please check your credentials.");
        setLoading(false);
      }

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
      <div className={`w-full max-w-md ${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-xl p-8 border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDark ? "bg-blue-600/20" : "bg-blue-100"}`}>
            <LogIn className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-slate-50" : "text-slate-900"}`}>
            Welcome Back
          </h1>
          <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Sign in to your MediPro AI account
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${isDark ? "bg-red-900/20 border border-red-800/50" : "bg-red-50 border border-red-200"}`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
            <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
                placeholder="doctor@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          <p>
            Having trouble?{" "}
            <a href="#" className={`font-medium hover:underline ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}>
              Contact Administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


