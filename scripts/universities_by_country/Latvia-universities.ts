import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Latvia_universities = [

   // Latvia

   { name: "Latvijas Universitāte", domain: "lu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Rīgas Tehniskā universitāte", domain: "rtu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Rīgas Stradiņa Universitāte", domain: "rsu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Latvijas Biozinātņu un tehnoloģiju universitāte", domain: "lbtu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Rīgas Ekonomikas augstskola", domain: "sseriga.edu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Rēzeknes Tehnoloģiju Akadēmija", domain: "rta.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Daugavpils Universitāte", domain: "du.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Biznesa augstskola Turība", domain: "turiba.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Vidzemes Augstskola", domain: "va.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Latvijas Mākslas akadēmija", domain: "lma.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Transporta un sakaru institūts", domain: "tsi.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Ventspils Augstskola", domain: "venta.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Rīgas Juridiskā augstskola", domain: "rgsl.edu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Latvijas Kultūras akadēmija", domain: "lka.edu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Baltijas Starptautiskā akadēmija", domain: "bsa.edu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Liepājas Universitāte", domain: "liepu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "RISEBA University of Applied Sciences", domain: "riseba.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Ekonomikas un kultūras augstskola", domain: "eka.edu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Banku augstskola", domain: "ba.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Jāzepa Vītola Latvijas mūzikas akadēmija", domain: "jvlma.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Informācijas sistēmu menedžmenta augstskola", domain: "isma.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Latvijas Sporta pedagoģijas akadēmija", domain: "lspa.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Eiropas Kristīgā akadēmija", domain: "eca.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Rīgas Aeronavigācijas institūts", domain: "rai.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Starptautiskā praktiskās psiholoģijas augstskola", domain: "ispp.edu.lv", region: "Europe", country: "Latvia", isVerified: true },
   { name: "Sociālā darba un sociālās pedagoģijas augstskola Attīstība", domain: "attistiba.lv", region: "Europe", country: "Latvia", isVerified: true },
]