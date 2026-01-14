'use client'

import React, { useRef, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface RecaptchaWrapperProps {
  onVerify: (token: string | null) => void
  onError?: () => void
  onExpired?: () => void
  size?: 'compact' | 'normal' | 'invisible'
  theme?: 'light' | 'dark'
  className?: string
}

const RecaptchaWrapper: React.FC<RecaptchaWrapperProps> = ({
  onVerify,
  onError,
  onExpired,
  size = 'normal',
  theme = 'light',
  className = ''
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKey) {
      console.error('reCAPTCHA site key is not configured')
    }
  }, [siteKey])

  const handleChange = (token: string | null) => {
    onVerify(token)
  }

  const handleError = () => {
    console.error('reCAPTCHA error occurred')
    if (onError) {
      onError()
    }
  }

  const handleExpired = () => {
    console.warn('reCAPTCHA token expired')
    onVerify(null)
    if (onExpired) {
      onExpired()
    }
  }

  // Method to manually reset reCAPTCHA
  const reset = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  // Method to manually execute reCAPTCHA (for invisible reCAPTCHA)
  const execute = async (): Promise<string | null> => {
    if (recaptchaRef.current) {
      return await recaptchaRef.current.executeAsync()
    }
    return null
  }

  if (!siteKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-red-600 text-sm">reCAPTCHA is not properly configured</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onError={handleError}
        onExpired={handleExpired}
        size={size}
        theme={theme}
      />
    </div>
  )
}

// Higher-order component for forms with reCAPTCHA
export const withRecaptcha = <P extends object>(
  WrappedComponent: React.ComponentType<P & { recaptchaToken: string | null; resetRecaptcha: () => void }>
) => {
  return function RecaptchaEnhancedComponent(props: P) {
    const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null)
    const recaptchaRef = React.useRef<ReCAPTCHA>(null)

    const resetRecaptcha = () => {
      setRecaptchaToken(null)
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
    }

    return (
      <div>
        <WrappedComponent
          {...props}
          recaptchaToken={recaptchaToken}
          resetRecaptcha={resetRecaptcha}
        />
        <div className="mt-4">
          <RecaptchaWrapper
            onVerify={setRecaptchaToken}
            onError={resetRecaptcha}
            onExpired={resetRecaptcha}
          />
        </div>
      </div>
    )
  }
}

export default RecaptchaWrapper
