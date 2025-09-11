import { useState, useEffect } from "react";
import HeaderBrand from "@/components/auth/HeaderBrand";
import AuthProviderButtons from "@/components/auth/AuthProviderButtons";
import FeatureCards from "@/components/auth/FeatureCards";
import DemoAccessCard from "@/components/auth/DemoAccessCard";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, BarChart3, Video, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, signupWithEmail } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    role: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await loginWithEmail({ email: loginForm.email, password: loginForm.password });
    if (res.success) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", loginForm.email);
      navigate("/afl-dashboard");
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (!signupForm.agreeTerms) {
      setError("Please agree to the terms of service");
      setIsLoading(false);
      return;
    }

    const res = await signupWithEmail({
      firstName: signupForm.firstName,
      lastName: signupForm.lastName,
      email: signupForm.email,
      password: signupForm.password,
      organization: signupForm.organization,
      role: signupForm.role,
    });
    if (res.success) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", signupForm.email);
      localStorage.setItem("userName", `${signupForm.firstName} ${signupForm.lastName}`);
      setSignupForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        organization: "",
        role: "",
        agreeTerms: false,
      });
      navigate("/afl-dashboard");
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  const demoLogin = () => {
    setLoginForm({
      email: "demo@aflanalytics.com",
      password: "demo123",
      rememberMe: true,
    });
  };

  // OAuth authentication handlers
  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  const handleAppleAuth = () => {
    window.location.href = "/api/auth/apple";
  };

  // Handle OAuth callback from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");
    const token = urlParams.get("token");
    const userParam = urlParams.get("user");
    const errorMessage = urlParams.get("message");

    if (authStatus === "success" && token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        // Store authentication data
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("authToken", token);
        localStorage.setItem("authProvider", user.provider);

        // Clear URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        // Redirect to dashboard
        navigate("/afl-dashboard");
      } catch (error) {
        console.error("Error parsing OAuth user data:", error);
        setError("Authentication failed. Please try again.");
      }
    } else if (authStatus === "error" && errorMessage) {
      setError(decodeURIComponent(errorMessage));
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);





  const features = [
    {
      icon: Activity,
      title: "Player Performance",
      description: "Real-time player statistics and performance metrics",
    },
    {
      icon: Users,
      title: "Crowd Monitoring",
      description: "Stadium crowd density and safety analytics",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive reporting and data insights",
    },
    {
      icon: Video,
      title: "Video Analysis",
      description: "AI-powered match video analysis and highlights",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <HeaderBrand />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Features & Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Shield className="w-3 h-3 mr-1" />
                  Trusted by AFL Teams
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Professional AFL
                  <span className="block bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Analytics Platform
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  Comprehensive player performance tracking, crowd monitoring,
                  and match analytics designed specifically for Australian
                  Football League professionals.
                </p>
              </div>

              <FeatureCards features={features} />

              <DemoAccessCard onLoadDemo={demoLogin} />
            </div>

            {/* Right side - Login/Signup Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to access your AFL analytics dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* OAuth Buttons */}
                      <AuthProviderButtons mode="login" onGoogle={handleGoogleAuth} onApple={handleAppleAuth} />

                      <LoginForm
                        values={loginForm}
                        showPassword={showPassword}
                        onToggleShowPassword={() => setShowPassword(!showPassword)}
                        onChange={(u) => setLoginForm({ ...loginForm, ...u })}
                        onSubmit={handleLogin}
                        isLoading={isLoading}
                        onForgotPassword={() => setIsResetModalOpen(true)}
                      />
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* OAuth Buttons */}
                      <AuthProviderButtons mode="signup" onGoogle={handleGoogleAuth} onApple={handleAppleAuth} />

                      <SignupForm
                        values={signupForm}
                        onChange={(u) => setSignupForm({ ...signupForm, ...u })}
                        onSubmit={handleSignup}
                        isLoading={isLoading}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen} />
    </div>
  );
}
