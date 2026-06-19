import fs from 'fs';
import path from 'path';
import { categoriesData } from '../src/data/categories';

const enPath = path.join(process.cwd(), 'messages/en.json');
const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (!enMessages.categories) {
  enMessages.categories = {};
}

categoriesData.forEach(cat => {
  if (!enMessages.categories[cat.id]) {
    enMessages.categories[cat.id] = {};
  }
  
  // Update fields
  enMessages.categories[cat.id].longDescription = cat.longDescription;
  enMessages.categories[cat.id].whyUse = cat.whyUse;
  enMessages.categories[cat.id].howItWorks = cat.howItWorks;
});

fs.writeFileSync(enPath, JSON.stringify(enMessages, null, 2), 'utf8');
console.log('Successfully merged categories metadata into messages/en.json!');
