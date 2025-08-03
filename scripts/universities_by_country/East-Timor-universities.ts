import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const East_Timor_universities = [

   // East Timor

   { name: "Universidade Nacional Timor Lorosa'e", domain: "untl.edu.tl", isVerified: true },
   { name: "East Timor Institute of Business", domain: "etib.edu.tl", isVerified: true },
   { name: "Universidade Oriental Timor Lorosa'e", domain: "uot.edu.tl", isVerified: true },
   { name: "Universidade de Díli", domain: "udl.edu.tl", isVerified: true },
   { name: "Universidade da Paz", domain: null, isVerified: false },
   { name: "Dili Institute of Technology", domain: "dit.edu.tl", isVerified: true },
   { name: "Instituto Superior Cristal", domain: null, isVerified: false },
   { name: "East Timor Coffee Institute", domain: null, isVerified: false },
]