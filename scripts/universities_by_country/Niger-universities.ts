import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Niger_universities = [

   // Niger

   { name: "Université Abdou Moumouni", domain: "uam.edu.ne", region: "Africa", country: "Niger", isVerified: true },                     
   { name: "African Development Universalis", domain: "ilimi.edu.ne", region: "Africa", country: "Niger", isVerified: true },            
   { name: "Université Islamique de Say", domain: "universite-say.com", region: "Africa", country: "Niger", isVerified: true },
   { name: "Université de Niamey", domain: "un.ne", region: "Africa", country: "Niger", isVerified: true },
   { name: "Université de Maroua", domain: "univ-maroua.ne", region: "Africa", country: "Niger", isVerified: true },
   { name: "Université de Zinder", domain: "univ-zinder.ne", region: "Africa", country: "Niger", isVerified: true },
   { name: "Université de Tahoua", domain: "univ-tahoua.ne", region: "Africa", country: "Niger", isVerified: true },
   { name: "Université de Tchintabaraden", domain: "univ-tchintabaraden.ne", region: "Africa", country: "Niger", isVerified: true },
   { name: "Université de Birni N'Konni", domain: "univ-birni-konni.ne", region: "Africa", country: "Niger", isVerified: true },
]