import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const New_Zealand_universities = [

   // New Zealand

   { name: "University of Auckland", domain: "auckland.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "University of Otago", domain: "otago.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "Victoria University of Wellington", domain: "wgtn.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "Massey University", domain: "massey.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "University of Canterbury", domain: "canterbury.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "University of Waikato", domain: "waikato.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "Auckland University of Technology", domain: "aut.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },
   { name: "Lincoln University", domain: "lincoln.ac.nz", region: "Oceania", country: "New Zealand", isVerified: true },  
]