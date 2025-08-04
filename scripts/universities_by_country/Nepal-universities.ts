import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Nepal_universities = [

    //  Nepal

    { name: "Tribhuvan University", domain: "tu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Kathmandu University", domain: "ku.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Pokhara University", domain: "pu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Agriculture and Forestry University", domain: "afu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Far Western University", domain: "fwu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Purbanchal University", domain: "purbanchaluniversity.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Lumbini Buddhist University", domain: "lbu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Mid Western University", domain: "mwu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
    { name: "Nepal Sanskrit University", domain: "nsu.edu.np", region: "Asia", country: "Nepal", isVerified: true },
]