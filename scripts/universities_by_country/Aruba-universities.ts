import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Aruba_universities = [

   // Aruba

   { name: "University of Aruba", domain: "ua.aw", region: "North America", country: "Aruba", isVerified: true },
   { name: "Xavier University School of Medicine", domain: "xusom.com", region: "North America", country: "Aruba", isVerified: true },
   { name: "Aureus University School of Medicine", domain: "aureusuniversity.com", region: "North America", country: "Aruba", isVerified: true },
   { name: "Instituto Pedagogico Arubano", domain: "ipaaruba.com", region: "North America", country: "Aruba", isVerified: true },
]