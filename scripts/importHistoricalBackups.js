import fs from 'fs';
import path from 'path';
import { cleanData } from '../src/parser/cleanData.js';
import { validateData } from '../src/parser/validateData.js';
import { transformData } from '../src/parser/transformData.js';
import { insertData } from '../src/database/insertData.js';
import { info, error } from '../src/utils/logger.js';

const BACKUP_DIR = path.resolve(process.cwd(), 'data/backups/daily-json');

const importHistoricalBackups = async () => {
  try {
    // Get all JSON files
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .sort(); // Sort by date
    
    console.log(`📦 Found ${files.length} backup files to import\n`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    let errors = 0;
    
    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const tradeDate = file.replace('.json', '');
      
      try {
        // Read JSON file
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Process through pipeline
        const cleaned = cleanData(rawData);
        const validated = validateData(cleaned);
        const transformed = transformData(validated);
        
        // Insert into database
        const result = await insertData(transformed);
        
        totalInserted += result.inserted;
        totalSkipped += result.skipped;
        
        if (result.inserted > 0) {
          console.log(`✅ ${tradeDate}: inserted ${result.inserted}, skipped ${result.skipped}`);
        } else {
          console.log(`⏭️  ${tradeDate}: skipped ${result.skipped} (already exists)`);
        }
        
      } catch (err) {
        errors++;
        console.error(`❌ ${tradeDate}: ${err.message}`);
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total files processed: ${files.length}`);
    console.log(`   Records inserted: ${totalInserted}`);
    console.log(`   Records skipped: ${totalSkipped}`);
    console.log(`   Errors: ${errors}`);
    
    info(`Historical import completed: ${totalInserted} inserted, ${totalSkipped} skipped, ${errors} errors`);
    
  } catch (err) {
    error(`Historical import failed: ${err.message}`);
    throw err;
  }
};

// Run import
importHistoricalBackups()
  .then(() => {
    console.log('\n✅ Historical data import complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Import failed:', err.message);
    process.exit(1);
  });
