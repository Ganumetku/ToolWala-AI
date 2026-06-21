const fs = require('fs');
const path = require('path');

const blogsDir = path.join(__dirname, 'blogs');
const dynamicBlogsPath = path.resolve(__dirname, '../src/data/dynamic_blogs.json');

const files = [
  'passport-size-photo-maker-online-free.md',
  'photo-resize-to-20kb.md',
  'signature-resize-to-20kb.md',
  'compress-pdf-to-100kb.md',
  'aadhaar-photo-resize-online.md'
];

const existingBlogs = JSON.parse(fs.readFileSync(dynamicBlogsPath, 'utf8'));

// Determine next ID
let maxId = 0;
existingBlogs.forEach(b => {
  const idNum = parseInt(b.id);
  if (!isNaN(idNum) && idNum > maxId) {
    maxId = idNum;
  }
});

const newBlogs = [];

files.forEach((file, index) => {
  const filePath = path.join(blogsDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const rawText = fs.readFileSync(filePath, 'utf8');
  
  // Split by first '---'
  const dividerIndex = rawText.indexOf('---');
  if (dividerIndex === -1) {
    console.error(`Divider not found in ${file}`);
    return;
  }
  
  const metaSection = rawText.substring(0, dividerIndex);
  const restSection = rawText.substring(dividerIndex + 3).trim();
  
  // Parse metaSection
  const seoTitleMatch = metaSection.match(/-\s+\*\*SEO Title\*\*:\s*(.*)/i);
  const metaDescMatch = metaSection.match(/-\s+\*\*Meta Description\*\*:\s*(.*)/i);
  const slugMatch = metaSection.match(/-\s+\*\*URL Slug\*\*:\s*(.*)/i);
  
  const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : '';
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
  const slug = slugMatch ? slugMatch[1].trim() : '';
  
  // Locate content after second '---' divider
  const secondDividerIndex = restSection.indexOf('---');
  let contentSection = restSection;
  if (secondDividerIndex !== -1) {
    contentSection = restSection.substring(secondDividerIndex + 3).trim();
  }
  
  // Parse H1 from content
  const h1Match = contentSection.match(/# H1:\s*(.*)/i);
  const title = h1Match ? h1Match[1].trim() : '';
  
  // Extract content without the H1 line
  let content = contentSection;
  if (h1Match) {
    content = contentSection.replace(/# H1:\s*(.*)/i, '').trim();
  }
  
  // Inject internal links dynamically at the end of the Introduction section
  let linkInjection = '';
  if (slug === 'passport-size-photo-maker-online-free') {
    linkInjection = `\n\nFor quick resizing without scrolling, you can use our dedicated [Passport Size Photo Maker Online Free Landing Page](/landing/passport-size-photo-maker-online-free/) or open the interactive tool [Passport Photo Maker](/tools/passport-photo-maker/).\n\n`;
  } else if (slug === 'photo-resize-to-20kb') {
    linkInjection = `\n\nFor immediate formatting under the 20KB threshold, check out our [Photo Resize to 20KB Landing Page](/landing/photo-resize-to-20kb/) or open the [Exam Photo Resizer](/tools/exam-photo-resizer/).\n\n`;
  } else if (slug === 'signature-resize-to-20kb') {
    linkInjection = `\n\nFor instant cropping of scanned signatures, visit our specialized [Signature Resize to 20KB Landing Page](/landing/signature-resize-to-20kb/) or configure the [Signature Resizer](/tools/signature-resize/).\n\n`;
  } else if (slug === 'compress-pdf-to-100kb') {
    linkInjection = `\n\nTo compress certificate scans and banking documents under 100KB instantly, check our [Compress PDF to 100KB Landing Page](/landing/compress-pdf-to-100kb/) or open the [PDF Compressor](/tools/compress-pdf/).\n\n`;
  } else if (slug === 'aadhaar-photo-resize-online') {
    linkInjection = `\n\nFor official biometric document updates and masking, visit our dedicated [Aadhaar Utilities Hub](/hubs/aadhaar-utilities/) or open the [Aadhaar Photo Resizer](/tools/aadhaar-photo-resizer/).\n\n`;
  }

  if (linkInjection) {
    const introIndex = content.indexOf('## 2.');
    if (introIndex !== -1) {
      content = content.substring(0, introIndex).trim() + linkInjection + content.substring(introIndex);
    } else {
      content = linkInjection + content;
    }
  }

  // Extract Excerpt (first paragraph under H1 / Introduction)
  const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('---'));
  const excerpt = paragraphs[0] ? paragraphs[0].replace(/\*\*/g, '').slice(0, 160).trim() + '...' : '';
  
  // Parse metadata from end
  const categoryMatch = rawText.match(/-\s+\*\*Suggested Category\*\*:\s*(.*)/i);
  const tagsMatch = rawText.match(/-\s+\*\*Suggested Tags\*\*:\s*(.*)/i);
  const category = categoryMatch ? categoryMatch[1].trim() : 'Image Tools';
  const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : ['Image Sizing', 'Free Tools'];
  
  // Related tools
  let relatedToolSlugs = [];
  if (slug.includes('pdf')) {
    relatedToolSlugs = ['compress-pdf', 'gov-form-pdf-compressor'];
  } else if (slug.includes('signature')) {
    relatedToolSlugs = ['signature-resize', 'image-compressor'];
  } else if (slug.includes('passport')) {
    relatedToolSlugs = ['passport-photo-maker', 'bg-remover'];
  } else {
    relatedToolSlugs = ['exam-photo-resizer', 'image-compressor'];
  }
  
  // FAQs parsing
  const faqs = [];
  const faqSectionMatch = rawText.match(/## 7\.\s+Frequently Asked Questions[\s\S]*?(## 8\.|$)/i);
  if (faqSectionMatch) {
    const faqBody = faqSectionMatch[0];
    const qMatches = faqBody.matchAll(/### Q(\d+):\s*(.*)\n([\s\S]*?)(?=(### Q\d+:|## 8\.|\n---|$))/g);
    for (const match of qMatches) {
      faqs.push({
        id: `${slug}-faq-${match[1]}`,
        question: match[2].trim(),
        answer: match[3].trim().replace(/\n+/g, ' '),
        order: parseInt(match[1])
      });
    }
  }
  
  const id = String(maxId + index + 1);
  const now = new Date().toISOString();
  
  const blogObj = {
    id,
    slug,
    title,
    excerpt,
    content,
    thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
    category,
    tags,
    featured: false,
    status: "published",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    author: {
      name: "ToolWala Editorial",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Tech Writer"
    },
    seoMetadata: {
      title: seoTitle,
      description: metaDesc
    },
    readingTime: "6 min read",
    faqs,
    relatedToolSlugs
  };
  
  newBlogs.push(blogObj);
});

// Avoid duplicates in existing blogs by slug
const filteredExisting = existingBlogs.filter(b => !newBlogs.some(nb => nb.slug === b.slug));
const updatedBlogs = [...filteredExisting, ...newBlogs];

fs.writeFileSync(dynamicBlogsPath, JSON.stringify(updatedBlogs, null, 2), 'utf8');
console.log(`Successfully published and updated ${newBlogs.length} articles in dynamic_blogs.json`);
