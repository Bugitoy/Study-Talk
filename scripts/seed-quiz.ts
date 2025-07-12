import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample quiz data...');
  // remove existing rooms so script can be rerun
  await prisma.quizAnswer.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quizRoom.deleteMany();

  const longLorem = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae voluptatem quas iusto, quidem aperiam sequi harum debitis tenetur corporis eos tempore libero! Eligendi? Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae voluptatem quas iusto, quidem aperiam sequi harum debitis tenetur corporis eos tempore libero! Eligendi? Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque culpa sit ex labore aliquid delectus molestiae voluptatem quas iusto, quidem aperiam sequi harum debitis tenetur corporis eos tempore libero! Eligendi?`;

  await prisma.quizRoom.create({
    data: {
      id: 'sample-room',
      name: 'Sample Quiz',
      timePerQuestion: 10,
      questions: {
        create: [
          {
            question: longLorem,
            optionA: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor',
            optionB: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor',
            optionC: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor',
            optionD: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor',
            correct: 'A',
          },
          {
            question: 'Sample Question 2',
            optionA: 'A1',
            optionB: 'B1',
            optionC: 'C1',
            optionD: 'D1',
            correct: 'B',
          },
        ],
      },
    },
  });

  console.log('Quiz data seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
