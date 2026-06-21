export interface LandingPageFaq {
  question: string;
  answer: string;
}

export interface LandingPageMetadata {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  badgeText: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  content: string;
  faqs: LandingPageFaq[];
  relatedTools: string[];
  relatedBlogs: { title: string; slug: string }[];
  category: string;
}

export const landingPagesData: LandingPageMetadata[] = [
  {
    slug: "passport-size-photo-maker-online-free",
    title: "Passport Size Photo Maker Online Free - 100% Compliant Editor",
    metaDescription: "Create print-ready passport-size photos online for free. Custom dimensions for India passport, US visa, Schengen, and background removal integration.",
    h1: "Passport Size Photo Maker Online (Free)",
    badgeText: "100% Client-Side Crop Engine",
    description: "Format, adjust, and edit your personal photographs to official passport and visa specifications. Automatically isolate subjects, replace backdrops with clean white, and export at 300 DPI.",
    ctaText: "Go to Passport Photo Maker",
    ctaHref: "/tools/passport-photo-maker",
    category: "Image Tools",
    relatedTools: ["bg-remover", "image-compressor", "signature-resize"],
    relatedBlogs: [
      { title: "Official Indian Passport Photo Size & Dimensions", slug: "official-indian-passport-photo-specifications" },
      { title: "How to Make Passport Size Photo with Blue Background", slug: "make-passport-photo-blue-background" }
    ],
    faqs: [
      { question: "Is this passport photo maker completely free?", answer: "Yes. ToolWala's Passport Photo Maker is 100% free with no signups, subscriptions, or watermarks. You can generate unlimited print-ready layouts at no cost." },
      { question: "What is the official passport photo size in India?", answer: "The Indian passport specification requires a 3.5cm x 4.5cm photo (35mm x 45mm) with a plain white background, and the face must cover 70-80% of the frame." },
      { question: "Is it safe to upload my photo here?", answer: "Yes, our tool runs client-side. The image crop and background removal are processed directly inside your browser cache. We never upload or save your photos." }
    ],
    content: `Need a passport photo quickly for a visa application, passport renewal, or identity card? Skip the studio and avoid print shop wait times. With our free online passport size photo maker, you can easily create compliant document photos from your home.

### How to Make a Passport Photo at Home
To get a passport photo that passes official government reviews, follow these basic steps:
1. **Take a Clear Portrait**: Stand against a plain wall in a well-lit room. Face the camera directly, keep your expression neutral, and ensure both eyes and ears are clearly visible. Avoid wearing glasses with glare or hats.
2. **Upload to our Resizer**: Select the Passport Photo Maker tool above and import your portrait.
3. **Select Your Preset**: Select 'India Passport' (3.5x4.5 cm) or 'US Visa' (2x2 inch) depending on your needs.
4. **Auto-Align Face**: The tool's edge-detection boundaries align your face, shoulders, and eyes according to official layout specifications.
5. **Clean the Background**: Turn on background removal to replace a busy background with a clean white backdrop.
6. **Download**: Export the single high-resolution image or download a 4x6 inch printable sheet with multiple copies.

### Standard Dimensions for Indian Passport Photos
- **Dimensions**: 35 mm width x 45 mm height (3.5 cm x 4.5 cm).
- **Face Coverage**: Your head must cover between 70% and 80% of the photo (32 mm to 36 mm from the chin to the top of the head).
- **Background**: Solid white background. Off-white is acceptable for some visa applications, but pure white is recommended.
- **DPI Quality**: Minimum 300 DPI for sharp printing.

### Complete Biometric Guidelines
To avoid application rejection, make sure you look straight at the lens, avoid head tilts, and keep a neutral facial expression. Avoid wearing white shirts (which blend into the white background); instead, wear dark colors for clear contrast.`
  },
  {
    slug: "passport-photo-size-online",
    title: "Passport Photo Size Online - Official Biometric Dimensions Resizer",
    metaDescription: "Format passport and visa photos to official sizing specifications online. Select presets for India, USA, Schengen, and central government portals.",
    h1: "Passport Photo Sizing & Format Online",
    badgeText: "Indian Portal Sizing Guide",
    description: "Crop and adjust photographs to official passport sizes online. Features direct presets for 35x45mm, 2x2 inch, and visa specifications.",
    ctaText: "Open Sizing Tool",
    ctaHref: "/tools/passport-photo-maker",
    category: "Image Tools",
    relatedTools: ["bg-remover", "image-compressor", "exam-photo-resizer"],
    relatedBlogs: [
      { title: "Official Indian Passport Photo Size & Dimensions", slug: "official-indian-passport-photo-specifications" },
      { title: "Make Passport Size Photo on Mobile Phone", slug: "make-passport-size-photo-mobile-phone" }
    ],
    faqs: [
      { question: "What are the common dimensions for visa photos?", answer: "US Visa requires 2x2 inches (51x51 mm) at 300 DPI. Schengen Visa and Indian Passport require 35x45 mm (3.5x4.5 cm)." },
      { question: "How do I resize my photo to passport size in pixels?", answer: "At 300 DPI, a 3.5x4.5 cm photo corresponds to 413 x 531 pixels. Our resizer automatically applies these dimensions when you choose a preset." }
    ],
    content: `When applying for international travel documents or official portals, getting the passport photo size correct is crucial. Different countries enforce distinct dimension and framing guidelines, and using the wrong size will lead to application rejections.

### Guide to Common Passport and Visa Sizes
- **India Passport & Visa**: 3.5 cm x 4.5 cm (35 mm x 45 mm) | Aspect Ratio: 7:9
- **United States Passport & Visa**: 2.0 inches x 2.0 inches (51 mm x 51 mm) | Aspect Ratio: 1:1
- **Schengen Visa (Europe)**: 3.5 cm x 4.5 cm (35 mm x 45 mm) | Aspect Ratio: 7:9
- **United Kingdom Passport**: 3.5 cm x 4.5 cm (35 mm x 45 mm) | Aspect Ratio: 7:9
- **Canada Passport**: 5.0 cm x 7.0 cm (50 mm x 70 mm) | Aspect Ratio: 5:7

### How to Format Passport Photo Sizes Online
Our online passport sizing tool automatically handles the math for you:
1. Choose the **Open Sizing Tool** button to start.
2. Upload your portrait scan.
3. Select your target country preset from the drop-down menu.
4. The crop boundaries adjust to the required width, height, and aspect ratio.
5. Save the cropped image at the correct resolution (300 DPI) for print or digital upload.`
  },
  {
    slug: "photo-resize-to-20kb",
    title: "Photo Resize to 20KB Online - Compress Image for Exam Forms",
    metaDescription: "Compress and resize photo scans under 20KB online for free. Adjust passport photographs to fit central government and exam portals.",
    h1: "Online Photo Resizer & Compressor to 20KB",
    badgeText: "20KB Exam Size Limit",
    description: "Shrink and optimize passport photographs under 20KB online. Meets specifications for central government recruitment forms, police bharti, and state exams.",
    ctaText: "Go to Photo Resizer",
    ctaHref: "/tools/exam-photo-resizer",
    category: "Image Tools",
    relatedTools: ["signature-resize", "image-compressor", "ssc-photo-resize"],
    relatedBlogs: [
      { title: "How to Upload Photo and Signature in SSC Application Form", slug: "upload-photo-signature-ssc-application" },
      { title: "Why SSC Rejected Your Application Photo & How to Prevent Rejection", slug: "why-ssc-rejected-application-photo-solutions" }
    ],
    faqs: [
      { question: "Why do government forms require photos under 20KB?", answer: "Many recruitment portals use legacy file databases with strict size caps to optimize bandwidth. Uploading photos larger than 20KB will cause an upload error." },
      { question: "Does compressing to 20KB make the photo blurry?", answer: "Our tool balances resolution and JPEG compression levels to ensure that your face details remain legible even at small file sizes." }
    ],
    content: `Uploading a passport photograph to government portals like SSC or state exam boards often requires the file size to be under 20KB. If your file is too large, the system throws a validation error, preventing you from submitting your form.

### How to Resize a Photo to 20KB Online
ToolWala makes it easy to compress your photos to the required size limit:
1. Click the **Go to Photo Resizer** button above.
2. Upload your scanned photograph.
3. The tool applies standard dimension presets (like SSC 3.5x4.5 cm).
4. Adjust the target file size slider to **20KB**.
5. Click **Download** to save your optimized JPEG.

### Tips for Formatting Small Images
- **Check Aspect Ratio**: Ensure the width-to-height ratio matches your form requirements (usually 3.5 x 4.5 cm).
- **Remove Background**: Use the background removal feature to strip background details, which reduces file size and improves clarity.
- **Save as JPEG**: JPEG format provides the best compression for photographs, allowing you to fit clean images under the 20KB limit.`
  },
  {
    slug: "photo-resize-to-50kb",
    title: "Photo Resize to 50KB Online - NSDL PAN & Exam Photo Compiler",
    metaDescription: "Compress and resize photographs under 50KB online for free. Compliant with NSDL PAN card applications and UPSC recruitment portals.",
    h1: "Online Photo Resizer to 50KB",
    badgeText: "50KB Portal Limit",
    description: "Resize and compress photographs to exactly 50KB or less online. Fits requirements for NSDL PAN card updates, IBPS banking exams, and state job portals.",
    ctaText: "Go to Photo Resizer",
    ctaHref: "/tools/exam-photo-resizer",
    category: "Image Tools",
    relatedTools: ["pan-card-resize", "signature-resize", "image-compressor"],
    relatedBlogs: [
      { title: "How to Resize Photo and Signature for PAN Card Application", slug: "resize-photo-signature-pan-card-application" },
      { title: "NSDL PAN Card Document Specifications: Complete Upload Guide", slug: "nsdl-pan-card-document-specifications" }
    ],
    faqs: [
      { question: "What portals require photos under 50KB?", answer: "NSDL PAN card uploads, IBPS PO/Clerk applications, and state recruitment portals often enforce a 50KB limit." },
      { question: "Will my photo quality decrease?", answer: "No. The tool optimizes the image dimensions and compression parameters to keep details clear while fitting the 50KB limit." }
    ],
    content: `When applying for bank exams (IBPS/SBI) or updates (NSDL PAN card), the uploaded photograph file size must be between 20 KB and 50 KB. Uploading images larger than 50KB will cause registration failures.

### How to Compress Your Photo Under 50KB
Follow these steps to format your photo:
1. Select the **Go to Photo Resizer** button.
2. Upload your scanned photograph.
3. Choose your preset (e.g., NSDL PAN 213x213 px or Bank Exam 4.5x3.5 cm).
4. Set the target file size slider to **50KB**.
5. Save the output image.

### Sizing and Dimension Requirements
- **Bank Exams (IBPS/SBI)**: 4.5 cm height x 3.5 cm width, target size: 20-50KB.
- **PAN Card (NSDL/UTIITSL)**: 3.5 cm x 2.5 cm (or 213x213 pixels), target size: 10-50KB.
- **Central Government Jobs**: Usually 3.5 cm x 4.5 cm, target size: 20-50KB.`
  },
  {
    slug: "photo-resize-to-100kb",
    title: "Photo Resize to 100KB Online - Document Photo Compressor",
    metaDescription: "Compress and resize photo scans under 100KB online for free. Adjust passport photographs to fit central portals and job forms.",
    h1: "Online Photo Resizer to 100KB",
    badgeText: "100KB Upload Spec",
    description: "Format and compress passport photographs to under 100KB online. Perfect for visa applications, corporate portals, and state government registrations.",
    ctaText: "Go to Photo Resizer",
    ctaHref: "/tools/exam-photo-resizer",
    category: "Image Tools",
    relatedTools: ["passport-photo-maker", "image-compressor", "gov-form-pdf-compressor"],
    relatedBlogs: [
      { title: "Standard Document Sizes for Indian Government Schemes", slug: "indian-government-scheme-document-sizes" },
      { title: "How to Upload Documents on Government Portals Without Rejection", slug: "upload-documents-government-portals" }
    ],
    faqs: [
      { question: "What documents require a 100KB size limit?", answer: "Many portal systems require supporting documents and passport photos to be under 100KB for faster loading." },
      { question: "Can I convert my photo to PDF under 100KB?", answer: "Yes. Use our Image Compressor to shrink the file, then convert it using the JPG to PDF tool." }
    ],
    content: `Uploading passport photos or document scans to visa systems and corporate portals often requires the file size to be under 100KB. Our online resizer helps you hit this limit without losing image clarity.

### Steps to Compress a Photo Under 100KB
1. Click the **Go to Photo Resizer** button above.
2. Upload your photograph.
3. Select your target dimensions or aspect ratio.
4. Set the target file size slider to **100KB**.
5. Download your optimized, print-ready image.

### Quality and Compliance Tips
- **Use High-Resolution Inputs**: Start with a high-resolution photo to keep the final output crisp.
- **Adjust Contrast**: Ensure proper lighting so your features remain visible at smaller file sizes.
- **Secure Processing**: The tool runs entirely in your browser cache, keeping your personal photos private.`
  },
  {
    slug: "signature-resize-to-20kb",
    title: "Signature Resize to 20KB Online - SSC Sign Cropper & Compressor",
    metaDescription: "Compress and resize signature scans under 20KB online. Compliant with Staff Selection Commission (SSC) guidelines.",
    h1: "SSC Signature Resizer & Compressor to 20KB",
    badgeText: "SSC Signature Spec",
    description: "Crop and compress scanned signatures under 20KB online. Formats signatures to exactly 6.0x3.0 cm to meet SSC portal guidelines.",
    ctaText: "Go to Signature Resizer",
    ctaHref: "/tools/signature-resize",
    category: "Image Tools",
    relatedTools: ["ssc-photo-resize", "image-compressor", "exam-photo-resizer"],
    relatedBlogs: [
      { title: "How to Resize Scanned Signature for SSC CGL Portal", slug: "resize-scanned-signature-ssc-cgl-portal" },
      { title: "Why SSC Rejected Your Application Photo & How to Prevent Rejection", slug: "why-ssc-rejected-application-photo-solutions" }
    ],
    faqs: [
      { question: "What is the signature file size limit for SSC?", answer: "SSC requires signature uploads to be in JPEG format and between 10 KB and 20 KB." },
      { question: "Can I sign in blue ink?", answer: "SSC accepts both black and blue ink, but black ink is recommended for higher contrast and better legibility." }
    ],
    content: `Applying for SSC CGL, CHSL, or MTS requires uploading a scanned signature between 10KB and 20KB. If your signature scan is too large or cropped incorrectly, the upload system will reject the file.

### How to Resize a Signature to 20KB
Format your signature scan quickly with these steps:
1. Click the **Go to Signature Resizer** button above.
2. Upload your signature scan.
3. Apply the **SSC preset** (6.0cm x 3.0cm).
4. Set the target compression slider to **20KB**.
5. Download your compliant JPEG.

### Best Practices for Scanned Signatures
- **Use Plain White Paper**: Sign on unruled, clean white paper. Ruled lines will cause rejections.
- **Maintain High Contrast**: Use black ink to ensure the signature is clear and legible.
- **Align and Crop**: Trim unnecessary white space around the signature to keep the file size small.`
  },
  {
    slug: "signature-resize-to-50kb",
    title: "Signature Resize to 50KB Online - UPSC Sign Editor",
    metaDescription: "Compress and resize signature scans under 50KB online. Standard format for UPSC CSE, NDA, CDS, and bank exam portals.",
    h1: "Online Signature Resizer to 50KB",
    badgeText: "50KB Sign Limit",
    description: "Resize and compress signature scans to exactly 50KB or less online. Fits guidelines for UPSC registrations, IBPS applications, and state recruitment forms.",
    ctaText: "Go to Signature Resizer",
    ctaHref: "/tools/signature-resize",
    category: "Image Tools",
    relatedTools: ["upsc-photo-resize", "image-compressor", "exam-photo-resizer"],
    relatedBlogs: [
      { title: "UPSC Photo and Signature Resize Specifications: Complete Steps", slug: "upsc-photo-signature-resize-specifications" },
      { title: "How to Resize UPSC Signature to 350x350 Pixels Online", slug: "resize-upsc-signature-350x350-pixels" }
    ],
    faqs: [
      { question: "What portals allow signatures up to 50KB?", answer: "UPSC (allows up to 300KB but recommends under 50KB) and various banking portals (like SBI and IBPS) require signatures under 50KB." },
      { question: "How do I crop my signature to a specific size?", answer: "Upload your scan to our resizer, adjust the crop box around your signature, set the target size, and download." }
    ],
    content: `UPSC and major banking exams require uploading a scanned signature that fits specific file size limits. This resizer helps you crop and compress your signature under 50KB in seconds.

### Steps to Resize Signature to 50KB
1. Click the **Go to Signature Resizer** button.
2. Upload your signature scan.
3. Select your target dimensions (e.g., UPSC 350x350 px or Bank Exam 140x60 px).
4. Set the target file size slider to **50KB**.
5. Download the optimized JPEG.

### Sizing Guidelines
- **UPSC forms**: Minimum 350x350 pixels, target size: 20-300KB (under 50KB recommended).
- **Bank forms**: 140 x 60 pixels, target size: 10-20KB (some state banks accept up to 50KB).`
  },
  {
    slug: "image-resize-in-kb",
    title: "Image Resize in KB - Compress JPG/PNG to Target Size Online",
    metaDescription: "Resize and compress images to specific KB limits online. Set custom target sizes like 20KB, 50KB, or 100KB for any document photo.",
    h1: "Online Image Resizer in KB",
    badgeText: "Target Size Compressor",
    description: "Resize and compress JPG, PNG, and WebP images to specific KB limits online. Adjust passport photos and document scans to target sizes locally.",
    ctaText: "Open Compressor Tool",
    ctaHref: "/tools/image-compressor",
    category: "Image Tools",
    relatedTools: ["signature-resize", "exam-photo-resizer", "jpg-to-pdf"],
    relatedBlogs: [
      { title: "How to Compress JPG Images Under 20KB/50KB/100KB", slug: "compress-jpg-images-kb-limit" },
      { title: "How to Upload Documents on Government Portals Without Rejection", slug: "upload-documents-government-portals" }
    ],
    faqs: [
      { question: "How does the target KB compressor work?", answer: "The tool adjusts JPEG compression levels and dimensions locally in your browser memory until the file matches your target KB limit." },
      { question: "What formats are supported?", answer: "We support JPG, JPEG, PNG, and WebP images." }
    ],
    content: `Need to resize an image to a specific kilobyte limit? Many online registration systems require files to be under limits like 20KB, 50KB, or 100KB. This tool lets you set a target size and handles the compression automatically.

### How to Resize an Image in KB
1. Click the **Open Compressor Tool** button.
2. Upload your image (JPG, PNG, or WebP).
3. Use the slider to set your target size (e.g., **50KB**).
4. Click **Download** to save your optimized image.

### Quality and File Size Balance
Reducing file size requires finding a balance between resolution and compression. Our tool adjusts these parameters to shrink your file while keeping text and face details sharp and readable.`
  },
  {
    slug: "compress-pdf-to-300kb",
    title: "Compress PDF to 300KB Online - e-Aadhaar & UPSC Portal Spec",
    metaDescription: "Compress PDF documents under 300KB online for free. Optimized for e-Aadhaar updates and UPSC certificate uploads.",
    h1: "Compress PDF to 300KB Online",
    badgeText: "300KB Portal Limit",
    description: "Reduce PDF file sizes under 300KB online. Perfect for official government portals, e-Aadhaar uploads, and UPSC application certificates.",
    ctaText: "Go to PDF Compressor",
    ctaHref: "/tools/compress-pdf",
    category: "PDF Tools",
    relatedTools: ["aadhaar-pdf-compressor", "gov-form-pdf-compressor", "merge-pdf"],
    relatedBlogs: [
      { title: "How to Compress e-Aadhaar PDF File Under 300KB", slug: "compress-eaadhaar-pdf-under-300kb" },
      { title: "How to Compress UPSC PDF Documents Under 300KB", slug: "compress-upsc-pdf-documents-under-300kb" }
    ],
    faqs: [
      { question: "Is my document secure?", answer: "Yes. The PDF compressor runs entirely client-side, meaning your document is processed in your browser memory and never uploaded to our servers." },
      { question: "Does it support password-protected PDFs?", answer: "Yes. The tool will prompt you for the password to decrypt the file locally before compressing it." }
    ],
    content: `Uploading documents to the UPSC portal or updating your details on the UIDAI Aadhaar website requires PDF files to be under 300KB. This tool helps you compress your PDFs to meet these limits securely.

### How to Compress PDF to 300KB
1. Click the **Go to PDF Compressor** button.
2. Upload your PDF file.
3. The tool adjusts resolution and removes unneeded metadata locally.
4. Download your optimized PDF under 300KB instantly.

### Why 300KB is Important
Both UPSC and UIDAI enforce a strict 300KB limit for certificate and identity uploads. Files exceeding this limit will fail to upload, but our local compressor helps you avoid registration issues.`
  },
  {
    slug: "compress-pdf-to-500kb",
    title: "Compress PDF to 500KB Online - NSDL e-PAN Card Spec",
    metaDescription: "Compress PDF documents under 500KB online for free. Optimized for NSDL PAN card application attachments.",
    h1: "Compress PDF to 500KB Online",
    badgeText: "500KB Upload Limit",
    description: "Reduce and compress PDF files under 500KB online. Complies with NSDL e-PAN card applications and state portal uploads.",
    ctaText: "Go to PDF Compressor",
    ctaHref: "/tools/compress-pdf",
    category: "PDF Tools",
    relatedTools: ["gov-form-pdf-compressor", "merge-pdf", "protect-pdf"],
    relatedBlogs: [
      { title: "NSDL PAN Card Document Specifications: Complete Upload Guide", slug: "nsdl-pan-card-document-specifications" },
      { title: "How to Compress PAN Card PDF File Under 300KB/500KB", slug: "compress-pan-card-pdf-limit" }
    ],
    faqs: [
      { question: "Will my PDF text remain clear?", answer: "Yes, our optimizer balances compression parameters to keep text layers and scans sharp and readable." },
      { question: "Can I combine pages before compressing?", answer: "Use our Merge PDF tool to combine your pages first, then compress the resulting file." }
    ],
    content: `NSDL and state government portals often require supporting documents to be uploaded as PDFs under 500KB. This tool helps you compress your files to meet these specifications.

### How to Compress PDF under 500KB
1. Click the **Go to PDF Compressor** button.
2. Upload your PDF document.
3. Set your target compression limits.
4. Download the optimized PDF instantly.

### Supported Formats and Scans
The compressor works with both digital PDFs and scanned image files, compressing them locally to fit under the 500KB limit.`
  },
  {
    slug: "compress-pdf-to-1mb",
    title: "Compress PDF to 1MB Online - Passport Seva Upload Spec",
    metaDescription: "Compress PDF documents under 1MB online for free. Compliant with Passport Seva and visa application portals.",
    h1: "Compress PDF to 1MB Online",
    badgeText: "1MB Seva Portal Limit",
    description: "Reduce and compress PDF files under 1MB online. Perfect for birth proof, address documents, and academic scans on the Passport Seva portal.",
    ctaText: "Go to PDF Compressor",
    ctaHref: "/tools/compress-pdf",
    category: "PDF Tools",
    relatedTools: ["gov-form-pdf-compressor", "merge-pdf", "split-pdf"],
    relatedBlogs: [
      { title: "How to Upload Passport Documents on Passport Seva Portal", slug: "upload-passport-documents-seva-portal" },
      { title: "How to Compress Passport PDF Scans Under 1MB", slug: "compress-passport-pdf-scans-1mb" }
    ],
    faqs: [
      { question: "What is the file size limit for Passport Seva uploads?", answer: "The official portal has a strict 1.0 MB file size limit for each uploaded PDF document." },
      { question: "Is this tool safe for personal documents?", answer: "Yes. Your files are processed locally in your browser cache and are never uploaded to our servers." }
    ],
    content: `Uploading birth certificates or address proofs to the Passport Seva portal requires PDF files to be under 1MB. This resizer helps you compress your PDFs to meet these guidelines.

### How to Compress PDF to 1MB Online
1. Click the **Go to PDF Compressor** button.
2. Upload your PDF scan.
3. The tool applies optimized compression levels.
4. Download your PDF under 1MB instantly.

### Maintain Text Legibility
Official portals require text to be clear and readable. Our compressor is designed to shrink your files while keeping text layers sharp and legible.`
  },
  {
    slug: "pan-card-photo-resize",
    title: "PAN Card Photo Resize Online - 213x213 Pixel Resizer",
    metaDescription: "Format, crop, and resize passport photos to NSDL/UTIITSL PAN card specifications. Get 213x213 pixel dimensions under 50KB.",
    h1: "PAN Card Online Photo Resizer",
    badgeText: "PAN 213x213 Spec",
    description: "Crop and resize passport photographs to NSDL and UTIITSL PAN card specifications. Fits the mandatory 213x213 pixel square format under 50KB.",
    ctaText: "Go to PAN Card Resizer",
    ctaHref: "/tools/pan-card-resize",
    category: "Image Tools",
    relatedTools: ["signature-resize", "image-compressor", "bg-remover"],
    relatedBlogs: [
      { title: "How to Resize Photo and Signature for PAN Card Application", slug: "resize-photo-signature-pan-card-application" },
      { title: "Why Your PAN Card Document Upload Failed on NSDL/UTIITSL", slug: "why-pan-card-document-upload-failed" }
    ],
    faqs: [
      { question: "What is the photo size for PAN card online?", answer: "The official dimension is 213 x 213 pixels (3.5 x 2.5 cm at 300 DPI) in square format." },
      { question: "Can I replace my photo background with white?", answer: "Yes, the resizer features an integrated background removal toggle to set a clean white backdrop." }
    ],
    content: `Applying for a new PAN card or updating your details requires submitting a photo that meets strict dimension rules. Our PAN card resizer helps you format your images to NSDL and UTIITSL specifications.

### How to Format Photo for PAN Card
1. Click the **Go to PAN Card Resizer** button.
2. Upload your passport photo.
3. The tool applies the 213x213 pixel crop box.
4. Set the target file size slider to **50KB**.
5. Save your compliant JPEG.

### Sizing Symmetrical Photos
- **Dimensions**: Exactly 213 x 213 pixels.
- **File size**: Under 50KB (NSDL) or 10-30KB (UTIITSL).
- **Background**: Solid white with no shadows.`
  },
  {
    slug: "railway-exam-photo-resize",
    title: "Railway Exam Photo Resize - RRB & RRC Application specs",
    metaDescription: "Resize and crop passport photos and signatures to RRB recruitment specs. Complies with RRB ALP, Group D, and NTPC requirements.",
    h1: "Railway Exam Form Photo Resizer",
    badgeText: "RRB / RRC Guidelines",
    description: "Format and resize passport photos for RRB ALP, Group D, and NTPC applications online. Auto-crop to 35mm x 45mm and compress under 50KB.",
    ctaText: "Go to Photo Resizer",
    ctaHref: "/tools/exam-photo-resizer",
    category: "Image Tools",
    relatedTools: ["signature-resize", "image-compressor", "bg-remover"],
    relatedBlogs: [
      { title: "RRB ALP Photo and Signature Size Guidelines & Resizer", slug: "rrb-alp-photo-signature-size-guidelines" },
      { title: "How to Resize Photo and Sign for RRB Group D Recruitment", slug: "resize-photo-signature-rrb-group-d" }
    ],
    faqs: [
      { question: "What is the photo size for railway exams?", answer: "The standard size is 35mm x 45mm (3.5cm x 4.5cm) with a white or light-colored background, and the file size must be between 20 KB and 50 KB." },
      { question: "What are the signature specs for RRB?", answer: "Signatures must be on white paper with black ink, and the file size must be between 10 KB and 20 KB." }
    ],
    content: `Applying for RRB ALP, Group D, or NTPC recruitment requires uploading photographs and signatures that meet strict dimension limits. Our railway exam resizer makes it easy to format your files.

### Steps to Format Photo for Railway Exams
1. Click the **Go to Photo Resizer** button above.
2. Upload your photograph.
3. Select your RRB/RRC exam preset.
4. Set the target compression slider to **50KB** (or **20KB** for signatures).
5. Download your optimized JPEG.

### Upload Sizing Guidelines
- **Photos**: 3.5cm x 4.5 cm (354 x 472 pixels) | Target size: 20-50KB.
- **Signatures**: 140 x 60 pixels | Target size: 10-20KB.`
  }
];
