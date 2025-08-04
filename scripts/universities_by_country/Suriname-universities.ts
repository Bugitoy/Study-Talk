import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Suriname_universities = [

   // Suriname

   { name: "Anton de Kom Universiteit van Suriname", domain: "uvs.edu", region: "South America", country: "Suriname", isVerified: true },
   { name: "Polytechnic College Suriname", domain: "ptc.edu.sr", region: "South America", country: "Suriname", isVerified: true },
   { name: "Academie voor Hoger Kunst- en Cultuuronderwijs", domain: "ahkco.sr", region: "South America", country: "Suriname", isVerified: true },
   { name: "Institute for Training of Advanced Teachers", domain: "iol-edu.sr", region: "South America", country: "Suriname", isVerified: true },
]