const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'src/data/dynamic_blogs.json');

const newBlogs = [
  {
    id: "10",
    slug: "new-ssc-photo-guidelines-live-upload",
    title: "New SSC Photo Guidelines: Live Photo Capture vs Upload Rules",
    excerpt: "Learn how the Staff Selection Commission (SSC) handles photograph updates, and how to format uploads for CGL, CHSL, and MTS forms.",
    content: "The Staff Selection Commission (SSC) has introduced updated rules for candidates applying to recruitment exams like SSC CGL, CHSL, MTS, and GD Constable. The primary change is the mandatory live webcam photo capture inside the SSC application form. However, signature uploads and certificate uploads still require manual resizing.\n\n### SSC Photo Specifications\nFor portals that still require uploaded passport-size photographs, the official specifications are:\n- **Dimensions**: 3.5 cm width x 4.5 cm height (354 x 472 pixels).\n- **File Size**: Between 20 KB and 50 KB.\n- **Background**: Plain white or light color with clear ear and eye visibility.\n\nUse ToolWala's SSC Photo Resizer to crop your images to these dimensions instantly. If you are uploading signatures, they must be formatted on white paper using black or blue ink under 20KB.",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["SSC", "Photo Resize", "Recruitment"],
    featured: true,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "New SSC Photo & Signature Guidelines | ToolWala AI",
      description: "Understand the Staff Selection Commission's rules for live captures and scanned signatures."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "ssc-faq-1", question: "Can I upload a selfie for SSC?", answer: "No, selfies will lead to application rejections. Take a formal passport photo or use the portal webcam.", order: 1 }
    ],
    relatedToolSlugs: ["ssc-photo-resize", "signature-resize"]
  },
  {
    id: "11",
    slug: "upsc-photo-signature-resize-specifications",
    title: "UPSC Photo and Signature Resize Specifications: Complete Steps",
    excerpt: "Avoid UPSC form rejections. Our complete guide walks you through dimensions and ratios for IAS, NDA, and CDS exams.",
    content: "The Union Public Service Commission (UPSC) enforces a strict file verification filter on its application portal. If your passport photo or signature scan does not meet the specified dimensions, the upload fails immediately.\n\n### UPSC Sizing Rules\nCandidates must format their image files to meet these criteria:\n- **Photo Resolution**: Between 350x350 and 1000x1000 pixels (aspect ratio 1:1).\n- **Photo Size**: 20 KB to 300 KB.\n- **Signature Resolution**: 350x350 to 1000x1000 pixels (square format).\n- **Signature Size**: 20 KB to 300 KB.\n\nUse the UPSC Photo Resizer tool to crop and convert your files to compliant formats. Additionally, all category and eligibility certificates must be formatted as PDFs under 300 KB.",
    thumbnail: "/UPSCImage.png",
    category: "Image Tools",
    tags: ["UPSC", "Photo Resize", "Civil Services"],
    featured: true,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "UPSC Photo and Signature Resize Specifications | ToolWala AI",
      description: "Step-by-step guide to formatting IAS, NDA, and CDS application documents to UPSC specifications."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "upsc-faq-1", question: "What is the minimum resolution for UPSC photos?", answer: "The minimum resolution is 350 pixels x 350 pixels.", order: 1 }
    ],
    relatedToolSlugs: ["upsc-photo-resize", "signature-resize"]
  },
  {
    id: "12",
    slug: "compress-eaadhaar-pdf-under-300kb",
    title: "How to Compress e-Aadhaar PDF File Under 300KB",
    excerpt: "Optimize and compress your downloaded UIDAI Aadhaar PDF safely inside your browser without uploading files to remote servers.",
    content: "When submitting document proofs to official portals, you are often required to upload your Aadhaar card in PDF format. However, downloaded PDFs from UIDAI are typically large and password-protected, which can cause portal upload failures.\n\n### e-Aadhaar Sizing Requirements\n- **Maximum File Size**: 300 KB.\n- **File Format**: PDF.\n- **Security Lock**: Decrypted/unlocked versions are recommended for automated verification systems.\n\nUse ToolWala's Aadhaar PDF Compressor to decrypt your document locally and optimize its file size under 300KB. All calculations run client-side in browser cache, ensuring complete security for your biometric data.",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80",
    category: "PDF Tools",
    tags: ["Aadhaar", "Compress PDF", "UIDAI"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Compress e-Aadhaar PDF Under 300KB Online | ToolWala AI",
      description: "Securely compress UIDAI e-Aadhaar PDFs to meet the 300KB upload limit. Processes 100% locally in your browser."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "aadhaar-faq-1", question: "What is the Aadhaar PDF password?", answer: "The password is the first 4 letters of your name in CAPITALS followed by your year of birth (e.g., NAME1995).", order: 1 }
    ],
    relatedToolSlugs: ["aadhaar-pdf-compressor", "unlock-pdf"]
  },
  {
    id: "13",
    slug: "open-password-aadhaar-remove-lock",
    title: "How to Open Password-Protected Aadhaar PDF and Remove Lock",
    excerpt: "Remove password security locks from your downloaded e-Aadhaar PDF files locally using browser-native libraries.",
    content: "UIDAI protects all e-Aadhaar downloads with a secure password lock. While this keeps your document safe, many registration portals cannot parse encrypted PDFs, leading to validation errors.\n\n### How to Remove Password from Aadhaar PDF\nTo decrypt your Aadhaar PDF locally without software:\n1. Open ToolWala's Unlock PDF tool.\n2. Upload your password-protected Aadhaar PDF.\n3. Enter the 8-character password when prompted (e.g., first 4 letters of your name in CAPITALS followed by your year of birth).\n4. Click **Unlock** and download the decrypted PDF.\n\nThis process is completed locally in your browser memory, ensuring your identity details are never exposed to external servers.",
    thumbnail: "https://images.unsplash.com/photo-1633158829585-23bc8f7c6414?auto=format&fit=crop&w=800&q=80",
    category: "PDF Tools",
    tags: ["Aadhaar", "Unlock PDF", "Security"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Remove Password Lock from Aadhaar PDF | ToolWala AI",
      description: "Decrypt and unlock password-protected e-Aadhaar PDFs locally. Free, secure, and browser-native."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "unlock-faq-1", question: "Is it legal to remove the Aadhaar PDF lock?", answer: "Yes, it is legal for personal verification use, and is often required for portal uploads.", order: 1 }
    ],
    relatedToolSlugs: ["unlock-pdf", "aadhaar-pdf-compressor"]
  },
  {
    id: "14",
    slug: "resize-photo-signature-pan-card-application",
    title: "How to Resize Photo and Signature for PAN Card Application",
    excerpt: "Crop and adjust your passport photos and signatures to NSDL Protean and UTIITSL specifications.",
    content: "Applying for a Permanent Account Number (PAN) card via NSDL (Protean) or UTIITSL requires submitting photographs and signatures that match strict guidelines. Incorrect dimensions or sizes can delay your application.\n\n### PAN Card Upload Guidelines\nCandidates must format their image files to meet these criteria:\n- **Photo Dimensions**: Exactly 213 pixels x 213 pixels (3.5 cm x 2.5 cm).\n- **Photo Size**: Between 10 KB and 50 KB.\n- **Signature Dimensions**: 213 x 213 pixels (NSDL) or 4.5 cm x 2.0 cm.\n- **Signature Size**: Under 50 KB.\n\nUse ToolWala's PAN Card Resizer to crop and compress your photos to the required square format. Replace busy backgrounds with solid white to meet NSDL portal rules.",
    thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["PAN Card", "Photo Resize", "NSDL"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Resize Photo & Signature for PAN Card Online | ToolWala AI",
      description: "Format, crop, and compress application photos to official NSDL/UTIITSL specifications."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "pan-faq-1", question: "What is the PAN photo size?", answer: "The standard size is 213 x 213 pixels at 300 DPI (3.5 x 2.5 cm).", order: 1 }
    ],
    relatedToolSlugs: ["pan-card-resize", "signature-resize"]
  },
  {
    id: "15",
    slug: "signature-size-pan-card-uploads",
    title: "Standard Signature Size for PAN Card Online Uploads",
    excerpt: "Everything you need to know about scanning and cropping signatures for NSDL and UTIITSL PAN card registration.",
    content: "When applying for a PAN card online, uploading a clear signature scan is required. Non-compliant uploads (e.g. signature on ruled paper or incorrect dimensions) can cause application rejection.\n\n### Signature Sizing Guidelines\n- **Paper and Ink**: Sign on plain white paper using black ink for higher contrast and better legibility.\n- **Dimensions**: Exactly 213 pixels x 213 pixels (square format) or 4.5 cm x 2.0 cm.\n- **File size**: Under 50 KB (NSDL) or under 30 KB (UTIITSL).\n\nUse the Signature Resizer to crop your signature scan and compress it under 30KB. The tool handles formatting locally to keep your private files secure.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["PAN Card", "Signature", "NSDL"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Signature Size for PAN Card Online Uploads | ToolWala AI",
      description: "Learn how to format scanned signatures for NSDL Protean and UTIITSL PAN card portals."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "pan-sig-faq-1", question: "Can I sign in blue ink for PAN card?", answer: "Yes, blue ink is allowed, but black ink is recommended for higher contrast.", order: 1 }
    ],
    relatedToolSlugs: ["signature-resize", "pan-card-resize"]
  },
  {
    id: "16",
    slug: "official-indian-passport-photo-specifications",
    title: "Official Indian Passport Photo Size & Dimensions Guidelines",
    metaDescription: "Understand the Ministry of External Affairs' guidelines for passport photo background colors, sizing, and facial expressions.",
    title: "Official Indian Passport Photo Size & Dimensions Guidelines",
    excerpt: "Learn the official guidelines for passport photo backgrounds, dimensions, and framing for Indian passport applications.",
    content: "Indian passport applications are subject to strict review by the Ministry of External Affairs. Using a photo with a colored background, shadows, or incorrect framing will cause rejections.\n\n### Official Indian Passport Photo Specifications\n- **Dimensions**: 3.5 cm x 4.5 cm (35 mm x 45 mm).\n- **Face Coverage**: Face must cover 70-80% of the image (32 mm to 36 mm from top of head to chin).\n- **Background**: Solid white background with no shadows or borders.\n- **File size**: 20 KB to 50 KB in JPEG format.\n\nUse our Passport Photo Maker to center your face automatically and remove backgrounds. All rendering runs client-side to keep your personal photos secure.",
    thumbnail: "/passportMakerImage.png",
    category: "Image Tools",
    tags: ["Passport", "Photo Size", "Govt Guidelines"],
    featured: true,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Indian Passport Photo Sizing & Specs | ToolWala AI",
      description: "Official photo dimensions, face alignment, and background colors for Passport Seva."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "pass-faq-1", question: "Can I wear glasses in a passport photo?", answer: "No, glasses must be removed to prevent reflection, shadows, or red-eye effects.", order: 1 }
    ],
    relatedToolSlugs: ["passport-photo-maker", "image-compressor"]
  },
  {
    id: "17",
    slug: "make-passport-photo-blue-background",
    title: "How to Make Passport Size Photo with Blue Background",
    excerpt: "Change photo backgrounds to blue online. Adjust images to visa specifications for countries requiring light blue backgrounds.",
    content: "While standard Indian passport photos require a solid white background, some visa applications (e.g., Malaysia, Singapore, and certain education portals) require a blue backdrop.\n\n### How to Add a Blue Background to Your Photo\nTo change background colors locally:\n1. Open ToolWala's Passport Photo Maker.\n2. Upload your photograph.\n3. The tool's AI automatically removes the background.\n4. Select **Light Blue** from the background color options.\n5. Crop to the required dimensions and download your JPEG.\n\nThis process runs entirely in your browser cache, keeping your personal photos private.",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["Passport", "Background Changer", "Visa"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Make Passport Size Photo with Blue Background | ToolWala AI",
      description: "Change passport background colors to blue online. Crop to official dimensions securely."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "blue-faq-1", question: "Which countries require a blue background for visa photos?", answer: "Countries like Malaysia, Singapore, and Oman require light blue backgrounds for visa processing.", order: 1 }
    ],
    relatedToolSlugs: ["passport-photo-maker", "bg-remover"]
  },
  {
    id: "18",
    slug: "upload-photo-signature-ssc-application",
    title: "How to Upload Photo and Signature in SSC Application Form",
    excerpt: "Steps to format and upload your application photos and signature scans to the Staff Selection Commission portal.",
    content: "Uploading photographs and signatures to the Staff Selection Commission (SSC) portal requires meeting specific file limits and parameters. Understanding these rules is key to avoiding registration delays.\n\n### SSC Upload Requirements\n- **Passport Photo**: 3.5 cm x 4.5 cm (20KB - 50KB in JPEG format).\n- **Scanned Signature**: 6.0 cm x 3.0 cm (10KB - 20KB in JPEG format).\n\nUse our SSC Photo Resizer to crop and compress your photos and signatures. The tool formats files locally on your device for complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["SSC", "Form Upload", "Signature Crop"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "How to Upload SSC Photo and Signature Scans | ToolWala AI",
      description: "Learn how to format, crop, and compress files to meet SSC CGL and CHSL portal rules."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "ssc-up-faq-1", question: "Can I print a signature on white paper and scan it?", answer: "Yes, sign on plain white paper using black ink, capture a photo, and crop it to 6.0x3.0 cm.", order: 1 }
    ],
    relatedToolSlugs: ["ssc-photo-resize", "signature-resize"]
  },
  {
    id: "19",
    slug: "upload-passport-documents-seva-portal",
    title: "How to Upload Passport Documents on Passport Seva Portal",
    excerpt: "Learn how to format, organize, and compress supporting document scans under 1MB for the Passport Seva portal.",
    content: "Submitting birth proofs or address documents to the Passport Seva portal requires PDF files to be under 1.0 MB. Incorrect file formats or large scans can prevent you from completing your application.\n\n### Passport Seva Sizing Guidelines\n- **File Format**: PDF (images must be converted to PDF first).\n- **Maximum File Size**: 1.0 MB (1024 KB) per document.\n- **Legibility**: Text and stamps must be clear and readable.\n\nUse our Government PDF Compressor to optimize your document sizes locally. If you have document photos in JPEG format, use the JPG to PDF tool first to convert them.",
    thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    category: "PDF Tools",
    tags: ["Passport", "PDF Compress", "Seva Portal"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Upload & Format Documents for Passport Seva | ToolWala AI",
      description: "Compress scanned certificates under 1MB and convert photos to compliant PDFs."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "pass-up-faq-1", question: "Can I upload a password-locked PDF to the portal?", answer: "No, password-locked documents will fail verification. Use our PDF unlock tool to remove the lock first.", order: 1 }
    ],
    relatedToolSlugs: ["gov-form-pdf-compressor", "unlock-pdf"]
  },
  {
    id: "20",
    slug: "compress-upsc-pdf-documents-under-300kb",
    title: "How to Compress UPSC PDF Documents Under 300KB",
    excerpt: "Optimize scanned certificates, marksheets, and identity proofs under 300KB for the UPSC IAS Mains application.",
    content: "Uploading academic marksheets, degree certificate scans, and caste certificates for UPSC IAS Mains requires PDF files under 300KB. High-resolution scanner outputs are usually much larger, leading to upload failures.\n\n### UPSC PDFS Sizing Rules\n- **File Format**: PDF.\n- **Maximum File Size**: 300 KB.\n- **Layout**: Portrait or landscape layout with legible text structures.\n\nUse our Government PDF Compressor to shrink your document files under 300KB. All optimization is processed locally in your browser memory for complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    category: "PDF Tools",
    tags: ["UPSC", "PDF Compress", "Mains Certificate"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Compress UPSC Application Certificates to 300KB | ToolWala AI",
      description: "Compress scanned marksheets and category certificates under 300KB locally in your browser."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "upsc-pdf-faq-1", question: "Will my documents look blurry after compression?", answer: "Our compressor balances text readability and image size to ensure your files remain eligible for verification.", order: 1 }
    ],
    relatedToolSlugs: ["gov-form-pdf-compressor", "merge-pdf"]
  },
  {
    id: "21",
    slug: "rrb-alp-photo-signature-size-guidelines",
    title: "RRB ALP Photo and Signature Size Guidelines & Resizer",
    excerpt: "Understand the document and image rules for Railway Recruitment Board (RRB) Assistant Loco Pilot (ALP) applications.",
    content: "The Railway Recruitment Board (RRB) has updated photo and signature sizing rules for RRB ALP (Assistant Loco Pilot) and Technician application forms. Uploading files with incorrect parameters will lead to immediate rejection.\n\n### RRB ALP Upload Requirements\n- **Photograph Dimensions**: 35mm x 45mm (354 x 472 pixels).\n- **Photograph File Size**: Between 20 KB and 50 KB in JPEG format.\n- **Signature Dimensions**: 140 pixels x 60 pixels.\n- **Signature File Size**: Between 10 KB and 20 KB.\n\nUse our Railway Exam Resizer tool to crop your photos and signatures. The tool applies these rules locally in your browser, keeping your personal details secure.",
    thumbnail: "https://images.unsplash.com/photo-1532103054090-334e6e60ab29?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["RRB", "Railway Exam", "Photo Sizing"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "RRB ALP Photo & Signature Size Guidelines | ToolWala AI",
      description: "Format, crop, and compress files to meet Railway Recruitment Board ALP specifications."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "rrb-faq-1", question: "What background is required for RRB photos?", answer: "The background must be plain white or off-white. Photos with colored backgrounds are not accepted.", order: 1 }
    ],
    relatedToolSlugs: ["exam-photo-resizer", "signature-resize"]
  },
  {
    id: "22",
    slug: "upload-documents-government-portals",
    title: "How to Upload Documents on Government Portals Without Rejection",
    excerpt: "Avoid portal rejections. Our complete guide walks you through formatting certificate scans and passport photos securely.",
    content: "Uploading files to Indian government recruitment portals (like UPSC, SSC, RRB, or NTA) often fails due to incorrect file parameters. Sizing your files correctly is essential for a smooth registration process.\n\n### Common Portal Rejections Reasons\n- **Exceeding Size Limits**: Uploading JPEGs larger than 50KB or PDFs larger than 300KB.\n- **Incorrect Dimensions**: Photos that are not square or lack the required 7:9 aspect ratio.\n- **Unreadable Scans**: Text that is blurry or features dark shadows.\n\nUse ToolWala's Government PDF Compressor and Image Resizers to format your documents. All processing runs locally in your browser cache to ensure complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["Form Upload", "Portal Sizing", "Govt Guidelines"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Upload Documents on Government Portals | ToolWala AI",
      description: "Avoid validation errors by formatting, cropping, and compressing JPEGs and PDFs correctly."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "upload-faq-1", question: "How do I compress files to a specific KB limit?", answer: "Our tools feature target file size sliders. Drag the slider to the required KB limit, and the compressor adjusts the settings automatically.", order: 1 }
    ],
    relatedToolSlugs: ["gov-form-pdf-compressor", "exam-photo-resizer"]
  },
  {
    id: "23",
    slug: "compress-pdf-under-kb-job-portals",
    title: "How to Compress PDF Under 100KB/200KB for Job Portals",
    excerpt: "Learn how to optimize multi-page marksheets and category certificates to fit strict job portal limits.",
    content: "Job application systems often require supporting documents to be under 100KB or 200KB. Freshly scanned files are usually much larger, leading to upload failures.\n\n### How to Compress PDF Under 200KB\n1. Open ToolWala's Government PDF Compressor.\n2. Upload your PDF document.\n3. Select your target limit (100KB or 200KB).\n4. Download the optimized PDF instantly.\n\nAll compression runs locally on your device, ensuring complete privacy for your sensitive personal certificates.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    category: "PDF Tools",
    tags: ["Compress PDF", "Job Portal", "PDF Optimization"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Compress PDF under 100KB/200KB for Job Portals | ToolWala AI",
      description: "Optimize scanned certificates to fit strict job application upload limits securely."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "job-faq-1", question: "Will my PDF quality degrade significantly?", answer: "No. The compressor balances text readability and file size to ensure your documents remain legible.", order: 1 }
    ],
    relatedToolSlugs: ["gov-form-pdf-compressor", "compress-pdf"]
  },
  {
    id: "24",
    slug: "ibps-bank-exam-photo-signature-size-spec",
    title: "IBPS Bank Exam Photo and Signature Size Requirements: Complete Steps",
    excerpt: "Format and resize passport photos and signatures to match IBPS and SBI banking exam specifications.",
    content: "Registering for bank exams (like IBPS PO, Clerk, or SBI PO) requires uploading photographs and signatures that match strict guidelines. Sizing your files correctly is essential for a smooth application process.\n\n### IBPS Upload Sizing Guidelines\n- **Passport Photo**: 4.5 cm height x 3.5 cm width (20KB - 50KB in JPEG format).\n- **Scanned Signature**: 140 pixels x 60 pixels (10KB - 20KB in JPEG format, signed in black ink).\n\nUse our Bank Exam Resizer tool to crop your photos and signatures. The tool formats files locally on your device for complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["Bank Exam", "IBPS", "Photo Sizing"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "IBPS PO & SBI PO Sizing Requirements | ToolWala AI",
      description: "Learn how to crop and compress photos and signatures for banking exam forms."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "ibps-faq-1", question: "Can I sign in blue ink for IBPS?", answer: "No, IBPS guidelines require signatures to be in black ink.", order: 1 }
    ],
    relatedToolSlugs: ["exam-photo-resizer", "signature-resize"]
  },
  {
    id: "25",
    slug: "how-to-mask-aadhaar-card-online",
    title: "How to Mask Aadhaar Card Number for Security Compliance",
    excerpt: "Protect your identity. Learn how to mask the first 8 digits of your Aadhaar card locally inside your browser.",
    content: "Sharing your full 12-digit Aadhaar number online poses security and identity theft risks. To protect personal data, UIDAI recommends using a Masked Aadhaar for e-KYC verifications.\n\n### How to Mask Your Aadhaar Card Online\nTo secure your Aadhaar card locally:\n1. Open ToolWala's Aadhaar Masking Tool.\n2. Upload your scanned Aadhaar image or PDF.\n3. The tool's AI detects and covers the first 8 digits.\n4. Click **Download** to save your masked Aadhaar copy.\n\nAll image processing is executed client-side in your browser cache, ensuring your sensitive identity details are kept secure.",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["Aadhaar", "Mask Aadhaar", "Privacy"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Mask Aadhaar Card Number Online for Security | ToolWala AI",
      description: "Secure your Aadhaar details by masking the first 8 digits locally in your browser."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "mask-faq-1", question: "Is a Masked Aadhaar legally valid?", answer: "Yes, it is legally valid for e-KYC where sharing the full number is not required.", order: 1 }
    ],
    relatedToolSlugs: ["aadhaar-masking-tool", "aadhaar-pdf-compressor"]
  },
  {
    id: "26",
    slug: "resize-scanned-signature-ssc-cgl-portal",
    title: "How to Resize Scanned Signature for SSC CGL Portal",
    excerpt: "Format and crop your signature scan to meet the strict 10KB-20KB limits for SSC CGL registrations.",
    content: "Uploading a scanned signature to the SSC CGL portal requires meeting specific file limits and aspect ratios. Non-compliant files will cause upload errors.\n\n### SSC CGL Signature Guidelines\n- **Dimensions**: 6.0 cm x 3.0 cm (aspect ratio 2:1).\n- **File size**: Between 10 KB and 20 KB in JPEG format.\n\nUse our Signature Resizer to crop and compress your signature scan. The tool formats files locally on your device for complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["SSC", "Signature", "CGL Form"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Resize Signature for SSC CGL Form | ToolWala AI",
      description: "Format and compress scanned signatures under 20KB to fit SSC CGL specifications."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "ssc-sig-faq-1", question: "Can I use blue ink for SSC CGL?", answer: "Yes, blue and black ink are accepted, but black is recommended for better legibility.", order: 1 }
    ],
    relatedToolSlugs: ["signature-resize", "ssc-photo-resize"]
  },
  {
    id: "27",
    slug: "upsc-otr-photo-document-upload-guide",
    title: "UPSC OTR (One Time Registration) Photo & Document Upload Guide",
    excerpt: "Steps to format, crop, and upload your profile photos and documents for UPSC OTR registrations.",
    content: "The UPSC One Time Registration (OTR) system simplifies the application process for NDA, CDS, and CSE exams. Getting your OTR document formatting correct is essential for a smooth registration.\n\n### UPSC OTR Sizing Guidelines\n- **Passport Photo**: Minimum 350x350 pixels (name and date printed at the bottom of the photo).\n- **Scanned Signature**: Minimum 350x350 pixels.\n- **Support Documents**: Compiled as a PDF under 300KB.\n\nUse our UPSC Resizer tool to crop and compress your photos and signatures. The tool formats files locally on your device for complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1422405153038-23bc8f7c6414?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["UPSC", "OTR Form", "Photo Sizing"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "UPSC OTR Sizing & Document Upload Guide | ToolWala AI",
      description: "Learn how to format, crop, and compress files for the UPSC OTR portal."
    },
    readingTime: "4 min read",
    faqs: [
      { id: "otr-faq-1", question: "Do I need to put my name on the OTR photo?", answer: "Yes, the printed name and date are required on the OTR photo.", order: 1 }
    ],
    relatedToolSlugs: ["upsc-photo-resize", "signature-resize"]
  },
  {
    id: "28",
    slug: "crop-aadhaar-card-photo-uidai-specs",
    title: "How to Crop Aadhaar Card Photo to Official UIDAI Specs",
    excerpt: "Format and resize passport photos to meet UIDAI guidelines for Aadhaar card updates.",
    content: "Updating your Aadhaar card photo requires submitting an image that meets UIDAI guidelines. Incorrect aspect ratios or sizes will lead to application rejections.\n\n### Aadhaar Update Sizing Guidelines\n- **Dimensions**: 3.5 cm x 4.5 cm (354 x 472 pixels).\n- **File size**: Under 100KB in JPEG format.\n\nUse our Aadhaar Photo Resizer to crop and compress your photos. The tool processes files locally on your device for complete privacy.",
    thumbnail: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["Aadhaar", "Photo Sizing", "UIDAI Guidelines"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "Akash Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Creator of ToolWala"
    },
    seoMetadata: {
      title: "Crop Aadhaar Card Photo Online | ToolWala AI",
      description: "Format and compress passport photos to official UIDAI specifications."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "uidai-faq-1", question: "Can I smile in my Aadhaar photo?", answer: "No, a neutral expression is required for biometric validation.", order: 1 }
    ],
    relatedToolSlugs: ["aadhaar-photo-resizer", "bg-remover"]
  },
  {
    id: "29",
    slug: "make-passport-size-photo-mobile-phone",
    title: "How to Make Passport Size Photo on Mobile Phone",
    excerpt: "Steps to capture, crop, and replace photo backgrounds locally on your smartphone.",
    content: "Need passport photos immediately? You can capture and format a compliant photo directly on your smartphone.\n\n### Steps to Make Passport Photos on Mobile\n1. Standing against a plain wall, have someone take a clear portrait of you.\n2. Open ToolWala's Passport Photo Maker on your mobile browser.\n3. Upload your photo and the AI centers your face.\n4. Select your target country preset and adjust framing.\n5. Download the optimized passport photo.\n\nAll processing runs client-side in your mobile browser, keeping your personal photos secure.",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    category: "Image Tools",
    tags: ["Passport", "Mobile Editor", "Biometric Photo"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-21T08:00:00.000Z",
    createdAt: "2026-06-21T08:00:00.000Z",
    updatedAt: "2026-06-21T08:00:00.000Z",
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: "Create Passport Size Photos on Mobile | ToolWala AI",
      description: "Capture, crop, and change background colors on mobile web browsers."
    },
    readingTime: "3 min read",
    faqs: [
      { id: "mob-faq-1", question: "Can I print mobile passport photos?", answer: "Yes, you can print them at any local kiosk or print shop.", order: 1 }
    ],
    relatedToolSlugs: ["passport-photo-maker", "bg-remover"]
  }
];

// Read existing blogs from the file
const existingBlogs = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

// Filter out blogs with the same slugs to prevent duplicates
const filteredExisting = existingBlogs.filter(b => !newBlogs.map(n => n.slug).includes(b.slug));

// Set correct statuses to published for the drafts in original data if any, or merge
const merged = [...filteredExisting, ...newBlogs];

// Serialize back to file
fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), 'utf8');

console.log(`Successfully generated and merged ${newBlogs.length} new blogs. Total blogs: ${merged.length}`);
