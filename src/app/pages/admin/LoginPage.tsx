import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, User, ArrowRight, Sun } from "lucide-react";
import logo from "figma:asset/d2505d34771c9cc46206a68c4ffbc9e7910c859c.png";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/admin/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="bg-black p-8 text-center relative">
          <div className="w-16 h-16 bg-white rounded-xl mx-auto mb-4 p-1 flex items-center justify-center shadow-lg">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin</h1>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Sun className="w-3 h-3 text-yellow-400" />
            4VJ's BrightBook System
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium transition-all"
                  placeholder="admin"
                  defaultValue="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium transition-all"
                  placeholder="••••••••"
                  defaultValue="password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="animate-pulse">Accessing System...</span>
              ) : (
                <>
                  Secure Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Authorized personnel only. <br/>
              Access is monitored and recorded.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-xs z-10">
        &copy; {new Date().getFullYear()} 4VJ's BrightBook Admin System
      </div>
    </div>
  );
}
