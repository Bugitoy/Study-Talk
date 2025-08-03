import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Brunei_universities = [

   // Brunei

   { name: "Universiti Brunei Darussalam", domain: "ubd.edu.bn", isVerified: true },
   { name: "Universiti Teknologi Brunei", domain: "utb.edu.bn", isVerified: true },
   { name: "Universiti Islam Sultan Sharif Ali", domain: "unissa.edu.bn", isVerified: true },
   { name: "Politeknik Brunei", domain: "pb.edu.bn", isVerified: true },  
]