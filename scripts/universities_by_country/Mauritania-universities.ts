import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Mauritania_universities = [

    // Mauritania

    { name: "Université des Sciences, de Technologie et de Médecine", domain: "ustm.mr", region: "Africa", country: "Mauritania", isVerified: true },
    { name: "École Nationale d'Administration, de Journalisme et de Magistrature", domain: "enajm.mr", region: "Africa", country: "Mauritania", isVerified: true },
    { name: "Université Libanaise Internationale en Mauritanie", domain: "liu.mr", region: "Africa", country: "Mauritania", isVerified: true },
    { name: "Institut Supérieur d'Etudes et de Recherche Islamiques", domain: "iseri.mr", region: "Africa", country: "Mauritania", isVerified: true },
]