import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Barbados_universities = [

   // Barbados

   { name: "Ross University School of Medicine", domain: "medical.rossu.edu", region: "North America", country: "Barbados", isVerified: true },
   { name: "The University of the West Indies, Cave Hill Campus", domain: "cavehill.uwi.edu", region: "North America", country: "Barbados", isVerified: true },
   { name: "American University of Integrative Sciences", domain: "auis.edu", region: "North America", country: "Barbados", isVerified: true },
   { name: "American University of Barbados School of Medicine", domain: "aubmed.org", region: "North America", country: "Barbados", isVerified: true },
]