import React, { useState, useEffect } from "react";
import { UserPlus, Mail, User, Shield, CheckCircle, XCircle, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createUser } from "../services/auth";
import type { User as AuthUser } from "../services/auth";
import { sendCredentialsEmail, generateCredentialsEmail } from "../services/email";
import { supabase } from "../services/supabase";
import { Theme, Language } from "../types";
import { useI18n } from "../utils/i18n";

interface AdminDashboardProps {
  theme: Theme;
  lang: Language;
}

interface DoctorUser extends AuthUser {
  password?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, lang }) => {
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isDark = theme === "dark";
  const t = useI18n(lang);

  // useEffect(() => {
  //   loadDoctors();
  // }, []);

  // const loadDoctors = async () => {
  //   try {
  //     setLoading(true);
  //     const { data, error: fetchError } = await supabase
  //       .from("users")
  //       .select("*")
  //       .eq("role", "DOCTOR")
  //       .order("createdAt", { ascending: false });

  //     if (fetchError) {
  //       throw new Error(fetchError.message);
  //     }

  //     setDoctors(data || []);
  //   } catch (err: any) {
  //     setError(`Failed to load doctors: ${err.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Create user
      const passwordToUse = formData.password || generateTempPassword();
     
      const result = await createUser({
        email: formData.email,
        name: formData.name,
        password: passwordToUse,
        role: "DOCTOR",
      });

      // Send credentials email
      const emailSent = await sendCredentialsEmail({
        email: result.user.email,
        password: result.password,
        name: result.user.name || result.user.email,
      });

      if (emailSent) {
        setSuccess(
          `Doctor ${result.user.name || result.user.email} created successfully! Credentials have been sent via email.`
        );
      } else {
        setSuccess(
          `Doctor ${result.user.name || result.user.email} created successfully! Password: ${result.password} (Please send this manually as email failed).`
        );
      }

      // Reload doctors list
      // await loadDoctors();

      // Reset form
      setFormData({ name: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const generateTempPassword = (): string => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const generatePassword = () => {
    const password = generateTempPassword();
    setFormData((prev) => ({ ...prev, password }));
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-blue-400" : "text-blue-600"}`} />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isDark ? "text-slate-50" : "text-slate-900"}`}>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Manage doctors and user accounts
          </p>
        </div>
      </div>

      {/* Add Doctor Form */}
      <div className={`rounded-xl p-6 border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? "bg-blue-600/20" : "bg-blue-100"}`}>
            <UserPlus className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          </div>
          <h2 className={`text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
            Add New Doctor
          </h2>
        </div>

        {error && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${isDark ? "bg-red-900/20 border border-red-800/50" : "bg-red-50 border border-red-200"}`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
            <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{error}</p>
          </div>
        )}

        {success && (
          <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${isDark ? "bg-green-900/20 border border-green-800/50" : "bg-green-50 border border-green-200"}`}>
            <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? "text-green-400" : "text-green-600"}`} />
            <p className={`text-sm ${isDark ? "text-green-300" : "text-green-700"}`}>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
                placeholder="Dr. John Doe"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
                placeholder="doctor@example.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Password
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  isDark
                    ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
                disabled={submitting}
              >
                Generate Random
              </button>
            </div>
            <input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-50 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              }`}
              placeholder="Leave empty to auto-generate"
              disabled={submitting}
            />
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              If left empty, a random password will be generated and sent via email
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Doctor...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Add Doctor
              </>
            )}
          </button>
        </form>
      </div>

      {/* Doctors List */}
      <div className={`rounded-xl p-6 border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? "bg-blue-600/20" : "bg-blue-100"}`}>
            <User className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          </div>
          <h2 className={`text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
            Registered Doctors ({doctors.length})
          </h2>
        </div>

        {doctors.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No doctors registered yet. Add your first doctor above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Name
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Email
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Status
                  </th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className={`border-b transition-colors hover:${isDark ? "bg-slate-700/50" : "bg-slate-50"} ${
                      isDark ? "border-slate-700" : "border-slate-200"
                    }`}
                  >
                    <td className={`py-3 px-4 ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-blue-600/20" : "bg-blue-100"
                        }`}>
                          <User className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                        </div>
                        {doctor.name || "N/A"}
                      </div>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-50" />
                        {doctor.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {doctor.isActive ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className={`text-sm ${isDark ? "text-green-400" : "text-green-600"}`}>
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    {/* <td className={`py-3 px-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "N/A"}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

