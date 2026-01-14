'use client'

import React from 'react'
import Link from 'next/link'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  ExternalLink,
  Shield,
  AlertTriangle
} from 'lucide-react'

const Footer = () => {
  const quickLinks = [
    { name: 'Passport Services', href: '/passport' },
    { name: 'Visa Services', href: '/visa' },
    { name: 'OCI Services', href: '/oci' },
    { name: 'Document Attestation', href: '/attestation' },
    { name: 'Book Appointment', href: '/appointment' },
    { name: 'Track Application', href: '/track' }
  ]

  const importantLinks = [
    { name: 'Embassy of India, Pretoria', href: 'https://www.eoipretoria.gov.in' },
    { name: 'Ministry of External Affairs', href: 'https://www.mea.gov.in' },
    { name: 'Passport Seva', href: 'https://www.passportindia.gov.in' },
    { name: 'e-Visa Portal', href: 'https://indianvisaonline.gov.in' },
    { name: 'OCI Services', href: 'https://ociservices.gov.in' },
    { name: 'Incredible India', href: 'https://www.incredibleindia.org' }
  ]

  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="bg-navy text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-temple-gold">Contact Us</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-saffron mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Consulate General of India</p>
                      <p className="text-sm text-blue-200">Johannesburg, South Africa</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-saffron flex-shrink-0" />
                    <div>
                      <p className="text-sm">+27 11 895 0460</p>
                      <p className="text-xs text-blue-200">Office Hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-300">+27 81 52125242</p>
                      <p className="text-xs text-green-200">WhatsApp Support</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-300">+27 81 52125242</p>
                      <p className="text-xs text-red-200">Emergency & Support</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-saffron flex-shrink-0" />
                    <p className="text-sm">support@oomas.co.za</p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-saffron" />
                  Office Hours
                </h4>
                <div className="text-sm space-y-1 text-blue-200">
                  <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p>Saturday: 9:00 AM - 1:00 PM</p>
                  <p>Sunday: Closed</p>
                  <p className="text-red-300 text-xs mt-2">
                    Closed on Indian and South African public holidays
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-temple-gold">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-blue-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Links */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-temple-gold">Important Links</h3>
              <ul className="space-y-2">
                {importantLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-200 hover:text-white transition-colors flex items-center"
                    >
                      {link.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Provider & Social */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-temple-gold">Service Provider</h3>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h4 className="font-semibold text-white mb-2">Oomas Pty Ltd</h4>
                  <p className="text-sm text-blue-200 mb-2">Johannesburg</p>
                  <p className="text-xs text-blue-300">
                    Authorized by the Consulate General of India for providing consular services.
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-semibold mb-3">Follow Us</h4>
                <div className="flex space-x-3">
                  <a
                    href="https://www.facebook.com/IndiaInSouthAfrica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    title="Follow us on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com/IndiainSA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    title="Follow us on Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/c/EmbassyofIndiaJohannesburg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    title="Subscribe to our YouTube channel"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/indiainsouthafrica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    title="Follow us on Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>

                {/* WhatsApp Support */}
                <div className="mt-4">
                  <a
                    href="https://wa.me/27828094646?text=Hello,%20I%20need%20help%20with%20consular%20services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.309"/>
                    </svg>
                    WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notices */}
      <div className="bg-red-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              <strong>Important:</strong> Beware of fraudulent websites and unauthorized agents.
              Always verify the authenticity of service providers. This is the official website for Indian consular services in Johannesburg.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

            {/* Copyright */}
            <div className="text-sm text-gray-400">
              <p>&copy; 2025 Indian Consular Services, Johannesburg. All rights reserved.</p>
              <p className="text-xs mt-1">
                Operated by Oomas Pty Ltd under authorization from Consulate General of India, Johannesburg
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">
                Disclaimer
              </Link>
              <Link href="/security" className="hover:text-white transition-colors flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tricolor Bottom Border */}
      <div className="tricolor-gradient h-1"></div>
    </footer>
  )
}

export default Footer
