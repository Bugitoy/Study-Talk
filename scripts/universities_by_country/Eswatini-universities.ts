import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Eswatini_universities = [

    // Eswatini

    { name: "University of Eswatini", domain: "uniswa.sz", region: "Africa", country: "Eswatini", isVerified: true },
    { name: "Southern African Nazarene University", domain: "sanu.ac.sz", region: "Africa", country: "Eswatini", isVerified: true },
    { name: "Eswatini Medical Christian University", domain: "emcu.ac.sz", region: "Africa", country: "Eswatini", isVerified: true },
    { name: "Ngwane Teacher's College", domain: "ntc.org.sz", region: "Africa", country: "Eswatini", isVerified: true },
    { name: "Springfield Research University", domain: "springfielduniversity.org", region: "Africa", country: "Eswatini", isVerified: false },
    { name: "Eswatini College of Technology", domain: "ecotech.ac.sz", region: "Africa", country: "Eswatini", isVerified: true },
    { name: "Limkokwing University of Creative Technology Swaziland", domain: "limkokwing.ac.sz", region: "Africa", country: "Eswatini", isVerified: true },
]