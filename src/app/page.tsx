import React, { Suspense } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import TrackingSection from '@/components/TrackingSection'
import Footer from '@/components/Footer'
import Chatbot from '@/components/Chatbot'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Suspense fallback={
        <section className="py-16 bg-gray-50" id="services">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </section>
      }>
        <Services />
      </Suspense>
      <TrackingSection />
      <Footer />
      <Chatbot />
    </main>
  )
}
