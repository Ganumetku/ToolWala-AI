const fs = require('fs');
const path = require('path');

const dynamicBlogsPath = path.resolve(__dirname, '../src/data/dynamic_blogs.json');
const blogs = JSON.parse(fs.readFileSync(dynamicBlogsPath, 'utf8'));

const now = new Date().toISOString();

// ============================================================
// 1. COMPRESS PDF TO 100KB
// ============================================================
const compressPdf = {
  title: "Compress PDF to 100KB Online: Sizing Certificates for Government Portals",
  seoMetadata: {
    title: "Compress PDF to 100KB Online Free – Government Portal PDF Reducer",
    description: "Compress PDF files under 100KB online for free. Secure client-side processing for EPFO, SSC, UPSC, and state recruitment portal uploads. No server uploads.",
    keywords: "compress pdf to 100kb, pdf compressor online free, reduce pdf size, epfo pdf upload, government portal pdf limit"
  },
  excerpt: "Government portals like EPFO, SSC, and state recruitment boards enforce strict PDF file size limits. Learn how to compress certificates, marksheets, and identity documents under 100KB using ToolWala's secure browser-based compressor.",
  category: "PDF Tools",
  tags: ["PDF Compressor", "Government Forms", "EPFO", "SSC", "Certificate Upload", "Document Compression", "Free Tools"],
  relatedToolSlugs: ["compress-pdf", "gov-form-pdf-compressor", "merge-pdf", "sign-pdf"],
  faqs: [
    { id: "compress-pdf-to-100kb-faq-1", question: "How can I compress a PDF to exactly 100KB?", answer: "Upload your PDF to ToolWala's compressor, select the 100KB target preset, and the tool will automatically adjust image resolution and font subsetting to bring your file under the limit while keeping text legible.", order: 1 },
    { id: "compress-pdf-to-100kb-faq-2", question: "Is my document safe when compressing online?", answer: "Yes. ToolWala processes everything locally in your browser memory using JavaScript. Your PDF never leaves your device and is never uploaded to any server.", order: 2 },
    { id: "compress-pdf-to-100kb-faq-3", question: "Does compressing to 100KB make text unreadable?", answer: "No. Our smart compression engine scales down background graphics and image layers while preserving text vectors and sharp font outlines, ensuring text remains clear and legible.", order: 3 },
    { id: "compress-pdf-to-100kb-faq-4", question: "Which government portals require PDFs under 100KB?", answer: "EPFO Member Portal, many state recruitment boards (UPSSSC, HSSC, RPSC), police bharti portals, and some scholarship application systems enforce a 100KB upload limit for certificates.", order: 4 },
    { id: "compress-pdf-to-100kb-faq-5", question: "Can I compress a scanned PDF under 100KB?", answer: "Yes. Scanned PDFs contain raster images, which are the primary target of our compression engine. The tool reduces image resolution to 150 DPI and optimizes JPEG quality to shrink file size effectively.", order: 5 },
    { id: "compress-pdf-to-100kb-faq-6", question: "What is the best DPI for government PDF uploads?", answer: "150 DPI provides the best balance between file size and text clarity for government portal uploads. Our tool automatically optimizes to this resolution.", order: 6 },
    { id: "compress-pdf-to-100kb-faq-7", question: "Can I compress password-protected PDFs?", answer: "Yes. ToolWala will prompt you to enter the password locally. The PDF is decrypted in your browser memory, compressed, and you can download the optimized file.", order: 7 },
    { id: "compress-pdf-to-100kb-faq-8", question: "Does this tool work on mobile phones?", answer: "Yes. ToolWala's PDF compressor is fully responsive and works on Android and iOS browsers. No app installation is required.", order: 8 },
    { id: "compress-pdf-to-100kb-faq-9", question: "Can I merge multiple PDFs and then compress them?", answer: "Yes. Use ToolWala's Merge PDF tool to combine your documents first, then compress the merged file to under 100KB using the compressor.", order: 9 },
    { id: "compress-pdf-to-100kb-faq-10", question: "How is ToolWala different from other online PDF compressors?", answer: "Unlike cloud-based compressors that upload your files to remote servers, ToolWala processes everything locally in your browser. Your sensitive documents never leave your computer, ensuring complete privacy.", order: 10 }
  ],
  content: `## Why Government Portals Enforce 100KB PDF Limits

Government portals across India handle millions of applications simultaneously. When every applicant uploads a 3MB certificate scan, server infrastructure buckles under the load. To prevent this, portals like EPFO, state recruitment boards, and scholarship platforms enforce strict file size caps — commonly 100KB for supporting documents.

The challenge for candidates is straightforward but frustrating: how do you compress a high-resolution certificate scan from 2MB down to 100KB without making the text illegible? If compression is too aggressive, the document becomes unreadable, and manual verification officers will reject it.

This guide walks you through the entire process using [ToolWala's PDF Compressor](https://toolwala.co/tools/compress-pdf), a free, privacy-first tool that runs entirely in your browser.

---

## Step-by-Step Guide to Compress PDF Under 100KB

### Step 1: Prepare a Clean Scan

Start with the highest quality source document you can obtain:

1. **Scan at 150–200 DPI**: Set your scanner or phone app to capture at 150 to 200 Dots Per Inch. Higher DPI produces sharper text but larger files. 150 DPI is the sweet spot for government uploads.
2. **Crop Margins**: Remove blank borders around your document. Extra whitespace adds unnecessary file weight without contributing useful information.
3. **Flatten the Document**: If your certificate has multiple overlapping layers (from editing software), flatten it into a single-layer PDF before compressing.

### Step 2: Upload to ToolWala

1. Navigate to [ToolWala's PDF Compressor](https://toolwala.co/tools/compress-pdf).
2. Drag and drop your PDF or browse your local files.
3. Your document loads instantly inside the browser cache — nothing is uploaded to any server.

### Step 3: Configure Compression Settings

1. Select the **100KB target preset** from the compression options.
2. The tool automatically adjusts image resolution, strips unused font subsets, and removes metadata profiles (EXIF headers, embedded thumbnails).
3. Preview the compressed output to verify that names, dates, and registration numbers are clearly legible.

### Step 4: Download

Click **Download** to save your optimized PDF. Verify the file size is under 100KB before uploading to the portal.

---

## Which Portals Require PDFs Under 100KB?

Understanding where these limits apply helps you prepare documents in advance:

| Portal / Platform | Documents Required | Maximum Size | Format |
| :--- | :--- | :--- | :--- |
| **EPFO Member Portal** | Passbook Scan, Cheque Leaf | 100KB | PDF / JPEG |
| **UPSSSC (Uttar Pradesh)** | Caste Certificate, Domicile | 100KB | PDF |
| **HSSC (Haryana)** | Category Certificate, ID Proof | 100KB | PDF |
| **RPSC (Rajasthan)** | Experience Certificate | 100KB | PDF |
| **State Police Bharti** | Character Certificate | 50–100KB | PDF |
| **NSP Scholarship Portal** | Income Certificate, Marksheet | 100KB | PDF |

For portals requiring larger limits like 200KB or 300KB, visit our [Compress PDF to 200KB](/landing/compress-pdf-to-200kb/) or [Compress PDF to 300KB](/landing/compress-pdf-to-300kb/) guides.

---

## How the Compression Engine Works

ToolWala's PDF compressor uses a multi-layered approach to reduce file size while maintaining document integrity:

### Image Layer Optimization
Scanned PDFs are essentially images wrapped in a PDF container. Our engine identifies these raster layers and applies targeted JPEG compression. Background areas (white paper, margins) receive aggressive compression, while text regions receive gentler treatment to preserve character edges.

### Font Subsetting
Many PDFs embed entire font families (thousands of glyphs) when only a fraction are used. Our engine strips unused characters, reducing font data from 200KB+ to just a few kilobytes.

### Metadata Stripping
PDF files often contain hidden metadata: creator software information, edit history, embedded thumbnails, and color profiles. Removing these non-essential elements can save 10–30KB without affecting the visible content.

### Stream Compression
PDF internal data streams can be recompressed using more efficient algorithms. Our engine repackages these streams for maximum space savings.

---

## Common Mistakes That Cause Rejections

Even after compressing, your PDF can be rejected if you make these common errors:

- **Scanning at too high a DPI**: A 600 DPI scan produces enormous files. Unless specifically required, 150 DPI is sufficient for government uploads.
- **Leaving borders and margins**: Extra whitespace around your document inflates file size. Always crop to content edges.
- **Not verifying after compression**: Always open the compressed file and verify that text is legible before uploading to the portal.
- **Using the wrong format**: Some portals accept only PDF, others accept JPEG. Verify the required format before uploading.
- **Compressing an already-compressed file**: Multiple rounds of compression degrade quality exponentially. Start from the original scan each time.

---

## Privacy and Security

Government certificates contain sensitive personal information — names, dates of birth, Aadhaar numbers, caste details, and registration IDs. Uploading these to cloud-based compression websites exposes you to:

- **Data harvesting**: Some services retain copies of uploaded files for analytics or resale.
- **Identity theft**: Personal details extracted from your certificates could be used for fraudulent applications.
- **GDPR and IT Act violations**: Processing personal documents on foreign servers may violate data protection regulations.

ToolWala eliminates these risks entirely. Every compression operation executes locally in your browser's JavaScript engine. Your files never touch a remote server. You can even disconnect your internet after the page loads and continue working offline.

---

## Related ToolWala Resources

Expand your document preparation toolkit with these related utilities:

- [Government Form PDF Compressor](/tools/gov-form-pdf-compressor/) — Specialized compression presets for Indian government portals
- [Merge PDF](/tools/merge-pdf/) — Combine multiple certificates into a single PDF before compressing
- [Sign PDF](/tools/sign-pdf/) — Add digital signatures to your compressed documents
- [Compress PDF to 200KB](/landing/compress-pdf-to-200kb/) — For portals with 200KB limits
- [Compress PDF to 300KB](/landing/compress-pdf-to-300kb/) — For e-Aadhaar and UPSC uploads
- [Aadhaar Utilities Hub](/hubs/aadhaar-utilities/) — Complete toolkit for Aadhaar-related document processing

For detailed portal-specific guides, read our articles on [How to Compress e-Aadhaar PDF Under 300KB](/blog/compress-eaadhaar-pdf-under-300kb) and [How to Upload Documents on Government Portals](/blog/upload-documents-government-portals).

---

## Conclusion

Compressing PDFs to 100KB doesn't have to compromise document quality. With the right scanning practices (150 DPI, cropped margins) and ToolWala's intelligent compression engine, you can produce portal-ready documents that pass both automated validation and manual review.

The key advantage of ToolWala over cloud-based alternatives is absolute privacy — your certificates never leave your device. Open the [PDF Compressor](https://toolwala.co/tools/compress-pdf) and prepare your documents in under a minute.`
};

// ============================================================
// 2. PHOTO RESIZE TO 20KB
// ============================================================
const photoResize = {
  title: "Photo Resize to 20KB Online: How to Format and Compress Images for Official Applications",
  seoMetadata: {
    title: "Photo Resize to 20KB Online Free – Exam Form Photo Compressor",
    description: "Resize and compress passport photos under 20KB online for free. Meets SSC, UPSC, state police bharti, and railway exam photo upload requirements.",
    keywords: "photo resize to 20kb, compress photo under 20kb, ssc photo size, exam form photo, passport photo compressor"
  },
  excerpt: "Government recruitment portals like SSC, state police bharti, and railway exams require passport photos under 20KB. Learn how to resize and compress your photos to exact specifications using ToolWala's free browser-based photo resizer.",
  category: "Image Tools",
  tags: ["Photo Resize", "20KB Limit", "SSC Photo", "Exam Form", "Passport Photo", "Image Compression", "Government Forms"],
  relatedToolSlugs: ["exam-photo-resizer", "image-compressor", "ssc-photo-resize", "signature-resize"],
  faqs: [
    { id: "photo-resize-20kb-faq-1", question: "Why do government forms require photos under 20KB?", answer: "Recruitment portals like SSC, state police bharti, and railway exams use legacy databases with strict file size caps to handle millions of applications efficiently. Photos larger than 20KB cause upload validation errors.", order: 1 },
    { id: "photo-resize-20kb-faq-2", question: "Does compressing to 20KB make my photo blurry?", answer: "Not when done correctly. ToolWala's compression engine balances JPEG quality and pixel dimensions to preserve facial details while meeting the size limit. The key is starting with a well-lit, properly framed photo.", order: 2 },
    { id: "photo-resize-20kb-faq-3", question: "What dimensions should my 20KB photo be?", answer: "Most government portals require 3.5cm x 4.5cm (approximately 200x250 pixels at 150 DPI). SSC specifically requires this dimension with JPEG format between 10KB and 20KB.", order: 3 },
    { id: "photo-resize-20kb-faq-4", question: "Can I use a phone camera photo?", answer: "Yes. Modern smartphone cameras produce excellent results. Take your photo against a plain white wall with good natural lighting, then crop and compress using our resizer.", order: 4 },
    { id: "photo-resize-20kb-faq-5", question: "What background color is required?", answer: "Most Indian government forms require a plain white background. Some accept light grey. ToolWala includes a background removal feature to replace busy backgrounds with clean white.", order: 5 },
    { id: "photo-resize-20kb-faq-6", question: "My photo is 500KB. How do I get it to 20KB?", answer: "Upload to ToolWala's Exam Photo Resizer, select the SSC/exam preset (3.5x4.5cm), set the target size to 20KB, and download. The tool handles all dimension and compression adjustments automatically.", order: 6 },
    { id: "photo-resize-20kb-faq-7", question: "Is this tool safe for my passport photo?", answer: "Absolutely. All processing happens locally in your browser. Your biometric photo is never uploaded to any server, ensuring complete privacy.", order: 7 },
    { id: "photo-resize-20kb-faq-8", question: "Can I resize PNG photos to 20KB?", answer: "Yes. Our tool accepts PNG files but outputs optimized JPEGs, which is the mandatory format for all government portals. JPEG provides better compression for photographs.", order: 8 },
    { id: "photo-resize-20kb-faq-9", question: "What if the portal says my photo is too small?", answer: "Some portals enforce a minimum size (e.g., 10KB). If your compressed photo is below the minimum, slightly increase the quality slider in the resizer until the file sits between the minimum and maximum limits.", order: 9 },
    { id: "photo-resize-20kb-faq-10", question: "Can I also resize my signature with this tool?", answer: "For signatures, use our dedicated Signature Resizer tool which has specific presets for signature dimensions (6.0cm x 3.0cm for SSC). Visit the Signature Resize to 20KB guide for detailed instructions.", order: 10 }
  ],
  content: `## Why Government Portals Enforce a 20KB Photo Limit

When the Staff Selection Commission (SSC) opens CGL, CHSL, or MTS registration, millions of candidates rush to submit applications within tight deadlines. Each application includes a passport photograph and a signature scan. If every photo were a full-resolution smartphone image (3–10MB), the portal's servers would buckle under the load.

To prevent this, recruitment portals enforce strict file size limits — typically between 10KB and 20KB for passport photographs. This constraint forces candidates to compress and resize their photos before uploading.

The problem is that aggressive compression can destroy facial details, causing manual verification officers to reject applications. This guide shows you how to format photos correctly using [ToolWala's Exam Photo Resizer](https://toolwala.co/tools/exam-photo-resizer), achieving the right balance between file size and image clarity.

---

## Step-by-Step Guide to Resize Photo Under 20KB

### Step 1: Capture a Good Source Photo

The quality of your final 20KB image depends entirely on the quality of your starting photo:

1. **Find Natural Lighting**: Stand facing a window with soft, diffused daylight. Avoid harsh overhead lights that create shadows under your eyes, nose, and chin.
2. **Use a Plain Background**: Stand against a clean white or light-coloured wall. Keep 1–2 feet of distance from the wall to prevent your body shadow from appearing in the shot.
3. **Frame Correctly**: Ask someone to take your photo from chest level. Your head should occupy roughly 70–80% of the vertical frame.
4. **Neutral Expression**: Keep your face relaxed. Both eyes must be open and clearly visible. Do not smile, tilt your head, or wear sunglasses.

### Step 2: Upload and Resize with ToolWala

1. Open [ToolWala's Exam Photo Resizer](https://toolwala.co/tools/exam-photo-resizer).
2. Upload your source photograph (any format: JPEG, PNG, or WebP).
3. Select the appropriate exam preset from the dropdown:
   - **SSC CGL/CHSL/MTS**: 3.5cm x 4.5cm, 10–20KB
   - **Railway (RRB)**: 3.5cm x 4.5cm, 20–50KB
   - **State Police Bharti**: 3.5cm x 4.5cm, 10–20KB
4. Align the crop guides over your face. The tool's edge-detection boundaries help you position your head at the correct coverage ratio.
5. Set the **target file size** slider to **20KB**.
6. Click **Download** to save your optimized JPEG.

### Step 3: Verify Before Uploading

Before submitting to the portal:
- Open the downloaded file and confirm your face is clearly visible
- Check the file size in your file manager (it should show 15–20KB)
- Verify the format is JPEG (not PNG)

---

## Dimension Requirements by Portal

Different exams and portals enforce slightly different specifications:

| Exam / Portal | Photo Dimensions | File Size Range | Format | Background |
| :--- | :--- | :--- | :--- | :--- |
| **SSC CGL / CHSL / MTS** | 3.5cm x 4.5cm | 10–20KB | JPEG | White |
| **SSC GD Constable** | 3.5cm x 4.5cm | 10–20KB | JPEG | White |
| **Railway RRB ALP** | 3.5cm x 4.5cm | 20–50KB | JPEG | White / Light |
| **State Police Bharti** | 3.5cm x 4.5cm | 10–20KB | JPEG | White |
| **IBPS Bank Exams** | 4.5cm x 3.5cm | 20–50KB | JPEG | White |
| **UPSC CSE** | 3.5cm x 4.5cm | 20–300KB | JPEG | White |

For SSC-specific formatting, visit our [SSC Photo Resizer](/tools/ssc-photo-resize/) or the [SSC Exam Utilities Hub](/hubs/ssc-exam-utilities/).

---

## How Compression Works Without Losing Quality

Reducing a photo from 500KB to 20KB requires removing 96% of the file data. How does ToolWala do this without destroying your face?

### Dimension Reduction
A smartphone photo might be 4000x3000 pixels (12 megapixels). Government portals only need about 200x250 pixels. Resizing to the correct dimensions accounts for most of the file size reduction — from megabytes to tens of kilobytes.

### JPEG Quality Optimization
JPEG compression works by grouping pixels into 8x8 blocks and discarding high-frequency visual details that the human eye is less sensitive to. Our engine applies this compression selectively: background regions receive higher compression, while the face region (detected by edge analysis) receives gentler treatment.

### Metadata Stripping
Camera photos contain EXIF metadata — GPS coordinates, camera model, ISO settings, timestamps. This metadata can be 10–50KB alone. Stripping it reduces file size significantly without any visual change.

### Colour Profile Optimization
Converting from wide-gamut colour spaces (like Adobe RGB) to sRGB reduces colour data size while maintaining visual appearance for web display.

---

## Common Photo Rejection Reasons and Solutions

Even with correct file size, photos get rejected for these reasons:

- **Shadows on face**: Hard shadows from overhead lights distort biometric markers. Use front-facing natural light instead.
- **Glasses glare**: Reflections on spectacle lenses hide your eyes. Remove glasses for the photo.
- **Head tilt**: Even a slight tilt can trigger automated rejection. Keep your head perfectly straight and level.
- **Excessive compression artifacts**: If the photo looks pixelated or blocky, increase the quality slider slightly and verify the file still fits under 20KB.
- **Wrong background**: Coloured or patterned backgrounds are rejected. Use ToolWala's background removal feature for a clean white backdrop.

---

## Privacy and Security

Passport photographs are sensitive biometric data. Cloud-based photo editors upload your face to remote servers for processing, creating privacy risks. ToolWala operates entirely differently:

- **Zero server uploads**: All crop, resize, and compression operations execute in your browser's JavaScript engine.
- **Works offline**: Once the page loads, you can disconnect your internet and continue processing.
- **No data retention**: Your photos exist only in browser memory and are cleared when you close the tab.

---

## Related Resources

Complete your exam application form with these companion tools:

- [Signature Resize to 20KB](/landing/signature-resize-to-20kb/) — Format your scanned signature for SSC and exam portals
- [SSC Photo Resizer](/tools/ssc-photo-resize/) — Dedicated SSC photo formatting presets
- [Image Compressor](/tools/image-compressor/) — General-purpose image compression for any size target
- [Photo Resize to 50KB](/landing/photo-resize-to-50kb/) — For portals with higher size limits
- [SSC Exam Utilities Hub](/hubs/ssc-exam-utilities/) — Complete toolkit for SSC application preparation

For portal-specific upload guides, read [How to Upload Photo and Signature in SSC Application](/blog/upload-photo-signature-ssc-application) and [RRB ALP Photo and Signature Guidelines](/blog/rrb-alp-photo-signature-size-guidelines).

---

## Conclusion

Resizing a photo to 20KB is a balance between file size and visual clarity. Start with a well-lit source photo, use the correct dimension preset, and let ToolWala's smart compression handle the rest. The tool's client-side processing guarantees your biometric data stays private.

Open the [Exam Photo Resizer](https://toolwala.co/tools/exam-photo-resizer) now and format your application photo in under a minute.`
};

// ============================================================
// 3. SIGNATURE RESIZE TO 20KB
// ============================================================
const signatureResize = {
  title: "Signature Resize to 20KB Online: Sizing Scanned Signatures for Online Applications",
  seoMetadata: {
    title: "Signature Resize to 20KB Online Free – SSC Signature Cropper",
    description: "Crop and compress scanned signatures under 20KB online for free. Format signatures to SSC, UPSC, railway, and bank exam specifications.",
    keywords: "signature resize to 20kb, ssc signature size, compress signature online, exam signature upload, scanned signature cropper"
  },
  excerpt: "SSC, railway, and bank exam portals require signature scans between 10KB and 20KB in specific dimensions. Learn how to crop, resize, and compress your scanned signature using ToolWala's free signature resizer.",
  category: "Image Tools",
  tags: ["Signature Resize", "20KB Limit", "SSC Signature", "Exam Forms", "Scanned Signature", "Document Formatting", "Free Tools"],
  relatedToolSlugs: ["signature-resize", "image-compressor", "ssc-photo-resize", "exam-photo-resizer"],
  faqs: [
    { id: "sig-resize-20kb-faq-1", question: "What is the signature file size limit for SSC?", answer: "SSC requires signature uploads to be in JPEG format between 10KB and 20KB, with dimensions of 6.0cm width x 3.0cm height (approximately 250x125 pixels).", order: 1 },
    { id: "sig-resize-20kb-faq-2", question: "Should I sign in black or blue ink?", answer: "Both are accepted by most portals, but black ink is recommended for higher contrast and better visibility after compression. Blue ink can appear faded on low-quality scans.", order: 2 },
    { id: "sig-resize-20kb-faq-3", question: "Can I use a photo of my signature from my phone?", answer: "Yes. Take a photo of your signature on plain white paper in good lighting. ToolWala's background removal will clean up any shadows or paper texture.", order: 3 },
    { id: "sig-resize-20kb-faq-4", question: "What paper should I use for my signature?", answer: "Use plain, unruled white paper. Ruled lines, graph paper marks, or coloured paper will interfere with the signature scan and may cause rejection.", order: 4 },
    { id: "sig-resize-20kb-faq-5", question: "My signature scan is 200KB. How do I get it to 20KB?", answer: "Upload to ToolWala's Signature Resizer, apply the SSC preset (6.0cm x 3.0cm), set the target to 20KB, and download. The tool handles cropping, resizing, and compression automatically.", order: 5 },
    { id: "sig-resize-20kb-faq-6", question: "What dimensions does UPSC require for signatures?", answer: "UPSC OTR requires signatures at minimum 350x350 pixels in square format, with file size between 20KB and 300KB. Use our 50KB signature preset for UPSC.", order: 6 },
    { id: "sig-resize-20kb-faq-7", question: "Is this tool safe for my scanned signature?", answer: "Yes. ToolWala processes your signature entirely in your browser memory. Nothing is uploaded to any server. Scanned signatures are sensitive biometric data, and our client-side approach ensures complete privacy.", order: 7 },
    { id: "sig-resize-20kb-faq-8", question: "Can I crop my signature to remove whitespace?", answer: "Yes. The tool includes a crop box that you can adjust to trim excess whitespace around your signature, which also helps reduce file size.", order: 8 },
    { id: "sig-resize-20kb-faq-9", question: "What if my signature is too thin or too thick?", answer: "Use a medium-point pen (0.7mm or 1.0mm ball pen) for the best scan results. Thin signatures may become invisible after compression, while very thick signatures may appear as blobs.", order: 9 },
    { id: "sig-resize-20kb-faq-10", question: "Can I also resize my passport photo with this tool?", answer: "For passport photos, use our dedicated Exam Photo Resizer which has specific presets for photo dimensions and face coverage ratios. See our Photo Resize to 20KB guide.", order: 10 }
  ],
  content: `## Why Portals Require Signatures Under 20KB

Recruitment portals like SSC, railway boards, and banking exams require candidates to upload a scanned signature alongside their passport photograph. While the photograph identifies the candidate visually, the signature serves as a legal verification mark that appears on admit cards, answer sheets, and appointment letters.

To manage server resources across millions of applications, these portals enforce strict file size limits. The Staff Selection Commission (SSC) mandates signature files between 10KB and 20KB in JPEG format with specific dimensions of 6.0cm x 3.0cm.

This guide walks you through the complete process of scanning, cropping, and compressing your signature using [ToolWala's Signature Resizer](https://toolwala.co/tools/signature-resize).

---

## How to Create a Perfect Signature Scan

### Step 1: Sign on Clean White Paper

The quality of your digital signature depends on your physical source:

1. **Use Plain White Paper**: Take a fresh, unruled sheet of white paper. Ruled paper, graph paper, or coloured paper will create lines and marks that interfere with the scan.
2. **Use Black Ink**: Sign with a black ball pen (0.7mm or 1.0mm point). Black ink provides the highest contrast against white paper and compresses most efficiently. Blue ink is acceptable but tends to appear lighter after JPEG compression.
3. **Sign Naturally**: Write your signature at normal size — not too large, not too small. The signature should fit within approximately 6cm x 3cm of space on the paper.
4. **Leave White Space**: Keep at least 1cm of margin around your signature. You will crop this later, but having space prevents accidental clipping of signature strokes.

### Step 2: Scan or Photograph Your Signature

You have two options:

**Using a Scanner**:
- Set resolution to 200 DPI (sufficient for signatures)
- Scan as colour or greyscale JPEG
- Place paper flat against the scanner glass

**Using a Phone Camera** (equally effective):
- Place the signed paper on a flat, well-lit surface
- Position your phone directly above (not at an angle)
- Ensure even lighting with no shadows across the paper
- Tap to focus on the signature before capturing

### Step 3: Crop and Compress with ToolWala

1. Open [ToolWala's Signature Resizer](https://toolwala.co/tools/signature-resize).
2. Upload your signature scan or photo.
3. Select the **SSC preset** from the dropdown menu:
   - Dimensions: 6.0cm x 3.0cm (250 x 125 pixels)
   - Target size: 10–20KB
   - Format: JPEG
4. Adjust the **crop box** around your signature to trim excess whitespace.
5. Set the **target file size** slider to **20KB**.
6. Click **Download** to save your compliant JPEG file.

---

## Signature Specifications by Exam Portal

Different portals enforce different dimension and size requirements:

| Exam / Portal | Signature Dimensions | File Size Range | Format | Ink Colour |
| :--- | :--- | :--- | :--- | :--- |
| **SSC CGL / CHSL / MTS** | 6.0cm x 3.0cm | 10–20KB | JPEG | Black / Blue |
| **SSC GD Constable** | 6.0cm x 3.0cm | 10–20KB | JPEG | Black / Blue |
| **Railway RRB ALP** | 3.5cm x 1.5cm | 10–20KB | JPEG | Black |
| **IBPS Bank Exams** | 3.5cm x 1.5cm | 10–20KB | JPEG | Black |
| **UPSC CSE OTR** | 350x350 px (square) | 20–300KB | JPEG | Black / Blue |
| **State Police Bharti** | 6.0cm x 3.0cm | 10–20KB | JPEG | Black |

For UPSC-specific formatting, visit our [Signature Resize to 50KB](/landing/signature-resize-to-50kb/) guide or the [UPSC Exam Utilities Hub](/hubs/upsc-exam-utilities/).

---

## The Science Behind Signature Compression

Compressing a signature from a 200KB scan to under 20KB requires removing over 90% of the file data. Here's how ToolWala achieves this without destroying legibility:

### Background Flattening
The most effective technique for signature compression is background optimization. A white paper background should be uniformly white (RGB 255,255,255). Scans often capture slight paper texture, lighting gradients, and grey tones. Our engine normalizes the background to pure white, which compresses extremely efficiently in JPEG format.

### Stroke Preservation
While the background is aggressively compressed, signature strokes (the dark ink lines) receive different treatment. The engine detects high-contrast edges and preserves their sharpness, ensuring your signature remains clearly readable.

### Dimension Reduction
A phone camera captures signatures at 4000+ pixels wide. Government portals only need 250 pixels. This single step reduces file size by over 90%. ToolWala handles this downscaling with anti-aliasing to keep strokes smooth.

### Metadata Removal
Camera photos include EXIF data (GPS, timestamps, device info) that can add 10–50KB. Stripping this metadata reduces file size without any visual change.

---

## Common Signature Rejection Reasons

Avoid these mistakes that cause portal rejections:

- **Ruled paper lines visible**: Lines from notebook paper appear in the scan and trigger automated rejection. Always use unruled white paper.
- **Shadows across the signature**: Uneven lighting when photographing creates dark patches. Use overhead daylight or a desk lamp angled from the front.
- **Signature too small after cropping**: If your crop is too tight, the signature may not be clearly visible at the portal's display size. Leave a small margin around the strokes.
- **File too small (under 10KB)**: Some portals enforce a minimum size. If your file is under 10KB, slightly increase the quality slider.
- **Wrong aspect ratio**: SSC expects a 2:1 width-to-height ratio. Uploading a square signature will cause it to appear stretched on the admit card.

---

## Privacy and Security

Scanned signatures are legally binding biometric data. If your signature is leaked, it could be used to forge documents, sign contracts, or commit identity fraud. Cloud-based signature editors that upload your scans to remote servers create serious privacy risks.

ToolWala processes everything locally:
- **No server uploads**: Your signature stays in your browser memory
- **Works offline**: Disconnect your internet after the page loads
- **No data retention**: Files are cleared when you close the tab

---

## Related Resources

Complete your application form with these companion tools:

- [Photo Resize to 20KB](/landing/photo-resize-to-20kb/) — Format your passport photo for exam portals
- [SSC Photo Resizer](/tools/ssc-photo-resize/) — Dedicated SSC photo formatting presets
- [Image Compressor](/tools/image-compressor/) — General-purpose image compression
- [SSC Exam Utilities Hub](/hubs/ssc-exam-utilities/) — Complete toolkit for SSC applications

For detailed upload guides, read [How to Upload Photo and Signature in SSC Application](/blog/upload-photo-signature-ssc-application) and [How to Resize Scanned Signature for SSC CGL Portal](/blog/resize-scanned-signature-ssc-cgl-portal).

---

## Conclusion

Formatting a scanned signature to 20KB requires clean source material (white paper, black ink), proper scanning technique, and intelligent compression. ToolWala's Signature Resizer handles the technical complexity — dimension resizing, background normalization, and JPEG optimization — while keeping your biometric data completely private.

Open the [Signature Resizer](https://toolwala.co/tools/signature-resize) and prepare your signature in under a minute.`
};

// ============================================================
// 4. AADHAAR PHOTO RESIZE ONLINE
// ============================================================
const aadhaarResize = {
  title: "Aadhaar Photo Resize Online: How to Format Photos for UIDAI Card Updates",
  seoMetadata: {
    title: "Aadhaar Photo Resize Online Free – UIDAI Photo Sizer & Cropper",
    description: "Resize and crop photos to official UIDAI Aadhaar specifications (3.5cm x 4.5cm) under 50KB. 100% client-side processing for complete privacy.",
    keywords: "aadhaar photo resize, uidai photo size, aadhaar card photo dimensions, resize photo for aadhaar update, aadhaar photo cropper"
  },
  excerpt: "UIDAI requires Aadhaar card photos to be 3.5cm x 4.5cm with a white background and under 50KB. Learn how to resize, crop, and format your photo for Aadhaar enrollment and update applications using ToolWala's free online tool.",
  category: "Image Tools",
  tags: ["Aadhaar Card", "UIDAI", "Photo Resize", "Biometric Photo", "Government ID", "Image Crop", "Free Tools"],
  relatedToolSlugs: ["exam-photo-resizer", "image-compressor", "aadhaar-masking-tool", "aadhaar-pdf-compressor"],
  faqs: [
    { id: "aadhaar-photo-faq-1", question: "What is the official Aadhaar photo size?", answer: "UIDAI requires photos to be 3.5cm x 4.5cm (35mm x 45mm), which corresponds to approximately 413 x 531 pixels at 300 DPI. The file must be in JPEG format under 50KB.", order: 1 },
    { id: "aadhaar-photo-faq-2", question: "Can I update my Aadhaar photo online?", answer: "Yes. UIDAI allows Aadhaar photo updates through the official myaadhaar.uidai.gov.in portal. You need to upload a compliant photo that meets their biometric specifications.", order: 2 },
    { id: "aadhaar-photo-faq-3", question: "Is my Aadhaar photo safe with this tool?", answer: "Absolutely. ToolWala processes everything in your browser memory. Your biometric photo is never uploaded to any server. You can even disconnect your internet after the page loads.", order: 3 },
    { id: "aadhaar-photo-faq-4", question: "What background colour is required for Aadhaar photos?", answer: "UIDAI requires a plain white or off-white background. ToolWala includes a background removal feature to replace busy backgrounds with a clean white backdrop.", order: 4 },
    { id: "aadhaar-photo-faq-5", question: "How much does Aadhaar photo update cost?", answer: "Online Aadhaar photo update through the UIDAI portal costs ₹50 including GST. Updates at Aadhaar Seva Kendras cost ₹50 per field update.", order: 5 },
    { id: "aadhaar-photo-faq-6", question: "Can I use a selfie for my Aadhaar card?", answer: "Selfies are generally not recommended because they distort facial proportions due to the close camera distance. Use a photo taken from at least 1 metre away for accurate biometric measurements.", order: 6 },
    { id: "aadhaar-photo-faq-7", question: "What is the face coverage requirement?", answer: "Your face must cover 70% to 80% of the photo frame. This means from your chin to the top of your head should occupy most of the vertical space in the photo.", order: 7 },
    { id: "aadhaar-photo-faq-8", question: "Can I wear glasses in my Aadhaar photo?", answer: "It is recommended to remove glasses to avoid glare and reflections that can obscure your eyes. If you must wear prescription glasses, ensure there is no lens glare.", order: 8 },
    { id: "aadhaar-photo-faq-9", question: "What format does UIDAI accept?", answer: "UIDAI accepts JPEG format only. Our tool automatically converts and saves your photo as an optimized JPEG file.", order: 9 },
    { id: "aadhaar-photo-faq-10", question: "Can I also process my e-Aadhaar PDF with ToolWala?", answer: "Yes. Use our Aadhaar PDF Compressor to compress downloaded e-Aadhaar PDFs to meet portal upload limits, and our Aadhaar Masking Tool to hide the first 8 digits for safe sharing.", order: 10 }
  ],
  content: `## Why Aadhaar Photo Specifications Matter

Your Aadhaar card is India's most critical identity document. Linked to your bank accounts, mobile numbers, PAN card, and government benefits, the photograph on your Aadhaar card serves as a primary biometric identifier. UIDAI uses facial recognition algorithms to verify your identity across government systems, making photo quality and compliance essential.

When you apply for a new Aadhaar enrollment or update your existing photo through the myaadhaar.uidai.gov.in portal, the system validates your uploaded image against strict biometric specifications. Photos that fail these checks — wrong dimensions, poor lighting, incorrect background — are automatically rejected, delaying your application.

This guide covers everything you need to know about formatting Aadhaar photos correctly using [ToolWala's Aadhaar Photo Resizer](https://toolwala.co/tools/aadhaar-photo-resizer).

---

## Official UIDAI Photo Specifications

UIDAI enforces these technical requirements for Aadhaar card photographs:

| Parameter | Specification |
| :--- | :--- |
| **Dimensions** | 3.5cm x 4.5cm (35mm x 45mm) |
| **Pixel Size (at 300 DPI)** | 413 x 531 pixels |
| **File Size** | Under 50KB |
| **Format** | JPEG only |
| **Background** | Plain white or off-white |
| **Face Coverage** | 70% to 80% of frame |
| **Expression** | Neutral, mouth closed |
| **Eyes** | Both eyes open, clearly visible |
| **Head Position** | Straight, no tilt |
| **Glasses** | Preferably removed |

These specifications align with international ICAO biometric standards and are designed for automated facial recognition processing.

---

## Step-by-Step Guide to Resize Aadhaar Photo

### Step 1: Take a Proper Source Photo

The quality of your Aadhaar photo starts with the source image:

1. **Use Good Lighting**: Stand facing a window with soft natural light. Avoid overhead lights, camera flash, or backlighting. The goal is even illumination across your entire face.
2. **Plain White Background**: Stand against a clean white or light grey wall. Keep 1–2 feet of distance to avoid casting a shadow on the wall behind you.
3. **Proper Distance**: Have someone photograph you from at least 1 metre away. Close-up selfies distort facial proportions and fail biometric checks.
4. **Neutral Expression**: Keep your face relaxed with a neutral expression. Both eyes must be wide open. Do not smile, frown, or tilt your head.
5. **Clothing**: Wear a dark-coloured shirt or top to contrast against the white background. Avoid white clothing which blends into the backdrop.

### Step 2: Upload and Resize with ToolWala

1. Open [ToolWala's Aadhaar Photo Resizer](https://toolwala.co/tools/aadhaar-photo-resizer).
2. Upload your photograph (JPEG, PNG, or any image format).
3. The tool automatically applies the **UIDAI preset** (3.5cm x 4.5cm).
4. Adjust the **face alignment guides** to ensure your face covers 70–80% of the frame.
5. If needed, toggle **Remove Background** to replace a busy background with clean white.
6. Set the **target file size** slider to **50KB** or lower.
7. Click **Download** to save your compliant JPEG photo.

### Step 3: Verify Before Uploading

Before submitting to the UIDAI portal:
- Open the file and verify your face is clearly visible and properly centred
- Check that the background is uniformly white
- Confirm the file size is under 50KB (check in file properties)
- Ensure the file format is JPEG

---

## When Do You Need to Update Your Aadhaar Photo?

UIDAI recommends updating your Aadhaar photo in these situations:

- **Children**: UIDAI requires mandatory biometric updates at ages 5 and 15, as facial features change significantly during childhood.
- **Significant Appearance Change**: If you have undergone major changes (weight loss/gain, aging, medical procedures), updating your photo ensures continued identity verification.
- **Old or Damaged Photo**: If your current Aadhaar card has a low-quality or damaged photo, updating it improves verification accuracy.
- **Photo Mismatch Issues**: If your current photo causes issues during eKYC or Aadhaar-based authentication at banks or government offices.

The update process costs ₹50 through the myaadhaar portal and can be completed online for address, name, photo, and other biometric updates.

---

## Common Aadhaar Photo Rejection Reasons

Understanding why photos get rejected helps you avoid repeating mistakes:

### Lighting Issues
- **Shadows on face**: Hard shadows under your nose, eyes, or chin confuse facial recognition algorithms. Use diffused front-facing light.
- **Overexposure**: Too much brightness washes out facial details. Move away from direct light sources.
- **Underexposure**: Dark, poorly lit photos lack the contrast needed for biometric mapping.

### Framing Issues
- **Face too small**: If your face occupies less than 70% of the frame, the biometric scanner cannot extract sufficient facial data points.
- **Face too large**: If your face is cropped (chin or forehead cut off), the photo fails completeness checks.
- **Head tilt**: Even a 5-degree tilt can misalign facial landmarks used for recognition.

### Background Issues
- **Coloured backgrounds**: Only white or very light grey is accepted.
- **Patterned backgrounds**: Textures, curtains, or furniture visible behind you will trigger rejection.
- **Shadows on background**: Your body shadow on the wall behind you can cause the background check to fail.

### Format Issues
- **File too large**: Photos over 50KB are rejected by the upload system.
- **Wrong format**: PNG, BMP, or TIFF files are not accepted. Only JPEG is valid.
- **Low resolution**: Photos below the minimum pixel dimensions may appear blurry and fail quality checks.

---

## Privacy Considerations

Your Aadhaar photo is directly linked to your 12-digit identity number, which connects to your bank accounts, tax records, and government benefit disbursals. Uploading your Aadhaar photo to cloud-based editing tools creates serious privacy risks:

- **Identity theft**: Your photo combined with other Aadhaar details could be used for fraudulent eKYC.
- **Data leaks**: Cloud services may store copies of your uploaded images.
- **Unauthorised biometric enrollment**: Your facial data could potentially be misused for fake Aadhaar enrollments.

ToolWala addresses these concerns with a strict privacy-first architecture:
- All processing runs locally in your browser's JavaScript engine
- Zero data is transmitted over the network
- You can work fully offline after the page loads
- No cookies, no tracking, no data retention

---

## Related ToolWala Resources

Complete your Aadhaar document workflow with these related tools:

- [Aadhaar Masking Tool](/tools/aadhaar-masking-tool/) — Mask the first 8 digits of your Aadhaar for safe sharing
- [Aadhaar PDF Compressor](/tools/aadhaar-pdf-compressor/) — Compress e-Aadhaar PDFs for portal uploads
- [Aadhaar Photo Resize Landing Page](/landing/aadhaar-photo-resize/) — Quick-access formatting tool
- [Aadhaar Utilities Hub](/hubs/aadhaar-utilities/) — Complete Aadhaar document toolkit
- [Background Remover](/tools/bg-remover/) — Replace photo backgrounds with white

For related guides, read [How to Crop Aadhaar Card Photo to UIDAI Specs](/blog/crop-aadhaar-card-photo-uidai-specs) and [How to Mask Aadhaar Card Online](/blog/how-to-mask-aadhaar-card-online).

---

## Conclusion

Formatting an Aadhaar-compliant photo is straightforward when you follow UIDAI's specifications: 3.5cm x 4.5cm dimensions, white background, neutral expression, and under 50KB in JPEG format. ToolWala's Aadhaar Photo Resizer handles all technical formatting while keeping your biometric data completely private.

Open the [Aadhaar Photo Resizer](https://toolwala.co/tools/aadhaar-photo-resizer) and format your photo in under a minute.`
};

// ============================================================
// Apply updates
// ============================================================
const updates = {
  'compress-pdf-to-100kb': compressPdf,
  'photo-resize-to-20kb': photoResize,
  'signature-resize-to-20kb': signatureResize,
  'aadhaar-photo-resize-online': aadhaarResize,
};

let updated = 0;
for (const blog of blogs) {
  if (updates[blog.slug]) {
    const u = updates[blog.slug];
    blog.title = u.title;
    blog.content = u.content;
    blog.excerpt = u.excerpt;
    blog.category = u.category;
    blog.tags = u.tags;
    blog.seoMetadata = u.seoMetadata;
    blog.faqs = u.faqs;
    blog.relatedToolSlugs = u.relatedToolSlugs;
    blog.updatedAt = now;
    blog.status = 'published';
    if (!blog.publishedAt) blog.publishedAt = now;

    // Word count
    const text = u.content.replace(/[#*|_\-\n\[\](){}]/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').filter(w => w.length > 0).length;
    blog.readingTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    
    console.log(`Updated: ${blog.slug} (${words} words, ${blog.faqs.length} FAQs)`);
    updated++;
  }
}

fs.writeFileSync(dynamicBlogsPath, JSON.stringify(blogs, null, 2), 'utf8');
console.log(`\nDone. Updated ${updated} blog articles.`);
