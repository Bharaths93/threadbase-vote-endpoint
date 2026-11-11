import { prisma } from "../src/lib/prisma.js";

async function seed() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.vote.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create at least one user
  const user = await prisma.user.create({
    data: {
      id: 1,
      name: "Alice",
    },
  });
  console.log("Created user:", user);

  // Create at least two posts
  const posts = await prisma.post.createManyAndReturn({
    data: [
      {
        id: 1,
        title: "First Post",
        body: "This is the first post content.",
        score: 0,
      },
      {
        id: 2,
        title: "Second Post",
        body: "This is the second post content.",
        score: 0,
      },
    ],
  });
  console.log("Created posts:", posts);
}

seed()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
