export const servicesData = [
  // Passport Services
  {
    id: 'passport-renewal-expiry',
    category: 'Passport Services',
    title: 'Passport Renewal (Expiry)',
    description: 'Renewal of expired Indian passport with complete documentation support',
    processingTime: '1 month',
    fees: [{ description: 'Passport fee', amount: 100, currency: 'USD' }],
    requiredDocuments: ['Current passport', 'Application form', 'Photographs', 'Proof of address'],
    eligibilityRequirements: ['Indian citizen', 'Valid ID proof', 'Proof of current address'],
    isActive: true
  },
  {
    id: 'passport-renewal-validity',
    category: 'Passport Services',
    title: 'Passport Renewal (Within Validity)',
    description: 'Renewal of valid Indian passport before expiry',
    processingTime: '3-4 weeks',
    fees: [{ description: 'Passport fee', amount: 100, currency: 'USD' }],
    requiredDocuments: ['Current passport', 'Application form', 'Photographs'],
    eligibilityRequirements: ['Indian citizen', 'Valid passport'],
    isActive: true
  },
  {
    id: 'passport-new',
    category: 'Passport Services',
    title: 'New Passport',
    description: 'Fresh passport application for first-time applicants',
    processingTime: '1-2 months',
    fees: [{ description: 'Passport fee', amount: 100, currency: 'USD' }],
    requiredDocuments: ['Birth certificate', 'Application form', 'Photographs', 'Proof of address'],
    eligibilityRequirements: ['Indian citizen by birth', 'Valid ID proof'],
    isActive: true
  },
  {
    id: 'passport-reissue',
    category: 'Passport Services',
    title: 'Passport Reissue',
    description: 'Reissue of passport due to damage, loss, or other reasons',
    processingTime: '1 month',
    fees: [{ description: 'Passport fee', amount: 100, currency: 'USD' }],
    requiredDocuments: ['Police report (if lost)', 'Application form', 'Photographs'],
    eligibilityRequirements: ['Indian citizen', 'Valid reason for reissue'],
    isActive: true
  },

  // Visa Services
  {
    id: 'visa-application',
    category: 'Visa Services',
    title: 'Regular Visa Application',
    description: 'Application for Indian visa for foreign nationals',
    processingTime: '7-15 days',
    fees: [{ description: 'Visa fee', amount: 80, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Application form', 'Photographs', 'Supporting documents'],
    eligibilityRequirements: ['Foreign national', 'Valid passport with 6+ months validity'],
    isActive: true
  },
  {
    id: 'visa-business',
    category: 'Visa Services',
    title: 'Business Visa',
    description: 'Business visa for commercial activities in India',
    processingTime: '7-10 days',
    fees: [{ description: 'Business visa fee', amount: 120, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Business invitation', 'Company documents'],
    eligibilityRequirements: ['Valid business purpose', 'Invitation from Indian company'],
    isActive: true
  },
  {
    id: 'visa-tourist',
    category: 'Visa Services',
    title: 'Tourist Visa',
    description: 'Tourist visa for leisure travel to India',
    processingTime: '5-7 days',
    fees: [{ description: 'Tourist visa fee', amount: 80, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Travel itinerary', 'Hotel bookings'],
    eligibilityRequirements: ['Tourism purpose', 'Return ticket booking'],
    isActive: true
  },
  {
    id: 'visa-medical',
    category: 'Visa Services',
    title: 'Medical Visa',
    description: 'Medical visa for treatment in India',
    processingTime: '3-5 days',
    fees: [{ description: 'Medical visa fee', amount: 80, currency: 'USD' }],
    requiredDocuments: ['Medical documents', 'Hospital letter', 'Passport'],
    eligibilityRequirements: ['Medical treatment requirement', 'Hospital confirmation'],
    isActive: true
  },

  // OCI Services
  {
    id: 'oci-services',
    category: 'OCI Related Services',
    title: 'OCI Registration',
    description: 'Overseas Citizen of India registration for eligible applicants',
    processingTime: '8-12 weeks',
    fees: [{ description: 'OCI fee', amount: 275, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Birth certificate', 'Photos', 'Supporting documents'],
    eligibilityRequirements: ['Former Indian citizen', 'Child/grandchild of Indian citizen'],
    isActive: true
  },
  {
    id: 'oci-renewal',
    category: 'OCI Related Services',
    title: 'OCI Card Renewal',
    description: 'Renewal of OCI card after passport renewal',
    processingTime: '6-8 weeks',
    fees: [{ description: 'OCI renewal fee', amount: 25, currency: 'USD' }],
    requiredDocuments: ['Current OCI card', 'New passport', 'Application form'],
    eligibilityRequirements: ['Valid OCI cardholder', 'Passport renewed'],
    isActive: true
  },
  {
    id: 'oci-replacement',
    category: 'OCI Related Services',
    title: 'OCI Card Replacement',
    description: 'Replacement of lost or damaged OCI card',
    processingTime: '8-10 weeks',
    fees: [{ description: 'OCI replacement fee', amount: 100, currency: 'USD' }],
    requiredDocuments: ['Police report', 'Application form', 'Photos'],
    eligibilityRequirements: ['Valid reason for replacement', 'Police report if lost'],
    isActive: true
  },

  // Police Clearance Certificate
  {
    id: 'pcc-indian',
    category: 'Police Clearance Certificate',
    title: 'PCC for Indian Nationals',
    description: 'Police Clearance Certificate for Indian citizens',
    processingTime: '2-3 weeks',
    fees: [{ description: 'PCC fee', amount: 60, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Application form', 'Photos'],
    eligibilityRequirements: ['Indian citizen', 'Valid passport'],
    isActive: true
  },
  {
    id: 'pcc-foreign',
    category: 'Police Clearance Certificate',
    title: 'PCC for Foreign Nationals',
    description: 'Police Clearance Certificate for foreign nationals who lived in India',
    processingTime: '3-4 weeks',
    fees: [{ description: 'PCC fee', amount: 60, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Indian visa copies', 'Address proof in India'],
    eligibilityRequirements: ['Lived in India for 6+ months', 'Valid documents'],
    isActive: true
  },

  // Life Certificate
  {
    id: 'life-certificate',
    category: 'Life Certificate',
    title: 'Life Certificate for Pensioners',
    description: 'Annual life certificate for Indian pensioners abroad',
    processingTime: '1-2 weeks',
    fees: [{ description: 'Life certificate fee', amount: 20, currency: 'USD' }],
    requiredDocuments: ['Pension documents', 'ID proof', 'Medical certificate'],
    eligibilityRequirements: ['Indian pensioner', 'Valid pension documents'],
    isActive: true
  },
  {
    id: 'life-certificate-urgent',
    category: 'Life Certificate',
    title: 'Urgent Life Certificate',
    description: 'Expedited life certificate service',
    processingTime: '2-3 days',
    fees: [{ description: 'Urgent processing fee', amount: 50, currency: 'USD' }],
    requiredDocuments: ['Pension documents', 'ID proof', 'Urgency letter'],
    eligibilityRequirements: ['Valid urgency reason', 'Complete documents'],
    isActive: true
  },

  // Birth/Death/Marriage Certificate
  {
    id: 'birth-certificate',
    category: 'Birth/Death/Marriage Certificate',
    title: 'Birth Certificate Registration',
    description: 'Registration of birth that occurred in South Africa',
    processingTime: '2-3 weeks',
    fees: [{ description: 'Registration fee', amount: 30, currency: 'USD' }],
    requiredDocuments: ['Hospital birth certificate', 'Parents\' documents', 'Photos'],
    eligibilityRequirements: ['Birth to Indian parents', 'Valid documents'],
    isActive: true
  },
  {
    id: 'death-certificate',
    category: 'Birth/Death/Marriage Certificate',
    title: 'Death Certificate Registration',
    description: 'Registration of death of Indian national in South Africa',
    processingTime: '1-2 weeks',
    fees: [{ description: 'Registration fee', amount: 30, currency: 'USD' }],
    requiredDocuments: ['Death certificate', 'Deceased\'s documents', 'Next of kin ID'],
    eligibilityRequirements: ['Indian national deceased', 'Valid death certificate'],
    isActive: true
  },
  {
    id: 'marriage-certificate',
    category: 'Birth/Death/Marriage Certificate',
    title: 'Marriage Certificate Registration',
    description: 'Registration of marriage involving Indian nationals',
    processingTime: '2-3 weeks',
    fees: [{ description: 'Registration fee', amount: 40, currency: 'USD' }],
    requiredDocuments: ['Marriage certificate', 'Passports', 'Photos'],
    eligibilityRequirements: ['One spouse Indian national', 'Valid marriage certificate'],
    isActive: true
  },

  // Surrender Certificate
  {
    id: 'surrender-certificate',
    category: 'Surrender Certificate',
    title: 'Indian Passport Surrender Certificate',
    description: 'Certificate for surrendering Indian passport after acquiring foreign citizenship',
    processingTime: '2-4 weeks',
    fees: [{ description: 'Surrender certificate fee', amount: 20, currency: 'USD' }],
    requiredDocuments: ['Indian passport', 'Foreign passport', 'Naturalization certificate'],
    eligibilityRequirements: ['Acquired foreign citizenship', 'Valid foreign passport'],
    isActive: true
  },

  // Document Attestation
  {
    id: 'document-attestation',
    category: 'Document Attestation',
    title: 'Attestation of Documents/Degrees',
    description: 'Official attestation of educational and personal documents',
    processingTime: '5-7 days',
    fees: [{ description: 'Attestation fee', amount: 20, currency: 'USD' }],
    requiredDocuments: ['Original documents', 'Copies', 'Application form'],
    eligibilityRequirements: ['Valid documents', 'Proper authentication'],
    isActive: true
  },
  {
    id: 'educational-attestation',
    category: 'Document Attestation',
    title: 'Educational Document Attestation',
    description: 'Attestation of educational certificates and degrees',
    processingTime: '7-10 days',
    fees: [{ description: 'Educational attestation fee', amount: 25, currency: 'USD' }],
    requiredDocuments: ['Degree certificates', 'Transcripts', 'University verification'],
    eligibilityRequirements: ['Valid educational documents', 'University authentication'],
    isActive: true
  },
  {
    id: 'commercial-attestation',
    category: 'Document Attestation',
    title: 'Commercial Document Attestation',
    description: 'Attestation of commercial and business documents',
    processingTime: '5-7 days',
    fees: [{ description: 'Commercial attestation fee', amount: 30, currency: 'USD' }],
    requiredDocuments: ['Commercial documents', 'Company registration', 'Authorization letter'],
    eligibilityRequirements: ['Valid commercial documents', 'Company verification'],
    isActive: true
  },

  // Emergency Services
  {
    id: 'emergency-certificate',
    category: 'Emergency Services',
    title: 'Emergency Certificate',
    description: 'Emergency travel document for urgent travel needs',
    processingTime: '1-2 days',
    fees: [{ description: 'Emergency certificate fee', amount: 60, currency: 'USD' }],
    requiredDocuments: ['Police report', 'Travel tickets', 'Emergency letter'],
    eligibilityRequirements: ['Valid emergency', 'Urgent travel requirement'],
    isActive: true
  },
  {
    id: 'distress-assistance',
    category: 'Emergency Services',
    title: 'Assistance to Distressed Indians',
    description: 'Support and assistance for Indians in distress',
    processingTime: 'Immediate',
    fees: [{ description: 'No fee', amount: 0, currency: 'USD' }],
    requiredDocuments: ['ID proof', 'Details of distress'],
    eligibilityRequirements: ['Indian national', 'Genuine distress'],
    isActive: true
  },

  // Miscellaneous Services
  {
    id: 'power-of-attorney',
    category: 'Miscellaneous Services',
    title: 'Power of Attorney',
    description: 'Execution of Power of Attorney documents',
    processingTime: '1 week',
    fees: [{ description: 'POA fee', amount: 40, currency: 'USD' }],
    requiredDocuments: ['Draft POA', 'ID proof', 'Witnesses'],
    eligibilityRequirements: ['Valid reason', 'Proper documentation'],
    isActive: true
  },
  {
    id: 'notarial-services',
    category: 'Miscellaneous Services',
    title: 'Notarial Services',
    description: 'Notarization of various documents and affidavits',
    processingTime: '1-2 days',
    fees: [{ description: 'Notarial fee', amount: 15, currency: 'USD' }],
    requiredDocuments: ['Documents to be notarized', 'ID proof'],
    eligibilityRequirements: ['Valid documents', 'In-person appearance'],
    isActive: true
  },
  {
    id: 'authentication-services',
    category: 'Miscellaneous Services',
    title: 'Document Authentication',
    description: 'Authentication of various certificates and documents',
    processingTime: '3-5 days',
    fees: [{ description: 'Authentication fee', amount: 25, currency: 'USD' }],
    requiredDocuments: ['Original documents', 'Supporting papers'],
    eligibilityRequirements: ['Valid documents', 'Proper verification'],
    isActive: true
  },

  // Visa Extensions
  {
    id: 'visa-extension',
    category: 'Visa Services',
    title: 'Visa Extension',
    description: 'Extension of existing Indian visa',
    processingTime: '1-2 weeks',
    fees: [{ description: 'Extension fee', amount: 40, currency: 'USD' }],
    requiredDocuments: ['Current visa', 'Extension letter', 'Supporting documents'],
    eligibilityRequirements: ['Valid reason', 'Current visa holder'],
    isActive: true
  },

  // Student Services
  {
    id: 'student-visa',
    category: 'Visa Services',
    title: 'Student Visa',
    description: 'Student visa for educational purposes in India',
    processingTime: '1-2 weeks',
    fees: [{ description: 'Student visa fee', amount: 60, currency: 'USD' }],
    requiredDocuments: ['Admission letter', 'Financial documents', 'Medical certificate'],
    eligibilityRequirements: ['Admission to recognized institution', 'Financial capability'],
    isActive: true
  },

  // Employment Services
  {
    id: 'employment-visa',
    category: 'Visa Services',
    title: 'Employment Visa',
    description: 'Employment visa for working in India',
    processingTime: '2-3 weeks',
    fees: [{ description: 'Employment visa fee', amount: 120, currency: 'USD' }],
    requiredDocuments: ['Employment contract', 'Educational certificates', 'Experience letters'],
    eligibilityRequirements: ['Job offer from Indian company', 'Required qualifications'],
    isActive: true
  },

  // Special Services
  {
    id: 'diplomatic-official-passport',
    category: 'Passport Services',
    title: 'Diplomatic/Official Passport',
    description: 'Special passport for diplomatic and official purposes',
    processingTime: '2-3 weeks',
    fees: [{ description: 'No fee for government officials', amount: 0, currency: 'USD' }],
    requiredDocuments: ['Government authorization', 'Official letter', 'Photos'],
    eligibilityRequirements: ['Government official', 'Official authorization'],
    isActive: true
  },

  // Additional Passport Services
  {
    id: 'passport-booklet-additional',
    category: 'Passport Services',
    title: 'Additional Passport Booklet',
    description: 'Additional passport booklet for frequent travelers',
    processingTime: '3-4 weeks',
    fees: [{ description: 'Additional booklet fee', amount: 50, currency: 'USD' }],
    requiredDocuments: ['Current passport', 'Justification letter', 'Travel history'],
    eligibilityRequirements: ['Frequent traveler', 'Valid justification'],
    isActive: true
  },

  // Consular Services
  {
    id: 'consular-registration',
    category: 'Miscellaneous Services',
    title: 'Consular Registration',
    description: 'Registration with the consulate for emergency contact',
    processingTime: '1-2 days',
    fees: [{ description: 'No fee', amount: 0, currency: 'USD' }],
    requiredDocuments: ['Passport', 'Address proof', 'Contact details'],
    eligibilityRequirements: ['Indian national', 'Resident in South Africa'],
    isActive: true
  },

  // Pension Services
  {
    id: 'pension-attestation',
    category: 'Life Certificate',
    title: 'Pension Document Attestation',
    description: 'Attestation of pension-related documents',
    processingTime: '1 week',
    fees: [{ description: 'Attestation fee', amount: 20, currency: 'USD' }],
    requiredDocuments: ['Pension documents', 'ID proof', 'Bank statements'],
    eligibilityRequirements: ['Valid pension documents', 'Proper verification'],
    isActive: true
  },

  // Verification Services
  {
    id: 'address-verification',
    category: 'Miscellaneous Services',
    title: 'Address Verification',
    description: 'Verification of address for various purposes',
    processingTime: '3-5 days',
    fees: [{ description: 'Verification fee', amount: 25, currency: 'USD' }],
    requiredDocuments: ['Address proof', 'ID documents', 'Utility bills'],
    eligibilityRequirements: ['Valid address', 'Proper documentation'],
    isActive: true
  },

  // Travel Document Services
  {
    id: 'travel-document',
    category: 'Emergency Services',
    title: 'Travel Document',
    description: 'Travel document for stateless persons or special cases',
    processingTime: '1-2 weeks',
    fees: [{ description: 'Travel document fee', amount: 100, currency: 'USD' }],
    requiredDocuments: ['Application form', 'Photos', 'Supporting documents'],
    eligibilityRequirements: ['Stateless person', 'Special circumstances'],
    isActive: true
  },

  // Repatriation Services
  {
    id: 'repatriation-assistance',
    category: 'Emergency Services',
    title: 'Repatriation Assistance',
    description: 'Assistance for repatriation to India',
    processingTime: '1-3 days',
    fees: [{ description: 'Case by case', amount: 0, currency: 'USD' }],
    requiredDocuments: ['ID proof', 'Details of circumstances'],
    eligibilityRequirements: ['Indian national', 'Genuine need'],
    isActive: true
  },

  // Cultural Services
  {
    id: 'cultural-events',
    category: 'Miscellaneous Services',
    title: 'Cultural Events Information',
    description: 'Information about Indian cultural events and programs',
    processingTime: 'Immediate',
    fees: [{ description: 'No fee', amount: 0, currency: 'USD' }],
    requiredDocuments: ['Inquiry form'],
    eligibilityRequirements: ['Interest in Indian culture'],
    isActive: true
  }
]

export const serviceCategories = [
  'Passport Services',
  'Visa Services',
  'OCI Related Services',
  'Police Clearance Certificate',
  'Life Certificate',
  'Birth/Death/Marriage Certificate',
  'Surrender Certificate',
  'Document Attestation',
  'Emergency Services',
  'Miscellaneous Services'
]
