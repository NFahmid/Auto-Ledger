const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TARGET_USER_ID = 6; // Target user 6

const sampleCategories = {
  asset: ["Cash", "Accounts Receivable", "Inventory", "Investments", "Equipment"],
  liability: ["Accounts Payable", "Loans", "Credit Card Debt"],
  capital: ["Owner's Contribution", "Retained Earnings"],
};

async function main() {
  console.log(`Starting seed process for user ID: ${TARGET_USER_ID}...`);

  // 1. Get the specific user to associate entries with
  const user = await prisma.user.findUnique({
    where: { id: TARGET_USER_ID },
  });

  if (!user) {
    console.error(`Error: User with ID ${TARGET_USER_ID} not found.`);
    console.error("Please create the user or change the TARGET_USER_ID in the script.");
    process.exit(1);
  }

  console.log(`Found user: ${user.name} with ID: ${user.id}`);

  // 2. Generate 40 random ledger entries
  const newEntries = [];
  const mainCategories = Object.keys(sampleCategories);

  for (let i = 0; i < 40; i++) {
    const mainCategory = mainCategories[Math.floor(Math.random() * mainCategories.length)];
    const subCategories = sampleCategories[mainCategory];
    const subCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
    
    // The 'type' field seems to be based on the main category in your logic
    const type = mainCategory; 

    const entry = {
      userId: user.id,
      date: new Date(new Date() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in the last year
      amount: parseFloat((Math.random() * 5000 + 10).toFixed(2)),
      type: type,
      mainCategory: mainCategory,
      subCategory: subCategory,
      description: `Random transaction #${i + 1}`,
    };
    newEntries.push(entry);
  }

  console.log(`Generated ${newEntries.length} new entries. Inserting into database...`);

  // 3. Insert the new entries into the database
  await prisma.ledgerEntry.createMany({
    data: newEntries,
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 