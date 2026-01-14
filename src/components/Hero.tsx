'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const Hero = () => {
  // Dynamic background images - Hindu temples and spiritual sites only
  const backgroundImages = [
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      name: 'Golden Temple, Amritsar'
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      name: 'Meenakshi Temple, Madurai'
    },
    {
      url: 'https://images.unsplash.com/photo-1540961047393-dd4f3c2b4c47?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      name: 'Lotus Temple, Delhi'
    },
    {
      url: 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      name: 'Akshardham Temple, Delhi'
    },
    {
      url: 'https://images.unsplash.com/photo-1605649487212-183049fb75b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      name: 'Somnath Temple, Gujarat'
    }
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only change image on client-side to avoid hydration mismatch
    setIsLoaded(true)
    // Use a deterministic but varying approach
    const hour = new Date().getHours()
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const index = (hour + dayOfYear) % backgroundImages.length
    setCurrentImageIndex(index)
  }, [])

  // Auto-rotate images every 10 seconds for dynamic experience
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      )
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  const currentImage = backgroundImages[currentImageIndex]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${currentImage?.url})`
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/80 via-blue-800/70 to-indigo-900/80"></div>
      </div>

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="temple-pattern"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fadeInUp">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-saffron block md:inline">
              Indian Consular Services
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 font-medium">
            Authentic • Secure • Efficient Consular Services in Johannesburg
          </p>

          {/* Description */}
          <p className="text-lg text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            We are the authorized service provider for the Consulate General of India in South Africa,
            offering comprehensive passport, visa, OCI, and consular services with the highest
            standards of security and authenticity.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/apply"
              className="inline-flex items-center px-8 py-4 bg-saffron hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Start Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/appointment"
              className="inline-flex items-center px-8 py-4 border-2 border-orange-500 bg-orange-500/90 backdrop-blur-sm text-white hover:bg-orange-600 font-semibold rounded-lg transition-all duration-300 shadow-lg"
            >
              Book Appointment
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
            >
              Track Application
            </Link>
          </div>

          {/* Image Caption */}
          {currentImage && (
            <div className="text-center text-blue-200/80 text-sm font-medium">
              📍 {currentImage.name}
            </div>
          )}
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-saffron w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
