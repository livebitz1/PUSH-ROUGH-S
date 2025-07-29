import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, Lock, Phone, Eye, EyeOff, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function DoctorLogin() {
  const [currentStep, setCurrentStep] = useState<"login" | "forgot" | "otp" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState("");
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
      rememberMe: false,
    },
  });

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/doctor/login", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to your doctor panel!",
      });
      window.location.href = "/doctor-dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      await apiRequest("POST", "/api/doctor/forgot-password", data);
    },
    onSuccess: () => {
      setTempPhoneNumber(forgotForm.getValues("phoneNumber"));
      setCurrentStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpFormData) => {
      await apiRequest("POST", "/api/doctor/verify-reset-otp", {
        phoneNumber: tempPhoneNumber,
        otp: data.otp,
      });
    },
    onSuccess: () => {
      setCurrentStep("reset");
      toast({
        title: "OTP Verified",
        description: "Please set your new password",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      await apiRequest("POST", "/api/doctor/reset-password", {
        phoneNumber: tempPhoneNumber,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      setCurrentStep("login");
      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onForgotSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  const onOtpSubmit = (data: OtpFormData) => {
    verifyOtpMutation.mutate(data);
  };

  const onResetSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            data-testid="link-back-home"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
          </div>
          <p className="text-gray-600">Access your professional dashboard</p>
        </div>

        {/* Login Form */}
        {currentStep === "login" && (
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your doctor panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="emailOrPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              {...field}
                              type="text"
                              className="pl-10"
                              placeholder="doctor@example.com or +855..."
                              data-testid="input-email-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10"
                              placeholder="Enter your password"
                              data-testid="input-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-remember-me"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Remember me
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <button
                      type="button"
                      onClick={() => setCurrentStep("forgot")}
                      className="text-sm text-blue-600 hover:text-blue-500"
                      data-testid="button-forgot-password"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-sign-in"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password Form */}
        {currentStep === "forgot" && (
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your phone number to receive a reset code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...forgotForm}>
                <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                  <FormField
                    control={forgotForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              {...field}
                              type="tel"
                              className="pl-10"
                              placeholder="+855 12 345 678"
                              data-testid="input-phone-forgot"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("login")}
                      className="flex-1"
                      data-testid="button-back-login"
                    >
                      Back to Login
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={forgotPasswordMutation.isPending}
                      data-testid="button-send-otp"
                    >
                      {forgotPasswordMutation.isPending ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Form */}
        {currentStep === "otp" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter OTP</CardTitle>
              <CardDescription>
                We sent a 6-digit code to {tempPhoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            placeholder="123456"
                            data-testid="input-otp"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("forgot")}
                      className="flex-1"
                      data-testid="button-back-forgot"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={verifyOtpMutation.isPending}
                      data-testid="button-verify-otp"
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Reset Password Form */}
        {currentStep === "reset" && (
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              {...field}
                              type="password"
                              className="pl-10"
                              placeholder="Enter new password"
                              data-testid="input-new-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              {...field}
                              type="password"
                              className="pl-10"
                              placeholder="Confirm new password"
                              data-testid="input-confirm-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}