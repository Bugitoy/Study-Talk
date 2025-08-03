import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Gambia_universities = [

    // Gambia

    { name: "University of the Gambia", domain: "ug.edu.gm", isVerified: true },
    { name: "American International University West Africa", domain: "aiu.edu.gm", isVerified: true }, 
]