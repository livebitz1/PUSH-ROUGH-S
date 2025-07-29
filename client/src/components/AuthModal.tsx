import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onSwitchMode: () => void;
}

export default function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  const [step, setStep] = useState<"details" | "otp">(mode === "signin" ? "details" : "details");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: async (userData: { phoneNumber: string; firstName?: string; lastName?: string; email?: string; age?: number; gender?: string; address?: string }) => {
      return apiRequest("POST", "/api/auth/send-otp", userData);
    },
    onSuccess: () => {
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code. Demo OTP: 123456",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp, userData }: { phone: string; otp: string; userData?: any }) => {
      return apiRequest("POST", "/api/auth/verify-otp", { 
        phoneNumber: phone, 
        otp,
        mode,
        userData 
      });
    },
    onSuccess: (data) => {
      // Login/signup successful
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: mode === "signin" ? "Signed in successfully!" : "Account created successfully!",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      const errorMessage = error.message || "Invalid OTP";
      
      // If user doesn't exist, suggest creating an account
      if (errorMessage.includes("No account found")) {
        toast({
          title: "Account Not Found",
          description: "No account found with this phone number. Please sign up to create a new account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });



  const resetForm = () => {
    setStep("details");
    setPhoneNumber("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setAge("");
    setGender("");
    setAddress("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSwitchModeWithReset = () => {
    // Reset form when switching modes to ensure clean state
    setStep("details");
    setPhoneNumber("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setAge("");
    setGender("");
    setAddress("");
    onSwitchMode();
  };

  const handleSendOtp = () => {
    if (mode === "signin") {
      // For sign in, only phone number is needed
      if (!phoneNumber.trim()) {
        toast({
          title: "Error",
          description: "Please enter your phone number",
          variant: "destructive",
        });
        return;
      }
      sendOtpMutation.mutate({ phoneNumber });
    } else {
      // For sign up, validate all required fields
      if (!phoneNumber.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !age.trim() || !gender.trim() || !address.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      const userData = {
        phoneNumber,
        firstName,
        lastName,
        email,
        age: parseInt(age),
        gender,
        address
      };
      sendOtpMutation.mutate(userData);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    
    const userData = mode === "signup" ? {
      firstName,
      lastName,
      email,
      age: parseInt(age),
      gender,
      address
    } : undefined;
    
    verifyOtpMutation.mutate({ phone: phoneNumber, otp, userData });
  };

  const handleCompleteSignup = () => {
    // This function is no longer needed as we handle everything in handleVerifyOtp
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-medical-blue">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === "details" && mode === "signup" && (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium">Create Your Account</h3>
                  <p className="text-sm text-gray-500">Please fill in your details</p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                        min="1"
                        max="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+855 12 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full bg-medical-blue hover:bg-medical-blue-dark"
              >
                {sendOtpMutation.isPending ? "Sending OTP..." : "Send Verification Code"}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleSwitchModeWithReset}
                  className="text-medical-blue hover:underline text-sm"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          )}

          {step === "details" && mode === "signin" && (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium">Welcome Back</h3>
                  <p className="text-sm text-gray-500">Please enter your phone number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+855 12 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    We'll send you a verification code
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full bg-medical-blue hover:bg-medical-blue-dark"
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send Verification Code"}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleSwitchModeWithReset}
                  className="text-medical-blue hover:underline text-sm"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium">Enter Verification Code</h3>
                  <p className="text-sm text-gray-500">
                    Sent to {phoneNumber}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Demo OTP: 123456
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending || otp.length !== 6}
                  className="w-full bg-medical-blue hover:bg-medical-blue-dark"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep("details")}
                  className="w-full"
                >
                  Change Phone Number
                </Button>
                
                <div className="text-center pt-2">
                  <button
                    onClick={handleSwitchModeWithReset}
                    className="text-medical-blue hover:underline text-sm"
                  >
                    {mode === "signin" 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </div>
            </>
          )}


        </div>
      </DialogContent>
    </Dialog>
  );
}