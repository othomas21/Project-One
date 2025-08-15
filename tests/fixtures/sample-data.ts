/**
 * @file sample-data.ts
 * @description Sample test data for medical imaging scenarios
 */

export const SAMPLE_MEDICAL_DATA = {
  patients: [
    {
      id: 'PAT001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-05-15',
      gender: 'M',
      mrn: 'MRN123456'
    },
    {
      id: 'PAT002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1992-08-22',
      gender: 'F',
      mrn: 'MRN789012'
    },
    {
      id: 'PAT003',
      firstName: 'Robert',
      lastName: 'Johnson',
      dateOfBirth: '1975-03-10',
      gender: 'M',
      mrn: 'MRN345678'
    }
  ],
  
  studies: [
    {
      id: 'STU001',
      patientId: 'PAT001',
      studyDescription: 'Chest X-Ray PA and Lateral',
      modality: 'CR',
      studyDate: '2024-01-15',
      bodyPart: 'CHEST',
      referringPhysician: 'Dr. Anderson',
      status: 'COMPLETED'
    },
    {
      id: 'STU002',
      patientId: 'PAT001',
      studyDescription: 'CT Chest without contrast',
      modality: 'CT',
      studyDate: '2024-01-16',
      bodyPart: 'CHEST',
      referringPhysician: 'Dr. Wilson',
      status: 'COMPLETED'
    },
    {
      id: 'STU003',
      patientId: 'PAT002',
      studyDescription: 'MRI Brain with and without contrast',
      modality: 'MR',
      studyDate: '2024-01-17',
      bodyPart: 'BRAIN',
      referringPhysician: 'Dr. Davis',
      status: 'IN_PROGRESS'
    },
    {
      id: 'STU004',
      patientId: 'PAT003',
      studyDescription: 'Ultrasound Abdomen Complete',
      modality: 'US',
      studyDate: '2024-01-18',
      bodyPart: 'ABDOMEN',
      referringPhysician: 'Dr. Miller',
      status: 'PENDING'
    }
  ],
  
  analysisResults: [
    {
      studyId: 'STU001',
      analysisId: 'ANA001',
      findings: 'Normal chest X-ray. No acute cardiopulmonary abnormalities.',
      confidence: 0.95,
      aiModel: 'MedGemma-4B',
      processingTime: 2.3,
      recommendations: [
        'No further imaging required',
        'Continue routine care'
      ],
      tags: ['normal', 'chest', 'no_abnormalities'],
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      studyId: 'STU002',
      analysisId: 'ANA002',
      findings: 'Small nodule in right upper lobe measuring 8mm. Recommend follow-up CT in 6 months.',
      confidence: 0.87,
      aiModel: 'MedGemma-4B',
      processingTime: 4.7,
      recommendations: [
        'Follow-up CT in 6 months',
        'Consider pulmonology consultation',
        'Patient counseling recommended'
      ],
      tags: ['nodule', 'chest', 'follow_up_required'],
      createdAt: '2024-01-16T14:20:00Z'
    },
    {
      studyId: 'STU003',
      analysisId: 'ANA003',
      findings: 'No acute intracranial abnormalities. White matter changes consistent with age.',
      confidence: 0.92,
      aiModel: 'MedGemma-4B',
      processingTime: 6.1,
      recommendations: [
        'Age-appropriate findings',
        'No immediate follow-up required'
      ],
      tags: ['normal', 'brain', 'age_related_changes'],
      createdAt: '2024-01-17T16:45:00Z'
    }
  ],
  
  uploadScenarios: [
    {
      name: 'successful_chest_xray',
      file: {
        name: 'chest-xray-normal.jpg',
        type: 'image/jpeg',
        size: 2048000, // 2MB
        content: 'mock_image_data'
      },
      patientInfo: {
        patientId: 'PAT001',
        studyDescription: 'Chest X-Ray PA',
        modality: 'CR'
      },
      expectedResult: {
        success: true,
        analysisTime: 2500,
        findings: 'Normal chest X-ray'
      }
    },
    {
      name: 'large_ct_scan',
      file: {
        name: 'ct-chest-series.dcm',
        type: 'application/dicom',
        size: 52428800, // 50MB
        content: 'mock_dicom_data'
      },
      patientInfo: {
        patientId: 'PAT002',
        studyDescription: 'CT Chest High Resolution',
        modality: 'CT'
      },
      expectedResult: {
        success: true,
        analysisTime: 8000,
        findings: 'High resolution CT chest'
      }
    },
    {
      name: 'unsupported_format',
      file: {
        name: 'report.pdf',
        type: 'application/pdf',
        size: 1024000, // 1MB
        content: 'mock_pdf_data'
      },
      patientInfo: {
        patientId: 'PAT003',
        studyDescription: 'Medical Report',
        modality: 'DOC'
      },
      expectedResult: {
        success: false,
        error: 'Unsupported file format'
      }
    },
    {
      name: 'oversized_file',
      file: {
        name: 'huge-mri-series.dcm',
        type: 'application/dicom',
        size: 104857600, // 100MB
        content: 'mock_large_dicom_data'
      },
      patientInfo: {
        patientId: 'PAT001',
        studyDescription: 'MRI Brain Complete Series',
        modality: 'MR'
      },
      expectedResult: {
        success: false,
        error: 'File size exceeds maximum limit'
      }
    }
  ],
  
  searchQueries: [
    {
      query: 'chest',
      expectedResults: ['STU001', 'STU002'],
      description: 'Should find chest studies'
    },
    {
      query: 'PAT001',
      expectedResults: ['STU001', 'STU002'],
      description: 'Should find studies for specific patient'
    },
    {
      query: 'CT',
      expectedResults: ['STU002'],
      description: 'Should find CT modality studies'
    },
    {
      query: 'Dr. Anderson',
      expectedResults: ['STU001'],
      description: 'Should find studies by referring physician'
    },
    {
      query: 'nonexistent',
      expectedResults: [],
      description: 'Should return empty results for non-matching query'
    }
  ],
  
  filterCombinations: [
    {
      name: 'date_and_modality',
      filters: {
        dateFrom: '2024-01-15',
        dateTo: '2024-01-16',
        modality: 'CT'
      },
      expectedResults: ['STU002'],
      description: 'CT studies within date range'
    },
    {
      name: 'patient_and_body_part',
      filters: {
        patientId: 'PAT001',
        bodyPart: 'CHEST'
      },
      expectedResults: ['STU001', 'STU002'],
      description: 'Chest studies for specific patient'
    },
    {
      name: 'status_filter',
      filters: {
        status: 'COMPLETED'
      },
      expectedResults: ['STU001', 'STU002', 'STU003'],
      description: 'Only completed studies'
    }
  ],
  
  dashboardStats: {
    totalUploads: 156,
    totalAnalyses: 142,
    completedToday: 8,
    avgProcessingTime: '3.2 minutes',
    successRate: 0.97,
    popularModalities: [
      { name: 'CR', count: 45 },
      { name: 'CT', count: 38 },
      { name: 'MR', count: 32 },
      { name: 'US', count: 28 }
    ],
    recentActivity: [
      {
        id: 'act_001',
        type: 'upload',
        description: 'Chest X-Ray uploaded for PAT001',
        timestamp: '2024-01-18T10:30:00Z',
        status: 'completed'
      },
      {
        id: 'act_002',
        type: 'analysis',
        description: 'CT analysis completed for PAT002',
        timestamp: '2024-01-18T09:45:00Z',
        status: 'completed'
      },
      {
        id: 'act_003',
        type: 'upload',
        description: 'MRI series uploaded for PAT003',
        timestamp: '2024-01-18T08:20:00Z',
        status: 'processing'
      }
    ]
  }
};

export const ERROR_SCENARIOS = {
  network: {
    timeout: {
      description: 'Network timeout during API call',
      response: { error: 'Request timeout' },
      statusCode: 408
    },
    serverError: {
      description: 'Internal server error',
      response: { error: 'Internal server error' },
      statusCode: 500
    },
    badGateway: {
      description: 'Bad gateway error',
      response: { error: 'Bad gateway' },
      statusCode: 502
    }
  },
  
  validation: {
    invalidEmail: {
      description: 'Invalid email format',
      input: 'invalid-email',
      expectedError: 'Please enter a valid email address'
    },
    weakPassword: {
      description: 'Password too weak',
      input: '123',
      expectedError: 'Password must be at least 8 characters'
    },
    missingPatientId: {
      description: 'Missing required patient ID',
      input: '',
      expectedError: 'Patient ID is required'
    }
  },
  
  fileUpload: {
    unsupportedFormat: {
      description: 'Unsupported file format',
      fileName: 'document.txt',
      expectedError: 'File format not supported'
    },
    fileTooLarge: {
      description: 'File exceeds size limit',
      fileName: 'huge-file.dcm',
      expectedError: 'File size exceeds maximum limit'
    },
    corruptedFile: {
      description: 'Corrupted or invalid file',
      fileName: 'corrupted.jpg',
      expectedError: 'File appears to be corrupted'
    }
  }
};

export const PERFORMANCE_THRESHOLDS = {
  pageLoad: {
    good: 1000,    // < 1 second
    acceptable: 3000,  // < 3 seconds
    poor: 5000     // > 5 seconds
  },
  
  apiResponse: {
    good: 200,     // < 200ms
    acceptable: 1000,  // < 1 second
    poor: 3000     // > 3 seconds
  },
  
  fileUpload: {
    small: 2000,   // < 2 seconds for files < 5MB
    medium: 10000, // < 10 seconds for files < 50MB
    large: 30000   // < 30 seconds for files < 100MB
  },
  
  analysis: {
    xray: 5000,    // < 5 seconds for X-ray analysis
    ct: 15000,     // < 15 seconds for CT analysis
    mri: 30000     // < 30 seconds for MRI analysis
  }
};