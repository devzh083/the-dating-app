import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Heart } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpVerification from "@/components/auth/OtpVerification";
import { API_BASE_URL } from "@/lib/config";

type AuthView = "login" | "signup" | "otp";

type LoginPageProps = {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLoginSuccess: () => void;
};

export default function LoginPage({
  isLoggedIn,
  onLogout,
  onLoginSuccess,
}: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- GOOGLE REDIRECT HANDLING ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (!access || !refresh) return;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    fetch(`${API_BASE_URL}/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((user) => {
        if (user?.email) {
          localStorage.setItem("user_email", user.email.toLowerCase());
        }

        window.history.replaceState({}, "", window.location.pathname);
        onLoginSuccess();
        navigate("/home");
      })
      .catch(() => {
        setErrorMsg("Google login failed. Please try again.");
      });
  }, [location.search, navigate, onLoginSuccess]);

  /* ---------------- UNIFIED LOGIN (auto-detects admin) ---------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const username = email.trim();

    try {
      // STEP 1: Try regular user login first
      const userRes = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password,
        }),
      });

      if (userRes.ok) {
        const data = await userRes.json();
        const { access, refresh, user } = data;

        // Check if user needs OTP verification
        if (!user?.is_verified) {
          await fetch(`${API_BASE_URL}/login/send-otp/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username }),
          });
          setView("otp");
          setLoading(false);
          return;
        }

        // Store regular user tokens
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user_email", user.email.toLowerCase());

        // Check if this user is actually an admin
        // Try to access admin endpoint with the JWT token
        const adminCheckRes = await fetch(`${API_BASE_URL}/admin/dashboard/stats/`, {
          headers: { 
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json"
          },
        });

        if (adminCheckRes.ok) {
          // User is an admin! Redirect to admin dashboard
          console.log("Admin user detected, redirecting to admin dashboard");
          navigate("/admin/dashboard");
          setLoading(false);
          return;
        }

        // Regular user - go to home
        onLoginSuccess();
        navigate("/home");
        setLoading(false);
        return;
      }

      // STEP 2: If regular login failed, try admin login
      const adminRes = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username, 
          password 
        }),
      });

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        
        // Store admin token (Token-based auth)
        localStorage.setItem("admin_token", adminData.token);
        localStorage.setItem("admin_user", JSON.stringify(adminData.user));
        
        console.log("Admin login successful:", adminData.user.username);
        navigate("/admin/dashboard");
        setLoading(false);
        return;
      }

      // Both logins failed
      const adminError = await adminRes.json();
      throw new Error(adminError.error || adminError.detail || "Invalid credentials");

    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    if (!ageConfirmed) {
      setErrorMsg("You must confirm you are 18 or older to sign up");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.detail || "Signup failed");
      }

      await fetch(`${API_BASE_URL}/login/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim() }),
      });

      setView("otp");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESEND OTP (from OTP page) ---------------- */
  const handleResendOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/login/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim() }),
      });
    } catch {
      // optional: setErrorMsg("Failed to resend OTP");
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/google-login/`);
      const data = await res.json();

      if (!res.ok || !data.auth_url) {
        throw new Error("Google login failed");
      }

      window.location.href = data.auth_url;
    } catch (err: any) {
      setErrorMsg(err.message || "Google login failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3fbff] to-[#f9fdfc]">
      {/* Top Bar */}
      <nav className="w-full bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-10 py-3.5">
          {/* Left: Branding */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#02b2f6] flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-[15px] leading-none text-[#222222]">
              The Dating App
            </span>
          </Link>

          {/* Right: Action Button */}
          <div className="flex items-center gap-3">
            <Button
              className="rounded-full px-6 py-2 text-[12px] font-semibold text-white bg-gradient-to-r from-[#02b2f6] to-[#09cf8b] hover:opacity-90 shadow-sm"
              onClick={() => navigate("/login")}
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="pt-24 pb-20 flex items-start justify-center px-4">
        <AnimatePresence mode="wait">
          {view === "otp" ? (
            <OtpVerification
              key="otp"
              email={email}
              apiBaseUrl={API_BASE_URL}
              onSuccess={() => {
                onLoginSuccess();
                navigate("/home");
              }}
              onResend={handleResendOtp}
              onBack={() => setView("login")}
            />
          ) : view === "signup" ? (
            /* ---------------- SIGNUP VIEW ---------------- */
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-[#f1f1f5] px-10 py-10">
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-2 text-[11px] text-[#9ca3af] hover:text-[#4b5563] mb-6"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>

                <div className="text-center mb-7">
                  <h1 className="text-[18px] font-semibold text-[#222222] mb-1">
                    Create Account
                  </h1>
                  <p className="text-[12px] text-[#9ca3af]">
                    Join The Dating App today
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4 text-[12px]">
                  <div className="space-y-1">
                    <Label
                      htmlFor="signup-email"
                      className="text-[11px] font-medium text-[#4b5563]"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="youremail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] focus:ring-1 focus:ring-[#ff9966]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="signup-password"
                      className="text-[11px] font-medium text-[#4b5563]"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="confirm-password"
                      className="text-[11px] font-medium text-[#4b5563]"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-[11px] text-[#4b5563] pt-1">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-[#e5e7eb] accent-[#02b2f6]"
                      required
                    />
                    <span>I confirm that I am 18 years of age or older</span>
                  </label>

                  {errorMsg && (
                    <p className="text-red-500 text-[11px] text-center">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
                    disabled={loading || !ageConfirmed}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-lg bg-white border border-[#e5e7eb] text-[12px] font-semibold hover:bg-[#f9fafb] flex items-center justify-center"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>

                <p className="text-center text-[11px] text-[#b0b5c0] mt-6">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </motion.div>
          ) : (
            /* ---------------- LOGIN VIEW ---------------- */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-[#f1f1f5] px-10 py-10">
                <div className="text-center mb-7">
                  <h1 className="text-[18px] font-semibold text-[#222222] mb-1">
                    The Dating App
                  </h1>
                  <p className="text-[13px] text-[#9ca3af]">Login</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-[12px]">
                  <div className="space-y-1">
                    <Label
                      htmlFor="email"
                      className="text-[11px] font-medium text-[#4b5563]"
                    >
                      Email / Username
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="youremail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] focus:ring-1 focus:ring-[#ff9966]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-[11px] font-medium text-[#4b5563]"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-[11px] text-center">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-lg bg-white border border-[#e5e7eb] text-[12px] font-semibold hover:bg-[#f9fafb] flex items-center justify-center"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView("signup")}
                    className="text-[11px] text-[#16a3ff] hover:underline font-medium"
                  >
                    New user? Sign up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}