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
    {
      "topic": "Minecraft",
      "question": "What item do you use to tame a wolf?",
      "optionA": "Bone",
      "optionB": "Raw Beef",
      "optionC": "Stick",
      "optionD": "Apple",
      "correct": "Bone"
    },
    {
      "topic": "Minecraft",
      "question": "Which tool is required to mine Obsidian?",
      "optionA": "Iron Pickaxe",
      "optionB": "Gold Pickaxe",
      "optionC": "Diamond Pickaxe",
      "optionD": "Wooden Pickaxe",
      "correct": "Diamond Pickaxe"
    },
    {
      "topic": "Minecraft",
      "question": "Which mob drops Ender Pearls?",
      "optionA": "Blaze",
      "optionB": "Enderman",
      "optionC": "Ghast",
      "optionD": "Witch",
      "correct": "Enderman"
    },
    {
      "topic": "Minecraft",
      "question": "What is the default player character's name?",
      "optionA": "Notch",
      "optionB": "Steve",
      "optionC": "Alex",
      "optionD": "Herobrine",
      "correct": "Steve"
    },
    {
      "topic": "Minecraft",
      "question": "Which structure naturally generates in the End?",
      "optionA": "Desert Temple",
      "optionB": "Village",
      "optionC": "End City",
      "optionD": "Jungle Temple",
      "correct": "End City"
    },
    {
      "topic": "Minecraft",
      "question": "What do you need to make a Potion of Night Vision?",
      "optionA": "Golden Carrot",
      "optionB": "Spider Eye",
      "optionC": "Ghast Tear",
      "optionD": "Magma Cream",
      "correct": "Golden Carrot"
    },
    {
      "topic": "Minecraft",
      "question": "What is the rarest ore in Minecraft?",
      "optionA": "Gold",
      "optionB": "Emerald",
      "optionC": "Iron",
      "optionD": "Diamond",
      "correct": "Emerald"
    },
    {
      "topic": "Minecraft",
      "question": "Which mob can be ridden with a saddle and controlled using a carrot on a stick?",
      "optionA": "Pig",
      "optionB": "Horse",
      "optionC": "Strider",
      "optionD": "Llama",
      "correct": "Pig"
    },
    {
      "topic": "Minecraft",
      "question": "What item do you use to cure a zombie villager?",
      "optionA": "Golden Apple and Weakness Potion",
      "optionB": "Milk",
      "optionC": "Splash Potion of Healing",
      "optionD": "Bread",
      "correct": "Golden Apple and Weakness Potion"
    },
    {
      "topic": "Minecraft",
      "question": "Which mob is immune to sunlight?",
      "optionA": "Skeleton",
      "optionB": "Zombie",
      "optionC": "Creeper",
      "optionD": "Phantom",
      "correct": "Creeper"
    },
    {
      "topic": "Minecraft",
      "question": "Which biome is the rarest in Minecraft?",
      "optionA": "Desert",
      "optionB": "Mushroom Fields",
      "optionC": "Jungle",
      "optionD": "Swamp",
      "correct": "Mushroom Fields"
    },
    {
      "topic": "Minecraft",
      "question": "What is needed to activate a Nether Portal?",
      "optionA": "Flint and Steel",
      "optionB": "Lava Bucket",
      "optionC": "Redstone Torch",
      "optionD": "Torch",
      "correct": "Flint and Steel"
    },
    {
      "topic": "Minecraft",
      "question": "What does a conduit do?",
      "optionA": "Allows flying",
      "optionB": "Increases underwater abilities",
      "optionC": "Makes you invisible",
      "optionD": "Spawns dolphins",
      "correct": "Increases underwater abilities"
    },
    {
      "topic": "Minecraft",
      "question": "Which block can be used to move redstone signals upwards?",
      "optionA": "Observer",
      "optionB": "Sticky Piston",
      "optionC": "Redstone Torch",
      "optionD": "Repeater",
      "correct": "Redstone Torch"
    },
    {
      "topic": "Minecraft",
      "question": "What enchantment lets you walk on water by freezing it?",
      "optionA": "Depth Strider",
      "optionB": "Frost Walker",
      "optionC": "Aqua Affinity",
      "optionD": "Feather Falling",
      "correct": "Frost Walker"
    },
    {
      "topic": "Minecraft",
      "question": "What is the name of the boss found in ocean monuments?",
      "optionA": "Elder Guardian",
      "optionB": "Sea King",
      "optionC": "Ocean Wraith",
      "optionD": "Coral Leviathan",
      "correct": "Elder Guardian"
    },
    {
      "topic": "Minecraft",
      "question": "Which potion allows you to see in the dark?",
      "optionA": "Potion of Strength",
      "optionB": "Potion of Invisibility",
      "optionC": "Potion of Night Vision",
      "optionD": "Potion of Swiftness",
      "correct": "Potion of Night Vision"
    },
    {
      "topic": "Minecraft",
      "question": "Which of these mobs can be traded with?",
      "optionA": "Enderman",
      "optionB": "Zombie",
      "optionC": "Villager",
      "optionD": "Blaze",
      "correct": "Villager"
    },
    {
      "topic": "Minecraft",
      "question": "What structure do you find the End Portal in?",
      "optionA": "Stronghold",
      "optionB": "Mineshaft",
      "optionC": "Dungeon",
      "optionD": "Village",
      "correct": "Stronghold"
    },
    {
      "topic": "Minecraft",
      "question": "What do bees drop in Minecraft?",
      "optionA": "Honeycomb",
      "optionB": "Gold",
      "optionC": "Nectar",
      "optionD": "Slime",
      "correct": "Honeycomb"
    },
    {
      "topic": "Minecraft",
      "question": "What is the max number of bookshelves that affect an enchanting table?",
      "optionA": "10",
      "optionB": "15",
      "optionC": "20",
      "optionD": "30",
      "correct": "15"
    },
    {
      "topic": "Minecraft",
      "question": "Which version introduced the Nether Update?",
      "optionA": "1.15",
      "optionB": "1.16",
      "optionC": "1.17",
      "optionD": "1.14",
      "correct": "1.16"
    },
    {
      "topic": "Minecraft",
      "question": "What is the strongest material to craft armor?",
      "optionA": "Diamond",
      "optionB": "Iron",
      "optionC": "Netherite",
      "optionD": "Gold",
      "correct": "Netherite"
    },
    {
      "topic": "Minecraft",
      "question": "Which mob drops blaze rods?",
      "optionA": "Blaze",
      "optionB": "Ghast",
      "optionC": "Wither Skeleton",
      "optionD": "Enderman",
      "correct": "Blaze"
    },
    {
      "topic": "Minecraft",
      "question": "What is the main ingredient in a fermented spider eye?",
      "optionA": "Sugar",
      "optionB": "Redstone",
      "optionC": "Gunpowder",
      "optionD": "Magma Cream",
      "correct": "Sugar"
    },
    {
      "topic": "Minecraft",
      "question": "Which block is unbreakable in Survival mode?",
      "optionA": "Diamond Block",
      "optionB": "Bedrock",
      "optionC": "Obsidian",
      "optionD": "Barrier",
      "correct": "Bedrock"
    },
    {
      "topic": "Minecraft",
      "question": "Which dimension features chorus plants and End Cities?",
      "optionA": "Overworld",
      "optionB": "Nether",
      "optionC": "End",
      "optionD": "Sky",
      "correct": "End"
    },
    {
      "topic": "Minecraft",
      "question": "What is the maximum height at which mobs can naturally spawn in the Overworld?",
      "optionA": "256",
      "optionB": "319",
      "optionC": "320",
      "optionD": "255",
      "correct": "319"
    },
    {
      "topic": "Minecraft",
      "question": "Which effect does the Wither boss apply to nearby players?",
      "optionA": "Blindness",
      "optionB": "Wither",
      "optionC": "Poison",
      "optionD": "Weakness",
      "correct": "Wither"
    },
    {
      "topic": "Minecraft",
      "question": "Which of these can NOT be used as fuel in a furnace?",
      "optionA": "Lava Bucket",
      "optionB": "Blaze Rod",
      "optionC": "Fence",
      "optionD": "Iron Sword",
      "correct": "Iron Sword"
    },
    {
      "topic": "Minecraft",
      "question": "Which item resets a villager's profession when placed near them?",
      "optionA": "Stonecutter",
      "optionB": "Composter",
      "optionC": "Job Site Block",
      "optionD": "Lectern",
      "correct": "Job Site Block"
    },
    {
      "topic": "Minecraft",
      "question": "What does the 'Luck of the Sea' enchantment do?",
      "optionA": "Increases treasure chance when fishing",
      "optionB": "Increases fish spawn rate",
      "optionC": "Reduces fishing cooldown",
      "optionD": "Improves underwater vision",
      "correct": "Increases treasure chance when fishing"
    },
    {
      "topic": "Minecraft",
      "question": "Which command gives a player a filled map with ID 0?",
      "optionA": "/give @p map",
      "optionB": "/give @p filled_map 0",
      "optionC": "/give @p minecraft:filled_map{map:0}",
      "optionD": "/give map:0",
      "correct": "/give @p minecraft:filled_map{map:0}"
    },
    {
      "topic": "Minecraft",
      "question": "Which advancement requires entering all three dimensions?",
      "optionA": "Adventuring Time",
      "optionB": "Hot Tourist Destinations",
      "optionC": "Cover Me in Debris",
      "optionD": "Subspace Bubble",
      "correct": "Adventuring Time"
    },
    {
      "topic": "Minecraft",
      "question": "What Y-level is optimal for ancient debris mining in the Nether?",
      "optionA": "8-22",
      "optionB": "15",
      "optionC": "11-15",
      "optionD": "5-12",
      "correct": "15"
    },
    {
      "topic": "Minecraft",
      "question": "How many blocks can water travel from its source on a farmland?",
      "optionA": "4",
      "optionB": "5",
      "optionC": "6",
      "optionD": "3",
      "correct": "4"
    },
    {
      "topic": "Minecraft",
      "question": "What is the minimum light level for hostile mobs to spawn (as of 1.18)?",
      "optionA": "0",
      "optionB": "1",
      "optionC": "7",
      "optionD": "8",
      "correct": "0"
    },
    {
      "topic": "Minecraft",
      "question": "What is the name of the data file where Minecraft stores region information?",
      "optionA": "region.mca",
      "optionB": "world.dat",
      "optionC": "level.dat",
      "optionD": "chunks.dat",
      "correct": "region.mca"
    },
    {
      "topic": "Minecraft",
      "question": "Which of the following mobs can break doors on Hard difficulty?",
      "optionA": "Zombie",
      "optionB": "Pillager",
      "optionC": "Skeleton",
      "optionD": "Witch",
      "correct": "Zombie"
    },
    {
      "topic": "Minecraft",
      "question": "Which rare item is dropped by a charged creeper killing a mob?",
      "optionA": "TNT Block",
      "optionB": "Mob Head",
      "optionC": "Gunpowder Block",
      "optionD": "Lightning Rod",
      "correct": "Mob Head"
    },
    {
      "topic": "Minecraft",
      "question": "What is the durability of a Netherite Pickaxe?",
      "optionA": "2031",
      "optionB": "1561",
      "optionC": "2500",
      "optionD": "3000",
      "correct": "2031"
    },
    {
      "topic": "Minecraft",
      "question": "Which enchantment cannot be applied to a bow?",
      "optionA": "Infinity",
      "optionB": "Power",
      "optionC": "Punch",
      "optionD": "Loyalty",
      "correct": "Loyalty"
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
    {
      "topic": "Rare Animals",
      "question": "Which rare mammal is native to Madagascar and resembles a raccoon with rodent-like teeth?",
      "optionA": "Fossa",
      "optionB": "Aye-Aye",
      "optionC": "Lemur",
      "optionD": "Tenrec",
      "correct": "Aye-Aye"
    },
    {
      "topic": "Rare Animals",
      "question": "What is the critically endangered bird found only in New Zealand?",
      "optionA": "Kea",
      "optionB": "Kakapo",
      "optionC": "Kiwi",
      "optionD": "Tui",
      "correct": "Kakapo"
    },
    {
      "topic": "Rare Animals",
      "question": "What is the IUCN status of the Javan Rhino?",
      "optionA": "Least Concern",
      "optionB": "Endangered",
      "optionC": "Critically Endangered",
      "optionD": "Near Threatened",
      "correct": "Critically Endangered"
    },
    {
      "topic": "Rare Animals",
      "question": "Which animal is often called the 'ghost of the mountains'?",
      "optionA": "Snow Leopard",
      "optionB": "Amur Leopard",
      "optionC": "Lynx",
      "optionD": "Cougar",
      "correct": "Snow Leopard"
    },
    {
      "topic": "Rare Animals",
      "question": "How many Northern Bald Ibises are estimated to be left in the wild?",
      "optionA": "Less than 1,000",
      "optionB": "5,000-10,000",
      "optionC": "10,000-20,000",
      "optionD": "Over 20,000",
      "correct": "Less than 1,000"
    },
    {
      "topic": "Rare Animals",
      "question": "Which of these is a rare marine mammal found in freshwater habitats in Asia?",
      "optionA": "Irrawaddy Dolphin",
      "optionB": "Narwhal",
      "optionC": "Vaquita",
      "optionD": "Dugong",
      "correct": "Irrawaddy Dolphin"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare animal is also known as the 'unicorn of the sea'?",
      "optionA": "Narwhal",
      "optionB": "Beluga Whale",
      "optionC": "Blue Whale",
      "optionD": "Orca",
      "correct": "Narwhal"
    },
    {
      "topic": "Rare Animals",
      "question": "Which endangered animal is famous for its long, sticky tongue and scales?",
      "optionA": "Armadillo",
      "optionB": "Anteater",
      "optionC": "Pangolin",
      "optionD": "Tapir",
      "correct": "Pangolin"
    },
    {
      "topic": "Rare Animals",
      "question": "The Saola, also known as the 'Asian Unicorn', was discovered in which country?",
      "optionA": "Vietnam",
      "optionB": "Thailand",
      "optionC": "Myanmar",
      "optionD": "Cambodia",
      "correct": "Vietnam"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare amphibian can regenerate limbs and organs?",
      "optionA": "Newt",
      "optionB": "Axolotl",
      "optionC": "Toad",
      "optionD": "Frog",
      "correct": "Axolotl"
    },
    {
      "topic": "Rare Animals",
      "question": "Which critically endangered antelope species lives only in parts of West Africa?",
      "optionA": "Gazelle",
      "optionB": "Addax",
      "optionC": "Saiga",
      "optionD": "Bontebok",
      "correct": "Addax"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare primate is known for its loud calls and is native to Indonesia?",
      "optionA": "Gibbon",
      "optionB": "Orangutan",
      "optionC": "Tarsier",
      "optionD": "Slow Loris",
      "correct": "Gibbon"
    },
    {
      "topic": "Rare Animals",
      "question": "Which endangered animal is known for its distinctive black and white coloring and only found in China?",
      "optionA": "Giant Panda",
      "optionB": "Snow Leopard",
      "optionC": "Black Bear",
      "optionD": "Red Panda",
      "correct": "Giant Panda"
    },
    {
      "topic": "Rare Animals",
      "question": "The Yangtze Giant Softshell Turtle is native to which country?",
      "optionA": "China",
      "optionB": "Thailand",
      "optionC": "India",
      "optionD": "Laos",
      "correct": "China"
    },
    {
      "topic": "Rare Animals",
      "question": "Which small wildcat is considered one of the rarest in Europe?",
      "optionA": "Scottish Wildcat",
      "optionB": "Serval",
      "optionC": "Caracal",
      "optionD": "Jaguarundi",
      "correct": "Scottish Wildcat"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare creature is famous for being one of the few venomous mammals?",
      "optionA": "Platypus",
      "optionB": "Aardvark",
      "optionC": "Maned Wolf",
      "optionD": "Sloth",
      "correct": "Platypus"
    },
    {
      "topic": "Rare Animals",
      "question": "Which endangered species is the world's smallest marine dolphin?",
      "optionA": "Vaquita",
      "optionB": "Spinner Dolphin",
      "optionC": "Hector’s Dolphin",
      "optionD": "Irrawaddy Dolphin",
      "correct": "Vaquita"
    },
    {
      "topic": "Rare Animals",
      "question": "The Okapi, a rare animal with zebra-like legs, is closely related to which animal?",
      "optionA": "Giraffe",
      "optionB": "Antelope",
      "optionC": "Horse",
      "optionD": "Camel",
      "correct": "Giraffe"
    },
    {
      "topic": "Rare Animals",
      "question": "What kind of environment is the primary habitat of the Philippine Eagle?",
      "optionA": "Rainforest",
      "optionB": "Desert",
      "optionC": "Mountain Tundra",
      "optionD": "Savanna",
      "correct": "Rainforest"
    },
    {
      "topic": "Rare Animals",
      "question": "Which animal is the rarest species of zebra?",
      "optionA": "Grevy’s Zebra",
      "optionB": "Mountain Zebra",
      "optionC": "Plains Zebra",
      "optionD": "Chapman’s Zebra",
      "correct": "Grevy’s Zebra"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare marsupial is found only on Tasmania and is threatened by a contagious cancer?",
      "optionA": "Koala",
      "optionB": "Wombat",
      "optionC": "Tasmanian Devil",
      "optionD": "Wallaby",
      "correct": "Tasmanian Devil"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare animal is known for its ability to roll into a near-perfect ball?",
      "optionA": "Armadillo",
      "optionB": "Pangolin",
      "optionC": "Hedgehog",
      "optionD": "Porcupine",
      "correct": "Pangolin"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare sea creature is often mistaken for a plant due to its leafy appearance?",
      "optionA": "Sea Dragon",
      "optionB": "Sea Cucumber",
      "optionC": "Sea Urchin",
      "optionD": "Box Jellyfish",
      "correct": "Sea Dragon"
    },
    {
      "topic": "Rare Animals",
      "question": "Which large, critically endangered bird is native to the Himalayas and known for its powerful beak?",
      "optionA": "Bearded Vulture",
      "optionB": "Harpy Eagle",
      "optionC": "Shoebill",
      "optionD": "Philippine Eagle",
      "correct": "Bearded Vulture"
    },
    {
      "topic": "Rare Animals",
      "question": "Which nocturnal primate is known for its slow movement and large eyes, making it vulnerable to the illegal pet trade?",
      "optionA": "Slow Loris",
      "optionB": "Bush Baby",
      "optionC": "Tarsier",
      "optionD": "Aye-Aye",
      "correct": "Slow Loris"
    },
    {
      "topic": "Rare Animals",
      "question": "What is the main diet of the Iberian Lynx, one of the rarest wildcats in the world?",
      "optionA": "Rodents",
      "optionB": "Fish",
      "optionC": "Rabbits",
      "optionD": "Birds",
      "correct": "Rabbits"
    },
    {
      "topic": "Rare Animals",
      "question": "Which rare animal was believed extinct until rediscovered in the 20th century in Vietnam?",
      "optionA": "Saola",
      "optionB": "Javan Rhino",
      "optionC": "Thylacine",
      "optionD": "Quokka",
      "correct": "Saola"
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
      "optionD": "L'Hôpital's Rule",
      "correct": "Product Rule"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of e^x?",
      "optionA": "e^x",
      "optionB": "x e^(x-1)",
      "optionC": "ln(x)",
      "optionD": "1/e^x",
      "correct": "e^x"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of ln(x)?",
      "optionA": "1/x",
      "optionB": "ln(x)",
      "optionC": "x",
      "optionD": "x ln(x)",
      "correct": "1/x"
    },
    {
      "topic": "Calculus",
      "question": "What is the chain rule used for?",
      "optionA": "Integrating rational functions",
      "optionB": "Differentiating inverse functions",
      "optionC": "Differentiating composite functions",
      "optionD": "Evaluating limits",
      "correct": "Differentiating composite functions"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of x^n, where n is a constant?",
      "optionA": "n*x^(n-1)",
      "optionB": "x^n",
      "optionC": "n*x^n",
      "optionD": "n/x^(n+1)",
      "correct": "n*x^(n-1)"
    },
    {
      "topic": "Calculus",
      "question": "What is the antiderivative of cos(x)?",
      "optionA": "sin(x)",
      "optionB": "-sin(x)",
      "optionC": "-cos(x)",
      "optionD": "tan(x)",
      "correct": "sin(x)"
    },
    {
      "topic": "Calculus",
      "question": "L'Hôpital's Rule is applied when evaluating limits with which form?",
      "optionA": "0/0 or ∞/∞",
      "optionB": "1/0",
      "optionC": "x/0",
      "optionD": "∞ - ∞",
      "correct": "0/0 or ∞/∞"
    },
    {
      "topic": "Calculus",
      "question": "What is the second derivative of f(x) called?",
      "optionA": "Rate of change",
      "optionB": "Curvature",
      "optionC": "Acceleration",
      "optionD": "Concavity",
      "correct": "Concavity"
    },
    {
      "topic": "Calculus",
      "question": "Which method is used to integrate the product of two functions?",
      "optionA": "U-substitution",
      "optionB": "Integration by parts",
      "optionC": "Partial fractions",
      "optionD": "L'Hôpital's Rule",
      "correct": "Integration by parts"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of tan(x)?",
      "optionA": "sec^2(x)",
      "optionB": "cot(x)",
      "optionC": "-csc^2(x)",
      "optionD": "sec(x)tan(x)",
      "correct": "sec^2(x)"
    },
    {
      "topic": "Calculus",
      "question": "Which of the following represents the Fundamental Theorem of Calculus?",
      "optionA": "d/dx ∫_a^x f(t) dt = f(x)",
      "optionB": "∫ f'(x) dx = f(x) + C",
      "optionC": "lim h→0 (f(x+h)-f(x))/h",
      "optionD": "f(x) = f(c) + f’(c)(x-c)",
      "correct": "d/dx ∫_a^x f(t) dt = f(x)"
    },
    {
      "topic": "Calculus",
      "question": "What is the integral of sec(x) dx?",
      "optionA": "ln|sec(x) + tan(x)|",
      "optionB": "ln|sec(x) - tan(x)|",
      "optionC": "arctan(x)",
      "optionD": "ln|cos(x)|",
      "correct": "ln|sec(x) + tan(x)|"
    },
    {
      "topic": "Calculus",
      "question": "If f(x) = x^3 - 3x^2 + 2, what are the x-values of critical points?",
      "optionA": "x = 0 and x = 2",
      "optionB": "x = 1 and x = 2",
      "optionC": "x = -1 and x = 1",
      "optionD": "x = 1 and x = 3",
      "correct": "x = 0 and x = 2"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of ln|x|?",
      "optionA": "1/x",
      "optionB": "|x|",
      "optionC": "-1/x",
      "optionD": "ln(x)",
      "correct": "1/x"
    },
    {
      "topic": "Calculus",
      "question": "What does it mean if the second derivative f''(x) > 0 at a point?",
      "optionA": "The graph is concave down",
      "optionB": "The function has a maximum",
      "optionC": "The graph is concave up",
      "optionD": "The function is decreasing",
      "correct": "The graph is concave up"
    },
    {
      "topic": "Calculus",
      "question": "What is the integral of e^(-x)?",
      "optionA": "-e^(-x)",
      "optionB": "e^(-x)",
      "optionC": "1/e^x",
      "optionD": "-ln(x)",
      "correct": "-e^(-x)"
    },
    {
      "topic": "Calculus",
      "question": "What is a point where a function changes concavity called?",
      "optionA": "Inflection Point",
      "optionB": "Critical Point",
      "optionC": "Stationary Point",
      "optionD": "Discontinuity",
      "correct": "Inflection Point"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of arctan(x)?",
      "optionA": "1 / (1 + x^2)",
      "optionB": "1 / √(1 - x^2)",
      "optionC": "-1 / (1 + x^2)",
      "optionD": "1 / x",
      "correct": "1 / (1 + x^2)"
    },
    {
      "topic": "Calculus",
      "question": "What does the Mean Value Theorem state?",
      "optionA": "There exists c such that f'(c) equals the average rate of change",
      "optionB": "The function has a minimum",
      "optionC": "The function is continuous",
      "optionD": "The derivative exists everywhere",
      "correct": "There exists c such that f'(c) equals the average rate of change"
    },
    {
      "topic": "Calculus",
      "question": "Which of these integrals results in an arctangent function?",
      "optionA": "∫1/(1+x^2) dx",
      "optionB": "∫1/√(1-x^2) dx",
      "optionC": "∫tan(x) dx",
      "optionD": "∫sec(x)^2 dx",
      "correct": "∫1/(1+x^2) dx"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of x ln(x)?",
      "optionA": "ln(x) + 1",
      "optionB": "x ln(x) - x",
      "optionC": "x / ln(x)",
      "optionD": "1 / x",
      "correct": "ln(x) + 1"
    },
    {
      "topic": "Calculus",
      "question": "Which limit defines the derivative?",
      "optionA": "lim h→0 (f(x+h) - f(x)) / h",
      "optionB": "lim x→a (f(x) - f(a)) / (x - a)",
      "optionC": "lim x→∞ f(x)/x",
      "optionD": "lim h→0 (f(x) / h)",
      "correct": "lim h→0 (f(x+h) - f(x)) / h"
    },
    {
      "topic": "Calculus",
      "question": "What is the integral of 1 / (1 - x^2) dx?",
      "optionA": "arctanh(x)",
      "optionB": "arcsin(x)",
      "optionC": "arccos(x)",
      "optionD": "ln|1 - x^2|",
      "correct": "arctanh(x)"
    },
    {
      "topic": "Calculus",
      "question": "Which technique is best for integrating rational functions?",
      "optionA": "Partial Fractions",
      "optionB": "Chain Rule",
      "optionC": "L'Hôpital's Rule",
      "optionD": "Completing the Square",
      "correct": "Partial Fractions"
    },
    {
      "topic": "Calculus",
      "question": "If f(x) is increasing and concave down, what can be said about f'(x)?",
      "optionA": "f'(x) > 0 and decreasing",
      "optionB": "f'(x) < 0 and decreasing",
      "optionC": "f'(x) = 0",
      "optionD": "f'(x) is increasing",
      "correct": "f'(x) > 0 and decreasing"
    },
    {
      "topic": "Calculus",
      "question": "What is the derivative of sec(x)?",
      "optionA": "sec(x)tan(x)",
      "optionB": "tan(x)",
      "optionC": "-sec(x)tan(x)",
      "optionD": "1 / cos(x)",
      "correct": "sec(x)tan(x)"
    },
    {
      "topic": "Calculus",
      "question": "If a function has a local minimum at x = c, then:",
      "optionA": "f'(c) = 0 and f''(c) > 0",
      "optionB": "f'(c) > 0",
      "optionC": "f'(c) = 0 and f''(c) < 0",
      "optionD": "f''(c) = 0",
      "correct": "f'(c) = 0 and f''(c) > 0"
    },
    {
      "topic": "Calculus",
      "question": "What is the integral of tan(x) dx?",
      "optionA": "-ln|cos(x)|",
      "optionB": "ln|sin(x)|",
      "optionC": "ln|tan(x)|",
      "optionD": "sec(x) + C",
      "correct": "-ln|cos(x)|"
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
    {
      "topic": "MCAT",
      "question": "Which macromolecule is primarily responsible for enzyme activity?",
      "optionA": "Carbohydrates",
      "optionB": "Lipids",
      "optionC": "Proteins",
      "optionD": "Nucleic Acids",
      "correct": "Proteins"
    },
    {
      "topic": "MCAT",
      "question": "Which of the following organelles is responsible for ATP production?",
      "optionA": "Ribosome",
      "optionB": "Golgi Apparatus",
      "optionC": "Lysosome",
      "optionD": "Mitochondria",
      "correct": "Mitochondria"
    },
    {
      "topic": "MCAT",
      "question": "What type of bond links amino acids together?",
      "optionA": "Hydrogen bond",
      "optionB": "Peptide bond",
      "optionC": "Ionic bond",
      "optionD": "Disulfide bond",
      "correct": "Peptide bond"
    },
    {
      "topic": "MCAT",
      "question": "Which phase of the cell cycle does DNA replication occur in?",
      "optionA": "G1 phase",
      "optionB": "S phase",
      "optionC": "G2 phase",
      "optionD": "M phase",
      "correct": "S phase"
    },
    {
      "topic": "MCAT",
      "question": "Which hormone is secreted by the pancreas to lower blood glucose levels?",
      "optionA": "Glucagon",
      "optionB": "Insulin",
      "optionC": "Adrenaline",
      "optionD": "Cortisol",
      "correct": "Insulin"
    },
    {
      "topic": "MCAT",
      "question": "Which type of immunity involves memory cells?",
      "optionA": "Innate Immunity",
      "optionB": "Passive Immunity",
      "optionC": "Active Immunity",
      "optionD": "Temporary Immunity",
      "correct": "Active Immunity"
    },
    {
      "topic": "MCAT",
      "question": "Which of the following describes an SN1 reaction?",
      "optionA": "Concerted single-step mechanism",
      "optionB": "Rate depends on nucleophile concentration",
      "optionC": "Involves a carbocation intermediate",
      "optionD": "Occurs only with primary alkyl halides",
      "correct": "Involves a carbocation intermediate"
    },
    {
      "topic": "MCAT",
      "question": "Which neurotransmitter is primarily involved in the parasympathetic nervous system?",
      "optionA": "Epinephrine",
      "optionB": "Acetylcholine",
      "optionC": "Dopamine",
      "optionD": "Serotonin",
      "correct": "Acetylcholine"
    },
    {
      "topic": "MCAT",
      "question": "What is the Hardy-Weinberg equilibrium equation?",
      "optionA": "p + q = 1",
      "optionB": "p^2 + 2pq + q^2 = 1",
      "optionC": "p - q = 1",
      "optionD": "p^2 - 2pq + q^2 = 1",
      "correct": "p^2 + 2pq + q^2 = 1"
    },
    {
      "topic": "MCAT",
      "question": "Which of the following best describes the function of the loop of Henle?",
      "optionA": "Filtration of blood",
      "optionB": "Reabsorption of glucose",
      "optionC": "Concentration of urine",
      "optionD": "Production of erythropoietin",
      "correct": "Concentration of urine"
    },
    {
      "topic": "MCAT",
      "question": "Which structure connects the hypothalamus to the pituitary gland?",
      "optionA": "Corpus callosum",
      "optionB": "Infundibulum",
      "optionC": "Pons",
      "optionD": "Medulla",
      "correct": "Infundibulum"
    },
    {
      "topic": "MCAT",
      "question": "Which of the following best describes an allosteric enzyme?",
      "optionA": "An enzyme with a single active site",
      "optionB": "An enzyme whose activity is regulated by binding at a site other than the active site",
      "optionC": "An enzyme that cannot be inhibited",
      "optionD": "An enzyme that works only at low pH",
      "correct": "An enzyme whose activity is regulated by binding at a site other than the active site"
    },
    {
      "topic": "MCAT",
      "question": "Which vitamin is required for proper blood clotting?",
      "optionA": "Vitamin A",
      "optionB": "Vitamin K",
      "optionC": "Vitamin D",
      "optionD": "Vitamin C",
      "correct": "Vitamin K"
    },
    {
      "topic": "MCAT",
      "question": "Which organelle is involved in lipid synthesis?",
      "optionA": "Rough ER",
      "optionB": "Mitochondria",
      "optionC": "Smooth ER",
      "optionD": "Golgi Apparatus",
      "correct": "Smooth ER"
    },
    {
      "topic": "MCAT",
      "question": "What is the main function of aldosterone?",
      "optionA": "Lower blood glucose",
      "optionB": "Increase sodium reabsorption",
      "optionC": "Stimulate red blood cell production",
      "optionD": "Decrease blood pressure",
      "correct": "Increase sodium reabsorption"
    },
    {
      "topic": "MCAT",
      "question": "Which molecule is the primary energy currency of the cell?",
      "optionA": "NADH",
      "optionB": "ATP",
      "optionC": "Glucose",
      "optionD": "FADH2",
      "correct": "ATP"
    },
    {
      "topic": "MCAT",
      "question": "What kind of transport requires energy input?",
      "optionA": "Osmosis",
      "optionB": "Facilitated diffusion",
      "optionC": "Simple diffusion",
      "optionD": "Active transport",
      "correct": "Active transport"
    },
    {
      "topic": "MCAT",
      "question": "Which process occurs in the mitochondria?",
      "optionA": "Glycolysis",
      "optionB": "Transcription",
      "optionC": "Citric Acid Cycle",
      "optionD": "Translation",
      "correct": "Citric Acid Cycle"
    },
    {
      "topic": "MCAT",
      "question": "Which type of RNA carries amino acids to the ribosome?",
      "optionA": "mRNA",
      "optionB": "rRNA",
      "optionC": "tRNA",
      "optionD": "snRNA",
      "correct": "tRNA"
    },
    {
      "topic": "MCAT",
      "question": "Which neurotransmitter is associated with reward and addiction?",
      "optionA": "GABA",
      "optionB": "Dopamine",
      "optionC": "Serotonin",
      "optionD": "Glutamate",
      "correct": "Dopamine"
    },
    {
      "topic": "MCAT",
      "question": "Which stage of development is characterized by the formation of the three germ layers?",
      "optionA": "Fertilization",
      "optionB": "Blastulation",
      "optionC": "Gastrulation",
      "optionD": "Neurulation",
      "correct": "Gastrulation"
    },
    {
      "topic": "MCAT",
      "question": "Which component of the immune system is part of the innate response?",
      "optionA": "B cells",
      "optionB": "T cells",
      "optionC": "Macrophages",
      "optionD": "Plasma cells",
      "correct": "Macrophages"
    },
    {
      "topic": "MCAT",
      "question": "Which enzyme is responsible for unwinding DNA during replication?",
      "optionA": "Ligase",
      "optionB": "Primase",
      "optionC": "Helicase",
      "optionD": "Topoisomerase",
      "correct": "Helicase"
    },
    {
      "topic": "MCAT",
      "question": "Which class of hormones binds to intracellular receptors?",
      "optionA": "Peptide hormones",
      "optionB": "Catecholamines",
      "optionC": "Steroid hormones",
      "optionD": "Protein hormones",
      "correct": "Steroid hormones"
    },
    {
      "topic": "MCAT",
      "question": "Which psychological perspective focuses on observable behavior?",
      "optionA": "Cognitive",
      "optionB": "Psychoanalytic",
      "optionC": "Behaviorist",
      "optionD": "Humanistic",
      "correct": "Behaviorist"
    },
    {
      "topic": "MCAT",
      "question": "Which organ regulates blood pH by excreting H+ ions?",
      "optionA": "Liver",
      "optionB": "Lungs",
      "optionC": "Kidneys",
      "optionD": "Pancreas",
      "correct": "Kidneys"
    },
    {
      "topic": "MCAT",
      "question": "Which technique is used to amplify DNA sequences?",
      "optionA": "Western Blot",
      "optionB": "ELISA",
      "optionC": "Southern Blot",
      "optionD": "PCR",
      "correct": "PCR"
    },
    {
      "topic": "MCAT",
      "question": "Which organ produces bile?",
      "optionA": "Gallbladder",
      "optionB": "Liver",
      "optionC": "Pancreas",
      "optionD": "Stomach",
      "correct": "Liver"
    },
    {
      "topic": "MCAT",
      "question": "Which structure in the eye is responsible for focusing light on the retina?",
      "optionA": "Cornea",
      "optionB": "Iris",
      "optionC": "Lens",
      "optionD": "Pupil",
      "correct": "Lens"
    },
    {
      "topic": "MCAT",
      "question": "Which process describes water moving through a semipermeable membrane?",
      "optionA": "Diffusion",
      "optionB": "Active Transport",
      "optionC": "Osmosis",
      "optionD": "Facilitated Diffusion",
      "correct": "Osmosis"
    },
    {
      "topic": "MCAT",
      "question": "Which type of molecule has both hydrophobic and hydrophilic regions?",
      "optionA": "Monosaccharide",
      "optionB": "Amino Acid",
      "optionC": "Phospholipid",
      "optionD": "Nucleotide",
      "correct": "Phospholipid"
    },
    {
      "topic": "MCAT",
      "question": "What is the role of the sarcoplasmic reticulum in muscle cells?",
      "optionA": "Generate action potentials",
      "optionB": "Produce ATP",
      "optionC": "Store and release calcium ions",
      "optionD": "Transmit neural signals",
      "correct": "Store and release calcium ions"
    },
    {
      "topic": "MCAT",
      "question": "Which of the following is a secondary protein structure?",
      "optionA": "Alpha helix",
      "optionB": "Disulfide bond",
      "optionC": "Enzyme active site",
      "optionD": "Quaternary structure",
      "correct": "Alpha helix"
    },
    {
      "topic": "MCAT",
      "question": "Which gas law explains the inverse relationship between pressure and volume?",
      "optionA": "Charles's Law",
      "optionB": "Boyle's Law",
      "optionC": "Avogadro's Law",
      "optionD": "Gay-Lussac's Law",
      "correct": "Boyle's Law"
    },
    {
      "topic": "MCAT",
      "question": "Which functional group is present in ketones?",
      "optionA": "Hydroxyl",
      "optionB": "Carbonyl",
      "optionC": "Carboxyl",
      "optionD": "Amino",
      "correct": "Carbonyl"
    },
    {
      "topic": "MCAT",
      "question": "What does a low Km value indicate in enzyme kinetics?",
      "optionA": "Low substrate affinity",
      "optionB": "High substrate affinity",
      "optionC": "Fast reaction rate",
      "optionD": "No enzyme activity",
      "correct": "High substrate affinity"
    },
    {
      "topic": "MCAT",
      "question": "Which neurotransmitter is most involved in muscle contraction?",
      "optionA": "Dopamine",
      "optionB": "Serotonin",
      "optionC": "GABA",
      "optionD": "Acetylcholine",
      "correct": "Acetylcholine"
    },
    {
      "topic": "MCAT",
      "question": "Which brain region regulates homeostasis such as temperature and hunger?",
      "optionA": "Cerebellum",
      "optionB": "Hippocampus",
      "optionC": "Hypothalamus",
      "optionD": "Thalamus",
      "correct": "Hypothalamus"
    },
    {
      "topic": "MCAT",
      "question": "Which sociological theory focuses on how individuals interact through symbols?",
      "optionA": "Functionalism",
      "optionB": "Conflict Theory",
      "optionC": "Symbolic Interactionism",
      "optionD": "Social Exchange Theory",
      "correct": "Symbolic Interactionism"
    },
    {
      "topic": "MCAT",
      "question": "In physics, what does the area under a velocity vs. time graph represent?",
      "optionA": "Acceleration",
      "optionB": "Work",
      "optionC": "Displacement",
      "optionD": "Momentum",
      "correct": "Displacement"
    },
    {
      "topic": "MCAT",
      "question": "Which psychological concept refers to difficulty recalling old information due to new learning?",
      "optionA": "Retrograde amnesia",
      "optionB": "Proactive interference",
      "optionC": "Retroactive interference",
      "optionD": "Repression",
      "correct": "Retroactive interference"
    },
    {
      "topic": "MCAT",
      "question": "Which of the following best describes an epigenetic modification?",
      "optionA": "Change in DNA sequence",
      "optionB": "Addition of new chromosomes",
      "optionC": "Methylation of DNA",
      "optionD": "Loss of a chromosome",
      "correct": "Methylation of DNA"
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
    {
      "topic": "Cars",
      "question": "Which country is home to the car brand Ferrari?",
      "optionA": "France",
      "optionB": "Germany",
      "optionC": "Italy",
      "optionD": "Japan",
      "correct": "Italy"
    },
    {
      "topic": "Cars",
      "question": "What does ABS stand for in vehicle safety systems?",
      "optionA": "Auto Brake System",
      "optionB": "Automatic Balance Suspension",
      "optionC": "Anti-lock Braking System",
      "optionD": "Active Brake Signal",
      "correct": "Anti-lock Braking System"
    },
    {
      "topic": "Cars",
      "question": "What is the name of Toyota's luxury division?",
      "optionA": "Acura",
      "optionB": "Infiniti",
      "optionC": "Lexus",
      "optionD": "Genesis",
      "correct": "Lexus"
    },
    {
      "topic": "Cars",
      "question": "What does the 'P' stand for in a car's gear shift?",
      "optionA": "Push",
      "optionB": "Park",
      "optionC": "Power",
      "optionD": "Pressure",
      "correct": "Park"
    },
    {
      "topic": "Cars",
      "question": "Which fuel type is most commonly used in diesel engines?",
      "optionA": "Petrol",
      "optionB": "Ethanol",
      "optionC": "Diesel",
      "optionD": "CNG",
      "correct": "Diesel"
    },
    {
      "topic": "Cars",
      "question": "What is turbo lag?",
      "optionA": "Delay in steering response",
      "optionB": "Delay between pressing the gas and turbo boost",
      "optionC": "Delay in engine starting",
      "optionD": "Delay in braking action",
      "correct": "Delay between pressing the gas and turbo boost"
    },
    {
      "topic": "Cars",
      "question": "Which brand produces the Aventador and Huracán?",
      "optionA": "McLaren",
      "optionB": "Ferrari",
      "optionC": "Lamborghini",
      "optionD": "Bugatti",
      "correct": "Lamborghini"
    },
    {
      "topic": "Cars",
      "question": "What is the primary purpose of a catalytic converter?",
      "optionA": "Increase speed",
      "optionB": "Improve fuel economy",
      "optionC": "Reduce harmful emissions",
      "optionD": "Cool the engine",
      "correct": "Reduce harmful emissions"
    },
    {
      "topic": "Cars",
      "question": "Which company owns Bugatti, Audi, and Porsche?",
      "optionA": "Toyota Group",
      "optionB": "Volkswagen Group",
      "optionC": "General Motors",
      "optionD": "Stellantis",
      "correct": "Volkswagen Group"
    },
    {
      "topic": "Cars",
      "question": "What drivetrain sends power to all four wheels?",
      "optionA": "FWD",
      "optionB": "RWD",
      "optionC": "AWD",
      "optionD": "CVT",
      "correct": "AWD"
    },
    {
      "topic": "Cars",
      "question": "What does 'horsepower' measure in a car?",
      "optionA": "Fuel efficiency",
      "optionB": "Torque",
      "optionC": "Braking power",
      "optionD": "Engine power output",
      "correct": "Engine power output"
    },
    {
      "topic": "Cars",
      "question": "What is the redline on a tachometer?",
      "optionA": "Maximum braking force",
      "optionB": "Maximum safe engine RPM",
      "optionC": "Top speed",
      "optionD": "Transmission limit",
      "correct": "Maximum safe engine RPM"
    },
    {
      "topic": "Cars",
      "question": "Which car company created the first mass-produced vehicle?",
      "optionA": "Chevrolet",
      "optionB": "Ford",
      "optionC": "BMW",
      "optionD": "Mercedes-Benz",
      "correct": "Ford"
    },
    {
      "topic": "Cars",
      "question": "What does SUV stand for?",
      "optionA": "Standard Utility Vehicle",
      "optionB": "Super Urban Van",
      "optionC": "Sport Utility Vehicle",
      "optionD": "Speed Utility Van",
      "correct": "Sport Utility Vehicle"
    },
    {
      "topic": "Cars",
      "question": "Which German automaker's logo consists of four interlocking rings?",
      "optionA": "BMW",
      "optionB": "Volkswagen",
      "optionC": "Audi",
      "optionD": "Porsche",
      "correct": "Audi"
    },
    {
      "topic": "Cars",
      "question": "What type of car is the Tesla Model S?",
      "optionA": "Hybrid",
      "optionB": "Diesel",
      "optionC": "Gasoline",
      "optionD": "Electric",
      "correct": "Electric"
    },
    {
      "topic": "Cars",
      "question": "What does the 'Check Engine' light usually indicate?",
      "optionA": "Flat tire",
      "optionB": "Engine malfunction",
      "optionC": "Low fuel",
      "optionD": "Battery dead",
      "correct": "Engine malfunction"
    },
    {
      "topic": "Cars",
      "question": "Which component charges a car battery while the engine is running?",
      "optionA": "Starter motor",
      "optionB": "Alternator",
      "optionC": "Ignition coil",
      "optionD": "Fuel pump",
      "correct": "Alternator"
    },
    {
      "topic": "Cars",
      "question": "What does a tachometer measure?",
      "optionA": "Fuel level",
      "optionB": "Battery voltage",
      "optionC": "Engine RPM",
      "optionD": "Oil pressure",
      "correct": "Engine RPM"
    },
    {
      "topic": "Cars",
      "question": "What does a dual-clutch transmission improve?",
      "optionA": "Brake performance",
      "optionB": "Fuel economy",
      "optionC": "Gear shifting speed",
      "optionD": "Tire grip",
      "correct": "Gear shifting speed"
    },
    {
      "topic": "Cars",
      "question": "What is the function of a car’s differential?",
      "optionA": "Cool the engine",
      "optionB": "Distribute torque to wheels",
      "optionC": "Reduce emissions",
      "optionD": "Increase fuel pressure",
      "correct": "Distribute torque to wheels"
    },
    {
      "topic": "Cars",
      "question": "Which component ensures clean air enters the engine?",
      "optionA": "Oil filter",
      "optionB": "Fuel filter",
      "optionC": "Air filter",
      "optionD": "Cabin filter",
      "correct": "Air filter"
    },
    {
      "topic": "Cars",
      "question": "What is understeer?",
      "optionA": "Front tires lose grip before rear tires",
      "optionB": "Rear tires spin freely",
      "optionC": "Excess brake pressure",
      "optionD": "Engine stalls when turning",
      "correct": "Front tires lose grip before rear tires"
    },
    {
      "topic": "Cars",
      "question": "Which engine configuration is commonly found in sports cars for better weight distribution?",
      "optionA": "Inline-4",
      "optionB": "V6",
      "optionC": "Boxer",
      "optionD": "Rotary",
      "correct": "Boxer"
    },
    {
      "topic": "Cars",
      "question": "What is a dyno test used for?",
      "optionA": "Measuring fuel efficiency",
      "optionB": "Testing emissions",
      "optionC": "Measuring horsepower and torque",
      "optionD": "Aligning the wheels",
      "correct": "Measuring horsepower and torque"
    },
    {
      "topic": "Cars",
      "question": "What do paddle shifters control?",
      "optionA": "Brakes",
      "optionB": "Manual gear changes",
      "optionC": "Cruise control",
      "optionD": "Windshield wipers",
      "correct": "Manual gear changes"
    },
    {
      "topic": "Cars",
      "question": "Which of the following is NOT a drivetrain configuration?",
      "optionA": "RWD",
      "optionB": "AWD",
      "optionC": "FWD",
      "optionD": "TWD",
      "correct": "TWD"
    },
    {
      "topic": "Cars",
      "question": "What does ECU stand for in modern vehicles?",
      "optionA": "Electronic Control Unit",
      "optionB": "Engine Compression Utility",
      "optionC": "Electric Chassis Unit",
      "optionD": "Emission Control Unit",
      "correct": "Electronic Control Unit"
    },
    {
      "topic": "Cars",
      "question": "Which car brand produces the 911 model?",
      "optionA": "Ferrari",
      "optionB": "Chevrolet",
      "optionC": "Porsche",
      "optionD": "BMW",
      "correct": "Porsche"
    },
    {
      "topic": "Cars",
      "question": "What does the 'M' stand for in BMW's M series (e.g., M3, M5)?",
      "optionA": "Modified",
      "optionB": "Motorsport",
      "optionC": "Mechanical",
      "optionD": "Manual",
      "correct": "Motorsport"
    },
    {
      "topic": "Cars",
      "question": "Which car company owns the luxury brand Rolls-Royce?",
      "optionA": "Volkswagen",
      "optionB": "Mercedes-Benz",
      "optionC": "BMW",
      "optionD": "Ford",
      "correct": "BMW"
    },
    {
      "topic": "Cars",
      "question": "What does CVT stand for in car transmissions?",
      "optionA": "Constant Valve Timing",
      "optionB": "Continuously Variable Transmission",
      "optionC": "Controlled Variable Torque",
      "optionD": "Cylindrical Valve Timing",
      "correct": "Continuously Variable Transmission"
    },
    {
      "topic": "Cars",
      "question": "Which country is the car brand Hyundai based in?",
      "optionA": "Japan",
      "optionB": "China",
      "optionC": "South Korea",
      "optionD": "Germany",
      "correct": "South Korea"
    },
    {
      "topic": "Cars",
      "question": "Which hybrid car model became globally famous in the early 2000s?",
      "optionA": "Chevy Volt",
      "optionB": "Ford Fusion Hybrid",
      "optionC": "Toyota Prius",
      "optionD": "Nissan Leaf",
      "correct": "Toyota Prius"
    },
    {
      "topic": "Cars",
      "question": "Which device measures the air pressure in a car's intake manifold?",
      "optionA": "Oxygen Sensor",
      "optionB": "MAF Sensor",
      "optionC": "MAP Sensor",
      "optionD": "Knock Sensor",
      "correct": "MAP Sensor"
    },
    {
      "topic": "Cars",
      "question": "Which car feature helps improve traction during acceleration?",
      "optionA": "ABS",
      "optionB": "Cruise Control",
      "optionC": "Traction Control System",
      "optionD": "Hill Start Assist",
      "correct": "Traction Control System"
    },
    {
      "topic": "Cars",
      "question": "What does a car’s VIN uniquely identify?",
      "optionA": "Engine size",
      "optionB": "Model year",
      "optionC": "Vehicle color",
      "optionD": "The entire vehicle",
      "correct": "The entire vehicle"
    },
    {
      "topic": "Cars",
      "question": "Which Italian brand is known for the Trident logo?",
      "optionA": "Ferrari",
      "optionB": "Alfa Romeo",
      "optionC": "Maserati",
      "optionD": "Fiat",
      "correct": "Maserati"
    },
    {
      "topic": "Cars",
      "question": "Which fuel has the highest octane rating?",
      "optionA": "Regular gasoline",
      "optionB": "Diesel",
      "optionC": "Premium gasoline",
      "optionD": "Ethanol",
      "correct": "Premium gasoline"
    },
    {
      "topic": "Cars",
      "question": "What does the term 'torque' refer to in a car?",
      "optionA": "Top speed",
      "optionB": "Fuel consumption",
      "optionC": "Rotational force of the engine",
      "optionD": "Engine noise",
      "correct": "Rotational force of the engine"
    },
    {
      "topic": "Cars",
      "question": "Which company developed the first modern assembly line?",
      "optionA": "General Motors",
      "optionB": "Chrysler",
      "optionC": "Ford",
      "optionD": "Toyota",
      "correct": "Ford"
    },
    {
      "topic": "Cars",
      "question": "What does a limited-slip differential do?",
      "optionA": "Prevents tire rotation",
      "optionB": "Evenly splits power between front and back wheels",
      "optionC": "Distributes torque between wheels to reduce wheel spin",
      "optionD": "Controls engine heat",
      "correct": "Distributes torque between wheels to reduce wheel spin"
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
    },
    {
      "topic": "Countries",
      "question": "Which country is known as the Land of the Rising Sun?",
      "optionA": "South Korea",
      "optionB": "China",
      "optionC": "Thailand",
      "optionD": "Japan",
      "correct": "Japan"
    },
    {
      "topic": "Countries",
      "question": "Which country has the most official languages?",
      "optionA": "India",
      "optionB": "Switzerland",
      "optionC": "South Africa",
      "optionD": "Belgium",
      "correct": "South Africa"
    },
    {
      "topic": "Countries",
      "question": "What is the only country that is also a continent?",
      "optionA": "Russia",
      "optionB": "India",
      "optionC": "Australia",
      "optionD": "Greenland",
      "correct": "Australia"
    },
    {
      "topic": "Countries",
      "question": "Which country shares the longest land border with the USA?",
      "optionA": "Mexico",
      "optionB": "Canada",
      "optionC": "Russia",
      "optionD": "Cuba",
      "correct": "Canada"
    },
    {
      "topic": "Countries",
      "question": "Which country is famous for the Eiffel Tower?",
      "optionA": "Germany",
      "optionB": "France",
      "optionC": "Italy",
      "optionD": "Spain",
      "correct": "France"
    },
    {
      "topic": "Countries",
      "question": "Which country is the smallest in the world by area?",
      "optionA": "Monaco",
      "optionB": "San Marino",
      "optionC": "Vatican City",
      "optionD": "Liechtenstein",
      "correct": "Vatican City"
    },
    {
      "topic": "Countries",
      "question": "Which country has the longest coastline in the world?",
      "optionA": "Australia",
      "optionB": "Russia",
      "optionC": "USA",
      "optionD": "Canada",
      "correct": "Canada"
    },
    {
      "topic": "Countries",
      "question": "Which African country has the highest population?",
      "optionA": "South Africa",
      "optionB": "Ethiopia",
      "optionC": "Nigeria",
      "optionD": "Kenya",
      "correct": "Nigeria"
    },
    {
      "topic": "Countries",
      "question": "Which country is home to the city of Machu Picchu?",
      "optionA": "Chile",
      "optionB": "Mexico",
      "optionC": "Peru",
      "optionD": "Brazil",
      "correct": "Peru"
    },
    {
      "topic": "Countries",
      "question": "Which European country uses the forint as its currency?",
      "optionA": "Hungary",
      "optionB": "Poland",
      "optionC": "Czech Republic",
      "optionD": "Slovakia",
      "correct": "Hungary"
    },
    {
      "topic": "Countries",
      "question": "Which country is the only one to have a non-rectangular flag?",
      "optionA": "Nepal",
      "optionB": "Bhutan",
      "optionC": "Sri Lanka",
      "optionD": "Maldives",
      "correct": "Nepal"
    },
    {
      "topic": "Countries",
      "question": "Which country has a maple leaf on its flag?",
      "optionA": "USA",
      "optionB": "Canada",
      "optionC": "UK",
      "optionD": "Denmark",
      "correct": "Canada"
    },
    {
      "topic": "Countries",
      "question": "Which country is famous for the Great Wall?",
      "optionA": "Japan",
      "optionB": "India",
      "optionC": "China",
      "optionD": "South Korea",
      "correct": "China"
    },
    {
      "topic": "Countries",
      "question": "Which country does Greenland belong to?",
      "optionA": "USA",
      "optionB": "Norway",
      "optionC": "Iceland",
      "optionD": "Denmark",
      "correct": "Denmark"
    },
    {
      "topic": "Countries",
      "question": "What is the capital city of Brazil?",
      "optionA": "São Paulo",
      "optionB": "Rio de Janeiro",
      "optionC": "Brasília",
      "optionD": "Belo Horizonte",
      "correct": "Brasília"
    },
    {
      "topic": "Countries",
      "question": "Which country has the most time zones?",
      "optionA": "United States",
      "optionB": "France",
      "optionC": "Russia",
      "optionD": "China",
      "correct": "France"
    },
    {
      "topic": "Countries",
      "question": "Which country is known for inventing pizza?",
      "optionA": "France",
      "optionB": "Greece",
      "optionC": "Italy",
      "optionD": "Spain",
      "correct": "Italy"
    },
    {
      "topic": "Countries",
      "question": "Which two countries share the longest uninterrupted international border?",
      "optionA": "Russia and China",
      "optionB": "USA and Mexico",
      "optionC": "Canada and USA",
      "optionD": "India and China",
      "correct": "Canada and USA"
    },
    {
      "topic": "Countries",
      "question": "Which country has the most volcanoes?",
      "optionA": "Indonesia",
      "optionB": "Japan",
      "optionC": "USA",
      "optionD": "Italy",
      "correct": "Indonesia"
    },
    {
      "topic": "Countries",
      "question": "Which is the only country to span four hemispheres?",
      "optionA": "Brazil",
      "optionB": "Russia",
      "optionC": "Kiribati",
      "optionD": "Indonesia",
      "correct": "Kiribati"
    },
    {
      "topic": "Countries",
      "question": "Which country is landlocked?",
      "optionA": "Bangladesh",
      "optionB": "Nepal",
      "optionC": "Vietnam",
      "optionD": "Malaysia",
      "correct": "Nepal"
    },
    {
      "topic": "Countries",
      "question": "Which country is both in Europe and Asia?",
      "optionA": "Kazakhstan",
      "optionB": "Turkey",
      "optionC": "Georgia",
      "optionD": "All of the above",
      "correct": "All of the above"
    },
    {
      "topic": "Countries",
      "question": "What is the official language of Egypt?",
      "optionA": "French",
      "optionB": "Arabic",
      "optionC": "English",
      "optionD": "Berber",
      "correct": "Arabic"
    },
    {
      "topic": "Countries",
      "question": "Which country is known as the 'Pearl of Africa'?",
      "optionA": "Kenya",
      "optionB": "Rwanda",
      "optionC": "Uganda",
      "optionD": "Tanzania",
      "correct": "Uganda"
    },
    {
      "topic": "Countries",
      "question": "Which country lies completely below sea level?",
      "optionA": "Sweden",
      "optionB": "Netherlands",
      "optionC": "Belgium",
      "optionD": "Finland",
      "correct": "Netherlands"
    },
    {
      "topic": "Countries",
      "question": "Which South American country is the only one with both Pacific and Atlantic coastlines?",
      "optionA": "Brazil",
      "optionB": "Colombia",
      "optionC": "Chile",
      "optionD": "Argentina",
      "correct": "Colombia"
    },
    {
      "topic": "Countries",
      "question": "Which country is home to the ancient city of Petra?",
      "optionA": "Jordan",
      "optionB": "Egypt",
      "optionC": "Syria",
      "optionD": "Iraq",
      "correct": "Jordan"
    },
    {
      "topic": "Countries",
      "question": "Which country has a red circle on a white background as its flag?",
      "optionA": "China",
      "optionB": "Japan",
      "optionC": "South Korea",
      "optionD": "Indonesia",
      "correct": "Japan"
    },
    {
      "topic": "Countries",
      "question": "Which country is known for building the tallest building in the world, the Burj Khalifa?",
      "optionA": "Qatar",
      "optionB": "Saudi Arabia",
      "optionC": "United Arab Emirates",
      "optionD": "Oman",
      "correct": "United Arab Emirates"
    },
    {
      "topic": "Countries",
      "question": "What is the capital of Turkey?",
      "optionA": "Istanbul",
      "optionB": "Ankara",
      "optionC": "Izmir",
      "optionD": "Bursa",
      "correct": "Ankara"
    },
    {
      "topic": "Countries",
      "question": "Which country is known for the maple leaf symbol?",
      "optionA": "USA",
      "optionB": "UK",
      "optionC": "Canada",
      "optionD": "Switzerland",
      "correct": "Canada"
    },
    {
      "topic": "Countries",
      "question": "Which country is completely surrounded by Italy?",
      "optionA": "Vatican City",
      "optionB": "San Marino",
      "optionC": "Liechtenstein",
      "optionD": "Monaco",
      "correct": "San Marino"
    },
    {
      "topic": "Countries",
      "question": "Which island nation lies off the southeast coast of Africa?",
      "optionA": "Sri Lanka",
      "optionB": "Fiji",
      "optionC": "Madagascar",
      "optionD": "New Zealand",
      "correct": "Madagascar"
    },
    {
      "topic": "Countries",
      "question": "Which Asian country was formerly known as Siam?",
      "optionA": "Thailand",
      "optionB": "Vietnam",
      "optionC": "Cambodia",
      "optionD": "Laos",
      "correct": "Thailand"
    },
    {
      "topic": "Countries",
      "question": "What is the currency of the United Kingdom?",
      "optionA": "Euro",
      "optionB": "Pound Sterling",
      "optionC": "Dollar",
      "optionD": "Franc",
      "correct": "Pound Sterling"
    },
    {
      "topic": "Countries",
      "question": "Which country is famous for tulips, windmills, and canals?",
      "optionA": "Belgium",
      "optionB": "Netherlands",
      "optionC": "Switzerland",
      "optionD": "Germany",
      "correct": "Netherlands"
    },
    {
      "topic": "Countries",
      "question": "What is the most widely spoken language in Brazil?",
      "optionA": "Spanish",
      "optionB": "Portuguese",
      "optionC": "French",
      "optionD": "English",
      "correct": "Portuguese"
    },
    {
      "topic": "Countries",
      "question": "Which country is the most recent to join the United Nations (as of 2023)?",
      "optionA": "South Sudan",
      "optionB": "Palau",
      "optionC": "East Timor",
      "optionD": "Montenegro",
      "correct": "South Sudan"
    },
    {
      "topic": "Countries",
      "question": "Which Scandinavian country is not a member of the European Union?",
      "optionA": "Denmark",
      "optionB": "Sweden",
      "optionC": "Norway",
      "optionD": "Finland",
      "correct": "Norway"
    },
    {
      "topic": "Countries",
      "question": "Which country has the city of Casablanca?",
      "optionA": "Algeria",
      "optionB": "Egypt",
      "optionC": "Morocco",
      "optionD": "Tunisia",
      "correct": "Morocco"
    },
    {
      "topic": "Countries",
      "question": "Which country lies on both the Equator and the Prime Meridian?",
      "optionA": "Gabon",
      "optionB": "Ecuador",
      "optionC": "Ghana",
      "optionD": "Indonesia",
      "correct": "Gabon"
    },
    {
      "topic": "Countries",
      "question": "Which country has the most Nobel Prize laureates?",
      "optionA": "Germany",
      "optionB": "USA",
      "optionC": "France",
      "optionD": "UK",
      "correct": "USA"
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