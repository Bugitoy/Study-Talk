import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Macau_universities = [

    // Macau

    { name: "Universidade de Macau", domain: "um.edu.mo", isVerified: true },
    { name: "Macau University of Science and Technology", domain: "must.edu.mo", isVerified: true },
    { name: "Universidade Politécnica de Macau", domain: "ipm.edu.mo", isVerified: true },
    { name: "Universidade de Turismo de Macau", domain: "ift.edu.mo", isVerified: true },
    { name: "University of Saint Joseph, Macao", domain: "usj.edu.mo", isVerified: true },
    { name: "Kiang Wu Nursing College of Macau", domain: "kwnc.edu.mo", isVerified: true },
    { name: "Macau Millennium College", domain: "mmc.edu.mo", isVerified: true },
    { name: "Instituto de Gestão de Macau", domain: "mim.edu.mo", isVerified: true },
]