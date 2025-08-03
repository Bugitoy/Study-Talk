import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Madagascar_universities = [

    // Madagascar

    { name: "Université d'Antananarivo", domain: "univ-antananarivo.mg", isVerified: true },
    { name: "Université de Toliara", domain: "univ-toliara.mg", isVerified: true },
    { name: "Université de Fianarantsoa", domain: "univ-fianar.mg", isVerified: true },
    { name: "Université de Mahajanga", domain: "univ-mahajanga.mg", isVerified: true },
    { name: "Université de Toamasina", domain: "univ-toamasina.mg", isVerified: true },
    { name: "Université d'Antsiranana", domain: "univ-antsiranana.mg", isVerified: true },
]