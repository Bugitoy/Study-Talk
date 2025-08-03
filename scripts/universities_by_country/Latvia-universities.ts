import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Latvia_universities = [

   // Latvia

   { name: "Latvijas Universitāte", domain: "lu.lv", isVerified: true },
   { name: "Rīgas Tehniskā universitāte", domain: "rtu.lv", isVerified: true },
   { name: "Rīgas Stradiņa Universitāte", domain: "rsu.lv", isVerified: true },
   { name: "Latvijas Biozinātņu un tehnoloģiju universitāte", domain: "lbtu.lv", isVerified: true },
   { name: "Rīgas Ekonomikas augstskola", domain: "sseriga.edu.lv", isVerified: true },
   { name: "Rēzeknes Tehnoloģiju Akadēmija", domain: "rta.lv", isVerified: true },
   { name: "Daugavpils Universitāte", domain: "du.lv", isVerified: true },
   { name: "Biznesa augstskola Turība", domain: "turiba.lv", isVerified: true },
   { name: "Vidzemes Augstskola", domain: "va.lv", isVerified: true },
   { name: "Latvijas Mākslas akadēmija", domain: "lma.lv", isVerified: true },
   { name: "Transporta un sakaru institūts", domain: "tsi.lv", isVerified: true },
   { name: "Ventspils Augstskola", domain: "venta.lv", isVerified: true },
   { name: "Rīgas Juridiskā augstskola", domain: "rgsl.edu.lv", isVerified: true },
   { name: "Latvijas Kultūras akadēmija", domain: "lka.edu.lv", isVerified: true },
   { name: "Baltijas Starptautiskā akadēmija", domain: "bsa.edu.lv", isVerified: true },
   { name: "Liepājas Universitāte", domain: "liepu.lv", isVerified: true },
   { name: "RISEBA University of Applied Sciences", domain: "riseba.lv", isVerified: true },
   { name: "Ekonomikas un kultūras augstskola", domain: "eka.edu.lv", isVerified: true },
   { name: "Banku augstskola", domain: "ba.lv", isVerified: true },
   { name: "Jāzepa Vītola Latvijas mūzikas akadēmija", domain: "jvlma.lv", isVerified: true },
   { name: "Informācijas sistēmu menedžmenta augstskola", domain: "isma.lv", isVerified: true },
   { name: "Latvijas Sporta pedagoģijas akadēmija", domain: "lspa.lv", isVerified: true },
   { name: "Eiropas Kristīgā akadēmija", domain: "eca.lv", isVerified: true },
   { name: "Rīgas Aeronavigācijas institūts", domain: "rai.lv", isVerified: true },
   { name: "Starptautiskā praktiskās psiholoģijas augstskola", domain: "ispp.edu.lv", isVerified: true },
   { name: "Sociālā darba un sociālās pedagoģijas augstskola Attīstība", domain: "attistiba.lv", isVerified: true },
]