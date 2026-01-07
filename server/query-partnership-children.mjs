import { drizzle } from 'drizzle-orm/mysql2';
import { partnershipChildren, partnerships, people } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

async function queryPartnershipChildren() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log('Querying partnership children...\n');
  
  const allPartnershipChildren = await db.select().from(partnershipChildren);
  const allPartnerships = await db.select().from(partnerships);
  const allPeople = await db.select().from(people);
  
  console.log(`Total partnerships: ${allPartnerships.length}`);
  console.log(`Total people: ${allPeople.length}`);
  console.log(`Total partnership children records: ${allPartnershipChildren.length}\n`);
  
  // Group children by partnership
  const childrenByPartnership = {};
  allPartnershipChildren.forEach(pc => {
    if (!childrenByPartnership[pc.partnershipId]) {
      childrenByPartnership[pc.partnershipId] = [];
    }
    childrenByPartnership[pc.partnershipId].push(pc.childId);
  });
  
  console.log('Partnership Children Summary:');
  console.log('=' .repeat(80));
  
  for (const partnership of allPartnerships.slice(0, 10)) {
    const partner1 = allPeople.find(p => p.id === partnership.partner1Id);
    const partner2 = allPeople.find(p => p.id === partnership.partner2Id);
    const children = childrenByPartnership[partnership.id] || [];
    
    console.log(`Partnership ${partnership.id}: ${partner1?.firstName} ${partner1?.lastName} & ${partner2?.firstName} ${partner2?.lastName}`);
    console.log(`  Children (${children.length}): ${children.join(', ')}`);
    
    if (children.length > 0) {
      children.forEach(childId => {
        const child = allPeople.find(p => p.id === childId);
        console.log(`    - ${child?.firstName} ${child?.lastName} (ID: ${childId})`);
      });
    }
    console.log('');
  }
  
  console.log(`\n... showing first 10 partnerships. Total: ${allPartnerships.length}`);
  
  // Find partnerships with no children
  const partnershipsWithoutChildren = allPartnerships.filter(p => !childrenByPartnership[p.id]);
  console.log(`\nPartnerships without children: ${partnershipsWithoutChildren.length}`);
  
  process.exit(0);
}

queryPartnershipChildren().catch(error => {
  console.error('Query failed:', error);
  process.exit(1);
});
