import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Belize_universities = [

   // Belize

   { name: "University of Belize", domain: "ub.edu.bz", region: "North America", country: "Belize", isVerified: true },
   { name: "Galen University", domain: "galen.edu.bz", region: "North America", country: "Belize", isVerified: true },
   { name: "Central America Health Sciences University, Belize Medical College", domain: "cahsu.edu.bz", region: "North America", country: "Belize", isVerified: true },
]