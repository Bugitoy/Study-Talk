import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Lesotho_universities = [

    // Lesotho

    { name: "National University of Lesotho", domain: "nul.ls", region: "Africa", country: "Lesotho", isVerified: true },
    { name: "Lesotho College of Education", domain: "lce.ac.ls", region: "Africa", country: "Lesotho", isVerified: true },
]