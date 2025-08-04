import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Papua_and_New_Guinea_universities = [

   // Papua New Guinea

   { name: "Divine Word University", domain: "divineword.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },  
   { name: "University of Papua New Guinea", domain: "upng.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },  
   { name: "Papua New Guinea University of Technology", domain: "unitech.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },  
   { name: "The University of Goroka", domain: "uog.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },  
   { name: "Pacific Adventist University", domain: "pau.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },  
   { name: "PNG University of Natural Resources and Environment", domain: "punre.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },  
   { name: "IBS University", domain: "ibsu.ac.pg", region: "Oceania", country: "Papua New Guinea", isVerified: true },
]