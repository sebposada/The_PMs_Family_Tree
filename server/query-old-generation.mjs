import { drizzle } from 'drizzle-orm/mysql2';
import { people, partnerships } from '../drizzle/schema.ts';

async function queryOldGeneration() {
  const db = drizzle(process.env.DATABASE_URL);
  
  const allPeople = await db.select().from(people);
  const allPartnerships = await db.select().from(partnerships);
  
  // Find people born before 1900
  const oldGeneration = allPeople
    .filter(p => p.birthDate && new Date(p.birthDate).getFullYear() < 1900)
    .sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
  
  console.log('People born before 1900 (earliest generation):');
  console.log('='.repeat(80));
  oldGeneration.forEach(p => {
    const birthYear = new Date(p.birthDate).getFullYear();
    console.log(`ID: ${p.id}, ${p.firstName} ${p.lastName}, Born: ${birthYear}`);
  });
  
  console.log(`\nTotal: ${oldGeneration.length} people`);
  
  // Find people born 1900-1930 (next generation)
  const nextGen = allPeople
    .filter(p => p.birthDate && new Date(p.birthDate).getFullYear() >= 1900 && new Date(p.birthDate).getFullYear() < 1930)
    .sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
  
  console.log('\n\nPeople born 1900-1930 (second generation):');
  console.log('='.repeat(80));
  nextGen.forEach(p => {
    const birthYear = new Date(p.birthDate).getFullYear();
    console.log(`ID: ${p.id}, ${p.firstName} ${p.lastName}, Born: ${birthYear}`);
  });
  
  console.log(`\nTotal: ${nextGen.length} people`);
  
  // Find partnerships involving old generation
  console.log('\n\nPartnerships involving people born before 1900:');
  console.log('='.repeat(80));
  
  const oldIds = new Set(oldGeneration.map(p => p.id));
  const relevantPartnerships = allPartnerships.filter(p => 
    oldIds.has(p.partner1Id) || oldIds.has(p.partner2Id)
  );
  
  relevantPartnerships.forEach(p => {
    const partner1 = allPeople.find(person => person.id === p.partner1Id);
    const partner2 = allPeople.find(person => person.id === p.partner2Id);
    console.log(`Partnership ${p.id}: ${partner1?.firstName} ${partner1?.lastName} & ${partner2?.firstName} ${partner2?.lastName}`);
  });
  
  console.log(`\nTotal: ${relevantPartnerships.length} partnerships`);
  
  process.exit(0);
}

queryOldGeneration().catch(error => {
  console.error('Query failed:', error);
  process.exit(1);
});
