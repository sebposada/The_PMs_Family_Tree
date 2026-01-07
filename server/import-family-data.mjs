import { drizzle } from "drizzle-orm/mysql2";
import { readFileSync } from "fs";
import { people, partnerships, partnershipChildren } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function importFamilyData() {
  console.log("Reading family data JSON...");
  const jsonData = JSON.parse(readFileSync("./family-data.json", "utf-8"));

  console.log(`Found ${jsonData.people.length} people and ${jsonData.partnerships.length} partnerships`);

  // Step 1: Clear existing data (in reverse order of dependencies)
  console.log("\nClearing existing data...");
  await db.delete(partnershipChildren);
  console.log("✓ Cleared partnership_children");
  
  await db.delete(partnerships);
  console.log("✓ Cleared partnerships");
  
  await db.delete(people);
  console.log("✓ Cleared people");

  // Step 2: Import people
  console.log("\nImporting people...");
  for (const person of jsonData.people) {
    const personData = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      birthDate: person.birthDate ? new Date(person.birthDate).toISOString().split('T')[0] : null,
      deathDate: person.deathDate ? new Date(person.deathDate).toISOString().split('T')[0] : null,
      birthPlace: person.birthPlace || null,
      deathPlace: person.deathPlace || null,
      bioMarkdown: person.bioMarkdown || null,
      primaryMediaId: person.primaryMediaId || null,
    };

    await db.insert(people).values(personData);
    console.log(`✓ Imported ${person.firstName} ${person.lastName} (ID: ${person.id})`);
  }

  // Step 3: Import partnerships
  console.log("\nImporting partnerships...");
  for (const partnership of jsonData.partnerships) {
    const partnershipData = {
      id: partnership.id,
      partner1Id: partnership.partner1Id,
      partner2Id: partnership.partner2Id,
      startDate: partnership.startDate ? new Date(partnership.startDate).toISOString().split('T')[0] : null,
      endDate: partnership.endDate ? new Date(partnership.endDate).toISOString().split('T')[0] : null,
    };

    await db.insert(partnerships).values(partnershipData);
    
    // Get partner names for logging
    const partner1 = jsonData.people.find(p => p.id === partnership.partner1Id);
    const partner2 = jsonData.people.find(p => p.id === partnership.partner2Id);
    console.log(`✓ Imported partnership: ${partner1?.firstName} ${partner1?.lastName} & ${partner2?.firstName} ${partner2?.lastName} (ID: ${partnership.id})`);
  }

  // Step 4: Import partnership children
  console.log("\nImporting partnership children...");
  for (const partnership of jsonData.partnerships) {
    if (partnership.children && partnership.children.length > 0) {
      for (const childId of partnership.children) {
        await db.insert(partnershipChildren).values({
          partnershipId: partnership.id,
          childId: childId,
        });
        
        const child = jsonData.people.find(p => p.id === childId);
        console.log(`✓ Added child ${child?.firstName} ${child?.lastName} to partnership ${partnership.id}`);
      }
    }
  }

  console.log("\n✅ Import complete!");
  console.log(`Imported ${jsonData.people.length} people, ${jsonData.partnerships.length} partnerships`);
  
  process.exit(0);
}

importFamilyData().catch((error) => {
  console.error("❌ Import failed:", error);
  process.exit(1);
});
