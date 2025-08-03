import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Eswatini_universities = [

    // Eswatini

    { name: "University of Eswatini", domain: "uniswa.sz", isVerified: true },
    { name: "Southern African Nazarene University", domain: "sanu.ac.sz", isVerified: true },
    { name: "Eswatini Medical Christian University", domain: "emcu.ac.sz", isVerified: true },
    { name: "Ngwane Teacher's College", domain: "ntc.org.sz", isVerified: true },
    { name: "Springfield Research University", domain: "springfielduniversity.org", isVerified: false },
    { name: "Eswatini College of Technology", domain: "ecotech.ac.sz", isVerified: true },
    { name: "Limkokwing University of Creative Technology Swaziland", domain: "limkokwing.ac.sz", isVerified: true },
]