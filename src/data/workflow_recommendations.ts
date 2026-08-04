export interface WorkflowStep {
  slug: string;
  label: string;
  icon: string;
}

export interface ToolWorkflow {
  nextRecommended: string[];
  mostUsedTogether: string[];
  workflow: WorkflowStep[];
}

// Visual Workflows Map
const WORKFLOWS: Record<string, ToolWorkflow> = {
  // 1. PDF Creation & Compiling
  'jpg-to-pdf': {
    nextRecommended: ['compress-pdf', 'merge-pdf', 'watermark-pdf'],
    mostUsedTogether: ['sign-pdf', 'protect-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'jpg-to-pdf', label: 'Convert JPG', icon: '🖼️' },
      { slug: 'compress-pdf', label: 'Compress Size', icon: '📉' },
      { slug: 'protect-pdf', label: 'Protect File', icon: '🔒' }
    ]
  },
  'merge-pdf': {
    nextRecommended: ['compress-pdf', 'sign-pdf', 'protect-pdf'],
    mostUsedTogether: ['split-pdf', 'organize-pdf', 'watermark-pdf'],
    workflow: [
      { slug: 'organize-pdf', label: 'Organize Pages', icon: '🧩' },
      { slug: 'merge-pdf', label: 'Merge Files', icon: '🔀' },
      { slug: 'protect-pdf', label: 'Protect PDF', icon: '🔒' }
    ]
  },
  'split-pdf': {
    nextRecommended: ['merge-pdf', 'compress-pdf', 'pdf-to-jpg'],
    mostUsedTogether: ['organize-pdf', 'remove-pages', 'rotate-pdf'],
    workflow: [
      { slug: 'split-pdf', label: 'Split Pages', icon: '✂️' },
      { slug: 'compress-pdf', label: 'Compress PDF', icon: '📉' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: '✍️' }
    ]
  },
  'organize-pdf': {
    nextRecommended: ['merge-pdf', 'compress-pdf', 'sign-pdf'],
    mostUsedTogether: ['remove-pages', 'rotate-pdf', 'crop-pdf'],
    workflow: [
      { slug: 'rotate-pdf', label: 'Rotate Pages', icon: '🔄' },
      { slug: 'organize-pdf', label: 'Reorder Pages', icon: '🧩' },
      { slug: 'merge-pdf', label: 'Merge PDFs', icon: '🔀' }
    ]
  },
  'rotate-pdf': {
    nextRecommended: ['organize-pdf', 'merge-pdf', 'compress-pdf'],
    mostUsedTogether: ['remove-pages', 'crop-pdf', 'split-pdf'],
    workflow: [
      { slug: 'rotate-pdf', label: 'Rotate Layout', icon: '🔄' },
      { slug: 'organize-pdf', label: 'Sort Pages', icon: '🧩' },
      { slug: 'merge-pdf', label: 'Compile PDF', icon: '🔀' }
    ]
  },
  'remove-pages': {
    nextRecommended: ['organize-pdf', 'merge-pdf', 'compress-pdf'],
    mostUsedTogether: ['rotate-pdf', 'crop-pdf', 'split-pdf'],
    workflow: [
      { slug: 'remove-pages', label: 'Delete Pages', icon: '🗑️' },
      { slug: 'organize-pdf', label: 'Sort Pages', icon: '🧩' },
      { slug: 'compress-pdf', label: 'Compress PDF', icon: '📉' }
    ]
  },
  'compress-pdf': {
    nextRecommended: ['merge-pdf', 'protect-pdf', 'sign-pdf'],
    mostUsedTogether: ['split-pdf', 'pdf-to-jpg', 'unlock-pdf'],
    workflow: [
      { slug: 'merge-pdf', label: 'Compile Files', icon: '🔀' },
      { slug: 'compress-pdf', label: 'Compress Size', icon: '📉' },
      { slug: 'sign-pdf', label: 'Sign & Finish', icon: '✍️' }
    ]
  },
  'crop-pdf': {
    nextRecommended: ['compress-pdf', 'watermark-pdf', 'protect-pdf'],
    mostUsedTogether: ['organize-pdf', 'rotate-pdf', 'remove-pages'],
    workflow: [
      { slug: 'crop-pdf', label: 'Crop Margins', icon: '✂️' },
      { slug: 'compress-pdf', label: 'Reduce Size', icon: '📉' },
      { slug: 'protect-pdf', label: 'Secure PDF', icon: '🔒' }
    ]
  },

  // 2. Converting & Editing
  'pdf-to-jpg': {
    nextRecommended: ['image-compressor', 'bg-remover', 'crop-pdf'],
    mostUsedTogether: ['split-pdf', 'pdf-ocr', 'pdf-summarizer'],
    workflow: [
      { slug: 'pdf-to-jpg', label: 'Convert to JPG', icon: '🖼️' },
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'image-compressor', label: 'Optimize Image', icon: '📉' }
    ]
  },
  'pdf-to-word-converter': {
    nextRecommended: ['word-to-pdf-converter', 'compress-pdf', 'edit-pdf'],
    mostUsedTogether: ['pdf-ocr', 'resume-builder', 'pdf-summarizer'],
    workflow: [
      { slug: 'pdf-to-word-converter', label: 'PDF to Word', icon: '📝' },
      { slug: 'resume-builder', label: 'Build Resume', icon: '📝' },
      { slug: 'word-to-pdf-converter', label: 'Word to PDF', icon: '📄' }
    ]
  },
  'word-to-pdf-converter': {
    nextRecommended: ['compress-pdf', 'protect-pdf', 'sign-pdf'],
    mostUsedTogether: ['pdf-to-word-converter', 'merge-pdf', 'watermark-pdf'],
    workflow: [
      { slug: 'word-to-pdf-converter', label: 'Word to PDF', icon: '📄' },
      { slug: 'compress-pdf', label: 'Shrink Layout', icon: '📉' },
      { slug: 'protect-pdf', label: 'Encrypt PDF', icon: '🔒' }
    ]
  },

  // 3. Document Signing & Protection
  'sign-pdf': {
    nextRecommended: ['protect-pdf', 'compress-pdf', 'watermark-pdf'],
    mostUsedTogether: ['merge-pdf', 'invoice-generator', 'add-page-numbers-to-pdf'],
    workflow: [
      { slug: 'invoice-generator', label: 'Create Invoice', icon: '🧾' },
      { slug: 'sign-pdf', label: 'Draw Signature', icon: '✍️' },
      { slug: 'protect-pdf', label: 'Lock File', icon: '🔒' }
    ]
  },
  'protect-pdf': {
    nextRecommended: ['unlock-pdf', 'sign-pdf', 'compress-pdf'],
    mostUsedTogether: ['watermark-pdf', 'merge-pdf', 'add-page-numbers-to-pdf'],
    workflow: [
      { slug: 'sign-pdf', label: 'E-Sign PDF', icon: '✍️' },
      { slug: 'watermark-pdf', label: 'Stamp Brand', icon: '🎨' },
      { slug: 'protect-pdf', label: 'Lock Password', icon: '🔒' }
    ]
  },
  'unlock-pdf': {
    nextRecommended: ['edit-pdf', 'compress-pdf', 'merge-pdf'],
    mostUsedTogether: ['protect-pdf', 'split-pdf', 'pdf-to-jpg'],
    workflow: [
      { slug: 'unlock-pdf', label: 'Decrypt PDF', icon: '🔓' },
      { slug: 'edit-pdf', label: 'Modify Content', icon: '✍️' },
      { slug: 'compress-pdf', label: 'Compress PDF', icon: '📉' }
    ]
  },
  'watermark-pdf': {
    nextRecommended: ['protect-pdf', 'compress-pdf', 'sign-pdf'],
    mostUsedTogether: ['add-page-numbers-to-pdf', 'merge-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'add-page-numbers-to-pdf', label: 'Number Pages', icon: '🔢' },
      { slug: 'watermark-pdf', label: 'Stamp Watermark', icon: '🎨' },
      { slug: 'protect-pdf', label: 'Encrypt PDF', icon: '🔒' }
    ]
  },
  'add-page-numbers-to-pdf': {
    nextRecommended: ['watermark-pdf', 'compress-pdf', 'protect-pdf'],
    mostUsedTogether: ['merge-pdf', 'sign-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'merge-pdf', label: 'Combine PDF', icon: '🔀' },
      { slug: 'add-page-numbers-to-pdf', label: 'Add Page Number', icon: '🔢' },
      { slug: 'watermark-pdf', label: 'Watermark PDF', icon: '🎨' }
    ]
  },
  'edit-pdf': {
    nextRecommended: ['sign-pdf', 'compress-pdf', 'protect-pdf'],
    mostUsedTogether: ['merge-pdf', 'watermark-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'unlock-pdf', label: 'Decrypt File', icon: '🔓' },
      { slug: 'edit-pdf', label: 'Edit Content', icon: '✍️' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: '✍️' }
    ]
  },

  // 4. Government Application Resizer Suite
  'exam-photo-resizer': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['ssc-photo-resize', 'upsc-photo-resize', 'bg-remover'],
    workflow: [
      { slug: 'passport-photo-maker', label: 'Crop Photo', icon: '📸' },
      { slug: 'exam-photo-resizer', label: 'Resize Photo', icon: '🎓' },
      { slug: 'signature-resize', label: 'Resize Signature', icon: '✍️' }
    ]
  },
  'pan-card-resize': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'ssc-photo-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'pan-card-resize', label: 'PAN Specs Resize', icon: '🪪' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: '✍️' }
    ]
  },
  'ssc-photo-resize': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'upsc-photo-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'ssc-photo-resize', label: 'SSC Specs Resize', icon: '📝' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: '✍️' }
    ]
  },
  'upsc-photo-resize': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'ssc-photo-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'upsc-photo-resize', label: 'UPSC Specs Resize', icon: '🎓' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: '✍️' }
    ]
  },
  'crop-aadhaar-card': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'aadhaar-pdf-compressor'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'crop-aadhaar-card', label: 'Aadhaar Crop', icon: '🪪' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: '✍️' }
    ]
  },
  'aadhaar-photo-resizer': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'aadhaar-pdf-compressor'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'crop-aadhaar-card', label: 'Aadhaar Crop', icon: '🪪' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: '✍️' }
    ]
  },
  'aadhar-card-cropper': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'aadhaar-pdf-compressor'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'crop-aadhaar-card', label: 'Aadhaar Crop', icon: '🪪' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: '✍️' }
    ]
  },
  'signature-resize': {
    nextRecommended: ['exam-photo-resizer', 'pan-card-resize', 'gov-form-image-compressor'],
    mostUsedTogether: ['passport-photo-maker', 'ssc-photo-resize', 'upsc-photo-resize'],
    workflow: [
      { slug: 'exam-photo-resizer', label: 'Resize Photo', icon: '🎓' },
      { slug: 'signature-resize', label: 'Resize Sign', icon: '✍️' },
      { slug: 'gov-form-image-compressor', label: 'Compress Photo', icon: '📉' }
    ]
  },

  //  government compressors
  'aadhaar-pdf-compressor': {
    nextRecommended: ['aadhaar-masking-tool', 'compress-pdf', 'protect-pdf'],
    mostUsedTogether: ['aadhaar-photo-resizer', 'gov-form-pdf-compressor', 'sign-pdf'],
    workflow: [
      { slug: 'aadhaar-pdf-compressor', label: 'Compress PDF', icon: '🔒' },
      { slug: 'aadhaar-masking-tool', label: 'Mask Card', icon: '🪪' },
      { slug: 'sign-pdf', label: 'E-Sign PDF', icon: '✍️' }
    ]
  },
  'gov-form-pdf-compressor': {
    nextRecommended: ['gov-form-image-compressor', 'compress-pdf', 'sign-pdf'],
    mostUsedTogether: ['exam-photo-resizer', 'signature-resize', 'protect-pdf'],
    workflow: [
      { slug: 'gov-form-pdf-compressor', label: 'Compress PDF', icon: '🗜️' },
      { slug: 'gov-form-image-compressor', label: 'Compress Photo', icon: '📉' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: '✍️' }
    ]
  },
  'aadhaar-masking-tool': {
    nextRecommended: ['aadhaar-pdf-compressor', 'protect-pdf', 'sign-pdf'],
    mostUsedTogether: ['aadhaar-photo-resizer', 'ocr-to-text', 'compress-pdf'],
    workflow: [
      { slug: 'aadhaar-pdf-compressor', label: 'Compress Aadhaar', icon: '🔒' },
      { slug: 'aadhaar-masking-tool', label: 'Mask Numbers', icon: '🪪' },
      { slug: 'protect-pdf', label: 'Encrypt PDF', icon: '🔒' }
    ]
  },

  // 5. Image Processing
  'bg-remover': {
    nextRecommended: ['image-compressor', 'passport-photo-maker', 'ai-image-upscaler'],
    mostUsedTogether: ['exam-photo-resizer', 'color-palette-generator', 'signature-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'passport-photo-maker', label: 'Make Passport', icon: '📸' },
      { slug: 'image-compressor', label: 'Compress Size', icon: '📉' }
    ]
  },
  'passport-photo-maker': {
    nextRecommended: ['bg-remover', 'image-compressor', 'signature-resize'],
    mostUsedTogether: ['color-palette-generator', 'exam-photo-resizer', 'pan-card-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: '🖼️' },
      { slug: 'passport-photo-maker', label: 'Make Portrait', icon: '📸' },
      { slug: 'image-compressor', label: 'Compress Size', icon: '📉' }
    ]
  },
  'image-compressor': {
    nextRecommended: ['bg-remover', 'passport-photo-maker', 'webp-to-jpg-png-converter'],
    mostUsedTogether: ['ai-image-upscaler', 'signature-resize', 'jpg-to-pdf'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove Background', icon: '🖼️' },
      { slug: 'image-compressor', label: 'Compress JPG/PNG', icon: '📉' },
      { slug: 'jpg-to-pdf', label: 'Convert to PDF', icon: '🔀' }
    ]
  },
  'webp-to-jpg-png-converter': {
    nextRecommended: ['image-compressor', 'bg-remover', 'passport-photo-maker'],
    mostUsedTogether: ['ai-image-upscaler', 'color-palette-generator', 'jpg-to-pdf'],
    workflow: [
      { slug: 'webp-to-jpg-png-converter', label: 'Convert WebP', icon: '🖼️' },
      { slug: 'image-compressor', label: 'Compress Size', icon: '📉' },
      { slug: 'jpg-to-pdf', label: 'Convert to PDF', icon: '🔀' }
    ]
  },

  // 6. Resume & Career
  'resume-builder': {
    nextRecommended: ['cover-letter-generator', 'text-humanizer', 'word-to-pdf-converter'],
    mostUsedTogether: ['pdf-to-word-converter', 'passport-photo-maker', 'pdf-summarizer'],
    workflow: [
      { slug: 'resume-builder', label: 'Write CV', icon: '📝' },
      { slug: 'cover-letter-generator', label: 'Write Letter', icon: '✉️' },
      { slug: 'word-to-pdf-converter', label: 'Export PDF', icon: '📄' }
    ]
  },
  'cover-letter-generator': {
    nextRecommended: ['resume-builder', 'text-humanizer', 'word-to-pdf-converter'],
    mostUsedTogether: ['pdf-to-word-converter', 'passport-photo-maker', 'pdf-summarizer'],
    workflow: [
      { slug: 'cover-letter-generator', label: 'Draft Letter', icon: '✉️' },
      { slug: 'text-humanizer', label: 'Polish Tone', icon: '👤' },
      { slug: 'word-to-pdf-converter', label: 'Convert to PDF', icon: '📄' }
    ]
  },

  // 7. Calculators
  'sip-calculator': {
    nextRecommended: ['emi-calculator', 'gst-calculator', 'age-calculator'],
    mostUsedTogether: ['adsense-revenue-calculator', 'youtube-money-calculator'],
    workflow: [
      { slug: 'sip-calculator', label: 'Invest returns', icon: '📈' },
      { slug: 'emi-calculator', label: 'Loan EMIs', icon: '🏦' },
      { slug: 'gst-calculator', label: 'Tax Calculations', icon: '🧾' }
    ]
  },
  'emi-calculator': {
    nextRecommended: ['sip-calculator', 'gst-calculator', 'age-calculator'],
    mostUsedTogether: ['adsense-revenue-calculator', 'youtube-money-calculator'],
    workflow: [
      { slug: 'sip-calculator', label: 'Mutual Funds', icon: '📈' },
      { slug: 'emi-calculator', label: 'Home/Car Loan', icon: '🏦' },
      { slug: 'gst-calculator', label: 'Business Tax', icon: '🧾' }
    ]
  },
  'gst-calculator': {
    nextRecommended: ['invoice-generator', 'emi-calculator', 'sip-calculator'],
    mostUsedTogether: ['invoice-cropper', 'adsense-revenue-calculator'],
    workflow: [
      { slug: 'invoice-generator', label: 'Make Invoice', icon: '🧾' },
      { slug: 'gst-calculator', label: 'Calculate Tax', icon: '🧾' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: '✍️' }
    ]
  },

  // 8. AI Creators
  'caption-generator': {
    nextRecommended: ['voice-generator', 'text-humanizer', 'ai-logo-maker'],
    mostUsedTogether: ['youtube-money-calculator', 'qr-code-generator'],
    workflow: [
      { slug: 'caption-generator', label: 'Create Post', icon: '✍️' },
      { slug: 'text-humanizer', label: 'Humanize copy', icon: '👤' },
      { slug: 'voice-generator', label: 'Generate Audio', icon: '🎙️' }
    ]
  },
  'voice-generator': {
    nextRecommended: ['text-humanizer', 'caption-generator', 'ai-logo-maker'],
    mostUsedTogether: ['youtube-money-calculator', 'qr-code-generator'],
    workflow: [
      { slug: 'text-humanizer', label: 'Refine Script', icon: '👤' },
      { slug: 'voice-generator', label: 'Voice Over', icon: '🎙️' },
      { slug: 'youtube-money-calculator', label: 'Estimate Money', icon: '▶️' }
    ]
  },
  'text-humanizer': {
    nextRecommended: ['voice-generator', 'caption-generator', 'resume-builder'],
    mostUsedTogether: ['pdf-summarizer', 'cover-letter-generator'],
    workflow: [
      { slug: 'caption-generator', label: 'Write Content', icon: '✍️' },
      { slug: 'text-humanizer', label: 'Humanize AI', icon: '👤' },
      { slug: 'voice-generator', label: 'Generate Speech', icon: '🎙️' }
    ]
  },

  // 9. Invoices
  'invoice-generator': {
    nextRecommended: ['sign-pdf', 'protect-pdf', 'gst-calculator'],
    mostUsedTogether: ['invoice-cropper', 'merge-pdf', 'compress-pdf'],
    workflow: [
      { slug: 'invoice-generator', label: 'Draft Bill', icon: '🧾' },
      { slug: 'sign-pdf', label: 'Sign Invoice', icon: '✍️' },
      { slug: 'protect-pdf', label: 'Lock Document', icon: '🔒' }
    ]
  }
};

/**
 * Returns structured workflow recommendations for a given tool slug.
 * If specific overrides don't exist, generates logical suggestions based on the category.
 */
export function getWorkflowRecommendations(slug: string, currentCategory: string = 'PDF Tools'): ToolWorkflow {
  // If we have a specific predefined workflow, use it!
  if (WORKFLOWS[slug]) {
    return WORKFLOWS[slug];
  }

  // Fallback category-based generation
  const defaultSteps: Record<string, WorkflowStep[]> = {
    'PDF Tools': [
      { slug: 'merge-pdf', label: 'Merge files', icon: '🔀' },
      { slug: 'compress-pdf', label: 'Compress size', icon: '📉' },
      { slug: 'protect-pdf', label: 'Lock files', icon: '🔒' }
    ],
    'Image Tools': [
      { slug: 'bg-remover', label: 'Remove background', icon: '🖼️' },
      { slug: 'passport-photo-maker', label: 'Size portrait', icon: '📸' },
      { slug: 'image-compressor', label: 'Compress size', icon: '📉' }
    ],
    'Calculator Tools': [
      { slug: 'sip-calculator', label: 'SIP Future Value', icon: '📈' },
      { slug: 'emi-calculator', label: 'Loan EMI Rate', icon: '🏦' },
      { slug: 'gst-calculator', label: 'Tax Breakdown', icon: '🧾' }
    ],
    'AI Tools': [
      { slug: 'text-humanizer', label: 'Humanize copy', icon: '👤' },
      { slug: 'voice-generator', label: 'Generate voice', icon: '🎙️' },
      { slug: 'ai-logo-maker', label: 'Design brand', icon: '🎨' }
    ],
    'Utility Tools': [
      { slug: 'password-generator', label: 'Generate keys', icon: '🔑' },
      { slug: 'ocr-to-text', label: 'Scan to characters', icon: '🔍' },
      { slug: 'qr-code-generator', label: 'Encode QR code', icon: '📱' }
    ],
    'Resume & Career': [
      { slug: 'resume-builder', label: 'Build ATS CV', icon: '📝' },
      { slug: 'cover-letter-generator', label: 'Write letter', icon: '✉️' },
      { slug: 'word-to-pdf-converter', label: 'Export PDF', icon: '📄' }
    ]
  };

  const fallbacks: Record<string, { next: string[], together: string[] }> = {
    'PDF Tools': {
      next: ['compress-pdf', 'merge-pdf', 'sign-pdf'],
      together: ['protect-pdf', 'watermark-pdf', 'pdf-to-jpg']
    },
    'Image Tools': {
      next: ['image-compressor', 'bg-remover', 'passport-photo-maker'],
      together: ['signature-resize', 'exam-photo-resizer', 'color-palette-generator']
    },
    'Calculator Tools': {
      next: ['sip-calculator', 'emi-calculator', 'gst-calculator'],
      together: ['adsense-revenue-calculator', 'youtube-money-calculator']
    },
    'AI Tools': {
      next: ['text-humanizer', 'voice-generator', 'caption-generator'],
      together: ['ai-logo-maker', 'resume-builder']
    },
    'Utility Tools': {
      next: ['ocr-to-text', 'password-generator', 'qr-code-generator'],
      together: ['bg-remover', 'image-compressor']
    },
    'Resume & Career': {
      next: ['resume-builder', 'cover-letter-generator', 'text-humanizer'],
      together: ['word-to-pdf-converter', 'pdf-to-word-converter']
    }
  };

  const catKey = currentCategory in defaultSteps ? currentCategory : 'PDF Tools';

  // Filter out the current tool slug from recommendations to prevent self-suggesting
  const nextRec = (fallbacks[catKey]?.next || []).filter(s => s !== slug).slice(0, 3);
  const together = (fallbacks[catKey]?.together || []).filter(s => s !== slug).slice(0, 3);
  
  // Ensure the workflow chain has the current tool as active if possible, otherwise use default
  let customWorkflow = defaultSteps[catKey] || defaultSteps['PDF Tools'];
  const hasCurrentSlugInChain = customWorkflow.some(w => w.slug === slug);
  if (!hasCurrentSlugInChain && customWorkflow.length > 0) {
    // Inject current slug at the beginning or as the first step for a logical flow
    customWorkflow = [
      { slug: slug, label: 'Active Tool', icon: '🔧' },
      ...customWorkflow.slice(0, 2)
    ];
  }

  return {
    nextRecommended: nextRec,
    mostUsedTogether: together,
    workflow: customWorkflow
  };
}
