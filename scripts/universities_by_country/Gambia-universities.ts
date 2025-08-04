import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Gambia_universities = [

    // Gambia

    { name: "University of the Gambia", domain: "ug.edu.gm", region: "Africa", country: "Gambia", isVerified: true },
    { name: "American International University West Africa", domain: "aiu.edu.gm", region: "Africa", country: "Gambia", isVerified: true }, 
]