import API from "../api/axiosInstance";

export type LoginParams = { email: string; password: string };
export type SignupParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organization: string;
  role: string;
};

export type AuthResult =
  | { success: true; access_token: string; token_type: string }
  | { success: false; message: string };

// -------------------------------
// Login (POST /api/v1/auth/login)
// -------------------------------
export async function loginWithEmail(params: LoginParams): Promise<AuthResult> {
  const { email, password } = params;

  try {
    // Backend expects form-data: username, password
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await API.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Save token for future requests
    localStorage.setItem("token", res.data.access_token);
     // ✅ Save email for UI
    localStorage.setItem("userEmail", email);

    return { success: true, ...res.data };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.detail || "Login failed",
    };
  }
}

// -------------------------------
// Signup (POST /api/v1/auth/register)
// -------------------------------
export async function signupWithEmail(params: SignupParams): Promise<AuthResult> {
  const { email, password } = params;

  try {
    const res = await API.post("/auth/register", { email, password });

    // Save token for future requests
    localStorage.setItem("token", res.data.access_token);
     // ✅ Save email for UI
    localStorage.setItem("userEmail", email);

    return { success: true, ...res.data };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.detail || "Signup failed",
    };
  }
}

// -------------------------------
// Password reset (stubs for now)
// -------------------------------
export async function sendResetEmail(email: string): Promise<AuthResult> {
  return { success: true, access_token: "", token_type: "bearer" };
}

export async function verifyResetCode(code: string): Promise<AuthResult> {
  return code === "123456"
    ? { success: true, access_token: "", token_type: "bearer" }
    : { success: false, message: "Invalid verification code" };
}

export async function resetPassword(newPassword: string, confirm: string): Promise<AuthResult> {
  if (newPassword !== confirm) {
    return { success: false, message: "Passwords do not match" };
  }
  return { success: true, access_token: "", token_type: "bearer" };
}
