import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Nepal_universities = [

    //  Nepal

    { name: "Tribhuvan University", domain: "tu.edu.np", isVerified: true },
    { name: "Kathmandu University", domain: "ku.edu.np", isVerified: true },
    { name: "Pokhara University", domain: "pu.edu.np", isVerified: true },
    { name: "Agriculture and Forestry University", domain: "afu.edu.np", isVerified: true },
    { name: "Far Western University", domain: "fwu.edu.np", isVerified: true },
    { name: "Purbanchal University", domain: "purbanchaluniversity.edu.np", isVerified: true },
    { name: "Lumbini Buddhist University", domain: "lbu.edu.np", isVerified: true },
    { name: "Mid Western University", domain: "mwu.edu.np", isVerified: true },
    { name: "Nepal Sanskrit University", domain: "nsu.edu.np", isVerified: true },
]