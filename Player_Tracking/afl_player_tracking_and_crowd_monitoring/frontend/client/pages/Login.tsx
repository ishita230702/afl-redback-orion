import { useState, useEffect } from "react";
import HeaderBrand from "@/components/auth/HeaderBrand";
import AuthProviderButtons from "@/components/auth/AuthProviderButtons";
import FeatureCards from "@/components/auth/FeatureCards";
import DemoAccessCard from "@/components/auth/DemoAccessCard";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";
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
import ResetPasswordDialog from "@/components/auth/ResetPasswordDialog";

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

  // Valid demo credentials for authentication
  const validCredentials = [
    { email: "demo@aflanalytics.com", password: "demo123" },
    { email: "admin@aflanalytics.com", password: "admin123" },
    { email: "coach@aflanalytics.com", password: "coach123" },
    { email: "analyst@aflanalytics.com", password: "analyst123" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate login API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if both email and password are provided
    if (!loginForm.email || !loginForm.password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    // Get stored user credentials from localStorage
    const storedUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );

    // Combine demo credentials with registered user credentials
    const allValidCredentials = [...validCredentials, ...storedUsers];

    // Validate credentials against all valid credentials
    const isValidCredential = allValidCredentials.some(
      (cred) =>
        cred.email.toLowerCase() === loginForm.email.toLowerCase() &&
        cred.password === loginForm.password,
    );

    if (isValidCredential) {
      // Store authentication state in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", loginForm.email);

      // Successful login - redirect to dashboard
      navigate("/afl-dashboard");
    } else {
      setError(
        "Invalid email or password. Try demo@aflanalytics.com / demo123 or use your signup credentials",
      );
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate all required fields
    if (
      !signupForm.firstName ||
      !signupForm.lastName ||
      !signupForm.email ||
      !signupForm.password ||
      !signupForm.organization
    ) {
      setError("Please fill all required fields");
      setIsLoading(false);
      return;
    }

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

    // Check if user already exists
    const existingUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );
    const userExists = existingUsers.some(
      (user: any) =>
        user.email.toLowerCase() === signupForm.email.toLowerCase(),
    );

    if (userExists) {
      setError(
        "An account with this email already exists. Please login instead.",
      );
      setIsLoading(false);
      return;
    }

    // Simulate signup API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create new user object
    const newUser = {
      email: signupForm.email,
      password: signupForm.password,
      firstName: signupForm.firstName,
      lastName: signupForm.lastName,
      organization: signupForm.organization,
      role: signupForm.role,
    };

    // Add new user to registered users list
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    // Store authentication state for new user
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", signupForm.email);
    localStorage.setItem(
      "userName",
      `${signupForm.firstName} ${signupForm.lastName}`,
    );

    // Clear the signup form
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

    // Successful signup - redirect to dashboard
    navigate("/afl-dashboard");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate sending reset email
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (resetForm.email) {
      setResetMessage(`Reset link sent to ${resetForm.email}`);
      setResetStep(2);
    } else {
      setError("Please enter a valid email address");
    }

    setIsLoading(false);
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate code verification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (resetForm.resetCode === "123456") {
      setResetStep(3);
    } else {
      setError("Invalid verification code. Try '123456' for demo.");
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (resetForm.newPassword !== resetForm.confirmNewPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Simulate password reset
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setResetStep(4);
    setIsLoading(false);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setResetStep(1);
    setResetForm({
      email: "",
      resetCode: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setError("");
    setResetMessage("");
  };

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

      {/* Forgot Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resetStep > 1 && resetStep < 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetStep(Math.max(1, resetStep - 1))}
                  className="p-0 h-6 w-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {resetStep === 1 && "Reset Password"}
              {resetStep === 2 && "Enter Verification Code"}
              {resetStep === 3 && "Create New Password"}
              {resetStep === 4 && "Password Reset Complete"}
            </DialogTitle>
            <DialogDescription>
              {resetStep === 1 && "Enter your email to receive a reset link"}
              {resetStep === 2 && "Check your email for a verification code"}
              {resetStep === 3 && "Enter your new password"}
              {resetStep === 4 && "Your password has been successfully reset"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resetMessage && resetStep === 2 && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>{resetMessage}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Email Input */}
            {resetStep === 1 && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={resetForm.email}
                      onChange={(e) =>
                        setResetForm({ ...resetForm, email: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-orange-600" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Reset Link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Verification Code</Label>
                  <Input
                    id="resetCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={resetForm.resetCode}
                    onChange={(e) =>
                      setResetForm({ ...resetForm, resetCode: e.target.value })
                    }
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-600">
                    For demo purposes, use code: <strong>123456</strong>
                  </p>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-orange-600" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>
            )}

            {/* Step 3: New Password */}
            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={resetForm.newPassword}
                      onChange={(e) =>
                        setResetForm({
                          ...resetForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={resetForm.confirmNewPassword}
                      onChange={(e) =>
                        setResetForm({
                          ...resetForm,
                          confirmNewPassword: e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-orange-600" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Resetting Password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            {/* Step 4: Success */}
            {resetStep === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Success!</h3>
                  <p className="text-sm text-green-700">
                    Your password has been reset successfully.
                  </p>
                </div>
                <Button onClick={closeResetModal} className="w-full bg-gradient-to-r from-purple-600 to-orange-600">
                  Continue to Sign In
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
