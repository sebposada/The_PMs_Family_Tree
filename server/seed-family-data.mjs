import { drizzle } from "drizzle-orm/mysql2";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { media, people, partnerships, partnershipChildren, comments } from "../drizzle/schema.ts";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const db = drizzle(process.env.DATABASE_URL);

// Simple file upload - just use local paths for now since S3 setup is complex
function getPhotoUrl(fileName) {
  // For now, return placeholder URLs - in production these would be S3 URLs
  return `/seed-photos/${fileName}`;
}

async function seedFamilyData() {
  console.log("Starting family data seeding...");

  try {
    // Define photo metadata
    console.log("\n1. Creating media records...");
    const photoData = [
      { fileName: "grandfather-james.jpg", caption: "Portrait of James Smith" },
      { fileName: "grandmother-mary.jpg", caption: "Portrait of Mary Smith" },
      { fileName: "grandfather-robert.jpg", caption: "Portrait of Robert Johnson" },
      { fileName: "grandmother-patricia.jpg", caption: "Portrait of Patricia Johnson" },
      { fileName: "father-michael.jpg", caption: "Portrait of Michael Smith" },
      { fileName: "mother-jennifer.jpg", caption: "Portrait of Jennifer Smith" },
      { fileName: "daughter-emily.jpg", caption: "Portrait of Emily Smith" },
      { fileName: "son-david.jpg", caption: "Portrait of David Smith" },
    ];

    const mediaRecords = [];
    for (const photo of photoData) {
      const result = await db.insert(media).values({
        uploaderUserId: 1,
        fileKey: `family-photos/${photo.fileName}`,
        url: getPhotoUrl(photo.fileName),
        category: "photo",
        caption: photo.caption,
      });
      mediaRecords.push({
        name: photo.fileName.replace(/\.(jpg|png)$/, ""),
        id: Number(result[0].insertId),
      });
    }

    const mediaMap = {
      jamesSmith: mediaRecords[0].id,
      marySmith: mediaRecords[1].id,
      robertJohnson: mediaRecords[2].id,
      patriciaJohnson: mediaRecords[3].id,
      michaelSmith: mediaRecords[4].id,
      jenniferSmith: mediaRecords[5].id,
      emilySmith: mediaRecords[6].id,
      davidSmith: mediaRecords[7].id,
    };

    console.log("Media records created!");

    // Insert people
    console.log("\n2. Creating people records...");
    
    // Grandparents (paternal - Smith side)
    const jamesResult = await db.insert(people).values({
      firstName: "James",
      lastName: "Smith",
      birthDate: "1950-03-15",
      birthPlace: "Boston, MA",
      bioMarkdown: "James Smith is the patriarch of the Smith family. A retired engineer, he spent 40 years designing bridges and infrastructure. Known for his warm smile and endless stories, James loves woodworking and spending time with his grandchildren.",
      primaryMediaId: mediaMap.jamesSmith,
    });
    const jamesSmithId = Number(jamesResult[0].insertId);

    const maryResult = await db.insert(people).values({
      firstName: "Mary",
      lastName: "Smith",
      birthDate: "1952-07-22",
      birthPlace: "Portland, ME",
      bioMarkdown: "Mary Smith is a retired school teacher who dedicated 35 years to elementary education. She has a passion for gardening and baking, and her apple pie is legendary in the family. Mary is known for her kindness and the warm welcome she extends to everyone.",
      primaryMediaId: mediaMap.marySmith,
    });
    const marySmithId = Number(maryResult[0].insertId);

    // Grandparents (maternal - Johnson side)
    const robertResult = await db.insert(people).values({
      firstName: "Robert",
      lastName: "Johnson",
      birthDate: "1948-11-08",
      birthPlace: "Chicago, IL",
      bioMarkdown: "Robert Johnson is a retired accountant who managed finances for several major corporations. He is an avid reader and history buff, with a particular interest in World War II. Robert enjoys playing chess and teaching his grandchildren about historical events.",
      primaryMediaId: mediaMap.robertJohnson,
    });
    const robertJohnsonId = Number(robertResult[0].insertId);

    const patriciaResult = await db.insert(people).values({
      firstName: "Patricia",
      lastName: "Johnson",
      birthDate: "1951-05-30",
      birthPlace: "Denver, CO",
      bioMarkdown: "Patricia Johnson worked as a nurse for over 30 years, caring for patients with compassion and dedication. She loves knitting, quilting, and has created beautiful handmade blankets for each of her grandchildren. Patricia is the family storyteller, keeping traditions alive.",
      primaryMediaId: mediaMap.patriciaJohnson,
    });
    const patriciaJohnsonId = Number(patriciaResult[0].insertId);

    // Parents
    const michaelResult = await db.insert(people).values({
      firstName: "Michael",
      lastName: "Smith",
      birthDate: "1978-09-12",
      birthPlace: "Boston, MA",
      bioMarkdown: "Michael Smith is a software engineer working in the tech industry. He inherited his father's love for problem-solving and building things. Michael enjoys hiking, photography, and coaching his son's soccer team. He is dedicated to his family and values quality time together.",
      primaryMediaId: mediaMap.michaelSmith,
    });
    const michaelSmithId = Number(michaelResult[0].insertId);

    const jenniferResult = await db.insert(people).values({
      firstName: "Jennifer",
      lastName: "Smith",
      birthDate: "1980-04-25",
      birthPlace: "Denver, CO",
      bioMarkdown: "Jennifer Smith (née Johnson) is a marketing manager who balances her career with being an involved parent. She has a creative spirit, enjoys painting, and volunteers at the local community center. Jennifer is known for organizing memorable family gatherings and keeping everyone connected.",
      primaryMediaId: mediaMap.jenniferSmith,
    });
    const jenniferSmithId = Number(jenniferResult[0].insertId);

    // Children
    const emilyResult = await db.insert(people).values({
      firstName: "Emily",
      lastName: "Smith",
      birthDate: "2008-06-18",
      birthPlace: "Seattle, WA",
      bioMarkdown: "Emily Smith is a bright and creative teenager who loves art and music. She plays the violin in her school orchestra and enjoys painting in her free time. Emily is passionate about environmental causes and volunteers with local conservation groups.",
      primaryMediaId: mediaMap.emilySmith,
    });
    const emilySmithId = Number(emilyResult[0].insertId);

    const davidResult = await db.insert(people).values({
      firstName: "David",
      lastName: "Smith",
      birthDate: "2010-11-03",
      birthPlace: "Seattle, WA",
      bioMarkdown: "David Smith is an energetic and curious young teenager who loves sports and science. He plays soccer and is fascinated by astronomy, often spending evenings stargazing with his telescope. David is known for his sense of humor and his love of adventure.",
      primaryMediaId: mediaMap.davidSmith,
    });
    const davidSmithId = Number(davidResult[0].insertId);

    console.log("People records created!");

    // Create partnerships
    console.log("\n3. Creating partnerships...");
    
    // James & Mary Smith partnership
    const jamesMaryResult = await db.insert(partnerships).values({
      partner1Id: jamesSmithId,
      partner2Id: marySmithId,
      startDate: "1972-06-10",
    });
    const jamesMaryPartnershipId = Number(jamesMaryResult[0].insertId);

    // Robert & Patricia Johnson partnership
    const robertPatriciaResult = await db.insert(partnerships).values({
      partner1Id: robertJohnsonId,
      partner2Id: patriciaJohnsonId,
      startDate: "1970-08-15",
    });
    const robertPatriciaPartnershipId = Number(robertPatriciaResult[0].insertId);

    // Michael & Jennifer Smith partnership
    const michaelJenniferResult = await db.insert(partnerships).values({
      partner1Id: michaelSmithId,
      partner2Id: jenniferSmithId,
      startDate: "2005-05-20",
    });
    const michaelJenniferPartnershipId = Number(michaelJenniferResult[0].insertId);

    console.log("Partnerships created!");

    // Link children to partnerships
    console.log("\n4. Linking children to partnerships...");
    
    // Michael is child of James & Mary
    await db.insert(partnershipChildren).values({
      partnershipId: jamesMaryPartnershipId,
      childId: michaelSmithId,
    });

    // Jennifer is child of Robert & Patricia
    await db.insert(partnershipChildren).values({
      partnershipId: robertPatriciaPartnershipId,
      childId: jenniferSmithId,
    });

    // Emily and David are children of Michael & Jennifer
    await db.insert(partnershipChildren).values({
      partnershipId: michaelJenniferPartnershipId,
      childId: emilySmithId,
    });

    await db.insert(partnershipChildren).values({
      partnershipId: michaelJenniferPartnershipId,
      childId: davidSmithId,
    });

    console.log("Children linked to partnerships!");

    // Add some sample comments
    console.log("\n5. Adding sample comments...");
    
    await db.insert(comments).values({
      personId: jamesSmithId,
      authorUserId: 1,
      body: "Grandpa James always had the best stories about his engineering projects!",
    });

    await db.insert(comments).values({
      personId: marySmithId,
      authorUserId: 1,
      body: "I still remember Grandma Mary's apple pie from Thanksgiving. Nobody makes it like she does!",
    });

    await db.insert(comments).values({
      personId: emilySmithId,
      authorUserId: 1,
      body: "Emily is so talented! Can't wait to hear her perform at the next recital.",
    });

    console.log("Sample comments added!");

    console.log("\n✅ Family data seeding completed successfully!");
    console.log("\nSummary:");
    console.log("- 8 people created (4 grandparents, 2 parents, 2 children)");
    console.log("- 3 partnerships established");
    console.log("- 4 parent-child relationships linked");
    console.log("- 8 photos added");
    console.log("- 3 sample comments added");
    
  } catch (error) {
    console.error("\n❌ Error seeding family data:", error);
    throw error;
  }
}

// Run the seed script
seedFamilyData()
  .then(() => {
    console.log("\nSeeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  });
