import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Jamaica_universities = [

   // Jamaica

   { name: "University of Technology, Jamaica", domain: "utech.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "Northern Caribbean University", domain: "ncu.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "The University of the West Indies, Mona", domain: "uwimona.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "Caribbean Maritime University", domain: "cmu.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "University of the Commonwealth Caribbean", domain: "ucc.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "Mico University College", domain: "themico.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "College of Agriculture Science and Education", domain: "case.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
   { name: "All American Institute of Medical Sciences", domain: "aaims.edu.jm", region: "North America", country: "Jamaica", isVerified: true },
]