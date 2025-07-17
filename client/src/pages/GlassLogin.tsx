import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassBackground } from "@/components/layout/GlassBackground";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function GlassLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData);

      // Check if login actually succeeded (response structure or user state)
      if (response?.user || user) {
        const loggedInUser = response?.user || user;

        // Store token if provided
        if ("token" in response && response.token) {
          localStorage.setItem("authToken", response.token);
        }

        toast({
          title: "Welcome back!",
          description: `Logged in as ${loggedInUser.username}`,
          duration: 5000,
        });

        RoleBasedRedirect(loggedInUser.role);
        return; // Exit early on success
      }

      // If we reach here, login failed
      throw new Error("Login failed - no user data received");

    } catch (err: any) {
      // Check if user is actually logged in despite the error
      if (user) {
        console.warn("Login error thrown but user is authenticated:", err.message);

        toast({
          title: "Welcome back!",
          description: `Logged in as ${user.username}`,
          duration: 5000,
        });

        RoleBasedRedirect(user.role);
        return;
      }

      // Handle actual login failures
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleBasedRedirect = (role: string) => {
    const roleRoutes: Record<string, string> = {
      super_admin: "/admin",
      admin: "/admin",
      builder: "/builder",
      telecaller: "/telecaller",
      broker: "/broker",
      ca: "/ca/portfolio",
      user: "/dashboard"
    };
    setLocation(roleRoutes[role] || "/dashboard");
  };

  const handleLoginError = (err: any) => {
    console.error("Login error:", err);

    let errorMessage = "Login failed. Please try again.";

    // More specific error handling
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      if (err.message.includes("credentials") || err.message.includes("Invalid")) {
        errorMessage = "Invalid username or password";
      } else if (err.message.includes("network") || err.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message.includes("timeout")) {
        errorMessage = "Request timeout. Please try again.";
      } else {
        errorMessage = err.message;
      }
    }

    setError(errorMessage);

    // Clear password on error
    setFormData(prev => ({ ...prev, password: "" }));

    toast({
      title: "Login failed",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        username: "test@email.com",
        password: "396c2e"
      });

      // Store token if provided
      if (response?.token) {
        localStorage.setItem("authToken", response.token);
      }

      toast({
        title: "Demo session started",
        description: "Logged in as demo user",
        duration: 5000,
      });

      RoleBasedRedirect(response.user.role);

    } catch (err: any) {
      // Check if user is actually logged in despite the error
      const currentUser = authService.getUser();
      if (currentUser) {
        console.warn("Demo login error thrown but user is authenticated:", err.message);

        toast({
          title: "Demo session started",
          description: "Logged in as demo user",
          duration: 5000,
        });

        RoleBasedRedirect(currentUser.role);
        return;
      }

      handleLoginError(err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GlassBackground />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20 + Math.random() * 40, 0],
              x: [0, -10 + Math.random() * 20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 py-12"
      >
        <GlassCard
          gradient="primary"
          blur="xl"
          className="p-8 relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-2xl">L</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your account
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center"
            >
              <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
              <span className="text-red-500 text-sm">{error}</span>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username@example.com"
                  required
                  className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400 transition-all"
                  disabled={isLoading || isDemoLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password">
                  <span className="text-sm text-gradient-primary hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400 transition-all"
                  disabled={isLoading || isDemoLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading || isDemoLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading || isDemoLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || isDemoLoading}
                className={cn(
                  "w-32 justify-center",
                  (isLoading || isDemoLoading) && "opacity-80 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing In
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </GlassButton>
            </div>
          </motion.form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/10 text-gray-500">or</span>
            </div>
          </div>

          <GlassButton
            onClick={handleDemoLogin}
            variant="secondary"
            className="w-full"
            disabled={isLoading || isDemoLoading}
          >
            {isDemoLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Loading Demo...
              </>
            ) : (
              "Try Demo Account"
            )}
          </GlassButton>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 text-center text-sm"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-gradient-primary font-medium hover:underline cursor-pointer">
                  Sign up
                </span>
              </Link>
            </p>
          </motion.div>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </motion.div>
      </motion.div>
    </div>
  );
}