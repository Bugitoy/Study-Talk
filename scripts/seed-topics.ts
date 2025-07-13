import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
  {
    title: "American History",
    description:
      "This quiz contains questions about the Revolutionary War, the Civil War, and the Great Depression.",
    backgroundImage: "/Images/meetups/topics/american-history.png",
  },
  {
    title: "Minecraft",
    description:
      "This quiz will test your knowledge of Minecraft including the different mobs, blocks, and items.",
    backgroundImage: "/Images/meetups/topics/minecraft.png",
  },
  {
    title: "Rare Animals",
    description:
      "This quiz contains questions to test your knowledge on animals such as the platypus and the quokka.",
    backgroundImage: "/Images/meetups/topics/animals.png",
  },
  {
    title: "Calculus",
    description:
      "This quiz contains questions about the different types of integrals and the different types of derivatives.",
    backgroundImage: "/Images/meetups/topics/calculus.png",
  },
  {
    title: "K-12",
    description:
      "This quiz contains questions about the different subjects and the different levels of education.",
    backgroundImage: "",
  },
  {
    title: "MCAT",
    description:
      "This quiz contains questions about the different sections of the MCAT and the different types of questions.",
    backgroundImage: "/Images/meetups/topics/mcat.png",
  },
  {
    title: "Cars",
    description:
      "This quiz contains questions about the different types of cars and the different parts of a car.",
    backgroundImage: "",
  },
  {
    title: "Countries",
    description:
      "This quiz contains questions about the different countries and the different capitals.",
    backgroundImage: "",
  },
];

async function main() {
  await prisma.topic.deleteMany();
  await prisma.topic.createMany({ data });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });