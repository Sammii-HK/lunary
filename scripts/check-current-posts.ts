#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentPosts() {
  const posts = await prisma.socialPost.findMany({
    where: { platform: 'instagram' },
    select: {
      id: true,
      postType: true,
      image_url: true,
      createdAt: true,
    },
    orderBy: { id: 'desc' },
    take: 5,
  });

  console.log(
    `\n📊 Current Instagram posts in database: ${posts.length} total\n`,
  );

  if (posts.length === 0) {
    console.log('✅ No Instagram posts found - database is clean!');
  } else {
    console.log('Most recent 5 posts:\n');
    posts.forEach((post) => {
      const imageUrl = post.image_url || '';
      const hasV4 = imageUrl.includes('v=4');
      const hasTimestamp = imageUrl.includes('&t=');
      const createdRecently =
        Date.now() - new Date(post.createdAt!).getTime() < 60000;

      console.log(`ID: ${post.id} | ${post.postType}`);
      console.log(`  Created: ${new Date(post.createdAt!).toLocaleString()}`);
      console.log(
        `  Recent: ${createdRecently ? '✓ (< 1 min ago)' : '✗ (old)'}`,
      );
      console.log(`  Has v=4: ${hasV4 ? '✓' : '✗'}`);
      console.log(`  Has timestamp: ${hasTimestamp ? '✓' : '✗'}`);
      console.log(`  URL: ${imageUrl.substring(0, 100)}...\n`);
    });
  }

  await prisma.$disconnect();
}

checkCurrentPosts().catch(async (error) => {
  console.error('❌ Error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
