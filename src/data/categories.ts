import { Tool } from './tools';

export interface CategoryMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  icon: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
  longDescription: string;
  whyUse: { title: string; desc: string; icon: string }[];
  howItWorks: { step: string; title: string; desc: string }[];
}

export const categoriesData: CategoryMetadata[] = [
  {
    id: "pdf-tools",
    slug: "pdf-tools",
    title: "PDF Tools",
    description: "Professional PDF suite to merge, split, compress, watermark, and convert documents locally.",
    intro: "A collection of 9+ high-performance PDF manipulation utilities designed to streamline your document workflows with complete security.",
    icon: "📄",
    seoTitle: "PDF Tools - Free Online PDF Editor, Splitter & Compressor | ToolWala AI",
    seoDescription: "Edit, merge, split, compress, watermark, protect, and scan PDF files locally. No subscription, no server uploads. Your data stays private.",
    keywords: ["pdf tools", "merge pdf", "split pdf", "compress pdf", "protect pdf", "watermark pdf", "pdf editor", "local pdf scanner"],
    faqs: [
      {
        question: "Are my PDF files secure on ToolWala AI?",
        answer: "Yes. All processing is executed 100% locally in your browser. Your documents never touch our servers or any cloud database."
      },
      {
        question: "Is this PDF toolkit completely free?",
        answer: "Absolutely. All document conversion, page sorting, split, and compression operations are fully free with no download caps."
      }
    ],
    longDescription: "The Portable Document Format (PDF) has emerged as the global standard for exchanging documents across business, legal, financial, and educational sectors. However, editing, merging, or optimizing these files usually forces users into a frustrating trade-off: either purchase expensive, resource-heavy desktop software licenses or upload sensitive records to unverified cloud servers. Uploading contracts, tax sheets, and personal identification to external databases poses severe security vulnerabilities, including data logs storage, network interception, and privacy breaches that violate strict corporate standards or data protection laws like GDPR, HIPAA, and CCPA. ToolWala AI's PDF Tools suite completely resolves this dilemma by delivering a professional-grade, comprehensive toolkit that runs entirely client-side inside your web browser sandbox. By utilizing high-performance WebAssembly compiles of leading PDF manipulation engines, all calculations and file transformations are performed locally on your device's CPU. This local-first architecture ensures that your documents never leave your browser window, giving you absolute data sovereignty. Because there are no server-side communication lags, processing happens almost instantaneously—typically in under 120 milliseconds. Furthermore, this client-side paradigm eliminates file size limits and slow upload or download speeds, letting you process large reports without internet connection constraints. Even if you are offline in a remote location, the tools remain fully functional and ready to use. Our feature-rich toolkit is logically grouped into specialized utilities to handle every aspect of your PDF workflow. In the Organize category, you can merge multiple files into a unified document using the [Merge PDF](/tools/merge-pdf) tool, extract specific chapters with [Split PDF](/tools/split-pdf), visual-sort pages with [Organize PDF Pages](/tools/organize-pdf), delete unwanted elements with [Remove PDF Pages](/tools/remove-pages), or adjust document orientation using [Rotate PDF](/tools/rotate-pdf). For file size reduction and layout editing, the Optimize category offers [Compress PDF](/tools/compress-pdf) (reducing file sizes while keeping fonts and vectors visually lossless) and [Crop PDF](/tools/crop-pdf) (trimming page margins to remove unnecessary borders). Format conversion is handled locally in the Convert category. You can instantly transform image layouts into clean PDF files using [JPG to PDF](/tools/jpg-to-pdf), convert document pages to image files using [PDF to JPG](/tools/pdf-to-jpg), or convert text layers using our [Word to PDF Converter](/tools/word-to-pdf-converter) and [PDF to Word Converter](/tools/pdf-to-word-converter). For document customization and labeling, the [Edit PDF](/tools/pdf-tools/edit-pdf) tool allows you to add text overlays, fill forms, and annotate layouts, while the [Watermark PDF](/tools/watermark-pdf) tool lets you stamp corporate branding or opacity-controlled copyright notices. Security is built directly into the toolkit. You can protect sensitive files with encryption using [Protect PDF](/tools/protect-pdf), or remove authorization restrictions and access passwords using [Unlock PDF](/tools/unlock-pdf). Finally, the PDF Intelligence category leverages on-device neural networks with the [PDF OCR Scanner](/tools/pdf-ocr), enabling you to extract search-optimized, editable text from scanned pages without transmitting anything to external API engines. Experience complete control over your document workflows with ToolWala AI. No subscription traps, no signups, and no hidden fees—just high-performance, private-by-design utilities that respect your privacy and maximize your efficiency.",
    whyUse: [
      {
        title: "100% Secure Local Sandbox",
        desc: "Documents are processed in active browser memory. No data is sent to external servers, protecting sensitive files.",
        icon: "🔒"
      },
      {
        title: "Visually Lossless Compression",
        desc: "Optimize file sizes while preserving fonts, vectors, and image clarity using advanced local compression engines.",
        icon: "📉"
      },
      {
        title: "Complete Format Support",
        desc: "Convert documents easily from [Word to PDF](/tools/word-to-pdf-converter) or [JPG to PDF](/tools/jpg-to-pdf) instantly.",
        icon: "📂"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Select Tool",
        desc: "Choose a PDF operation from our directory, such as Merge, Split, Edit, or Compress."
      },
      {
        step: "2",
        title: "Upload File",
        desc: "Drag and drop your document. It will load instantly since no upload is required."
      },
      {
        step: "3",
        title: "Process & Download",
        desc: "Apply changes (like annotating or converting) and click Download to save the modified PDF."
      }
    ]
  },
  {
    id: "image-tools",
    slug: "image-tools",
    title: "Image Tools",
    description: "Automated background remover, passport photo resizer, and image optimizer.",
    intro: "Create standardized ID photos, extract subject cutouts, generate QR codes, and compress image file sizes instantly.",
    icon: "🖼️",
    seoTitle: "Image Tools & Photo Editors Online | ToolWala AI",
    seoDescription: "Standardize passport photos, crop Aadhaar cards, remove image backgrounds, and compress photos with local browser engines.",
    keywords: ["image tools", "crop passport photo", "aadhaar photo resizer", "bg remover", "image compressor", "color palette", "free image editor"],
    faqs: [
      {
        question: "Does the AI background remover run locally?",
        answer: "Yes. It leverages edge WebAssembly models from @imgly/background-removal inside your browser. No server uploads are required."
      },
      {
        question: "What formats does the Image Compressor support?",
        answer: "It supports JPG, JPEG, PNG, and WebP formats, compressing images up to 90% without losing visual clarity."
      }
    ],
    longDescription: "Optimizing digital media is essential for modern websites, professional applications, and official government portal submissions. ToolWala AI's Image Tools suite provides a powerful set of automated editing and resizing utilities powered by advanced client-side technologies. Users preparing official application forms can easily leverage our specialized Indian portal compliance tools. Use the [Aadhaar Photo Resizer](/tools/aadhaar-photo-resizer) to crop and size identity images according to UIDAI specifications, scale photographs using the [PAN Card Resize](/tools/pan-card-resize) for NSDL formats, crop signatures with [Signature Resize](/tools/signature-resize), or construct standard biometric cards with the [Passport Photo Maker](/tools/passport-photo-maker) and NSDL-compliant [PAN Card Resize](/tools/pan-card-resize). If you are designing graphics or social media content, our advanced [Background Remover](/tools/bg-remover) automatically isolates foreground subjects in seconds. By running neural networks locally on your device, we process image files without uploading them to external cloud servers, guaranteeing absolute privacy for your personal identity documents. To optimize performance and page loading speed, the [Image Compressor](/tools/image-compressor) reduces file sizes by up to 90% while maintaining crisp visual quality. This is achieved by stripping unneeded metadata and applying visually lossless compression algorithms. All canvas operations, colors, and crops are computed locally in your active tab memory. This local-first structure ensures that your private files remain entirely confidential, making ToolWala AI the safest choice for secure image editing. You can resize, convert, compress, and enhance pictures without registering an account or risking any third-party access. By compiling complex graphics engines into WebAssembly (WASM) and processing canvases natively in JS, we bypass traditional database pipelines completely. Traditional editors transmit drafts over open protocols, which exposes you to packet sniffing or data theft. ToolWala AI isolates all execution threads, meaning your photographic records are rendered in active CPU cache and discarded instantly when you close the tab. Whether you are generating custom palettes with our [AI Color Palette Generator](/tools/color-palette-generator), cropping biometric parameters, or compressing marketing brochures, enjoy zero delay, zero costs, and absolute security.",
    whyUse: [
      {
        title: "Client-Side AI Engine",
        desc: "Leverage edge models to remove backgrounds and upscale images instantly without server delays.",
        icon: "⚡"
      },
      {
        title: "Official Spec Compliance",
        desc: "Crop and scale photos to exact dimensions required by UIDAI, NSDL, and visa specifications.",
        icon: "📏"
      },
      {
        title: "Visual Quality Preservation",
        desc: "Advanced canvas algorithms compress file sizes while keeping textures and lines crisp.",
        icon: "🎨"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Choose Utility",
        desc: "Select an image editing tool, such as the Background Remover or Aadhaar Photo Resizer."
      },
      {
        step: "2",
        title: "Import Image",
        desc: "Select your photograph from your local storage. The tool parses it instantly on your device."
      },
      {
        step: "3",
        title: "Customize & Save",
        desc: "Customize size, target KB, or crop parameters and download the processed image."
      }
    ]
  },
  {
    id: "ai-tools",
    slug: "ai-tools",
    title: "AI Tools",
    description: "Premium AI resume constructor, voice reader, and social caption generators.",
    intro: "Leverage advanced localized AI models to build ATS resumes, humanize text, and create engaging social media copy.",
    icon: "🤖",
    seoTitle: "AI Tools - AI Logo Maker, Resume Builder & Text Humanizer | ToolWala AI",
    seoDescription: "Supercharge your career and content creation with local AI logo generators, resume builders, and voice creators.",
    keywords: ["ai tools", "ai logo maker", "resume builder", "ai resume constructor", "ai text humanizer", "ai voice generator"],
    faqs: [
      {
        question: "Is the AI Resume Builder ATS-compliant?",
        answer: "Yes. All templates generated are structured specifically to be easily parsed and scored by Applicant Tracking Systems (ATS)."
      },
      {
        question: "How does the AI Text Humanizer work?",
        answer: "It scans AI-generated text structures to simplify vocabulary and adjust syntax, helping the text read more naturally and sound human-written."
      }
    ],
    longDescription: "Artificial intelligence is transforming how we construct resumes, generate narration audio, and optimize written content. ToolWala AI's AI Tools directory democratizes access to premium model interfaces by executing processes within secure browser environments and optimized client-side endpoints. For job seekers, our advanced [Resume Builder](/tools/resume-builder) provides structured layouts and keyword optimizations to ensure your professional history passes Applicant Tracking Systems (ATS) filters. If you are creating online content or articles and need to improve readability, use the [Text Humanizer](/tools/text-humanizer) to analyze sentence flows, simplify complex vocabulary, and remove repetitive machine patterns. Additionally, visual creators can generate vector logos instantly using our [AI Logo Maker](/tools/ai-logo-maker), while developers and audio producers can leverage the local [Voice Generator](/tools/voice-generator) to turn written text into natural-sounding speech files. There are no expensive subscriptions, account registrations, or hidden fees required to use these premium tools. By focusing on localized processing and direct APIs, your personal data and writing drafts are never stored or used to train third-party AI models. Elevate your workflow with modern artificial intelligence tools that prioritize user privacy and speed. You can easily build CVs, humanize content, make graphics, and generate speech directly from your browser sandbox. Unlike typical AI startups that route your personal logs through their servers, ToolWala acts as an offline-capable mediator. Your resumes, letters, prompts, and audio models compile locally in active RAM memory. By avoiding server-side database logs, you prevent your intellectual property, work history, and creative assets from leaking. Whether you are generating social copy with [AI Caption Generator](/tools/caption-generator), building corporate layouts, or listening to text narration, ToolWala AI guarantees absolute confidentiality and lightning-fast speed.",
    whyUse: [
      {
        title: "ATS Optimization",
        desc: "Resumes are generated using compliant formatting and semantic keywords to pass recruiter screens.",
        icon: "📝"
      },
      {
        title: "Humanized Output",
        desc: "Simplify vocabulary and remove machine patterns to optimize readability and engagement scores.",
        icon: "👤"
      },
      {
        title: "Custom Brand Assets",
        desc: "Generate vector logo assets and high-fidelity narration audio files in seconds.",
        icon: "🎯"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Pick Assistant",
        desc: "Choose the AI Resume Builder, Text Humanizer, or Voice Generator tool."
      },
      {
        step: "2",
        title: "Input Details",
        desc: "Write your details, copy, or upload a resume draft in the console fields."
      },
      {
        step: "3",
        title: "Generate & Export",
        desc: "Click execute to generate the text or audio and export it to your clipboard or device."
      }
    ]
  },
  {
    id: "document-tools",
    slug: "document-tools",
    title: "Document Tools",
    description: "Invoice editors, cover letters, and standard business utilities.",
    intro: "Prepare templates, client invoices, and job applications with standardized document layout formats.",
    icon: "📁",
    seoTitle: "Document Tools - Invoice & Resume Builders | ToolWala AI",
    seoDescription: "Create professional business invoices, custom cover letters, and ATS resumes online in seconds.",
    keywords: ["document tools", "invoice generator", "billing utility", "cover letter creator", "ats resume template"],
    faqs: [
      {
        question: "Can I download invoices as professional PDFs?",
        answer: "Yes. Invoices compile instantly into standard print-ready PDF formats containing custom line items and tax templates."
      }
    ],
    longDescription: "Professional document templates and billing utilities are crucial for freelancers, small business owners, consultants, and content creators. ToolWala AI's Document Tools suite provides high-performance, serverless layout generators designed to compile clean corporate files in seconds. Quickly create client receipts and billing forms using our [Invoice Generator](/tools/invoice-generator), or crop scanned documentation sheets with the [Invoice Cropper](/tools/invoice-cropper) to extract clean receipts. If you are preparing application packages for new job opportunities, use the [Cover Letter Generator](/tools/cover-letter-generator) to write custom, targeted cover letters that match specific job descriptions. All fields you type are kept strictly in your local tab memory, eliminating the risk of data leaks. Once prepared, your documents compile instantly into standard print-ready PDF files containing custom styles, tables, and corporate lines. You can print them directly from your browser or download them locally. By running all document compilation algorithms on the client side, ToolWala AI ensures that sensitive customer details, financial rates, and professional summaries remain confidential and secure on your device. You do not need to sign up for a service, upload any financial information, or buy expensive subscriptions to create corporate collateral. Traditional documentation hubs require you to input bank credentials, customer names, and pricing breakdowns into their cloud databases. This exposes small businesses to compliance failures under GDPR and local privacy laws. Our client-side rendering engine operates inside the secure browser context, allowing you to crop [Invoice Cropper](/tools/invoice-cropper), generate cover letters, and structure ATS layouts with zero server footprints. Create unlimited assets, export print-ready formats, and maintain absolute client security with ToolWala's browser-local document suite.",
    whyUse: [
      {
        title: "Professional Templates",
        desc: "Layout structures comply with modern billing and corporate communication standards.",
        icon: "💼"
      },
      {
        title: "100% Free Business Tools",
        desc: "Generate unlimited billing invoices and cover letters without premium paywalls or subscription traps.",
        icon: "🆓"
      },
      {
        title: "Data Confidentiality",
        desc: "Keep invoice line-item costs, customer names, and bank details completely secure on your machine.",
        icon: "🔒"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Select Form",
        desc: "Open the Invoice Generator, Cover Letter Generator, or crop tool."
      },
      {
        step: "2",
        title: "Fill Variables",
        desc: "Complete the template fields (amounts, items, skills, addresses) in the fields."
      },
      {
        step: "3",
        title: "Download Document",
        desc: "Download print-ready PDFs or copy compiled texts for direct usage."
      }
    ]
  },
  {
    id: "utility-tools",
    slug: "utility-tools",
    title: "Utility Tools",
    description: "Secure data extraction engines, converters, and other helpers.",
    intro: "Process OCR document scans and utility scripts instantly with secure client-side code.",
    icon: "⚙️",
    seoTitle: "Utility Tools - Online OCR & Secure Scanners | ToolWala AI",
    seoDescription: "Extract metadata and scan image files without sending anything to remote servers.",
    keywords: ["ocr to text", "extract text from screenshot", "utility tools"],
    faqs: [
      {
        question: "How does secure local OCR scan my files?",
        answer: "It runs Tesseract.js WASM engine entirely inside your local sandbox, keeping scanned image details protected."
      }
    ],
    longDescription: "Quickly extracting text from documents and generating secure system keys are common daily requirements for office workers and web developers. ToolWala AI's Utility Tools folder contains optimized browser-native helpers that perform calculations locally on your device. Extract editable text from image scans, receipts, or screenshots using our secure [OCR to Text](/tools/ocr-to-text) tool. The OCR reader runs Tesseract.js WebAssembly threads directly inside your browser cache, meaning your scanned files are processed on your device's CPU rather than being sent to external databases. This is vital when digitizing sheets with personal information or financial data. Additionally, you can create cryptographically strong passwords with our [Password Generator](/tools/password-generator) to secure online accounts. Every hash, string, and character is computed locally, so no external system can intercept your keys. Experience the convenience of high-performance utilities that work offline and respect your privacy. By running all scripts on the client, ToolWala AI guarantees zero data exposure, helping you digitize documents and secure your applications with ease. Traditional utility sites profit by showing intrusive ads and collecting your system metadata or clipboard history. ToolWala AI provides a safe, clean sandbox environment. All operations (such as converting image pixels to raw strings or generating secure 64-character hashes) compile on local CPU threads. Once loaded, the utilities remain fully functional even if you disconnect from the internet. This lets you run local OCR scans, print custom QR codes, and generate master passwords in complete isolation. Minimize compliance risks and keep your personal data secure.",
    whyUse: [
      {
        title: "Secure Local OCR",
        desc: "Digitise images and documents with zero server exposure using on-device optical character recognition.",
        icon: "👁️"
      },
      {
        title: "Offline Functionality",
        desc: "Access core features without an active internet connection once the page loads, as no server API is required.",
        icon: "🔌"
      },
      {
        title: "Developer Helpers",
        desc: "Generate high-entropy passwords, parse file structures, and manage layouts securely.",
        icon: "🛠️"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Open Utility",
        desc: "Open the OCR scanner or password tool from the category deck."
      },
      {
        step: "2",
        title: "Select Input",
        desc: "Import a screenshot, select image language, or configure character parameters."
      },
      {
        step: "3",
        title: "Extract & Use",
        desc: "Copy extracted texts or generated hashes directly to your clipboard."
      }
    ]
  },
  {
    id: "resume-career",
    slug: "resume-career",
    title: "Resume & Career",
    description: "ATS Resume constructors, cover letters, and application creators.",
    intro: "Create ATS-compliant layouts and custom cover letters to stand out in hiring pipelines.",
    icon: "💼",
    seoTitle: "Resume & Career - CV Builder & Cover Letter Creator | ToolWala AI",
    seoDescription: "Construct clean, ATS-scorable resumes and write custom job cover letters easily and for free.",
    keywords: ["resume builder", "ats cv layout", "cover letter generator", "career utilities"],
    faqs: [
      {
        question: "Is my personal career details stored?",
        answer: "Never. All fields typed are stored in local sandbox memory, ensuring absolute security and privacy."
      }
    ],
    longDescription: "Standing out in modern recruitment pipelines requires clean, professional layouts that are optimized for resume scanning algorithms. ToolWala AI's Resume & Career folder contains specialized utilities designed to help job applicants build search-optimized portfolios. Our [Resume Builder](/tools/resume-builder) uses structured tables, ATS-friendly fonts, and clear semantic hierarchies to ensure that Applicant Tracking Systems can easily parse and grade your qualifications. To complement your application, the [Cover Letter Generator](/tools/cover-letter-generator) helps you compose tailored introductory letters that highlight relevant skills. Because these tools run 100% locally in your browser session, your contact details, work history, and education records are completely secure. You don't need to register an account or worry about third-party databases collecting your information. Generate and download clean, single-page PDF documents instantly to apply for your next career opportunity with confidence. Make your application process seamless with secure, ATS-optimized layout tools that keep your personal information completely private. Most career platforms require you to upload your entire CV history to their databases, making your contact info, career gaps, and previous salary ranges vulnerable to data brokers. ToolWala AI respects your data sovereignty. All form calculations, sentence structures, and formatting styles compile in your browser memory. This means you can create professional resumes and cover letters in seconds without leaving a digital footprint. Empower your career search with secure, private utilities.",
    whyUse: [
      {
        title: "ATS Score Optimized",
        desc: "Structure text layers and headings specifically for high applicant tracking system readability.",
        icon: "📈"
      },
      {
        title: "Private Local CVs",
        desc: "Keep sensitive personal contacts, credentials, and job histories safe from third-party databases.",
        icon: "🔒"
      },
      {
        title: "Instant Format Customization",
        desc: "Adapt resume designs and draft letters in one click to fit target vacancies.",
        icon: "✨"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Select Template",
        desc: "Open the resume builder or cover letter assistant from the dashboard."
      },
      {
        step: "2",
        title: "Fill Professional Details",
        desc: "Enter contact details, work experiences, skills, and target job parameters."
      },
      {
        step: "3",
        title: "Export print-ready PDF",
        desc: "Download clean, single-page print-ready PDFs and start applying."
      }
    ]
  },
  {
    id: "seo-tools",
    slug: "seo-tools",
    title: "SEO Tools",
    description: "Content optimizer helpers, OCR text parsers, and tag scanners.",
    intro: "Optimize tags and humanize blog copy for search engines and readabilities.",
    icon: "📈",
    seoTitle: "SEO Tools - AI Text Humanizer & Text Scanners | ToolWala AI",
    seoDescription: "Improve search rankings by humanizing AI structures and scanning document texts.",
    keywords: ["seo tools", "ai humanizer", "blog optimization", "extract tags"],
    faqs: [
      {
        question: "Can I rewrite AI copy for SEO optimization?",
        answer: "Yes, the AI Text Humanizer parses sentence flows to increase readability score and avoid generic phrasing patterns."
      }
    ],
    longDescription: "Improving search engine visibility requires a combination of readable copywriting, optimized keywords, and structured content. ToolWala AI's SEO Tools suite delivers localized, browser-based utilities to help content writers and webmasters optimize their blogs. Analyze and improve sentence flows using our [Text Humanizer](/tools/text-humanizer) to simplify complex phrasing, increase readability scores, and ensure text reads naturally. To digitize printed references, books, or notes without manual typing, use our local [OCR to Text](/tools/ocr-to-text) scanner. It extracts text layers instantly using client-side OCR engines. For social media optimization, the [Caption Generator](/tools/caption-generator) creates platform-ready captions complete with relevant hashtags. By running these optimizations locally, your content remains private and is never uploaded to external databases. Build search rankings and drive traffic with private, high-performance SEO utilities. You can modify copy, scan text, and generate tags securely without worrying about model training or content scrapers. Typical optimization sites require you to copy-paste drafts to cloud servers, exposing your unpublished works and research. ToolWala AI isolates all execution threads, meaning your copy is analyzed in active memory and discarded when you close the tab. Whether you are humanizing articles with [Text Humanizer](/tools/text-humanizer), scanning print materials with [OCR to Text](/tools/ocr-to-text), or creating social media captions, enjoy complete speed, zero limits, and absolute privacy.",
    whyUse: [
      {
        title: "Readability Boost",
        desc: "Adjust sentence flow and phrasing patterns to improve article clarity and score higher on readability tests.",
        icon: "✍️"
      },
      {
        title: "Clean Text Extractor",
        desc: "Scan print references and extract clean paragraph text without manual typing.",
        icon: "📄"
      },
      {
        title: "Privacy Guaranteed",
        desc: "Modify copy safely without data leaking to external databases or model training servers.",
        icon: "🔒"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Select Utility",
        desc: "Open the Text Humanizer or OCR scanner from the sidebar."
      },
      {
        step: "2",
        title: "Paste Copy",
        desc: "Paste your article text or drag a document image scan."
      },
      {
        step: "3",
        title: "Process SEO",
        desc: "Convert text or humanize phrasing with a single click."
      }
    ]
  },
  {
    id: "developer-tools",
    slug: "developer-tools",
    title: "Developer Tools",
    description: "QR Code generators, script utilities, and helper tools.",
    intro: "Create vector QR codes and parse screenshots directly on client-side threads.",
    icon: "💻",
    seoTitle: "Developer Tools - QR Code Generator & local OCR | ToolWala AI",
    seoDescription: "Create static vector QR codes and translate images to editable code structures.",
    keywords: ["qr generator", "ocr parser", "developer utilities"],
    faqs: [
      {
        question: "Do generated QR codes have expiration caps?",
        answer: "No. The static vector files generated do not expire and will remain permanently active."
      }
    ],
    longDescription: "Developers require quick, secure utilities that execute without network latency or external dependencies. ToolWala AI's Developer Tools suite features client-side solutions that run in your browser's CPU threads. Generate static vector QR codes using our [QR Code Generator](/tools/qr-code-generator), which includes adjustable error correction levels and customizable styling. If you need to copy code blocks from design mockups or screenshots, use the [OCR to Text](/tools/ocr-to-text) tool to convert images into editable characters locally. The tool utilizes WebAssembly compiled libraries to process images in real-time. By keeping your data client-side, your API keys, configuration strings, and code snippets are never sent to external servers. Streamline your development workflow with lightweight, secure tools designed for modern creators. Build QR codes, convert image text, and parse configs offline and with complete security. Most developer utilities upload your configurations and files to cloud databases, raising compliance risks under GDPR and CCPA. ToolWala AI bypasses all server loops. Generate vector assets, scan image code text locally, and manage setups securely inside the browser sandbox. Enjoy zero latency, zero account requirements, and complete data safety.",
    whyUse: [
      {
        title: "SVG Vector Outputs",
        desc: "Download generated QR codes in clean, high-resolution vector formats.",
        icon: "🎨"
      },
      {
        title: "WASM OCR Scanners",
        desc: "Parse screenshots and mockups to editable code structures directly on client-side threads.",
        icon: "🖥️"
      },
      {
        title: "100% Serverless",
        desc: "Keep project configurations and sensitive hashes completely secure inside the browser sandbox.",
        icon: "🔒"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Open Developer Tool",
        desc: "Open the QR code builder or OCR text extractor."
      },
      {
        step: "2",
        title: "Paste Code/Data",
        desc: "Enter the target URL or load your screenshot mock."
      },
      {
        step: "3",
        title: "Export Raw Assets",
        desc: "Copy generated code, download vector graphics, or save text."
      }
    ]
  },
  {
    id: "social-media-tools",
    slug: "social-media-tools",
    title: "Social Media Tools",
    description: "Platform caption makers, AI voices, and background remover clips.",
    intro: "Create engaging social caption drafts and voice files for reels/shorts creators.",
    icon: "📱",
    seoTitle: "Social Media Tools - AI Voice Reader & Captions | ToolWala AI",
    seoDescription: "Design premium reel/shorts voice narrations and platform-optimized caption lines.",
    keywords: ["social media tools", "shorts voice generator", "instagram caption generator"],
    faqs: [
      {
        question: "Can I use generated AI voices in videos?",
        answer: "Yes, files generated are exported as high-fidelity audio streams suitable for video narration and editing."
      }
    ],
    longDescription: "Creating content for platforms like Instagram, YouTube, and TikTok demands rapid media editing and engaging copywriting. ToolWala AI's Social Media Tools suite provides creators with secure utilities that run directly in the browser. Generate professional narration audio files using our [Voice Generator](/tools/voice-generator), which converts text to speech locally without server latency. To optimize your visual assets, use the [Background Remover](/tools/bg-remover) to create transparent PNG cutouts for thumbnails and posts. You can also draft engaging captions with hooks and hashtags using the [Caption Generator](/tools/caption-generator), or estimate content earnings with our [YouTube Money Calculator](/tools/youtube-money-calculator). All calculations and media rendering are handled on your local device. This ensures your content drafts, photographs, and analytics are kept secure, making it easy to create high-quality assets safely. Boost your online presence with local creator tools that respect your digital rights and keep your files private. Traditional online tools force you to upload assets to external servers, exposing your files to storage logs and network threats. ToolWala AI processes all data in active browser memory. Run local voice generators, remove image backdrops, write captions, and calculate creator margins securely on your device.",
    whyUse: [
      {
        title: "High-Fidelity Audio",
        desc: "Save narration files as high-fidelity MP3 streams optimized for short video clips.",
        icon: "🎙️"
      },
      {
        title: "Transparent BG Cutouts",
        desc: "Generate background-free PNG cutouts for flyers and thumbnails.",
        icon: "🖼️"
      },
      {
        title: "Engaging Caption Drafts",
        desc: "Generate optimized copy drafts complete with hooks and suggested hashtags.",
        icon: "💬"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Choose Creator Tool",
        desc: "Open the Voice Generator or Background Remover from the sidebar dashboard."
      },
      {
        step: "2",
        title: "Import Content",
        desc: "Enter your script text or upload your raw photograph."
      },
      {
        step: "3",
        title: "Export Asset",
        desc: "Download high-resolution image files or clear audio files."
      }
    ]
  },
  {
    id: "calculator-tools",
    slug: "calculator-tools",
    title: "Calculator Tools",
    description: "SIP, EMI, GST, Age, YouTube Money, and AdSense revenue calculators.",
    intro: "Fast, accurate, and secure client-side calculators for all your daily needs.",
    icon: "🧮",
    seoTitle: "Online Calculators - Age, SIP, EMI & More | ToolWala AI",
    seoDescription: "Free online calculators for age, finance, and various other metrics. Fast and fully private client-side processing.",
    keywords: ["calculators", "age calculator", "sip calculator", "emi calculator", "online calculator", "free calculator"],
    faqs: [
      {
        question: "Are these calculators accurate?",
        answer: "Yes, our calculators use precise mathematical functions and run entirely in your browser for instant and accurate results."
      }
    ],
    longDescription: "Financial planning and daily calculations require accurate, responsive, and private interfaces. ToolWala AI's Calculator Tools suite provides client-side calculators to help you manage your finances and metrics. Estimate compound interest and investment returns using the [SIP Calculator](/tools/sip-calculator), or compute monthly loan repayments and amortization schedules with the [EMI Calculator](/tools/emi-calculator). If you are running a business or managing accounts, use the [GST Calculator](/tools/gst-calculator) to quickly add or remove tax percentages. You can also calculate exact age values and date differences using the [Age Calculator](/tools/age-calculator). For online creators, we offer tools like the [YouTube Money Calculator](/tools/youtube-money-calculator) to estimate video earnings. All math operations run locally on your device, ensuring that your financial figures, income inputs, and calculations remain completely private. Manage your budgets, tax obligations, and wealth planning safely without any data transmission to cloud servers. Most online calculators collect your financial calculations and IP addresses for target advertising. ToolWala AI keeps all calculations strictly inside your active browser tab, executing on local JS threads. Run compound interest estimations, evaluate debt parameters, calculate tax values, and determine margins in complete privacy.",
    whyUse: [
      {
        title: "Instant Browser Math",
        desc: "Calculations execute locally on client-side JS threads for real-time responsiveness.",
        icon: "⚡"
      },
      {
        title: "Detailed Financial Grids",
        desc: "Get extensive loan amortization schedules and compound wealth projections instantly.",
        icon: "📊"
      },
      {
        title: "Secure Operations",
        desc: "Compute payroll, invoices, and debt metrics safely without sending values to remote databases.",
        icon: "🔒"
      }
    ],
    howItWorks: [
      {
        step: "1",
        title: "Select Calculator",
        desc: "Open the EMI, SIP, GST, or Age calculator."
      },
      {
        step: "2",
        title: "Adjust Parameters",
        desc: "Enter variables (loan amount, principal rates, interest ranges, or date strings)."
      },
      {
        step: "3",
        title: "Analyze Projections",
        desc: "Inspect compound schedules, tax breakdowns, or age values instantly."
      }
    ]
  }
];

export function getToolsByCategory(categoryId: string, allTools: Tool[]): Tool[] {
  const idToCategoryMap: Record<string, string> = {
    'pdf-tools': 'PDF Tools',
    'image-tools': 'Image Tools',
    'ai-tools': 'AI Tools',
    'document-tools': 'Document Tools',
    'utility-tools': 'Utility Tools',
    'resume-career': 'Resume & Career',
    'seo-tools': 'SEO Tools',
    'developer-tools': 'Developer Tools',
    'social-media-tools': 'Social Media Tools',
    'calculator-tools': 'Calculator Tools',
  };

  const categoryName = idToCategoryMap[categoryId];

  return allTools.filter(t => {
    // 1. Direct match by category
    if (categoryName && t.category === categoryName) {
      return true;
    }
    
    // 2. Fallback cross-mapping to match original behavior
    if (categoryId === 'resume-career' && ['resume-builder', 'cover-letter-generator'].includes(t.id)) {
      return true;
    }
    if (categoryId === 'seo-tools' && ['text-humanizer', 'ocr-to-text', 'caption-generator'].includes(t.id)) {
      return true;
    }
    if (categoryId === 'developer-tools' && ['qr-code-generator', 'ocr-to-text'].includes(t.id)) {
      return true;
    }
    if (categoryId === 'social-media-tools' && ['caption-generator', 'voice-generator', 'bg-remover', 'youtube-money-calculator'].includes(t.id)) {
      return true;
    }
    if (categoryId === 'calculator-tools' && ['youtube-money-calculator'].includes(t.id)) {
      return true;
    }
    
    return false;
  });
}
