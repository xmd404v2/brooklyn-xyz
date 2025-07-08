import "dotenv/config";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function syncJsonToSupabase(filePath: string) {
  // Read JSON file
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Loop through and upload each entry
  for (const story of jsonData) {
    const { error } = await supabase
      .from('story_queue')
      .insert({
        day: parseInt(story.day),
        title: story.title,
        prompt: story.prompt,
        status: 'pending'
      });
    
    if (error) {
      console.error(`Error inserting day ${story.day}:`, error);
    } else {
      console.log(`✓ Inserted day ${story.day}: ${story.title}`);
    }
  }
}

// Usage
syncJsonToSupabase('./story.json');