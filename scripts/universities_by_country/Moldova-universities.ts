import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Moldova_universities = [

   // Moldova

   { name: "Universitatea Tehnică a Moldovei", domain: "utm.md", isVerified: true },
   { name: "Universitatea de Stat din Moldova", domain: "usm.md", isVerified: true },
   { name: "Universitatea de Stat de Medicină și Farmacie", domain: "usmf.md", isVerified: true },
   { name: "Academia de Studii Economice din Moldova", domain: "ase.md", isVerified: true },
   { name: "Universitatea Liberă Internațională din Moldova", domain: "ulim.md", isVerified: true },
   { name: "Universitatea Pedagogică de Stat Ion Creangă", domain: "upsc.md", isVerified: true },
   { name: "Universitatea de Stat „Alecu Russo”", domain: "usarb.md", isVerified: true },
   { name: "Universitatea de Stat din Comrat", domain: "kdu.md", isVerified: true },
   { name: "Universitatea Academiei de Științe a Moldovei", domain: "edu.asm.md", isVerified: true },
   { name: "Universitatea Cooperatist-Comercială din Moldova", domain: "uccm.md", isVerified: true },
   { name: "Academia de Muzică, Teatru și Arte Plastice", domain: "amtap.md", isVerified: true },
   { name: "Universitatea de Stat „Bogdan Petriceicu Hasdeu”", domain: "usch.md", isVerified: true },
   { name: "Universitatea de Studii Politice și Economice Europene", domain: "uspee.md", isVerified: true },
   { name: "Universitatea de Studii Europene din Moldova", domain: "usem.md", isVerified: true },
   { name: "Universitatea de Stat de Educație Fizică și Sport", domain: "usefs.md", isVerified: true },
   { name: "Universitatea de Stat din Taraclia", domain: "tdu-tar.md", isVerified: true },
   { name: "Universitatea Slavonă", domain: "surm.md", isVerified: true },
   { name: "Universitatea de Științe Aplicative din Moldova", domain: "usam.md", isVerified: true },
   { name: "Universitatea „Perspectiva - INT”", domain: "perspectiva.md", isVerified: true },
]