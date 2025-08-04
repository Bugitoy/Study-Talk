import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Kuwait_universities = [

    // Kuwait
  
    { name: "Kuwait University", domain: "ku.edu.kw", region: "Asia", country: "Kuwait", isVerified: true },
    { name: "Gulf University for Science and Technology", domain: "gust.edu.kw", region: "Asia", country: "Kuwait", isVerified: true },
    { name: "American University of Kuwait", domain: "auk.edu.kw", region: "Asia", country: "Kuwait", isVerified: true },
    { name: "Australian University of Kuwait", domain: "au.edu.kw", region: "Asia", country: "Kuwait", isVerified: true },
    { name: "Kuwait Maastricht College of Management", domain: "kuwait-mcm.com", region: "Asia", country: "Kuwait", isVerified: true },
]