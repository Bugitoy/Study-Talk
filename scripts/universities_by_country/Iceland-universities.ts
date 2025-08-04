import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Iceland_universities = [

   // Iceland

   { name: "Háskóli Íslands", domain: "hi.is", region: "Europe", country: "Iceland", isVerified: true },
   { name: "Háskólinn í Reykjavík", domain: "ru.is", region: "Europe", country: "Iceland", isVerified: true },
   { name: "Háskólinn á Akureyri", domain: "unak.is", region: "Europe", country: "Iceland", isVerified: true },
   { name: "Listaháskóli Íslands", domain: "lhi.is", region: "Europe", country: "Iceland", isVerified: true },
   { name: "Háskólinn á Bifröst", domain: "bifrost.is", region: "Europe", country: "Iceland", isVerified: true },
   { name: "Agricultural University of Iceland", domain: "lbhi.is", region: "Europe", country: "Iceland", isVerified: true },
   { name: "Háskólinn á Hólum", domain: "holar.is", region: "Europe", country: "Iceland", isVerified: true },
]