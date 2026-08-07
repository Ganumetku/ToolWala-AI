export interface HubFaq {
  question: string;
  answer: string;
}

export interface HubMetadata {
  slug: string;
  id: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  icon: string;
  badgeText: string;
  content: string;
  relatedTools: { title: string; slug: string; icon: string }[];
  landingPages: { title: string; slug: string }[];
  faqs: HubFaq[];
  keywords: string[];
}

export const hubsData: HubMetadata[] = [
  {
    slug: "upsc-exam-utilities",
    id: "upsc-hub",
    title: "UPSC Exam Document & Photo Optimization Hub",
    h1: "UPSC Form Document Optimizer & Resizer",
    description: "Format, crop, and resize documents, photographs, and signatures to official UPSC guidelines. Instantly get 350x350 px photos and under 300KB PDFs.",
    intro: "A dedicated toolkit for Union Public Service Commission (UPSC) candidates. Easily prepare your photographs, signatures, and certificates for NDA, CDS, CSE, and OTR applications locally and securely.",
    icon: "🎓",
    badgeText: "UPSC Online Form Portal Rules",
    keywords: ["upsc photo resize", "upsc signature resize", "otr photo specifications", "upsc document size", "compress upsc pdf"],
    content: `Preparing documents for the Union Public Service Commission (UPSC) Civil Services and other national examinations can be challenging due to strict guidelines. Every year, thousands of online applications are rejected or put on hold because candidates upload non-compliant passport photos, signatures, or academic certificates. The UPSC portal enforces strict automated checks during upload: if your files do not match the required dimensions and file size limits, the upload fails immediately.

To successfully submit your UPSC application, you must follow these specific parameters:
- **Photograph Dimensions**: The image width and height must be equal. The official specification requires a minimum of 350 pixels x 350 pixels and a maximum of 1000 pixels x 1000 pixels.
- **Photograph File Size**: The uploaded JPEG file must be between 20 KB and 300 KB.
- **Signature Dimensions**: Similar to the photo, the signature scan must have equal dimensions of 350 x 350 pixels up to 1000 x 1000 pixels.
- **Signature File Size**: The file must be between 20 KB and 300 KB in JPG format.
- **Certificates and Proofs**: Supporting documents (like caste certificates, income declarations, or graduation marksheets) must be in PDF format. Each PDF must be compressed under 300 KB.

With ToolWala's UPSC Hub, you can optimize all these files directly on your computer or mobile phone. Our client-side engines resize images to exactly 350x350 pixels, adjust compression levels to target 50KB, and compress PDFs to under 300KB without uploading anything to remote servers. This ensures complete privacy for your personal identity documents.`,
    relatedTools: [
      { title: "UPSC Photo Resizer", slug: "upsc-photo-resize", icon: "🎓" },
      { title: "Signature Resizer", slug: "signature-resize", icon: "✍️" },
      { title: "Gov Form PDF Compressor", slug: "gov-form-pdf-compressor", icon: "🗜️" }
    ],
    landingPages: [
      { title: "UPSC Photo Resizer", slug: "upsc-photo-resize" },
      { title: "Signature Resize for UPSC", slug: "signature-resize-to-50kb" },
      { title: "Compress PDF to 300KB", slug: "compress-pdf-to-300kb" }
    ],
    faqs: [
      {
        question: "What are the UPSC One Time Registration (OTR) photo guidelines?",
        answer: "UPSC OTR requires a passport photograph with the candidate's name and the date of the photo printed at the bottom. The background should be white or light-colored, and dimensions must be minimum 350x350 pixels."
      },
      {
        question: "How do I compress my UPSC mains certificates under 300KB?",
        answer: "Use our Government Form PDF Compressor. Simply upload your scanned certificate PDF, set the target upload limit to 300KB, and the tool will balance resolution to ensure compliance while keeping text readable."
      },
      {
        question: "Can I take a photo on my mobile and upload it directly?",
        answer: "Direct mobile uploads usually fail due to incorrect aspect ratios and high file sizes. Use our UPSC Photo Resizer to automatically crop your photo to the required 350x350 px and compress it under 300KB."
      }
    ]
  },
  {
    slug: "ssc-exam-utilities",
    id: "ssc-hub",
    title: "SSC Exam Document & Photo Optimization Hub",
    h1: "SSC Form Photo & Signature Resizer",
    description: "Resize and format photos and signatures for Staff Selection Commission (SSC) portals. Auto-crop to 3.5x4.5 cm and compress to 20KB-50KB instantly.",
    intro: "Central portal for Staff Selection Commission (SSC) candidates. Prepare your documents, passport photos, and scanned signature images to meet CGL, CHSL, MTS, and GD guidelines.",
    icon: "📝",
    badgeText: "SSC Portal Guidelines",
    keywords: ["ssc photo resize", "ssc signature upload specs", "ssc document dimensions", "rrb sign resize"],
    content: `The Staff Selection Commission (SSC) conducts national recruitments for CGL, CHSL, MTS, Stenographer, and GD Constable posts. SSC application forms feature strict image validation checks. If your photo or signature scan does not meet the specified dimensions and kilobyte limits, the application system will reject the files, preventing you from completing your registration.

SSC upload requirements are highly specific:
- **Photograph Dimensions**: The photograph must be 3.5 cm width x 4.5 cm height. For scanned uploads, this translates to 354 x 472 pixels.
- **Photograph File Size**: Must be between 20 KB and 50 KB. The background must be clean white or light gray, with both eyes and ears clearly visible.
- **New Live Capture Rule**: Note that recent SSC notifications require candidates to capture a live webcam photo during registration. However, signature uploads and historical document filings must still be prepared manually.
- **Signature Dimensions**: The signature must be scanned on a plain white paper using black or blue ink, with dimensions of 6.0 cm width x 3.0 cm height (about 250 x 125 pixels).
- **Signature File Size**: The signature JPEG must be between 10 KB and 20 KB.

Our SSC optimization hub provides dedicated resizers designed around these rules. You can crop your signature scan, remove borders, and compress it under 20KB. For non-live photo portals or historical document submissions, the photo crop preset formats your image to exactly 3.5x4.5 cm with the target size range of 20-50KB.`,
    relatedTools: [
      { title: "SSC Photo Resizer", slug: "ssc-photo-resize", icon: "📝" },
      { title: "Signature Resizer", slug: "signature-resize", icon: "✍️" },
      { title: "Image Compressor", slug: "image-compressor", icon: "📉" }
    ],
    landingPages: [
      { title: "SSC Photo Resizer", slug: "ssc-photo-resize" },
      { title: "Signature Resize for SSC", slug: "signature-resize-to-20kb" },
      { title: "Photo Resize to 20KB", slug: "photo-resize-to-20kb" }
    ],
    faqs: [
      {
        question: "What is the signature size for SSC forms?",
        answer: "The scanned signature must be in JPEG format, with dimensions of 6.0 cm width x 3.0 cm height (2:1 aspect ratio), and the file size must be between 10 KB and 20 KB."
      },
      {
        question: "Why does my SSC photo keep getting rejected?",
        answer: "Common rejection reasons include taking photos with glasses or caps, uploading blurry images, having a dark background, or exceeding the 50KB size limit. Use our compiler to format your photo correctly."
      }
    ]
  },
  {
    slug: "aadhaar-utilities",
    id: "aadhaar-hub",
    title: "UIDAI e-Aadhaar & Document Optimization Hub",
    h1: "e-Aadhaar PDF Compressor & Masking Tool",
    description: "Mask your Aadhaar number for security, crop passport photos to UIDAI specs, and compress Aadhaar PDFs under 300KB safely in your browser.",
    intro: "Manage your Aadhaar updates and privacy. Instantly mask the first 8 digits of your Aadhaar card, compress verification PDFs, and crop update photos client-side.",
    icon: "🪪",
    badgeText: "100% Browser-Native Security",
    keywords: ["aadhaar photo resize", "compress aadhaar pdf", "mask aadhaar card", "uidai photo dimensions"],
    content: `Your Aadhaar card is the most crucial identity document in India, containing your biometric and personal details. When uploading your Aadhaar card to private or government websites (like banks, telecom portals, or employment systems), sharing your full 12-digit number poses severe privacy risks. To protect citizens, the Unique Identification Authority of India (UIDAI) recommends using a **Masked Aadhaar**, which hides the first 8 digits and displays only the last 4 digits.

Additionally, when updating details or uploading Aadhaar proofs, you must meet strict portal specifications:
- **Aadhaar PDF Upload Limit**: Most portals require e-Aadhaar PDF uploads to be under 300 KB. Freshly downloaded PDFs from UIDAI are often much larger and password-encrypted.
- **Aadhaar Photo Dimensions**: Updates on the official portal require a passport-size photo of 3.5 x 4.5 cm under 100 KB.
- **Aadhaar PDF Security**: e-Aadhaar PDFs are protected with an 8-character password. You must remove the password lock before uploading it to systems that do not support automated decryption.

ToolWala's Aadhaar Hub runs 100% locally inside your web browser. The **Aadhaar Masking Tool** uses browser-based image detection to overlay dark masks on the first 8 digits, protecting your biometric privacy. The **Aadhaar PDF Compressor** shrinks your document under 300KB locally, keeping your sensitive identity scans safe from third-party databases.`,
    relatedTools: [
      { title: "Crop & Resize Aadhaar Card", slug: "crop-aadhaar-card", icon: "📸" },
      { title: "Aadhaar Masking Tool", slug: "aadhaar-masking-tool", icon: "🪪" },
      { title: "Aadhaar PDF Compressor", slug: "aadhaar-pdf-compressor", icon: "🔒" }
    ],
    landingPages: [
      { title: "Crop & Resize Aadhaar Card", slug: "crop-aadhaar-card" },
      { title: "Compress PDF to 300KB", slug: "compress-pdf-to-300kb" },
      { title: "Aadhaar Masking Tool", slug: "aadhaar-masking-tool" }
    ],
    faqs: [
      {
        question: "What is a Masked Aadhaar and is it legally valid?",
        answer: "A Masked Aadhaar hides the first 8 digits of your Aadhaar number. It is fully valid and approved by UIDAI for e-KYC verification where sharing the full number is not legally required."
      },
      {
        question: "How do I unlock and compress my Aadhaar PDF?",
        answer: "Our Aadhaar PDF Compressor lets you load your password-protected PDF locally, decrypts it in your browser cache, and optimizes the size under 300KB in one click."
      }
    ]
  },
  {
    slug: "pan-card-utilities",
    id: "pan-hub",
    title: "NSDL & UTIITSL PAN Card Document Hub",
    h1: "PAN Card Photo & Signature Resizer",
    description: "Format, crop, and compress passport photos and signatures to NSDL/UTIITSL specifications. Auto-crop to 213x213 pixels and compress under 50KB.",
    intro: "Prepare documents for PAN card applications. Format signature scans and passport photos to the exact specifications required by NSDL and UTIITSL portals.",
    icon: "🪪",
    badgeText: "NSDL & UTIITSL Specs",
    keywords: ["pan card photo resize", "nsdl signature upload size", "pan card document compressor", "utiitsl photo size"],
    content: `Applying for a Permanent Account Number (PAN) card via NSDL (Protean) or UTIITSL requires submitting photographs and signatures that match specific dimensions. Unlike other portals that accept general passport photos, the PAN card application system uses strict automated filters: if your photo has a non-white background or incorrect dimensions in pixels, your application will be put on hold, leading to processing delays.

To ensure your PAN card documents are approved:
- **Photograph Dimensions**: Must be exactly 2.5 cm x 3.5 cm (equivalent to 213 pixels x 213 pixels in square resolution).
- **Photograph File Size**: Must be under 50 KB in JPG format. The photo should show the face clearly against a white background.
- **Signature Specifications**: Scanned signature must be on plain white paper, with dimensions of 213 pixels x 213 pixels or 4.5 cm x 2.0 cm.
- **Signature File Size**: Must be under 50 KB (NSDL) or under 30 KB (UTIITSL).
- **Proof Documents**: Supporting identity, address, and date of birth documents must be compiled into a single PDF under 300KB (NSDL) or 500KB (UTIITSL).

ToolWala's PAN Card Hub simplifies this process. The **PAN Card Resizer** crops your photo to the required 213x213 pixels square format, sets the target compression limit to 50KB, and lets you replace busy backdrops with a clean white color. The **PDF Compressor** helps you merge and optimize your proof documents under 300KB/500KB for easy uploading.`,
    relatedTools: [
      { title: "PAN Card Resize", slug: "pan-card-resize", icon: "🪪" },
      { title: "Signature Resizer", slug: "signature-resize", icon: "✍️" },
      { title: "Gov Form PDF Compressor", slug: "gov-form-pdf-compressor", icon: "🗜️" }
    ],
    landingPages: [
      { title: "PAN Card Photo Resize", slug: "pan-card-photo-resize" },
      { title: "Compress PDF to 500KB", slug: "compress-pdf-to-500kb" }
    ],
    faqs: [
      {
        question: "What is the official pixel size for PAN card photos?",
        answer: "The official dimension is 213 x 213 pixels in square format, representing 3.5 x 2.5 cm dimensions at 300 DPI."
      },
      {
        question: "Can I crop and compress my PAN card signature scan here?",
        answer: "Yes, you can scan your signature on white paper, upload it to the resizer, crop it to the required aspect ratio, and compress it under 30KB."
      }
    ]
  },
  {
    slug: "passport-seva-utilities",
    id: "passport-hub",
    title: "Passport Seva Document & Photo Optimization Hub",
    h1: "Passport Size Photo Maker & Seva Document Hub",
    description: "Create official 3.5x4.5 cm passport photos with clean white backgrounds, and compress document scans under 1MB for the Passport Seva portal.",
    intro: "Prepare documents for passport applications. Generate standard passport photos, change background colors, and compress certificate scans for PSK uploads.",
    icon: "📸",
    badgeText: "Passport Seva PSK Guidelines",
    keywords: ["passport size photo maker online free", "passport photo size online", "compress passport pdf", "passport seva upload size"],
    content: `Filing applications on the Passport Seva portal requires preparing documents that meet strict size and dimension rules. Unlike other portals that accept general document sizes, the Passport Seva Kendra (PSK) system has a strict 1 MB file size limit for all uploads, and photographs must match official Ministry of External Affairs standards. Non-compliant uploads will cause delay or require you to bring physical copies to the PSK.

Uphold these guidelines to ensure passport document approval:
- **Passport Photo Dimensions**: Must be 3.5 cm width x 4.5 cm height, with the face covering 70-80% of the photograph area.
- **Passport Photo Background**: Must be plain white or off-white. Photos with patterned, colored, or shadowed backgrounds will be rejected.
- **Passport Photo Resolution**: File size must be between 20 KB and 50 KB in JPEG format, with a minimum resolution of 350 x 450 pixels.
- **Supporting Documents**: Birth proof, address proof, and academic certificates must be uploaded in PDF format, with each file size under 1.0 MB.

ToolWala's Passport Hub helps you handle these requirements. The **Passport Photo Maker** features a built-in AI background remover that lets you replace backdrops with clean white, centers your face automatically, and crops the image to exactly 3.5x4.5 cm. The **PDF Compressor** helps you compress large multi-page document scans under 1MB locally, ensuring your private identity details are kept secure.`,
    relatedTools: [
      { title: "Passport Photo Maker", slug: "passport-photo-maker", icon: "📸" },
      { title: "Image Compressor", slug: "image-compressor", icon: "📉" },
      { title: "Gov Form PDF Compressor", slug: "gov-form-pdf-compressor", icon: "🗜️" }
    ],
    landingPages: [
      { title: "Passport Photo Maker Online Free", slug: "passport-size-photo-maker-online-free" },
      { title: "Passport Photo Size Online", slug: "passport-photo-size-online" },
      { title: "Compress PDF to 1MB", slug: "compress-pdf-to-1mb" }
    ],
    faqs: [
      {
        question: "What is the official passport photo size in India?",
        answer: "The official dimension is 35mm x 45mm (3.5cm x 4.5cm) with a white background. The face must cover 70-80% of the photo."
      },
      {
        question: "How do I compress my birth certificate scan under 1MB?",
        answer: "Upload your PDF scan to our Government Form PDF Compressor, set the target upload limit to 1MB, and download the optimized PDF instantly."
      }
    ]
  }
];
