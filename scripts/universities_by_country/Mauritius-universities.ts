import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Mauritius_universities = [

    // Mauritius

    { name: "University of Mauritius", domain: "uom.ac.mu", isVerified: true },
    { name: "University of Technology, Mauritius", domain: "utm.ac.mu", isVerified: true },
    { name: "Mauritius Institute of Education", domain: "mie.ac.mu", isVerified: true },
    { name: "Université des Mascareignes", domain: "udm.ac.mu", isVerified: true },
    { name: "Mahatma Gandhi Institute", domain: "mgirti.ac.mu", isVerified: true },
]