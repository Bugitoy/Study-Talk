import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Jordan_universities = [

    // Jordan
  
    { name: "University of Jordan", domain: "ju.edu.jo", isVerified: true },
    { name: "Jordan University of Science and Technology", domain: "just.edu.jo", isVerified: true },
    { name: "Yarmouk University", domain: "yu.edu.jo", isVerified: true },
    { name: "Al-Balqa' Applied University", domain: "bau.edu.jo", isVerified: true },
    { name: "The Hashemite University", domain: "hu.edu.jo", isVerified: true },
    { name: "Amman Arab University", domain: "aau.edu.jo", isVerified: true },
    { name: "Al-Ahliyya Amman University", domain: "ammanu.edu.jo", isVerified: true },
    { name: "Philadelphia University", domain: "philadelphia.edu.jo", isVerified: true },
    { name: "Princess Sumaya University for Technology", domain: "psut.edu.jo", isVerified: true },
    { name: "German Jordanian University", domain: "gju.edu.jo", isVerified: true },
    { name: "Middle East University, Jordan", domain: "meu.edu.jo", isVerified: true },
    { name: "Al-Zaytoonah University of Jordan", domain: "zut.edu.jo", isVerified: true },
    { name: "Mutah university", domain: "mutah.edu.jo", isVerified: true },
    { name: "Applied Science Private University", domain: "asu.edu.jo", isVerified: true },
    { name: "Al-Hussein Bin Talal University", domain: "ahu.edu.jo", isVerified: true },
    { name: "Al al-Bayt University", domain: "aabu.edu.jo", isVerified: true },
    { name: "Zarqa University", domain: "zu.edu.jo", isVerified: true },
    { name: "University of Petra", domain: "uop.edu.jo", isVerified: true },
    { name: "The World Islamic Sciences and Education University", domain: "wise.edu.jo", isVerified: true },
    { name: "Tafila Technical University", domain: "ttu.edu.jo", isVerified: true },
    { name: "Jerash Private University", domain: "jpu.edu.jo", isVerified: true },
    { name: "Isra University", domain: "isra.edu.jo", isVerified: true },
    { name: "Jadara University", domain: "jadara.edu.jo", isVerified: true },
    { name: "Al Hussein Technical University", domain: "ahtu.edu.jo", isVerified: true },
    { name: "Irbid National University", domain: "inu.edu.jo", isVerified: true },
    { name: "American University of Madaba", domain: "aum.edu.jo", isVerified: true },
    { name: "Aqaba University of Technology", domain: "aut.edu.jo", isVerified: true },
    { name: "Ajloun National Private University", domain: "anpu.edu.jo", isVerified: true },
    { name: "Ammon Applied University College", domain: "ammon.edu.jo", isVerified: true },
    { name: "Jordan Academy of Music", domain: "jam.edu.jo", isVerified: true },
]