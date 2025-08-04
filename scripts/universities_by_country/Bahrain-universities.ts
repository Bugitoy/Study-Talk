import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Bahrain_universities = [

   // Bahrain

   { name: "University of Bahrain", domain: "uob.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Arabian Gulf University", domain: "agu.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Ahlia University", domain: "ahlia.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Bahrain Institute for Banking and Finance", domain: "bibf.com", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Applied Science University", domain: "asu.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Gulf University", domain: "gu.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "University College of Bahrain", domain: "ucb.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Kingdom University", domain: "ku.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Royal University for Women", domain: "ruw.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "University of Technology Bahrain", domain: "utb.edu.bh", region: "Asia", country: "Bahrain", isVerified: true },
   { name: "Royal College of Surgeons in Ireland - Medical University of Bahrain", domain: "rcsi-mub.com", region: "Asia", country: "Bahrain", isVerified: true },
]