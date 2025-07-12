import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const data = [
    {
      "topic": "American History",
      "question": "Who was the first President of the United States?",
      "optionA": "George Washington",
      "optionB": "Thomas Jefferson",
      "optionC": "Abraham Lincoln",
      "optionD": "John Adams",
      "correct": "George Washington"
    },
    {
      "topic": "American History",
      "question": "What year did the American Civil War begin?",
      "optionA": "1776",
      "optionB": "1812",
      "optionC": "1861",
      "optionD": "1914",
      "correct": "1861"
    },
    {
      "topic": "American History",
      "question": "The Declaration of Independence was signed in which city?",
      "optionA": "Boston",
      "optionB": "Philadelphia",
      "optionC": "New York",
      "optionD": "Washington D.C.",
      "correct": "Philadelphia"
    },
    {
        "topic": "American History",
        "question": "Which U.S. president issued the Emancipation Proclamation?",
        "optionA": "Ulysses S. Grant",
        "optionB": "Andrew Johnson",
        "optionC": "Abraham Lincoln",
        "optionD": "James Buchanan",
        "correct": "Abraham Lincoln"
    },
    {
        "topic": "American History",
        "question": "What was the main cause of the American Civil War?",
        "optionA": "Religious freedom",
        "optionB": "Slavery",
        "optionC": "Taxation without representation",
        "optionD": "British interference",
        "correct": "Slavery"
    },
    {
        "topic": "American History",
        "question": "Who was the principal author of the Declaration of Independence?",
        "optionA": "Benjamin Franklin",
        "optionB": "John Adams",
        "optionC": "Thomas Jefferson",
        "optionD": "James Madison",
        "correct": "Thomas Jefferson"
    },
    {
        "topic": "American History",
        "question": "Which battle marked the turning point of the American Revolution?",
        "optionA": "Battle of Bunker Hill",
        "optionB": "Battle of Saratoga",
        "optionC": "Battle of Yorktown",
        "optionD": "Battle of Trenton",
        "correct": "Battle of Saratoga"
    },
    {
        "topic": "American History",
        "question": "Which document outlines the first framework of U.S. government?",
        "optionA": "Bill of Rights",
        "optionB": "U.S. Constitution",
        "optionC": "Articles of Confederation",
        "optionD": "Emancipation Proclamation",
        "correct": "Articles of Confederation"
    },
    {
        "topic": "American History",
        "question": "Who is known for the Midnight Ride to warn of British troops?",
        "optionA": "Paul Revere",
        "optionB": "George Washington",
        "optionC": "Thomas Paine",
        "optionD": "John Hancock",
        "correct": "Paul Revere"
    },
    {
        "topic": "American History",
        "question": "Which war was fought between the North and South regions of the U.S.?",
        "optionA": "Revolutionary War",
        "optionB": "War of 1812",
        "optionC": "Civil War",
        "optionD": "Mexican-American War",
        "correct": "Civil War"
    },
    {
        "topic": "American History",
        "question": "Who was the only U.S. president to serve more than two terms?",
        "optionA": "Theodore Roosevelt",
        "optionB": "Franklin D. Roosevelt",
        "optionC": "Woodrow Wilson",
        "optionD": "Dwight D. Eisenhower",
        "correct": "Franklin D. Roosevelt"
    },
    {
        "topic": "American History",
        "question": "Which movement aimed to end racial segregation in the 1950s and 60s?",
        "optionA": "Suffrage Movement",
        "optionB": "Civil Rights Movement",
        "optionC": "Temperance Movement",
        "optionD": "Abolitionist Movement",
        "correct": "Civil Rights Movement"
    },
    {
        "topic": "American History",
        "question": "Who was president during the Great Depression and World War II?",
        "optionA": "Herbert Hoover",
        "optionB": "Harry Truman",
        "optionC": "Franklin D. Roosevelt",
        "optionD": "John F. Kennedy",
        "correct": "Franklin D. Roosevelt"
    },
    {
        "topic": "American History",
        "question": "Which event directly triggered the start of World War I for the United States?",
        "optionA": "Attack on Pearl Harbor",
        "optionB": "Zimmermann Telegram",
        "optionC": "Sinking of the Lusitania",
        "optionD": "Invasion of Poland",
        "correct": "Zimmermann Telegram"
    },
    {
        "topic": "American History",
        "question": "Who was the U.S. president during the Louisiana Purchase?",
        "optionA": "George Washington",
        "optionB": "Thomas Jefferson",
        "optionC": "John Adams",
        "optionD": "James Monroe",
        "correct": "Thomas Jefferson"
    },
    {
        "topic": "American History",
        "question": "What did the 19th Amendment to the U.S. Constitution achieve?",
        "optionA": "Ended slavery",
        "optionB": "Gave women the right to vote",
        "optionC": "Lowered the voting age to 18",
        "optionD": "Established prohibition",
        "correct": "Gave women the right to vote"
    },
    {
        "topic": "American History",
        "question": "Which scandal led to President Nixon’s resignation?",
        "optionA": "Teapot Dome Scandal",
        "optionB": "Iran-Contra Affair",
        "optionC": "Watergate",
        "optionD": "Lewinsky Scandal",
        "correct": "Watergate"
    },
    {
        "topic": "American History",
        "question": "What did the Supreme Court decide in Brown v. Board of Education (1954)?",
        "optionA": "Legalized segregation in schools",
        "optionB": "Overturned the Emancipation Proclamation",
        "optionC": "Declared segregation in public schools unconstitutional",
        "optionD": "Established separate but equal doctrine",
        "correct": "Declared segregation in public schools unconstitutional"
    },
    {
        "topic": "American History",
        "question": "Who was the commander of the Continental Army during the American Revolution?",
        "optionA": "Benedict Arnold",
        "optionB": "George Washington",
        "optionC": "Thomas Paine",
        "optionD": "John Adams",
        "correct": "George Washington"
    },
    {
        "topic": "American History",
        "question": "Which president purchased Alaska from Russia?",
        "optionA": "James Buchanan",
        "optionB": "Andrew Johnson",
        "optionC": "Ulysses S. Grant",
        "optionD": "Abraham Lincoln",
        "correct": "Andrew Johnson"
    },
    {
        "topic": "American History",
        "question": "What was the Trail of Tears?",
        "optionA": "A military route during the Civil War",
        "optionB": "A major westward migration route",
        "optionC": "The forced relocation of Native Americans",
        "optionD": "A route to freedom for enslaved people",
        "correct": "The forced relocation of Native Americans"
    },
    {
        "topic": "American History",
        "question": "Who was the first African American to serve on the U.S. Supreme Court?",
        "optionA": "Barack Obama",
        "optionB": "Clarence Thomas",
        "optionC": "Thurgood Marshall",
        "optionD": "Frederick Douglass",
        "correct": "Thurgood Marshall"
    },
    {
        "topic": "American History",
        "question": "Which war was sparked by the annexation of Texas and disputes over its southern border?",
        "optionA": "Spanish-American War",
        "optionB": "War of 1812",
        "optionC": "Mexican-American War",
        "optionD": "Civil War",
        "correct": "Mexican-American War"
    },
    {
        "topic": "American History",
        "question": "What was the purpose of the Federalist Papers?",
        "optionA": "To oppose the Constitution",
        "optionB": "To support ratification of the Constitution",
        "optionC": "To declare independence from Britain",
        "optionD": "To draft the Bill of Rights",
        "correct": "To support ratification of the Constitution"
    },
    {
        "topic": "American History",
        "question": "Which American inventor is credited with developing the light bulb?",
        "optionA": "Nikola Tesla",
        "optionB": "Alexander Graham Bell",
        "optionC": "Benjamin Franklin",
        "optionD": "Thomas Edison",
        "correct": "Thomas Edison"
    },
    {
        "topic": "American History",
        "question": "Which U.S. territory became the 50th state in 1959?",
        "optionA": "Alaska",
        "optionB": "Puerto Rico",
        "optionC": "Hawaii",
        "optionD": "Guam",
        "correct": "Hawaii"
    },
    {
        "topic": "American History",
        "question": "Who gave the famous 'I Have a Dream' speech during the March on Washington?",
        "optionA": "Malcolm X",
        "optionB": "Frederick Douglass",
        "optionC": "Martin Luther King Jr.",
        "optionD": "Jesse Jackson",
        "correct": "Martin Luther King Jr."
    },
    {
        "topic": "American History",
        "question": "Which economic crisis began with the stock market crash of 1929?",
        "optionA": "The Great Depression",
        "optionB": "The Panic of 1873",
        "optionC": "The Recession of 2008",
        "optionD": "The Dust Bowl",
        "correct": "The Great Depression"
    },
    {
        "topic": "American History",
        "question": "Which U.S. president was known for the 'New Deal' programs?",
        "optionA": "Harry S. Truman",
        "optionB": "Franklin D. Roosevelt",
        "optionC": "Woodrow Wilson",
        "optionD": "Dwight D. Eisenhower",
        "correct": "Franklin D. Roosevelt"
    },
    {
        "topic": "American History",
        "question": "What was the Manhattan Project?",
        "optionA": "A post-war housing initiative",
        "optionB": "A mission to the moon",
        "optionC": "A secret project to develop atomic bombs",
        "optionD": "A military invasion of Germany",
        "correct": "A secret project to develop atomic bombs"
    },
    {
        "topic": "American History",
        "question": "Which amendment guarantees freedom of speech, press, and religion?",
        "optionA": "First Amendment",
        "optionB": "Fifth Amendment",
        "optionC": "Tenth Amendment",
        "optionD": "Fourteenth Amendment",
        "correct": "First Amendment"
    },
    {
        "topic": "American History",
        "question": "What was the significance of the Dred Scott decision?",
        "optionA": "It ended slavery in the South",
        "optionB": "It declared that African Americans could not be citizens",
        "optionC": "It legalized school segregation",
        "optionD": "It established judicial review",
        "correct": "It declared that African Americans could not be citizens"
      },
      {
        "topic": "American History",
        "question": "Which U.S. military conflict was also known as 'The Forgotten War'?",
        "optionA": "World War I",
        "optionB": "Korean War",
        "optionC": "Vietnam War",
        "optionD": "Spanish-American War",
        "correct": "Korean War"
      },

// Minecraft

    {
      "topic": "Minecraft",
      "question": "Which material is required to craft a Crafting Table?",
      "optionA": "Cobblestone",
      "optionB": "Iron Ingot",
      "optionC": "Wood Planks",
      "optionD": "Sticks",
      "correct": "Wood Planks"
    },
    {
      "topic": "Minecraft",
      "question": "What hostile mob explodes when it gets close to the player?",
      "optionA": "Zombie",
      "optionB": "Skeleton",
      "optionC": "Creeper",
      "optionD": "Spider",
      "correct": "Creeper"
    },
    {
      "topic": "Minecraft",
      "question": "How do you enter the Nether dimension?",
      "optionA": "Use an End Portal",
      "optionB": "Build a Nether Portal",
      "optionC": "Drink a Potion",
      "optionD": "Use a Command Block",
      "correct": "Build a Nether Portal"
    },
    
    // Rare Animals
    {
      "topic": "Rare Animals",
      "question": "Which animal is known as the rarest big cat in the world?",
      "optionA": "Amur Leopard",
      "optionB": "Snow Leopard",
      "optionC": "Siberian Tiger",
      "optionD": "Jaguar",
      "correct": "Amur Leopard"
    },
    {
      "topic": "Rare Animals",
      "question": "Where is the native habitat of the Axolotl?",
      "optionA": "Mexico",
      "optionB": "Brazil",
      "optionC": "India",
      "optionD": "China",
      "correct": "Mexico"
    },
    {
      "topic": "Rare Animals",
      "question": "What is the main threat to the Vaquita porpoise?",
      "optionA": "Pollution",
      "optionB": "Climate Change",
      "optionC": "Fishing Nets",
      "optionD": "Oil Spills",
      "correct": "Fishing Nets"
    },
    
    // Calculus
    {
      "topic": "Calculus",
      "question": "What is the derivative of sin(x)?",
      "optionA": "cos(x)",
      "optionB": "-cos(x)",
      "optionC": "-sin(x)",
      "optionD": "tan(x)",
      "correct": "cos(x)"
    },
    {
      "topic": "Calculus",
      "question": "What is the integral of 1/x dx?",
      "optionA": "ln(x)",
      "optionB": "x ln(x)",
      "optionC": "1/x",
      "optionD": "e^x",
      "correct": "ln(x)"
    },
    {
      "topic": "Calculus",
      "question": "Which rule is used for the derivative of a product of functions?",
      "optionA": "Chain Rule",
      "optionB": "Quotient Rule",
      "optionC": "Product Rule",
      "optionD": "L'H\u00f4pital's Rule",
      "correct": "Product Rule"
    },

    // MCAT
    {
      "topic": "MCAT",
      "question": "What does DNA stand for?",
      "optionA": "Deoxyribonucleic Acid",
      "optionB": "Dinucleic Acid",
      "optionC": "Deoxyribose Acid",
      "optionD": "Dioxyribonucleic Acid",
      "correct": "Deoxyribonucleic Acid"
    },
    {
      "topic": "MCAT",
      "question": "Which part of the brain controls breathing?",
      "optionA": "Cerebellum",
      "optionB": "Cerebrum",
      "optionC": "Medulla Oblongata",
      "optionD": "Thalamus",
      "correct": "Medulla Oblongata"
    },
    {
      "topic": "MCAT",
      "question": "What is the normal pH of blood?",
      "optionA": "7.0",
      "optionB": "7.4",
      "optionC": "6.5",
      "optionD": "8.0",
      "correct": "7.4"
    },
    
    //Cars
    {
      "topic": "Cars",
      "question": "What does RPM stand for in cars?",
      "optionA": "Revolutions Per Minute",
      "optionB": "Rate Per Mile",
      "optionC": "Rear Power Motor",
      "optionD": "Rapid Performance Mode",
      "correct": "Revolutions Per Minute"
    },
    {
      "topic": "Cars",
      "question": "Which company manufactures the Mustang?",
      "optionA": "Chevrolet",
      "optionB": "Ford",
      "optionC": "Toyota",
      "optionD": "Nissan",
      "correct": "Ford"
    },
    {
      "topic": "Cars",
      "question": "What kind of engine do electric cars use?",
      "optionA": "Combustion Engine",
      "optionB": "Rotary Engine",
      "optionC": "Electric Motor",
      "optionD": "Hybrid Engine",
      "correct": "Electric Motor"
    },
    
    // Countries
    {
      "topic": "Countries",
      "question": "Which is the largest country by area?",
      "optionA": "Canada",
      "optionB": "China",
      "optionC": "United States",
      "optionD": "Russia",
      "correct": "Russia"
    },
    {
      "topic": "Countries",
      "question": "What is the capital of Australia?",
      "optionA": "Sydney",
      "optionB": "Melbourne",
      "optionC": "Canberra",
      "optionD": "Perth",
      "correct": "Canberra"
    },
    {
      "topic": "Countries",
      "question": "Which country has the most population?",
      "optionA": "India",
      "optionB": "USA",
      "optionC": "China",
      "optionD": "Indonesia",
      "correct": "India"
    }
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