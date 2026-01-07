import { drizzle } from 'drizzle-orm/mysql2';
import { partnerships } from '../drizzle/schema.ts';
import fs from 'fs';

async function importPartnerships() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log('Reading partnerships file...');
  const data = JSON.parse(fs.readFileSync('./additional-partnerships.json', 'utf8'));
  
  console.log(`Found ${data.length} partnerships to import`);
  
  for (const partnership of data) {
    try {
      // Convert date strings to Date objects
      const partnershipData = {
        id: partnership.id,
        partner1Id: partnership.partner1Id,
        partner2Id: partnership.partner2Id,
        startDate: partnership.startDate ? new Date(partnership.startDate) : null,
        endDate: partnership.endDate ? new Date(partnership.endDate) : null,
        createdAt: new Date(),
      };
      
      await db.insert(partnerships).values(partnershipData).onDuplicateKeyUpdate({
        set: {
          partner1Id: partnershipData.partner1Id,
          partner2Id: partnershipData.partner2Id,
          startDate: partnershipData.startDate,
          endDate: partnershipData.endDate,
        }
      });
      
      console.log(`✓ Imported partnership ${partnership.id}: ${partnership.note || 'No note'}`);
    } catch (error) {
      console.error(`✗ Failed to import partnership ${partnership.id}:`, error.message);
    }
  }
  
  console.log('\n✅ Partnership import complete!');
  process.exit(0);
}

importPartnerships().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});
