import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Zambia_universities = [

   // Zambia

   { name: "Cavendish University Zambia", domain: "cavendishza.org", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Rusangu University", domain: "rusangu.edu.zm", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Supershine University", domain: "supershineuniversity.net", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Sunningdale University", domain: "sunningdaleuniversity.com", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Zambia Open University", domain: "zou.edu.zm", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Zambia Polytechnic", domain: "zp.edu.zm", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Zambia School of Law", domain: "zsl.edu.zm", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Zambia National Certificate of Education", domain: "zncc.edu.zm", region: "Africa", country: "Zambia", isVerified: true },
   { name: "Zambia Institute of Technology", domain: "zit.edu.zm", region: "Africa", country: "Zambia", isVerified: true },
   { name: "University of Zambia", domain: "unza.zm", region: "Africa", country: "Zambia", isVerified: true },
]