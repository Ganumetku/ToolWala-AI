const fs = require('fs');
const path = require('path');

function generateBlogSummaries() {
  const blogsPath = path.join(__dirname, '../src/data/dynamic_blogs.json');
  const summariesPath = path.join(__dirname, '../src/data/blogSummaries.json');

  if (!fs.existsSync(blogsPath)) {
    console.warn('[Blog Summaries Gen] dynamic_blogs.json not found, skipping.');
    return;
  }

  try {
    const rawData = fs.readFileSync(blogsPath, 'utf8');
    const blogs = JSON.parse(rawData);

    // Extract only lightweight metadata fields required by ToolArticle and listings
    // Exclude heavy 'content' (raw markdown) which adds ~240KB to client bundles
    const summaries = blogs.map((blog) => ({
      id: blog.id || blog.slug,
      slug: blog.slug,
      title: blog.title,
      description: blog.description || '',
      excerpt: blog.excerpt || blog.description || '',
      category: blog.category || 'General',
      date: blog.date || '',
      readingTime: blog.readingTime || '5 min read',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      status: blog.status || 'published',
      relatedToolSlugs: Array.isArray(blog.relatedToolSlugs) ? blog.relatedToolSlugs : [],
    }));

    fs.writeFileSync(summariesPath, JSON.stringify(summaries, null, 2), 'utf8');
    console.log(`[Blog Summaries Gen] Successfully generated ${summaries.length} blog summaries (${(fs.statSync(summariesPath).size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error('[Blog Summaries Gen] Failed to generate blog summaries:', err.message);
    process.exit(1);
  }
}

generateBlogSummaries();
