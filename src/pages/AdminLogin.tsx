import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WEBHOOKS } from "@/config/webhooks";
import logo from "@/assets/logo.png";

// Session duration in days — change this to control how long the admin stays logged in
const SESSION_DURATION_DAYS = 7;

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please enter username and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(WEBHOOKS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();

      const sessionData = {
        token: data.token || "authenticated",
        user: username,
        expiresAt: Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
      };

      if (rememberMe) {
        localStorage.setItem("admin_session", JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem("admin_session", JSON.stringify(sessionData));
      }

      toast({ title: "Welcome back, Admin!" });
      navigate("/admin/dashboard");
    } catch {
      toast({ title: "Login Failed", description: "Invalid username or password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-30 h-40 flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-display font-black uppercase text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Tacti8ai Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-secondary border-none rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none text-sm"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border-none rounded-md px-4 py-3 pr-11 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none text-sm"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-9 h-5 rounded-full transition-colors relative ${rememberMe ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rememberMe ? "left-[18px]" : "left-0.5"}`} />
            </button>
            <span className="text-xs text-muted-foreground">Remember me for {SESSION_DURATION_DAYS} days</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected area · Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
