import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Chad_universities = [

   // Chad

   { name: "Université de N'Djaména", domain: "universite-ndjamena.td", region: "Africa", country: "Chad", isVerified: true },
   { name: "Université Emi Koussi", domain: "universite-emikoussi.net", region: "Africa", country: "Chad", isVerified: true },
   { name: "Université de Moundou", domain: "univ-mdou.org", region: "Africa", country: "Chad", isVerified: true },
   { name: "École Nationale d'Administration, Tchad", domain: "ena.td", region: "Africa", country: "Chad", isVerified: true },
   { name: "Université de Sarh", domain: "uds.td", region: "Africa", country: "Chad", isVerified: true },
   { name: "Université de Doba", domain: null, region: "Africa", country: "Chad", isVerified: false },
   { name: "Université Adam Barka d'Abéché", domain: "univ-abeche.com", region: "Africa", country: "Chad", isVerified: true },
   { name: "Université Roi Fayçal", domain: null, region: "Africa", country: "Chad", isVerified: false },
   { name: "Université des Sciences et de Technologie d'Ati", domain: null, region: "Africa", country: "Chad", isVerified: false },
]