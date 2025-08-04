import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Jordan_universities = [

    // Jordan
  
    { name: "University of Jordan", domain: "ju.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Jordan University of Science and Technology", domain: "just.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Yarmouk University", domain: "yu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Al-Balqa' Applied University", domain: "bau.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "The Hashemite University", domain: "hu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Amman Arab University", domain: "aau.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Al-Ahliyya Amman University", domain: "ammanu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Philadelphia University", domain: "philadelphia.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Princess Sumaya University for Technology", domain: "psut.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "German Jordanian University", domain: "gju.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Middle East University, Jordan", domain: "meu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Al-Zaytoonah University of Jordan", domain: "zut.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Mutah university", domain: "mutah.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Applied Science Private University", domain: "asu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Al-Hussein Bin Talal University", domain: "ahu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Al al-Bayt University", domain: "aabu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Zarqa University", domain: "zu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "University of Petra", domain: "uop.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "The World Islamic Sciences and Education University", domain: "wise.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Tafila Technical University", domain: "ttu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Jerash Private University", domain: "jpu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Isra University", domain: "isra.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Jadara University", domain: "jadara.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Al Hussein Technical University", domain: "ahtu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Irbid National University", domain: "inu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "American University of Madaba", domain: "aum.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Aqaba University of Technology", domain: "aut.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Ajloun National Private University", domain: "anpu.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Ammon Applied University College", domain: "ammon.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
    { name: "Jordan Academy of Music", domain: "jam.edu.jo", region: "Asia", country: "Jordan", isVerified: true },
]