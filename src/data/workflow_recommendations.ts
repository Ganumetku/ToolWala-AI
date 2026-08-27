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
      { slug: 'jpg-to-pdf', label: 'Convert JPG', icon: 'Image' },
      { slug: 'compress-pdf', label: 'Compress Size', icon: 'Shrink' },
      { slug: 'protect-pdf', label: 'Protect File', icon: 'Lock' }
    ]
  },
  'merge-pdf': {
    nextRecommended: ['compress-pdf', 'sign-pdf', 'protect-pdf'],
    mostUsedTogether: ['split-pdf', 'organize-pdf', 'watermark-pdf'],
    workflow: [
      { slug: 'organize-pdf', label: 'Organize Pages', icon: 'LayoutGrid' },
      { slug: 'merge-pdf', label: 'Merge Files', icon: 'Merge' },
      { slug: 'protect-pdf', label: 'Protect PDF', icon: 'Lock' }
    ]
  },
  'split-pdf': {
    nextRecommended: ['merge-pdf', 'compress-pdf', 'pdf-to-jpg'],
    mostUsedTogether: ['organize-pdf', 'remove-pages', 'rotate-pdf'],
    workflow: [
      { slug: 'split-pdf', label: 'Split Pages', icon: 'SplitSquareHorizontal' },
      { slug: 'compress-pdf', label: 'Compress PDF', icon: 'Shrink' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: 'PenTool' }
    ]
  },
  'organize-pdf': {
    nextRecommended: ['merge-pdf', 'compress-pdf', 'sign-pdf'],
    mostUsedTogether: ['remove-pages', 'rotate-pdf', 'crop-pdf'],
    workflow: [
      { slug: 'rotate-pdf', label: 'Rotate Pages', icon: 'RotateCw' },
      { slug: 'organize-pdf', label: 'Reorder Pages', icon: 'LayoutGrid' },
      { slug: 'merge-pdf', label: 'Merge PDFs', icon: 'Merge' }
    ]
  },
  'rotate-pdf': {
    nextRecommended: ['organize-pdf', 'merge-pdf', 'compress-pdf'],
    mostUsedTogether: ['remove-pages', 'crop-pdf', 'split-pdf'],
    workflow: [
      { slug: 'rotate-pdf', label: 'Rotate Layout', icon: 'RotateCw' },
      { slug: 'organize-pdf', label: 'Sort Pages', icon: 'LayoutGrid' },
      { slug: 'merge-pdf', label: 'Compile PDF', icon: 'Merge' }
    ]
  },
  'remove-pages': {
    nextRecommended: ['organize-pdf', 'merge-pdf', 'compress-pdf'],
    mostUsedTogether: ['rotate-pdf', 'crop-pdf', 'split-pdf'],
    workflow: [
      { slug: 'remove-pages', label: 'Delete Pages', icon: 'FileMinus' },
      { slug: 'organize-pdf', label: 'Sort Pages', icon: 'LayoutGrid' },
      { slug: 'compress-pdf', label: 'Compress PDF', icon: 'Shrink' }
    ]
  },
  'compress-pdf': {
    nextRecommended: ['merge-pdf', 'protect-pdf', 'sign-pdf'],
    mostUsedTogether: ['split-pdf', 'pdf-to-jpg', 'unlock-pdf'],
    workflow: [
      { slug: 'merge-pdf', label: 'Compile Files', icon: 'Merge' },
      { slug: 'compress-pdf', label: 'Compress Size', icon: 'Shrink' },
      { slug: 'sign-pdf', label: 'Sign & Finish', icon: 'PenTool' }
    ]
  },
  'crop-pdf': {
    nextRecommended: ['compress-pdf', 'watermark-pdf', 'protect-pdf'],
    mostUsedTogether: ['organize-pdf', 'rotate-pdf', 'remove-pages'],
    workflow: [
      { slug: 'crop-pdf', label: 'Crop Margins', icon: 'Crop' },
      { slug: 'compress-pdf', label: 'Reduce Size', icon: 'Shrink' },
      { slug: 'protect-pdf', label: 'Secure PDF', icon: 'Lock' }
    ]
  },

  // 2. Converting & Editing
  'pdf-to-jpg': {
    nextRecommended: ['image-compressor', 'bg-remover', 'crop-pdf'],
    mostUsedTogether: ['split-pdf', 'pdf-ocr', 'pdf-summarizer'],
    workflow: [
      { slug: 'pdf-to-jpg', label: 'Convert to JPG', icon: 'FileImage' },
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'image-compressor', label: 'Optimize Image', icon: 'ImageDown' }
    ]
  },
  'pdf-to-word-converter': {
    nextRecommended: ['word-to-pdf-converter', 'compress-pdf', 'edit-pdf'],
    mostUsedTogether: ['pdf-ocr', 'resume-builder', 'pdf-summarizer'],
    workflow: [
      { slug: 'pdf-to-word-converter', label: 'PDF to Word', icon: 'FileText' },
      { slug: 'resume-builder', label: 'Build Resume', icon: 'FileUser' },
      { slug: 'word-to-pdf-converter', label: 'Word to PDF', icon: 'FileOutput' }
    ]
  },
  'word-to-pdf-converter': {
    nextRecommended: ['compress-pdf', 'protect-pdf', 'sign-pdf'],
    mostUsedTogether: ['pdf-to-word-converter', 'merge-pdf', 'watermark-pdf'],
    workflow: [
      { slug: 'word-to-pdf-converter', label: 'Word to PDF', icon: 'FileOutput' },
      { slug: 'compress-pdf', label: 'Shrink Layout', icon: 'Shrink' },
      { slug: 'protect-pdf', label: 'Encrypt PDF', icon: 'Lock' }
    ]
  },

  // 3. Document Signing & Protection
  'sign-pdf': {
    nextRecommended: ['protect-pdf', 'compress-pdf', 'watermark-pdf'],
    mostUsedTogether: ['merge-pdf', 'invoice-generator', 'add-page-numbers-to-pdf'],
    workflow: [
      { slug: 'invoice-generator', label: 'Create Invoice', icon: 'Receipt' },
      { slug: 'sign-pdf', label: 'Draw Signature', icon: 'PenTool' },
      { slug: 'protect-pdf', label: 'Lock File', icon: 'Lock' }
    ]
  },
  'protect-pdf': {
    nextRecommended: ['unlock-pdf', 'sign-pdf', 'compress-pdf'],
    mostUsedTogether: ['watermark-pdf', 'merge-pdf', 'add-page-numbers-to-pdf'],
    workflow: [
      { slug: 'sign-pdf', label: 'E-Sign PDF', icon: 'PenTool' },
      { slug: 'watermark-pdf', label: 'Stamp Brand', icon: 'Droplets' },
      { slug: 'protect-pdf', label: 'Lock Password', icon: 'Lock' }
    ]
  },
  'unlock-pdf': {
    nextRecommended: ['edit-pdf', 'compress-pdf', 'merge-pdf'],
    mostUsedTogether: ['protect-pdf', 'split-pdf', 'pdf-to-jpg'],
    workflow: [
      { slug: 'unlock-pdf', label: 'Decrypt PDF', icon: 'LockOpen' },
      { slug: 'edit-pdf', label: 'Modify Content', icon: 'FilePenLine' },
      { slug: 'compress-pdf', label: 'Compress PDF', icon: 'Shrink' }
    ]
  },
  'watermark-pdf': {
    nextRecommended: ['protect-pdf', 'compress-pdf', 'sign-pdf'],
    mostUsedTogether: ['add-page-numbers-to-pdf', 'merge-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'add-page-numbers-to-pdf', label: 'Number Pages', icon: 'Hash' },
      { slug: 'watermark-pdf', label: 'Stamp Watermark', icon: 'Droplets' },
      { slug: 'protect-pdf', label: 'Encrypt PDF', icon: 'Lock' }
    ]
  },
  'add-page-numbers-to-pdf': {
    nextRecommended: ['watermark-pdf', 'compress-pdf', 'protect-pdf'],
    mostUsedTogether: ['merge-pdf', 'sign-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'merge-pdf', label: 'Combine PDF', icon: 'Merge' },
      { slug: 'add-page-numbers-to-pdf', label: 'Add Page Number', icon: 'Hash' },
      { slug: 'watermark-pdf', label: 'Watermark PDF', icon: 'Droplets' }
    ]
  },
  'edit-pdf': {
    nextRecommended: ['sign-pdf', 'compress-pdf', 'protect-pdf'],
    mostUsedTogether: ['merge-pdf', 'watermark-pdf', 'organize-pdf'],
    workflow: [
      { slug: 'unlock-pdf', label: 'Decrypt File', icon: 'LockOpen' },
      { slug: 'edit-pdf', label: 'Edit Content', icon: 'FilePenLine' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: 'PenTool' }
    ]
  },

  // 4. Government Application Resizer Suite
  'exam-photo-resizer': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['ssc-photo-resize', 'upsc-photo-resize', 'bg-remover'],
    workflow: [
      { slug: 'passport-photo-maker', label: 'Crop Photo', icon: 'IdCard' },
      { slug: 'exam-photo-resizer', label: 'Resize Photo', icon: 'GraduationCap' },
      { slug: 'signature-resize', label: 'Resize Signature', icon: 'PenTool' }
    ]
  },
  'pan-card-resize': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'ssc-photo-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'pan-card-resize', label: 'PAN Specs Resize', icon: 'IdCard' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: 'PenTool' }
    ]
  },
  'ssc-photo-resize': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'upsc-photo-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'ssc-photo-resize', label: 'SSC Specs Resize', icon: 'IdCard' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: 'PenTool' }
    ]
  },
  'upsc-photo-resize': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'ssc-photo-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'upsc-photo-resize', label: 'UPSC Specs Resize', icon: 'GraduationCap' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: 'PenTool' }
    ]
  },
  'crop-aadhaar-card': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'aadhaar-pdf-compressor'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'crop-aadhaar-card', label: 'Aadhaar Crop', icon: 'Crop' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: 'PenTool' }
    ]
  },
  'aadhaar-photo-resizer': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'aadhaar-pdf-compressor'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'crop-aadhaar-card', label: 'Aadhaar Crop', icon: 'Crop' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: 'PenTool' }
    ]
  },
  'aadhar-card-cropper': {
    nextRecommended: ['signature-resize', 'gov-form-image-compressor', 'passport-photo-maker'],
    mostUsedTogether: ['exam-photo-resizer', 'bg-remover', 'aadhaar-pdf-compressor'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'crop-aadhaar-card', label: 'Aadhaar Crop', icon: 'Crop' },
      { slug: 'signature-resize', label: 'Signature Resize', icon: 'PenTool' }
    ]
  },
  'signature-resize': {
    nextRecommended: ['exam-photo-resizer', 'pan-card-resize', 'gov-form-image-compressor'],
    mostUsedTogether: ['passport-photo-maker', 'ssc-photo-resize', 'upsc-photo-resize'],
    workflow: [
      { slug: 'exam-photo-resizer', label: 'Resize Photo', icon: 'GraduationCap' },
      { slug: 'signature-resize', label: 'Resize Sign', icon: 'PenTool' },
      { slug: 'gov-form-image-compressor', label: 'Compress Photo', icon: 'ImageDown' }
    ]
  },

  //  government compressors
  'aadhaar-pdf-compressor': {
    nextRecommended: ['aadhaar-masking-tool', 'compress-pdf', 'protect-pdf'],
    mostUsedTogether: ['crop-aadhaar-card', 'gov-form-pdf-compressor', 'sign-pdf'],
    workflow: [
      { slug: 'aadhaar-pdf-compressor', label: 'Compress PDF', icon: 'Shrink' },
      { slug: 'aadhaar-masking-tool', label: 'Mask Card', icon: 'EyeOff' },
      { slug: 'sign-pdf', label: 'E-Sign PDF', icon: 'PenTool' }
    ]
  },
  'gov-form-pdf-compressor': {
    nextRecommended: ['gov-form-image-compressor', 'compress-pdf', 'sign-pdf'],
    mostUsedTogether: ['exam-photo-resizer', 'signature-resize', 'protect-pdf'],
    workflow: [
      { slug: 'gov-form-pdf-compressor', label: 'Compress PDF', icon: 'FileMinus' },
      { slug: 'gov-form-image-compressor', label: 'Compress Photo', icon: 'ImageDown' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: 'PenTool' }
    ]
  },
  'aadhaar-masking-tool': {
    nextRecommended: ['aadhaar-pdf-compressor', 'protect-pdf', 'sign-pdf'],
    mostUsedTogether: ['crop-aadhaar-card', 'ocr-to-text', 'compress-pdf'],
    workflow: [
      { slug: 'aadhaar-pdf-compressor', label: 'Compress Aadhaar', icon: 'Shrink' },
      { slug: 'aadhaar-masking-tool', label: 'Mask Numbers', icon: 'EyeOff' },
      { slug: 'protect-pdf', label: 'Encrypt PDF', icon: 'Lock' }
    ]
  },

  // 5. Image Processing
  'bg-remover': {
    nextRecommended: ['image-compressor', 'passport-photo-maker', 'ai-image-upscaler'],
    mostUsedTogether: ['exam-photo-resizer', 'color-palette-generator', 'signature-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'passport-photo-maker', label: 'Make Passport', icon: 'IdCard' },
      { slug: 'image-compressor', label: 'Compress Size', icon: 'ImageDown' }
    ]
  },
  'passport-photo-maker': {
    nextRecommended: ['bg-remover', 'image-compressor', 'signature-resize'],
    mostUsedTogether: ['color-palette-generator', 'exam-photo-resizer', 'pan-card-resize'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove BG', icon: 'Wand2' },
      { slug: 'passport-photo-maker', label: 'Make Portrait', icon: 'IdCard' },
      { slug: 'image-compressor', label: 'Compress Size', icon: 'ImageDown' }
    ]
  },
  'image-compressor': {
    nextRecommended: ['bg-remover', 'passport-photo-maker', 'webp-to-jpg-png-converter'],
    mostUsedTogether: ['ai-image-upscaler', 'signature-resize', 'jpg-to-pdf'],
    workflow: [
      { slug: 'bg-remover', label: 'Remove Background', icon: 'Wand2' },
      { slug: 'image-compressor', label: 'Compress JPG/PNG', icon: 'ImageDown' },
      { slug: 'jpg-to-pdf', label: 'Convert to PDF', icon: 'Image' }
    ]
  },
  'webp-to-jpg-png-converter': {
    nextRecommended: ['image-compressor', 'bg-remover', 'passport-photo-maker'],
    mostUsedTogether: ['ai-image-upscaler', 'color-palette-generator', 'jpg-to-pdf'],
    workflow: [
      { slug: 'webp-to-jpg-png-converter', label: 'Convert WebP', icon: 'Image' },
      { slug: 'image-compressor', label: 'Compress Size', icon: 'ImageDown' },
      { slug: 'jpg-to-pdf', label: 'Convert to PDF', icon: 'Image' }
    ]
  },

  // 6. Resume & Career
  'resume-builder': {
    nextRecommended: ['cover-letter-generator', 'text-humanizer', 'word-to-pdf-converter'],
    mostUsedTogether: ['pdf-to-word-converter', 'passport-photo-maker', 'pdf-summarizer'],
    workflow: [
      { slug: 'resume-builder', label: 'Write CV', icon: 'FileUser' },
      { slug: 'cover-letter-generator', label: 'Write Letter', icon: 'Mail' },
      { slug: 'word-to-pdf-converter', label: 'Export PDF', icon: 'FileOutput' }
    ]
  },
  'cover-letter-generator': {
    nextRecommended: ['resume-builder', 'text-humanizer', 'word-to-pdf-converter'],
    mostUsedTogether: ['pdf-to-word-converter', 'passport-photo-maker', 'pdf-summarizer'],
    workflow: [
      { slug: 'cover-letter-generator', label: 'Draft Letter', icon: 'Mail' },
      { slug: 'text-humanizer', label: 'Polish Tone', icon: 'UserCheck' },
      { slug: 'word-to-pdf-converter', label: 'Convert to PDF', icon: 'FileOutput' }
    ]
  },

  // 7. Calculators
  'sip-calculator': {
    nextRecommended: ['emi-calculator', 'gst-calculator', 'age-calculator'],
    mostUsedTogether: ['adsense-revenue-calculator', 'youtube-money-calculator'],
    workflow: [
      { slug: 'sip-calculator', label: 'Invest returns', icon: 'TrendingUp' },
      { slug: 'emi-calculator', label: 'Loan EMIs', icon: 'Landmark' },
      { slug: 'gst-calculator', label: 'Tax Calculations', icon: 'Percent' }
    ]
  },
  'emi-calculator': {
    nextRecommended: ['sip-calculator', 'gst-calculator', 'age-calculator'],
    mostUsedTogether: ['adsense-revenue-calculator', 'youtube-money-calculator'],
    workflow: [
      { slug: 'sip-calculator', label: 'Mutual Funds', icon: 'TrendingUp' },
      { slug: 'emi-calculator', label: 'Home/Car Loan', icon: 'Landmark' },
      { slug: 'gst-calculator', label: 'Business Tax', icon: 'Percent' }
    ]
  },
  'gst-calculator': {
    nextRecommended: ['invoice-generator', 'emi-calculator', 'sip-calculator'],
    mostUsedTogether: ['invoice-cropper', 'adsense-revenue-calculator'],
    workflow: [
      { slug: 'invoice-generator', label: 'Make Invoice', icon: 'Receipt' },
      { slug: 'gst-calculator', label: 'Calculate Tax', icon: 'Percent' },
      { slug: 'sign-pdf', label: 'Sign Document', icon: 'PenTool' }
    ]
  },

  // 8. AI Creators
  'caption-generator': {
    nextRecommended: ['voice-generator', 'text-humanizer', 'ai-logo-maker'],
    mostUsedTogether: ['youtube-money-calculator', 'qr-code-generator'],
    workflow: [
      { slug: 'caption-generator', label: 'Create Post', icon: 'MessageSquareText' },
      { slug: 'text-humanizer', label: 'Humanize copy', icon: 'UserCheck' },
      { slug: 'voice-generator', label: 'Generate Audio', icon: 'Mic' }
    ]
  },
  'voice-generator': {
    nextRecommended: ['text-humanizer', 'caption-generator', 'ai-logo-maker'],
    mostUsedTogether: ['youtube-money-calculator', 'qr-code-generator'],
    workflow: [
      { slug: 'text-humanizer', label: 'Refine Script', icon: 'UserCheck' },
      { slug: 'voice-generator', label: 'Voice Over', icon: 'Mic' },
      { slug: 'youtube-money-calculator', label: 'Estimate Money', icon: 'Youtube' }
    ]
  },
  'text-humanizer': {
    nextRecommended: ['voice-generator', 'caption-generator', 'resume-builder'],
    mostUsedTogether: ['pdf-summarizer', 'cover-letter-generator'],
    workflow: [
      { slug: 'caption-generator', label: 'Write Content', icon: 'MessageSquareText' },
      { slug: 'text-humanizer', label: 'Humanize AI', icon: 'UserCheck' },
      { slug: 'voice-generator', label: 'Generate Speech', icon: 'Mic' }
    ]
  },

  // 9. Invoices
  'invoice-generator': {
    nextRecommended: ['sign-pdf', 'protect-pdf', 'gst-calculator'],
    mostUsedTogether: ['invoice-cropper', 'merge-pdf', 'compress-pdf'],
    workflow: [
      { slug: 'invoice-generator', label: 'Draft Bill', icon: 'Receipt' },
      { slug: 'sign-pdf', label: 'Sign Invoice', icon: 'PenTool' },
      { slug: 'protect-pdf', label: 'Lock Document', icon: 'Lock' }
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
      { slug: 'merge-pdf', label: 'Merge files', icon: 'Merge' },
      { slug: 'compress-pdf', label: 'Compress size', icon: 'Shrink' },
      { slug: 'protect-pdf', label: 'Lock files', icon: 'Lock' }
    ],
    'Image Tools': [
      { slug: 'bg-remover', label: 'Remove background', icon: 'Wand2' },
      { slug: 'passport-photo-maker', label: 'Size portrait', icon: 'IdCard' },
      { slug: 'image-compressor', label: 'Compress size', icon: 'ImageDown' }
    ],
    'Calculator Tools': [
      { slug: 'sip-calculator', label: 'SIP Future Value', icon: 'TrendingUp' },
      { slug: 'emi-calculator', label: 'Loan EMI Rate', icon: 'Landmark' },
      { slug: 'gst-calculator', label: 'Tax Breakdown', icon: 'Percent' }
    ],
    'AI Tools': [
      { slug: 'text-humanizer', label: 'Humanize copy', icon: 'UserCheck' },
      { slug: 'voice-generator', label: 'Generate voice', icon: 'Mic' },
      { slug: 'ai-logo-maker', label: 'Design brand', icon: 'Shapes' }
    ],
    'Utility Tools': [
      { slug: 'password-generator', label: 'Generate keys', icon: 'KeyRound' },
      { slug: 'ocr-to-text', label: 'Scan to characters', icon: 'ScanText' },
      { slug: 'qr-code-generator', label: 'Encode QR code', icon: 'QrCode' }
    ],
    'Resume & Career': [
      { slug: 'resume-builder', label: 'Build ATS CV', icon: 'FileUser' },
      { slug: 'cover-letter-generator', label: 'Write letter', icon: 'Mail' },
      { slug: 'word-to-pdf-converter', label: 'Export PDF', icon: 'FileOutput' }
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
      { slug: slug, label: 'Active Tool', icon: 'Wrench' },
      ...customWorkflow.slice(0, 2)
    ];
  }

  return {
    nextRecommended: nextRec,
    mostUsedTogether: together,
    workflow: customWorkflow
  };
}
