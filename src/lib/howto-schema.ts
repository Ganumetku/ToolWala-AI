export interface HowToStepItem {
  position: number;
  name: string;
  text: string;
  url?: string;
}

export interface HowToSchemaOptions {
  slug: string;
  title: string;
  category?: string;
  description?: string;
}

/**
 * Dynamically generates 4-step HowTo workflows tailored to each tool's micro-intent
 */
export function generateHowToSteps(slug: string, title: string, category: string = ''): HowToStepItem[] {
  const cleanSlug = slug.toLowerCase().replace(/\/$/, '');
  const baseUrl = `https://toolwala.co/tools/${cleanSlug}/`;

  // 1. PDF Compression
  if (cleanSlug.includes('compress-pdf') || cleanSlug.includes('pdf-compressor')) {
    return [
      { position: 1, name: 'Upload PDF Document', text: `Drag and drop your PDF file(s) into the ${title} workspace area.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Choose Compression Level', text: 'Select your preferred target size (Extreme, Recommended, or Low Compression).', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Compress PDF', text: 'Click Compress PDF to reduce file size instantly using local browser memory.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Download Compressed File', text: 'Save your compressed PDF document directly to your device with 100% privacy.', url: `${baseUrl}#step-4` },
    ];
  }

  // 2. Image to PDF Converters (JPG to PDF, Excel to PDF, Word to PDF)
  if (cleanSlug.includes('to-pdf')) {
    return [
      { position: 1, name: 'Upload Source Files', text: `Upload your images or documents into the ${title} converter.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Arrange Page Order', text: 'Reorder pages, set page orientation (Portrait/Landscape), and customize page margins.', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Generate PDF Document', text: 'Click Convert to compile your files into a single structured PDF document.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Download PDF', text: 'Download your compiled PDF document instantly without server uploads.', url: `${baseUrl}#step-4` },
    ];
  }

  // 3. PDF to Images / Formats (PDF to JPG, PDF to Word, PDF to Excel, PDF OCR)
  if (cleanSlug.startsWith('pdf-to') || cleanSlug.includes('pdf-ocr') || cleanSlug.includes('ocr-to-text')) {
    return [
      { position: 1, name: 'Upload PDF File', text: `Drag and drop your PDF document into the ${title} interface.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Select Target Output Options', text: 'Choose desired output quality, image resolution, or OCR text language.', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Process PDF Pages', text: 'Click Process to render PDF pages locally in high resolution.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Download Extracted Files', text: 'Download individual extracted files or download all pages in a ZIP archive.', url: `${baseUrl}#step-4` },
    ];
  }

  // 4. Passport Photo & Photo Resizers (PAN, Aadhaar, SSC, UPSC)
  if (cleanSlug.includes('passport') || cleanSlug.includes('photo-resize') || cleanSlug.includes('photo-resizer')) {
    return [
      { position: 1, name: 'Upload Photograph', text: `Upload a clear front-facing photograph or document scan into ${title}.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Select Country & Document Dimensions', text: 'Choose standard dimensions (e.g. US 2x2 inch, India Passport 3.5x4.5cm, PAN 3.5x2.5cm).', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Adjust Crop & Alignment', text: 'Position head guidelines using interactive crop grid and apply automatic background cleaning.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Download HD Print Ready Photo', text: 'Export your compliant passport photo in JPG/PNG format ready for submission.', url: `${baseUrl}#step-4` },
    ];
  }

  // 5. Image Compression & Converters (Image Compressor, JPG to WebP, PNG to WebP, WebP Converter)
  if (cleanSlug.includes('image-compressor') || cleanSlug.includes('to-webp') || cleanSlug.includes('webp-to') || cleanSlug.includes('gov-form-image')) {
    return [
      { position: 1, name: 'Select Image Files', text: `Drag and drop your image files into the ${title} browser converter.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Configure Compression & Quality', text: 'Adjust the quality slider, target dimensions, or transparency preservation options.', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Convert Image Batch', text: 'Click Convert to encode your images locally in browser memory.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Download Converted Images', text: 'Save your optimized images individually or download as a bundled ZIP.', url: `${baseUrl}#step-4` },
    ];
  }

  // 6. PDF Manipulation Suite (Merge, Split, Remove Pages, Rotate, Organize, Unlock, Protect, Sign, Watermark)
  if (cleanSlug.includes('merge') || cleanSlug.includes('split') || cleanSlug.includes('remove-pages') || cleanSlug.includes('rotate') || cleanSlug.includes('organize') || cleanSlug.includes('unlock') || cleanSlug.includes('protect') || cleanSlug.includes('sign') || cleanSlug.includes('watermark')) {
    return [
      { position: 1, name: 'Upload PDF Files', text: `Select and upload your PDF file(s) to the ${title} editor.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Configure Pages & Settings', text: 'Drag pages to reorder, specify page ranges, set passwords, or position watermark elements.', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Apply Document Changes', text: 'Click the primary action button to process changes 100% locally in your browser.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Download Modified PDF', text: 'Save your newly modified PDF document directly to your device.', url: `${baseUrl}#step-4` },
    ];
  }

  // 7. Resumes & Career Tools (ATS Resume Checker, Resume Builder, Cover Letter, Bullet Generator)
  if (cleanSlug.includes('resume') || cleanSlug.includes('cover-letter') || cleanSlug.includes('ats')) {
    return [
      { position: 1, name: 'Upload Resume or Enter Data', text: `Upload your existing resume PDF/Word document or fill in details in ${title}.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Analyze ATS Compatibility', text: 'Review formatting score, keyword matching, and section recommendations.', url: `${baseUrl}#step-2` },
      { position: 3, name: 'Optimize Content & Formatting', text: 'Apply smart recommendations, format bullet points, and align with job descriptions.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Export Optimized Resume PDF', text: 'Download your ATS-compliant resume PDF ready for job applications.', url: `${baseUrl}#step-4` },
    ];
  }

  // 8. Calculators (GST, EMI, SIP, Age, Exam Marks, AdSense, YouTube)
  if (cleanSlug.includes('calculator') || cleanSlug.includes('marks')) {
    return [
      { position: 1, name: 'Enter Input Values', text: `Input your initial figures, amounts, or parameters into the ${title} input fields.`, url: `${baseUrl}#step-1` },
      { position: 2, name: 'Customize Calculation Criteria', text: 'Adjust sliders, tax brackets, percentage metrics, or date ranges.', url: `${baseUrl}#step-2` },
      { position: 3, name: 'View Instant Calculations', text: 'Review auto-calculated totals, visual charts, and detailed metric summaries.', url: `${baseUrl}#step-3` },
      { position: 4, name: 'Copy or Save Summary', text: 'Copy calculated values to your clipboard or print the result report.', url: `${baseUrl}#step-4` },
    ];
  }

  // 9. Generic Default Workflow for all future tools
  return [
    { position: 1, name: 'Upload Files or Enter Inputs', text: `Provide your input files or data into the ${title} interface.`, url: `${baseUrl}#step-1` },
    { position: 2, name: 'Configure Tool Settings', text: 'Customize options, parameters, and output preferences to meet your requirements.', url: `${baseUrl}#step-2` },
    { position: 3, name: 'Process Data Locally', text: 'Click the primary action button to process your data 100% privately in your browser.', url: `${baseUrl}#step-3` },
    { position: 4, name: 'Download Final Output', text: 'Download your finalized results or copy them directly to your clipboard.', url: `${baseUrl}#step-4` },
  ];
}

/**
 * Builds a Google Rich Results compliant HowTo JSON-LD graph object
 */
export function buildHowToSchema({ slug, title, category, description }: HowToSchemaOptions) {
  const cleanSlug = slug.toLowerCase().replace(/\/$/, '');
  const url = `https://toolwala.co/tools/${cleanSlug}/`;
  const steps = generateHowToSteps(cleanSlug, title, category);

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Use ${title}`,
    description: description || `Step-by-step guide to use ${title} online for free on ToolWala AI.`,
    totalTime: 'PT1M',
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Digital File or Input Data',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: `ToolWala AI ${title}`,
      },
    ],
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.position,
      name: s.name,
      text: s.text,
      url: s.url || `${url}#step-${s.position}`,
    })),
  };
}
