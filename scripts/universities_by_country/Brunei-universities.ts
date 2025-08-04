import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Brunei_universities = [

   // Brunei

   { name: "Universiti Brunei Darussalam", domain: "ubd.edu.bn", region: "Asia", country: "Brunei", isVerified: true },
   { name: "Universiti Teknologi Brunei", domain: "utb.edu.bn", region: "Asia", country: "Brunei", isVerified: true },
   { name: "Universiti Islam Sultan Sharif Ali", domain: "unissa.edu.bn", region: "Asia", country: "Brunei", isVerified: true },
   { name: "Politeknik Brunei", domain: "pb.edu.bn", region: "Asia", country: "Brunei", isVerified: true },  
]