import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Kuwait_universities = [

    // Kuwait
  
    { name: "Kuwait University", domain: "ku.edu.kw", isVerified: true },
    { name: "Gulf University for Science and Technology", domain: "gust.edu.kw", isVerified: true },
    { name: "American University of Kuwait", domain: "auk.edu.kw", isVerified: true },
    { name: "Australian University of Kuwait", domain: "au.edu.kw", isVerified: true },
    { name: "Kuwait Maastricht College of Management", domain: "kuwait-mcm.com", isVerified: true },
]