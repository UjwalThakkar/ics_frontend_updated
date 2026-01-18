"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Eye,
  EyeOff,
  Phone,
  Mail,
  User,
  Lock,
  AlertCircle,
  Check,
  XCircle,
} from "lucide-react";
import { phpAPI } from "@/lib/php-api-client";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
  onSwitchType: (type: "login" | "register") => void;
  onSuccessRedirect?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  type,
  onSwitchType,
  onSuccessRedirect,
}) => {
  const { login, register, sendRegistrationOtp, regenerateRegistrationOtp } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [isRegeneratingOtp, setIsRegeneratingOtp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [countryCode, setCountryCode] = useState<string>("+27"); // Default to South Africa

  // Validation functions
  const validateFirstName = (name: string): string | null => {
    if (!name.trim()) {
      return "First name is required";
    }
    if (name.trim().length < 2) {
      return "First name must be at least 2 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return "First name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return null;
  };

  const validateLastName = (name: string): string | null => {
    if (!name.trim()) {
      return "Last name is required";
    }
    if (name.trim().length < 2) {
      return "Last name must be at least 2 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return null;
  };

  // Common country codes with their validation rules
  const countryPhoneRules: Record<string, { minLength: number; maxLength: number; pattern?: RegExp }> = {
    "+27": { minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ }, // South Africa
    "+1": { minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ }, // USA/Canada
    "+91": { minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ }, // India
    "+44": { minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ }, // UK
    "+61": { minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ }, // Australia
    "+86": { minLength: 11, maxLength: 11, pattern: /^[0-9]{11}$/ }, // China
    "+81": { minLength: 10, maxLength: 10, pattern: /^[0-9]{10}$/ }, // Japan
    "+49": { minLength: 10, maxLength: 11, pattern: /^[0-9]{10,11}$/ }, // Germany
    "+33": { minLength: 9, maxLength: 9, pattern: /^[0-9]{9}$/ }, // France
    "+39": { minLength: 9, maxLength: 10, pattern: /^[0-9]{9,10}$/ }, // Italy
  };

  const validatePhone = (phone: string, countryCode: string): string | null => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    
    // Get validation rules for the country code
    const rules = countryPhoneRules[countryCode];
    const digitsOnly = phone.trim().replace(/\D/g, "");
    
    if (rules) {
      // Use specific validation for known country codes
      if (digitsOnly.length < rules.minLength || digitsOnly.length > rules.maxLength) {
        return `Phone number must be ${rules.minLength}-${rules.maxLength} digits`;
      }
      if (rules.pattern && !rules.pattern.test(digitsOnly)) {
        return "Please enter a valid phone number";
      }
    } else {
      // Generic validation for unknown country codes
      if (digitsOnly.length < 7) {
        return "Phone number must be at least 7 digits";
      }
      if (digitsOnly.length > 15) {
        return "Phone number cannot exceed 15 digits";
      }
    }
    
    return null;
  };

  const validatePassword = (password: string): {
    isValid: boolean;
    checks: {
      minLength: boolean;
      hasUpperCase: boolean;
      hasLowerCase: boolean;
      hasNumber: boolean;
      hasSpecialChar: boolean;
    };
  } => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    return {
      isValid: Object.values(checks).every((check) => check === true),
      checks,
    };
  };

  // Password validation checks (memoized)
  const passwordValidation = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  // OTP Countdown Timer Effect
  useEffect(() => {
    if (step === "otp" && otpExpiresAt) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        // Parse the UTC datetime string properly
        // Backend sends UTC time in format: "2026-01-18 10:27:16"
        // We need to parse it as UTC explicitly
        let expiresAtTime: number;
        try {
          if (otpExpiresAt.includes('T') || otpExpiresAt.includes('Z') || otpExpiresAt.includes('+')) {
            // Already has timezone info
            expiresAtTime = new Date(otpExpiresAt).getTime();
          } else {
            // Assume UTC if no timezone info (backend sends UTC)
            // Format: "2026-01-18 10:27:16" -> "2026-01-18T10:27:16Z"
            const utcString = otpExpiresAt.replace(' ', 'T') + 'Z';
            expiresAtTime = new Date(utcString).getTime();
          }
          
          // Validate that we got a valid date
          if (isNaN(expiresAtTime)) {
            console.error("Invalid OTP expiration date:", otpExpiresAt);
            setTimeRemaining(0);
            return;
          }
          
          const remaining = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
          
          setTimeRemaining(remaining);

          if (remaining <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setTimeRemaining(0);
          }
        } catch (error) {
          console.error("Error calculating OTP countdown:", error);
          setTimeRemaining(0);
        }
      };

      // Initial calculation
      updateCountdown();

      // Update every second
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);

      // Cleanup on unmount or when step/expiresAt changes
      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      };
    } else {
      setTimeRemaining(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [step, otpExpiresAt]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (type === "register") {
      const firstNameError = validateFirstName(formData.first_name);
      if (firstNameError) errors.first_name = firstNameError;

      const lastNameError = validateLastName(formData.last_name);
      if (lastNameError) errors.last_name = lastNameError;

      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;

      const phoneError = validatePhone(formData.phone, countryCode);
      if (phoneError) errors.phone = phoneError;

      if (!passwordValidation.isValid) {
        errors.password = "Password does not meet all requirements";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle field blur
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));

    let error: string | null = null;
    switch (fieldName) {
      case "first_name":
        error = validateFirstName(formData.first_name);
        break;
      case "last_name":
        error = validateLastName(formData.last_name);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "phone":
        error = validatePhone(formData.phone, countryCode);
        break;
    }

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: error! }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (type === "register") {
        // Step 1: Send OTP
        if (step === "form") {
          console.log("📝 Sending registration OTP...");

          // Validate all fields before proceeding
          if (!validateAllFields()) {
            setError("Please fix all validation errors before continuing");
            setIsLoading(false);
            return;
          }

          // Send OTP
          const result = await sendRegistrationOtp(
            formData.first_name,
            formData.last_name,
            formData.email
          );

          if (result.success) {
            console.log("OTP sent successfully");
            setOtpExpiresAt(result.expiresAt || null);
            setStep("otp");
          } else {
            console.error("Failed to send OTP:", result.error);
            setError(result.error || "Failed to send OTP. Please try again.");
          }
        } 
        // Step 2: Verify OTP and Register
        else if (step === "otp") {
          console.log("📝 Verifying OTP and registering...");

          if (formData.otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            setIsLoading(false);
            return;
          }

          // Register with OTP (include country code in phone number)
          const fullPhoneNumber = `${countryCode}${formData.phone}`;
          const result = await register(
            formData.first_name,
            formData.last_name,
            formData.email,
            fullPhoneNumber,
            formData.password,
            formData.otp
          );

          if (result.success) {
            console.log("Registration successful");
            setStep("success");
            setTimeout(() => {
              onClose();
              resetForm();
              if (onSuccessRedirect) {
                onSuccessRedirect();
              }
            }, 2000);
          } else {
            console.error("Registration failed:", result.error);
            setError(result.error || "Registration failed. Please try again.");
          }
        }
      } else {
        // Real login using PHP API
        console.log("🔐 Attempting login with:", {
          type: "user",
          email: formData.username || formData.email,
        });

        const email = formData.username || formData.email;
        const type = "user";
        const result = await login(type, email, formData.password);

        if (result.success) {
          console.log("✅ Login successful!");
          setStep("success");
          setTimeout(() => {
            onClose();
            resetForm();
            if (onSuccessRedirect) {
              onSuccessRedirect();
            }
          }, 2000);
        } else {
          console.error("❌ Login failed:", result.error);
          setError(result.error || "Login failed. Please try again.");
          console.log(result)
        }
      }
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateOtp = async () => {
    if (isRegeneratingOtp) return;
    
    setIsRegeneratingOtp(true);
    setError(null);

    try {
      const result = await regenerateRegistrationOtp(
        formData.first_name,
        formData.last_name,
        formData.email
      );

      if (result.success) {
        setOtpExpiresAt(result.expiresAt || null);
        setError(null);
        // Show success message briefly
        setTimeout(() => {
          // Clear any error messages
        }, 2000);
      } else {
        setError(result.error || "Failed to regenerate OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to regenerate OTP");
    } finally {
      setIsRegeneratingOtp(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      otp: "",
      username: "",
    });
    setStep("form");
    setError(null);
    setOtpExpiresAt(null);
    setIsRegeneratingOtp(false);
    setFieldErrors({});
    setTouchedFields(new Set());
    setCountryCode("+27");
    setTimeRemaining(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-blue-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {type === "login" ? "Login" : "Create Account"}
                </h2>
                <p className="text-blue-100 text-sm">
                  Access your consular services
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className=" text-black hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "register" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => {
                        setFormData({ ...formData, first_name: e.target.value });
                        // Clear error when user starts typing
                        if (fieldErrors.first_name) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.first_name;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={() => handleFieldBlur("first_name")}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        touchedFields.has("first_name") && fieldErrors.first_name
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {touchedFields.has("first_name") && fieldErrors.first_name && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => {
                        setFormData({ ...formData, last_name: e.target.value });
                        if (fieldErrors.last_name) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.last_name;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={() => handleFieldBlur("last_name")}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        touchedFields.has("last_name") && fieldErrors.last_name
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {touchedFields.has("last_name") && fieldErrors.last_name && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.last_name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {type === "login" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              )}

              {type === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={() => handleFieldBlur("email")}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        touchedFields.has("email") && fieldErrors.email
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {touchedFields.has("email") && fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              )}

              {type === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value);
                          // Clear phone error when country code changes
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.phone;
                              return newErrors;
                            });
                          }
                        }}
                        className="h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium"
                      >
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+31">🇳🇱 +31</option>
                        <option value="+32">🇧🇪 +32</option>
                        <option value="+41">🇨🇭 +41</option>
                        <option value="+46">🇸🇪 +46</option>
                        <option value="+47">🇳🇴 +47</option>
                        <option value="+45">🇩🇰 +45</option>
                        <option value="+358">🇫🇮 +358</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+353">🇮🇪 +353</option>
                        <option value="+30">🇬🇷 +30</option>
                        <option value="+48">🇵🇱 +48</option>
                        <option value="+420">🇨🇿 +420</option>
                        <option value="+36">🇭🇺 +36</option>
                        <option value="+40">🇷🇴 +40</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+972">🇮🇱 +972</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+233">🇬🇭 +233</option>
                        <option value="+256">🇺🇬 +256</option>
                        <option value="+255">🇹🇿 +255</option>
                        <option value="+250">🇷🇼 +250</option>
                        <option value="+251">🇪🇹 +251</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+213">🇩🇿 +213</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+218">🇱🇾 +218</option>
                        <option value="+249">🇸🇩 +249</option>
                        <option value="+260">🇿🇲 +260</option>
                        <option value="+263">🇿🇼 +263</option>
                        <option value="+258">🇲🇿 +258</option>
                        <option value="+265">🇲🇼 +265</option>
                        <option value="+267">🇧🇼 +267</option>
                        <option value="+268">🇸🇿 +268</option>
                        <option value="+266">🇱🇸 +266</option>
                        <option value="+264">🇳🇦 +264</option>
                      </select>
                    </div>
                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, phone: value });
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.phone;
                              return newErrors;
                            });
                          }
                        }}
                        onBlur={() => handleFieldBlur("phone")}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          touchedFields.has("phone") && fieldErrors.phone
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex-1">
                      {touchedFields.has("phone") && fieldErrors.phone && (
                        <p className="text-xs text-red-600">
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Full: {countryCode} {formData.phone || "..."}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setTouchedFields((prev) => new Set(prev).add("password"));
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.password;
                          return newErrors;
                        });
                      }
                    }}
                    onBlur={() => {
                      setTouchedFields((prev) => new Set(prev).add("password"));
                      if (!passwordValidation.isValid) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: "Password does not meet all requirements",
                        }));
                      }
                    }}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      touchedFields.has("password") && fieldErrors.password
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Password Requirements Checklist */}
                {type === "register" && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Password Requirements:
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs">
                        {passwordValidation.checks.minLength ? (
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={
                            passwordValidation.checks.minLength
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          At least 8 characters long
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordValidation.checks.hasUpperCase ? (
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={
                            passwordValidation.checks.hasUpperCase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          Include uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordValidation.checks.hasLowerCase ? (
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={
                            passwordValidation.checks.hasLowerCase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          Include lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordValidation.checks.hasNumber ? (
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={
                            passwordValidation.checks.hasNumber
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          Include at least one number
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        {passwordValidation.checks.hasSpecialChar ? (
                          <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={
                            passwordValidation.checks.hasSpecialChar
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          Include at least one special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {touchedFields.has("password") && fieldErrors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {type === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        });
                        setTouchedFields((prev) =>
                          new Set(prev).add("confirmPassword")
                        );
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.confirmPassword;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields((prev) =>
                          new Set(prev).add("confirmPassword")
                        );
                        if (formData.password !== formData.confirmPassword) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: "Passwords do not match",
                          }));
                        }
                      }}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        touchedFields.has("confirmPassword") &&
                        fieldErrors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {touchedFields.has("confirmPassword") &&
                    fieldErrors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  (type === "register" &&
                    step === "form" &&
                    !passwordValidation.isValid)
                }
                className="w-full py-3 bg-saffron hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {type === "login" 
                      ? "Signing In..." 
                      : step === "form" 
                        ? "Send Verification Code" 
                        : "Creating Account..."}
                  </>
                ) : type === "login" ? (
                  "Sign In"
                ) : step === "form" ? (
                  "Send Verification Code"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Verify Your Email
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-gray-800 font-medium mt-1">
                  {formData.email}
                </p>
                {timeRemaining !== null && (
                  <div className="mt-2">
                    {timeRemaining > 0 ? (
                      <p className="text-xs text-gray-600">
                        Code expires in:{" "}
                        <span
                          className={`font-semibold ${
                            timeRemaining <= 60
                              ? "text-red-600"
                              : timeRemaining <= 180
                              ? "text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          {formatTimeRemaining(timeRemaining)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 font-medium">
                        OTP has expired. Please request a new one.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.otp}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, otp: value.slice(0, 6) });
                    }}
                    className="w-full px-4 py-3 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    formData.otp.length !== 6 ||
                    (timeRemaining !== null && timeRemaining <= 0)
                  }
                  className="w-full py-3 bg-saffron hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                      Verifying & Creating Account...
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
                </button>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerateOtp}
                    disabled={isRegeneratingOtp}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
                  >
                    {isRegeneratingOtp ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block mr-1"></div>
                        Sending...
                      </>
                    ) : (
                      "Resend OTP"
                    )}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Back to form
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {type === "login" ? "Welcome Back!" : "Account Created!"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {type === "login"
                    ? "You have been successfully logged in."
                    : "Your account has been created and verified successfully."}
                </p>
              </div>
            </div>
          )}

          {step === "form" && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {type === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  onClick={() =>
                    onSwitchType(type === "login" ? "register" : "login")
                  }
                  className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                >
                  {type === "login" ? "Create Account" : "Sign In"}
                </button>
              </p>

              {type === "login" && (
                <button className="text-blue-600 hover:text-blue-800 text-sm mt-2">
                  Forgot your password?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
