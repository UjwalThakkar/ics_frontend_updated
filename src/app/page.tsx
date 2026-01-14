import React from 'react'
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
      <Services />
      <TrackingSection />
      <Footer />
      <Chatbot />
    </main>
  )
}
