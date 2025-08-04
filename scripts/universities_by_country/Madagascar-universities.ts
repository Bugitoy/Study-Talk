import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Madagascar_universities = [

    // Madagascar

    { name: "Université d'Antananarivo", domain: "univ-antananarivo.mg", region: "Africa", country: "Madagascar", isVerified: true },
    { name: "Université de Toliara", domain: "univ-toliara.mg", region: "Africa", country: "Madagascar", isVerified: true },
    { name: "Université de Fianarantsoa", domain: "univ-fianar.mg", region: "Africa", country: "Madagascar", isVerified: true },
    { name: "Université de Mahajanga", domain: "univ-mahajanga.mg", region: "Africa", country: "Madagascar", isVerified: true },
    { name: "Université de Toamasina", domain: "univ-toamasina.mg", region: "Africa", country: "Madagascar", isVerified: true },
    { name: "Université d'Antsiranana", domain: "univ-antsiranana.mg", region: "Africa", country: "Madagascar", isVerified: true },
]