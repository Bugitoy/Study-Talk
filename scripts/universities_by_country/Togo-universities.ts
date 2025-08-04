import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Togo_universities = [

   // Togo

   { name: "Université de Lomé", domain: "univ-lome.tg", region: "Africa", country: "Togo", isVerified: true },
   { name: "Université de Kara", domain: "univ-kara.org", region: "Africa", country: "Togo", isVerified: true },
   { name: "Université Catholique de l'Afrique de l'Ouest - Unité Universitaire du Togo", domain: "ucao-uub.com", region: "Africa", country: "Togo", isVerified: true },
   { name: "Université des Sciences et Technologies du Togo", domain: "rusta-usttg.org", region: "Africa", country: "Togo", isVerified: true },
]