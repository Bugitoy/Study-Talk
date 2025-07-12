import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const data = [
  {
    topic: 'American History',
    question: 'Who was the first President of the United States?',
    optionA: 'George Washington',
    optionB: 'Thomas Jefferson',
    optionC: 'Abraham Lincoln',
    optionD: 'John Adams',
    correct: 'George Washington',
  },
  {
    topic: 'American History',
    question: 'What year did the American Civil War begin?',
    optionA: '1776',
    optionB: '1812',
    optionC: '1861',
    optionD: '1914',
    correct: '1861',
  },
  {
    topic: 'American History',
    question: 'The Declaration of Independence was signed in which city?',
    optionA: 'Boston',
    optionB: 'Philadelphia',
    optionC: 'New York',
    optionD: 'Washington D.C.',
    correct: 'Philadelphia',
  },
  {
    topic: 'Minecraft',
    question: 'Which material is required to craft a Crafting Table?',
    optionA: 'Cobblestone',
    optionB: 'Iron Ingot',
    optionC: 'Wood Planks',
    optionD: 'Sticks',
    correct: 'Wood Planks',
  },
  {
    topic: 'Minecraft',
    question: 'What hostile mob explodes when it gets close to the player?',
    optionA: 'Zombie',
    optionB: 'Skeleton',
    optionC: 'Creeper',
    optionD: 'Spider',
    correct: 'Creeper',
  },
  {
    topic: 'Minecraft',
    question: 'How do you enter the Nether dimension?',
    optionA: 'Use an End Portal',
    optionB: 'Build a Nether Portal',
    optionC: 'Drink a Potion',
    optionD: 'Use a Command Block',
    correct: 'Build a Nether Portal',
  },
]

async function main() {
  await prisma.topicQuestion.deleteMany()
  await prisma.topicQuestion.createMany({ data })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })