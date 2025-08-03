import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Mauritania_universities = [

    // Mauritania

    { name: "Université des Sciences, de Technologie et de Médecine", domain: "ustm.mr", isVerified: true },
    { name: "École Nationale d'Administration, de Journalisme et de Magistrature", domain: "enajm.mr", isVerified: true },
    { name: "Université Libanaise Internationale en Mauritanie", domain: "liu.mr", isVerified: true },
    { name: "Institut Supérieur d'Etudes et de Recherche Islamiques", domain: "iseri.mr", isVerified: true },
]