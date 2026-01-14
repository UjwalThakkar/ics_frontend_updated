'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Phone, Mail, MapPin, Globe, User as UserIcon } from 'lucide-react'
import IndianEmblem from './IndianEmblem'
import AuthModal from './AuthModal'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authType, setAuthType] = useState<'login' | 'register'>('login')
  const [isScrolled, setIsScrolled] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 70)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])



  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleServices = () => setIsServicesOpen(!isServicesOpen)

  const openAuthModal = (type: 'login' | 'register') => {
    setAuthType(type)
    setIsAuthModalOpen(true)
  }

  const services = [
    { name: 'Passport Services', href: '/passport' },
    { name: 'Visa Services', href: '/visa' },
    { name: 'OCI Services', href: '/oci' },
    { name: 'Document Attestation', href: '/attestation' },
    { name: 'Consular Services', href: '/consular' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      {/* Government Info Bar */}
      <div className="tricolor-gradient h-1"></div>

      {/* Contact Info Bar */}
      <div className={`bg-navy text-white transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 py-0' : 'h-auto py-2'} hidden md:block`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+27 81 52125242</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@oomas.co.za</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Johannesburg, South Africa</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span>Emergency: +27 81 52125242</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-4' : 'py-4'}`}>
            {/* Logo and Title */}
            <Link href="/" className="flex items-center space-x-4">
              {/* Indian Emblem */}
              <div className="bg-white p-2 rounded-lg shadow-lg border-2 border-saffron">
                <IndianEmblem size="lg" />
              </div>

              <div className="flex flex-col">
                <h1 className={`font-bold text-navy transition-all duration-300 ${isScrolled ? 'text-lg md:text-2xl' : 'text-xl md:text-2xl'}`}>
                  Consulate General of India
                </h1>
                <p className={`text-gray-600 transition-all duration-300 ${isScrolled ? 'text-sx' : 'text-sx'}`}>Johannesburg (South Africa)</p>
                <p className={`text-saffron font-medium transition-all duration-300 ${isScrolled ? 'hidden' : 'text-xs'}`}>Indian Consular Services</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-navy transition-colors">
                {t('nav.home')}
              </Link>

              {/* Services Dropdown */}
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-navy transition-colors">
                  {t('nav.services')}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-lg border mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-navy transition-colors"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/appointment" className="text-gray-700 hover:text-navy transition-colors">
                {t('nav.book')}
              </Link>
              <Link href="/track" className="text-gray-700 hover:text-navy transition-colors">
                {t('nav.track')}
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-navy transition-colors">
                {t('nav.about')}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-navy transition-colors">
                {t('nav.contact')}
              </Link>

              {/* Language Switcher */}
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-navy transition-colors">
                  <Globe className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'EN' : 'हिं'}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute top-full right-0 w-32 bg-white shadow-xl rounded-lg border mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        language === 'en' ? 'bg-blue-50 text-navy' : 'text-gray-700 hover:bg-blue-50 hover:text-navy'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('hi')}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        language === 'hi' ? 'bg-blue-50 text-navy' : 'text-gray-700 hover:bg-blue-50 hover:text-navy'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-md">
                    <UserIcon className="h-4 w-4 text-navy" />
                    <span className="text-sm font-medium text-navy">
                      {user?.username || user?.email}
                    </span>
                    {user?.role && (
                      <span className="text-xs bg-saffron text-white px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-navy transition-colors"
                  >
                    My Applications
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 border border-navy text-navy hover:bg-navy hover:text-white transition-colors rounded-md"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 bg-navy text-white hover:bg-blue-800 transition-colors rounded-md shadow-md"
                  >
                    {t('nav.register')}
                  </button>
                </>
              )}
              <Link
                href="/apply"
                className="px-4 py-2 bg-saffron text-white hover:bg-orange-600 transition-colors rounded-md shadow-md"
              >
                {t('nav.apply')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-navy transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-4">
              <Link
                href="/"
                className="block text-gray-700 hover:text-navy transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Services Menu */}
              <div>
                <button
                  onClick={toggleServices}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-navy transition-colors"
                >
                  Services
                  <ChevronDown className={`h-4 w-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isServicesOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="block text-sm text-gray-600 hover:text-navy transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/appointment"
                className="block text-gray-700 hover:text-navy transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Appointment
              </Link>
              <Link
                href="/track"
                className="block text-gray-700 hover:text-navy transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Application
              </Link>
              <Link
                href="/about"
                className="block text-gray-700 hover:text-navy transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-gray-700 hover:text-navy transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                    <button
                      onClick={() => {
                        setIsLoggedIn(false)
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openAuthModal('login')
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-center px-4 py-2 border border-navy text-navy hover:bg-navy hover:text-white transition-colors rounded-md"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('register')
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-center px-4 py-2 bg-navy text-white hover:bg-blue-800 transition-colors rounded-md shadow-md"
                    >
                      Register
                    </button>
                  </>
                )}
                <Link
                  href="/apply"
                  className="block w-full text-center px-4 py-2 bg-saffron text-white hover:bg-orange-600 transition-colors rounded-md shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Apply Now
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authType}
        onSwitchType={setAuthType}
      />
    </header>
  )
}

export default Header
