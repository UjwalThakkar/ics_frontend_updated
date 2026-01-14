'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Analytics and Monitoring
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  // Initialize Sentry for error monitoring
  useEffect(() => {
    const initMonitoring = async () => {
      if (process.env.NODE_ENV === 'production') {
        try {
          const { initSentry } = await import('@/lib/monitoring')
          initSentry()
        } catch (error) {
          console.error('Failed to initialize Sentry:', error)
        }
      }
    }

    initMonitoring()
  }, [])

  // Track page views with Google Analytics
  useEffect(() => {
    const trackPageView = () => {
      if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: pathname,
          page_title: document.title
        })
      }
    }

    // Small delay to ensure gtag is loaded
    const timer = setTimeout(trackPageView, 100)
    return () => clearTimeout(timer)
  }, [pathname])

  // Track Web Vitals for performance monitoring
  useEffect(() => {
    const trackWebVitals = async () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        try {
          const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals')

          getCLS((metric) => {
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'CLS',
                value: Math.round(metric.value * 1000)
              })
            }
          })

          getFID((metric) => {
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'FID',
                value: Math.round(metric.value)
              })
            }
          })

          getFCP((metric) => {
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'FCP',
                value: Math.round(metric.value)
              })
            }
          })

          getLCP((metric) => {
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'LCP',
                value: Math.round(metric.value)
              })
            }
          })

          getTTFB((metric) => {
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'TTFB',
                value: Math.round(metric.value)
              })
            }
          })
        } catch (error) {
          console.error('Error tracking Web Vitals:', error)
        }
      }
    }

    trackWebVitals()
  }, [])

  if (!GA_TRACKING_ID) {
    return <>{children}</>
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });

            // Track consular service interactions
            window.trackConsularEvent = function(eventType, data) {
              gtag('event', eventType, {
                event_category: 'consular_services',
                service_type: data.serviceType || 'unknown',
                user_type: data.userType || 'visitor',
                custom_parameters: data
              });
            };

            // Track application funnel
            window.trackApplicationFunnel = function(step, serviceType) {
              gtag('event', 'application_funnel', {
                event_category: 'conversions',
                funnel_step: step,
                service_type: serviceType,
                value: 1
              });
            };

            // Track admin actions
            window.trackAdminAction = function(action, resource) {
              gtag('event', 'admin_action', {
                event_category: 'admin_panel',
                action_type: action,
                resource_type: resource,
                admin_interaction: true
              });
            };
          `,
        }}
      />

      {/* Hotjar Analytics (Optional) */}
      {process.env.NEXT_PUBLIC_HOTJAR_ID && (
        <Script
          id="hotjar"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}

      {children}
    </>
  )
}
