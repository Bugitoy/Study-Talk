import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const East_Timor_universities = [

   // East Timor

   { name: "Universidade Nacional Timor Lorosa'e", domain: "untl.edu.tl", region: "Asia", country: "East Timor", isVerified: true },
   { name: "East Timor Institute of Business", domain: "etib.edu.tl", region: "Asia", country: "East Timor", isVerified: true },
   { name: "Universidade Oriental Timor Lorosa'e", domain: "uot.edu.tl", region: "Asia", country: "East Timor", isVerified: true },
   { name: "Universidade de Díli", domain: "udl.edu.tl", region: "Asia", country: "East Timor", isVerified: true },
   { name: "Universidade da Paz", domain: null, region: "Asia", country: "East Timor", isVerified: false },
   { name: "Dili Institute of Technology", domain: "dit.edu.tl", region: "Asia", country: "East Timor", isVerified: true },
   { name: "Instituto Superior Cristal", domain: null, region: "Asia", country: "East Timor", isVerified: false },
   { name: "East Timor Coffee Institute", domain: null, region: "Asia", country: "East Timor", isVerified: false },
]