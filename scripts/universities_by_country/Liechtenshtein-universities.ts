import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Liechtenshtein_universities = [

    // Liechtenshtein

    { name: "Universität Liechtenstein", domain: "uni.li", region: "Europe", country: "Liechtenstein", isVerified: true },
    { name: "Private Universität im fürstentum Liechtenstein", domain: "ufl.li", region: "Europe", country: "Liechtenstein", isVerified: true },
]