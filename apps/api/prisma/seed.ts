import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'Photographer', slug: 'photographer', icon: '📷' },
  { name: 'Caterer', slug: 'caterer', icon: '🍽️' },
  { name: 'Decorator', slug: 'decorator', icon: '🎨' },
  { name: 'Tent Supplier', slug: 'tent-supplier', icon: '⛺' },
  { name: 'Venue', slug: 'venue', icon: '🏛️' },
  { name: 'Band', slug: 'band', icon: '🎵' },
  { name: 'DJ', slug: 'dj', icon: '🎧' },
  { name: 'Makeup Artist', slug: 'makeup-artist', icon: '💄' },
  { name: 'Flower Decorator', slug: 'flower-decorator', icon: '💐' },
  { name: 'Mehndi Artist', slug: 'mehndi-artist', icon: '🖐️' },
]

async function main() {
  try {
    for (const category of categories) {
      await prisma.serviceCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          icon: category.icon,
        },
        create: {
          name: category.name,
          slug: category.slug,
          icon: category.icon,
        },
      })
    }
    console.log('Seed completed successfully')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()