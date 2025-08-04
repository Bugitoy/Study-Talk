import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Seychelles_universities = [

   // Seychelles

   { name: "University of Seychelles", domain: "unisey.ac.sc", region: "Africa", country: "Seychelles", isVerified: true },
   { name: "Seychelles Polytechnic", domain: "seypoly.edu.sc", region: "Africa", country: "Seychelles", isVerified: true },
   { name: "ATAFOM University International", domain: "atafom.university", region: "Africa", country: "Seychelles", isVerified: true },
   { name: "University of Seychelles - American Institute of Medicine", domain: "usaim.edu", region: "Africa", country: "Seychelles", isVerified: true },
]