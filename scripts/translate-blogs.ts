import { getPublicBlogs } from '../src/lib/blogs-server';
import { getBlogTranslationWithFallback } from '../src/lib/blog-translation-service';

async function run() {
  console.log('Loading all public blogs to pre-translate...');
  const blogs = await getPublicBlogs();
  console.log(`Found ${blogs.length} blog posts. Beginning translation to Hindi...`);

  for (const blog of blogs) {
    try {
      const translated = await getBlogTranslationWithFallback(blog, 'hi');
      console.log(`✅ Translated and cached: ${blog.slug} -> "${translated.title}"`);
    } catch (err) {
      console.error(`❌ Failed to translate ${blog.slug}:`, err);
    }
  }

  console.log('🎉 Pre-translation complete!');
}

run().catch(console.error);
