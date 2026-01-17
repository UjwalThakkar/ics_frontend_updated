"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect");

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, authLoading, redirectUrl, router]);

  // Handle successful login/registration
  const handleAuthSuccess = () => {
    // Close modal and redirect after a short delay
    setTimeout(() => {
      setIsModalOpen(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    }, 1500);
  };

  // If still loading auth state, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth Modal - shown immediately */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // If user closes modal without logging in, redirect to home
          router.push("/");
        }}
        type={authType}
        onSwitchType={setAuthType}
        onSuccessRedirect={handleAuthSuccess}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

