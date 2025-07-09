import "dotenv/config";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function syncHintsToSupabase(filePath: string) {
  // Read JSON file
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // Loop through and update each entry with hints
  for (const story of jsonData) {
    const { error } = await supabase
      .from('story_queue')
      .update({
        hints: story.hints
      })
      .eq('day', parseInt(story.day));
    
    if (error) {
      console.error(`Error updating hints for day ${story.day}:`, error);
    } else {
      console.log(`✓ Updated hints for day ${story.day}: ${story.title}`);
    }
  }
}

// Usage
syncHintsToSupabase('./story.json');