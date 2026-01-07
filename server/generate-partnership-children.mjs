import { drizzle } from 'drizzle-orm/mysql2';
import { partnershipChildren, partnerships, people } from '../drizzle/schema.ts';

async function generatePartnershipChildren() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log('Generating partnership children based on family structure...\n');
  
  const allPartnerships = await db.select().from(partnerships);
  const allPeople = await db.select().from(people);
  
  // Create a map of people by ID for quick lookup
  const peopleById = {};
  allPeople.forEach(p => {
    peopleById[p.id] = p;
  });
  
  // Define parent-child relationships based on the family structure
  // Format: [partnershipId, childId, description]
  const relationships = [
    // Smith Family - Generation 1 to 2
    [1, 5, "James & Mary Smith → Michael Smith"],
    
    // Johnson Family - Generation 1 to 2  
    [2, 6, "Robert & Patricia Johnson → Jennifer Johnson (later Smith)"],
    
    // Smith Family - Generation 2 to 3
    [3, 7, "Michael & Jennifer Smith → Emily Smith"],
    [3, 8, "Michael & Jennifer Smith → David Smith"],
    
    // Additional families based on partnerships
    // Wilson Family
    [8, 13, "Susan & George Wilson → Susan Wilson"],
    [8, 18, "Susan & George Wilson → Brian Wilson"],
    
    // Miller Family
    [9, 21, "Joseph & Betty Miller → Steven Miller"],
    [9, 54, "Joseph & Betty Miller → Frank Miller"],
    
    // Davis Family
    [4, 24, "Sarah & Christopher Davis → Jessica Davis"],
    [10, 31, "Linda & Paul Davis → Sarah Davis"],
    
    // Johnson Family extended
    [5, 28, "William & Elizabeth Johnson → Nancy Brown"],
    [5, 48, "William & Elizabeth Johnson → Rebecca Johnson"],
    [5, 61, "William & Elizabeth Johnson → Donny Johnson"],
    
    // Smith Family extended
    [6, 12, "Arthur & Margaret Smith → Thomas Smith"],
    [6, 45, "Arthur & Margaret Smith → John Smith"],
    [6, 51, "Arthur & Margaret Smith → Harold Smith"],
    
    [7, 16, "Thomas & Karen Smith → Kevin Smith"],
    [7, 17, "Thomas & Karen Smith → Lisa Smith"],
    
    // Brown Family
    [11, 30, "David & Nancy Brown → Mark Brown"],
    [11, 32, "David & Nancy Brown → Amy Cooper"],
    
    // Wilson Family extended
    [12, 19, "Brian & Amanda Wilson → Ryan Wilson"],
    [12, 20, "Brian & Amanda Wilson → Sophia Wilson"],
    
    // Miller Family extended
    [13, 22, "Steven & Laura Miller → Andrew Miller"],
    [13, 23, "Steven & Laura Miller → Megan Miller"],
    [13, 58, "Steven & Laura Miller → Timmy Miller"],
    
    // Davis Family extended
    [14, 25, "Jessica & Daniel Davis → Olivia Davis"],
    [14, 26, "Jessica & Daniel Davis → Ethan Davis"],
    
    // Cooper Family
    [15, 33, "Amy & James Cooper → Emma Cooper"],
    [15, 34, "Amy & James Cooper → Noah Cooper"],
    
    // Johnson Family further extended
    [16, 35, "Rebecca & Matthew Johnson → Ava Johnson"],
    [16, 36, "Rebecca & Matthew Johnson → Liam Johnson"],
    
    // Brown Family extended
    [17, 37, "Mark & Lisa Brown → Isabella Brown"],
    [17, 38, "Mark & Lisa Brown → Mason Brown"],
    
    // Wilson Family further extended
    [18, 39, "Ryan & Samantha Wilson → Charlotte Wilson"],
    [18, 40, "Ryan & Samantha Wilson → Elijah Wilson"],
    
    // Miller Family further extended
    [19, 41, "Andrew & Rachel Miller → Amelia Miller"],
    [19, 42, "Andrew & Rachel Miller → Benjamin Miller"],
    
    // Davis Family further extended
    [20, 43, "Olivia & Jacob Davis → Harper Davis"],
    [20, 44, "Olivia & Jacob Davis → Lucas Davis"],
    
    // Cooper Family extended
    [21, 46, "Emma & Alexander Cooper → Evelyn Cooper"],
    [21, 47, "Emma & Alexander Cooper → Henry Cooper"],
    
    // Johnson Family youngest generation
    [22, 49, "Ava & William Johnson → Abigail Johnson"],
    [22, 50, "Ava & William Johnson → Jack Johnson"],
    
    // Smith Family youngest generation
    [23, 52, "Thomas & Karen Smith → Harold Smith Jr"],
    
    // Evans Family
    [24, 64, "Forrest & Jenny Evans → Forrest Jr Evans"],
    [24, 65, "Forrest & Jenny Evans → Little Jenny Evans"],
    
    // Miller Family - Frank's children
    [25, 55, "Frank & Barbara Miller → Frank Jr Miller"],
    [25, 56, "Frank & Barbara Miller → Dorothy Miller"],
    [25, 57, "Frank & Barbara Miller → George Miller"],
    
    // Johnson Family - Walter's children
    [26, 60, "Walter & Helen Johnson → Walter Jr Johnson"],
    [26, 62, "Walter & Helen Johnson → Margaret Johnson"],
    [26, 63, "Walter & Helen Johnson → Thomas Johnson"],
    
    // Wilson Family - George's children
    [27, 66, "George & Dorothy Wilson → George Jr Wilson"],
    [27, 67, "George & Dorothy Wilson → Betty Wilson"],
    [27, 68, "George & Dorothy Wilson → James Wilson"],
    
    // Davis Family - Paul's children
    [28, 69, "Paul & Margaret Davis → Paul Jr Davis"],
    [28, 70, "Paul & Margaret Davis → Susan Davis"],
    [28, 71, "Paul & Margaret Davis → Robert Davis"],
    
    // Brown Family - David's children
    [29, 72, "David & Nancy Brown → David Jr Brown"],
    [29, 73, "David & Nancy Brown → Mary Brown"],
    [29, 74, "David & Nancy Brown → John Brown"],
    
    // Cooper Family - James's children
    [30, 75, "James & Amy Cooper → James Jr Cooper"],
    [30, 76, "James & Amy Cooper → Sarah Cooper"],
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [partnershipId, childId, description] of relationships) {
    try {
      // Check if partnership and child exist
      const partnership = allPartnerships.find(p => p.id === partnershipId);
      const child = peopleById[childId];
      
      if (!partnership) {
        console.log(`⚠ Skipping: Partnership ${partnershipId} not found - ${description}`);
        errorCount++;
        continue;
      }
      
      if (!child) {
        console.log(`⚠ Skipping: Child ${childId} not found - ${description}`);
        errorCount++;
        continue;
      }
      
      // Insert the relationship
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
  
  console.log(`\n✅ Partnership children generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  process.exit(0);
}

generatePartnershipChildren().catch(error => {
  console.error('Generation failed:', error);
  process.exit(1);
});
