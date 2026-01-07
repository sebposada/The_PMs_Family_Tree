import { drizzle } from 'drizzle-orm/mysql2';
import { partnershipChildren } from '../drizzle/schema.ts';

async function addOldGenerationChildren() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log('Adding partnership children for earliest generations...\n');
  
  // Define parent-child relationships for earliest generations
  // Format: [partnershipId, childId, description]
  const relationships = [
    // Generation 1 (1889-1899) → Generation 2 (1900-1930)
    
    // George & Martha Smith (Partnership 24) → Arthur Smith
    [24, 10, "George & Martha Smith (1889) → Arthur Smith (1919)"],
    [24, 51, "George & Martha Smith (1889) → Harold Smith (1923)"],
    
    // Harry & Molly O'Connor (Partnership 25) - need to find their children
    // Likely some of the 1900-1930 generation with similar surnames
    
    // Jack & Jill Miller (Partnership 26) → Joseph Miller, Frank Miller
    [26, 19, "Jack & Jill Miller (1899/1904) → Joseph Miller (1925)"],
    [26, 54, "Jack & Jill Miller (1899/1904) → Frank Miller (1929)"],
    
    // Ben & Beth Johnson (Partnership 27) → William Johnson, Walter Johnson
    [27, 25, "Ben & Beth Johnson (1894/1899) → William Johnson (1920)"],
    [27, 59, "Ben & Beth Johnson (1894/1899) → Walter Johnson (1926)"],
    
    // Carl & Clara Evans (Partnership 28) → Samuel Evans, Dorothy Evans, Larry Evans, Sally Evans
    [28, 38, "Carl & Clara Evans (1889/1894) → Samuel Evans (1919)"],
    [28, 39, "Carl & Clara Evans (1889/1894) → Dorothy Evans (1921)"],
    [28, 62, "Carl & Clara Evans (1889/1894) → Larry Evans (1924)"],
    [28, 63, "Carl & Clara Evans (1889/1894) → Sally Evans (1929)"],
    
    // Generation 2 (1900-1930) → Generation 3 (1948-1952)
    
    // Arthur & Margaret Smith (Partnership 6) - already done in previous script
    // William & Elizabeth Johnson (Partnership 5) - already done
    // Joseph & Betty Miller (Partnership 9) - already done
    // Frank & Barbara Miller (Partnership 25) - already done
    // Walter & Helen Johnson (Partnership 26) - already done
    
    // Samuel & Dorothy Evans → Forrest Evans, Jenny Evans
    [31, 40, "Samuel & Dorothy Evans (1919/1921) → Forrest Evans"],
    [31, 41, "Samuel & Dorothy Evans (1919/1921) → Jenny Evans"],
    
    // Larry & Sally Evans - if they have children
    [32, 64, "Larry & Sally Evans (1924/1929) → Forrest Jr Evans"],
    [32, 65, "Larry & Sally Evans (1924/1929) → Little Jenny Evans"],
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [partnershipId, childId, description] of relationships) {
    try {
      await db.insert(partnershipChildren).values({
        partnershipId,
        childId,
      }).onDuplicateKeyUpdate({
        set: { partnershipId, childId }
      });
      
      successCount++;
      console.log(`✓ ${description}`);
    } catch (error) {
      console.error(`✗ Failed: ${description} - ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Old generation children addition complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  process.exit(0);
}

addOldGenerationChildren().catch(error => {
  console.error('Addition failed:', error);
  process.exit(1);
});
