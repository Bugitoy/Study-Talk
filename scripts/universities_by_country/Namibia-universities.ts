import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Namibia_universities = [

   // Namibia

   { name: "University of Namibia", domain: "unam.edu.na", region: "Africa", country: "Namibia", isVerified: true },
   { name: "Namibia University of Science and Technology", domain: "nust.edu.na", region: "Africa", country: "Namibia", isVerified: true },
   { name: "Namibia Institute of Technology", domain: "nit.edu.na", region: "Africa", country: "Namibia", isVerified: true },
   { name: "International University of Management", domain: "ium.edu.na", region: "Africa", country: "Namibia", isVerified: true },
]