import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Iceland_universities = [

   // Iceland

   { name: "Háskóli Íslands", domain: "hi.is", isVerified: true },
   { name: "Háskólinn í Reykjavík", domain: "ru.is", isVerified: true },
   { name: "Háskólinn á Akureyri", domain: "unak.is", isVerified: true },
   { name: "Listaháskóli Íslands", domain: "lhi.is", isVerified: true },
   { name: "Háskólinn á Bifröst", domain: "bifrost.is", isVerified: true },
   { name: "Agricultural University of Iceland", domain: "lbhi.is", isVerified: true },
   { name: "Háskólinn á Hólum", domain: "holar.is", isVerified: true },
]