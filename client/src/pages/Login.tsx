import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://homobiebackend-railway-production.up.railway.app';

// Enhanced validation schema
const loginSchema = z.object({
  username: z.string()
    .min(1, { message: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be less than 50 characters" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
});

type LoginForm = z.infer<typeof loginSchema>;

// Enhanced auth service with better error handling
const authService = {
  login: async (data: LoginForm) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          username: data.username,
          password: data.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        }
      );

      // Debug log the response
      console.log('Login response:', {
        status: response.status,
        data: {
          ...response.data,
          // Check for token from backend response
          token: response.data?.token ? 'REDACTED' : undefined
        }
      });

      // Validate the response for token
      if (!response.data?.token) {
        throw new Error('Authentication failed: No token received');
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        // Debug log the error response
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });

        const serverMessage = error.response?.data?.message;
        const status = error.response?.status;

        if (status === 403) {
          throw new Error(serverMessage || 'Access denied. Please check your credentials.');
        }

        if (status === 401) {
          throw new Error(serverMessage || 'Invalid username or password.');
        }

        // Handle JSON parse errors specifically
        if (status === 400 && error.response?.data?.includes('JSON parse error')) {
          throw new Error('Invalid request format. Please try again or contact support.');
        }

        throw new Error(serverMessage || 'Authentication failed. Please try again.');
      }

      // Handle non-Axios errors
      throw new Error(error.message || 'Network error. Please try again.');
    }
  }
};

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Log the request payload for debugging
      console.log('Login payload:', {
        username: data.username,
        password: '••••••••' // Don't log actual password
      });

      const response = await authService.login(data);

      // Store token and user data according to backend response
      localStorage.setItem('authToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      // Store email and role from backend response
      if (response.email) {
        localStorage.setItem('user', JSON.stringify({
          email: response.email,
          role: response.role
        }));
      }

      toast({
        title: "Login successful",
        description: "Welcome to Homobie portal!",
      });

      // Redirect based on user role if needed
      setLocation("/dashboard");
    } catch (error) {
      let errorMessage = "Login failed";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Special handling for specific error cases
        if (error.message.toLowerCase().includes('credentials') ||
          error.message.toLowerCase().includes('invalid')) {
          errorMessage = "Invalid username or password";
        }
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cred-dark via-gray-900 to-cred-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-cred-mint rounded-xl flex items-center justify-center">
              <Home className="text-cred-dark text-2xl" size={24} />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">Homobie</h1>
              <p className="text-gray-300 text-sm">Loan Management Portal</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Sign in to access your role-based dashboard
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-cred-dark">
              Sign In
            </CardTitle>
            <p className="text-gray-600 text-center text-sm">
              Enter your credentials to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-cred-dark font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register("username")}
                  className={`h-11 focus:ring-cred-mint focus:border-cred-mint border-gray-300 ${errors.username ? 'border-red-500' : ''
                    }`}
                  disabled={isLoading}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cred-dark font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`h-11 pr-10 focus:ring-cred-mint focus:border-cred-mint border-gray-300 ${errors.password ? 'border-red-500' : ''
                      }`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 px-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-cred-mint text-cred-dark hover:bg-cred-mint/90 font-semibold disabled:opacity-75"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cred-dark"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Additional options */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => setLocation("/register")}
                  className="text-cred-mint font-medium hover:underline focus:outline-none"
                  disabled={isLoading}
                >
                  Create account here
                </button>
              </p>
              <button
                onClick={() => setLocation("/forgot-password")}
                className="text-cred-mint text-sm font-medium hover:underline focus:outline-none"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}