'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.book': 'Book Appointment',
    'nav.track': 'Track Application',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.apply': 'Apply Now',

    // Hero Section
    'hero.title': 'Welcome to Indian Consular Services',
    'hero.subtitle': 'Authentic • Secure • Efficient Consular Services in Johannesburg',
    'hero.description': 'We are the authorized service provider for the Consulate General of India in South Africa, offering comprehensive passport, visa, OCI, and consular services with the highest standards of security and authenticity.',
    'hero.start_application': 'Start Application',
    'hero.book_appointment': 'Book Appointment',
    'hero.track_application': 'Track Application',

    // Services
    'services.title': 'Our Consular Services',
    'services.subtitle': 'Comprehensive consular services for Indian nationals and foreign citizens seeking Indian services. All services are processed with the highest standards of security and authenticity.',

    // Process
    'process.title': 'Simple Application Process',
    'process.step1': 'Choose Service',
    'process.step1_desc': 'Select your required consular service',
    'process.step2': 'Fill Application',
    'process.step2_desc': 'Complete the online application form',
    'process.step3': 'Upload Documents',
    'process.step3_desc': 'Upload required supporting documents',
    'process.step4': 'Book Appointment',
    'process.step4_desc': 'Schedule your visit to submit documents',
    'process.step5': 'Track & Collect',
    'process.step5_desc': 'Track status and collect your documents',

    // Tracking
    'track.title': 'Track Your Application',
    'track.subtitle': 'Enter your application number to check the current status and track progress in real-time.',
    'track.placeholder': 'Enter your application number (e.g., ICS2025001234)',
    'track.button': 'Track',
    'track.tracking': 'Tracking...',

    // Footer
    'footer.contact': 'Contact Us',
    'footer.quick_links': 'Quick Links',
    'footer.important_links': 'Important Links',
    'footer.service_provider': 'Service Provider',
    'footer.follow_us': 'Follow Us',
    'footer.office_hours': 'Office Hours',
    'footer.emergency_only': 'Emergency Only',

    // Common
    'common.loading': 'Loading...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.required': 'Required',
    'common.optional': 'Optional',

    // Application Requirements
    'requirements.title': 'Application Requirements',
    'requirements.person': 'All applications must be submitted in person',
    'requirements.documents': 'Bring original documents + 2 sets of attested copies from Commissioner of Oaths',
    'requirements.hours': 'Submission: 9:30 AM - 12:30 PM | Collection: 3:00 PM - 4:30 PM',
    'requirements.appointment': 'Book appointment in advance to avoid waiting',
  },
  hi: {
    // Header
    'nav.home': 'मुख्य पृष्ठ',
    'nav.services': 'सेवाएं',
    'nav.book': 'अपॉइंटमेंट बुक करें',
    'nav.track': 'आवेदन ट्रैक करें',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉगिन',
    'nav.register': 'पंजीकरण',
    'nav.apply': 'अभी आवेदन करें',

    // Hero Section
    'hero.title': 'भारतीय वाणिज्य दूतावास सेवाओं में आपका स्वागत है',
    'hero.subtitle': 'प्रामाणिक • सुरक्षित • कुशल वाणिज्य दूतावास सेवाएं जोहान्सबर्ग में',
    'hero.description': 'हम दक्षिण अफ्रीका में भारत के महावाणिज्य दूतावास के लिए अधिकृत सेवा प्रदाता हैं, जो सुरक्षा और प्रामाणिकता के उच्चतम मानकों के साथ व्यापक पासपोर्ट, वीज़ा, ओसीआई और वाणिज्य दूतावास सेवाएं प्रदान करते हैं।',
    'hero.start_application': 'आवेदन शुरू करें',
    'hero.book_appointment': 'अपॉइंटमेंट बुक करें',
    'hero.track_application': 'आवेदन ट्रैक करें',

    // Services
    'services.title': 'हमारी वाणिज्य दूतावास सेवाएं',
    'services.subtitle': 'भारतीय नागरिकों और भारतीय सेवाओं की तलाश करने वाले विदेशी नागरिकों के लिए व्यापक वाणिज्य दूतावास सेवाएं। सभी सेवाओं को सुरक्षा और प्रामाणिकता के उच्चतम मानकों के साथ संसाधित किया जाता है।',

    // Process
    'process.title': 'सरल आवेदन प्रक्रिया',
    'process.step1': 'सेवा चुनें',
    'process.step1_desc': 'अपनी आवश्यक वाणिज्य दूतावास सेवा का चयन करें',
    'process.step2': 'आवेदन भरें',
    'process.step2_desc': 'ऑनलाइन आवेदन फॉर्म पूरा करें',
    'process.step3': 'दस्तावेज़ अपलोड करें',
    'process.step3_desc': 'आवश्यक सहायक दस्तावेज़ अपलोड करें',
    'process.step4': 'अपॉइंटमेंट बुक करें',
    'process.step4_desc': 'दस्तावेज़ जमा करने के लिए अपनी यात्रा का समय निर्धारित करें',
    'process.step5': 'ट्रैक और संग्रह',
    'process.step5_desc': 'स्थिति ट्रैक करें और अपने दस्तावेज़ एकत्र करें',

    // Tracking
    'track.title': 'अपना आवेदन ट्रैक करें',
    'track.subtitle': 'वर्तमान स्थिति जांचने और वास्तविक समय में प्रगति ट्रैक करने के लिए अपना आवेदन नंबर दर्ज करें।',
    'track.placeholder': 'अपना आवेदन नंबर दर्ज करें (जैसे, ICS2025001234)',
    'track.button': 'ट्रैक करें',
    'track.tracking': 'ट्रैकिंग...',

    // Footer
    'footer.contact': 'संपर्क करें',
    'footer.quick_links': 'त्वरित लिंक',
    'footer.important_links': 'महत्वपूर्ण लिंक',
    'footer.service_provider': 'सेवा प्रदाता',
    'footer.follow_us': 'हमें फॉलो करें',
    'footer.office_hours': 'कार्यालय के घंटे',
    'footer.emergency_only': 'केवल आपातकाल',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.close': 'बंद करें',
    'common.required': 'आवश्यक',
    'common.optional': 'वैकल्पिक',

    // Application Requirements
    'requirements.title': 'आवेदन आवश्यकताएं',
    'requirements.person': 'सभी आवेदन व्यक्तिगत रूप से जमा किए जाने चाहिए',
    'requirements.documents': 'मूल दस्तावेज़ + शपथ आयुक्त से सत्यापित प्रतियों के 2 सेट लाएं',
    'requirements.hours': 'जमा करना: सुबह 9:30 - दोपहर 12:30 | संग्रह: दोपहर 3:00 - शाम 4:30',
    'requirements.appointment': 'प्रतीक्षा से बचने के लिए पहले से अपॉइंटमेंट बुक करें',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
