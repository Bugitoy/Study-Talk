import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Tajikistan_universities = [

   // Tajikistan

   { name: "Tajik National University", domain: "tnu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Russian-Tajik Slavonic University", domain: "rtsu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Kulob State University", domain: "kgu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Avicenna Tajik State Medical University", domain: "tajmedun.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Technological University of Tajikistan", domain: "tut.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajik Technical University", domain: "ttu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajik Agrarian University", domain: "tajagroun.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajik State University of Commerce", domain: "tguk.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajik State Pedagogical University", domain: "tgpu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "State Financial and Economic University of Tajikistan", domain: "tgfeu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajikistan State University of Law, Business and Politics", domain: "tsulbp.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Khujand State University", domain: "hgu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Moscow State University Lomonosov in Dushanbe", domain: "msu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Mining-metallurgy Institute of Tajikistan", domain: "gmit.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "International University of Tourism and Entrepreneurship of Tajikistan", domain: "iutet.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Dangara State University", domain: "dsu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajik Institute of Languages", domain: "ddzt.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Khorog State University", domain: "khogu.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Academy of Public Administration under the President of the Republic of Tajikistan", domain: "apa.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Pedagogical Institute of Panjakent", domain: "dotpanj.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajikistan State University of Culture and Arts", domain: null, region: "Asia", country: "Tajikistan", isVerified: false },
   { name: "Tajik National Conservatory", domain: "konservatoriya.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "Tajik Institute of Physical Education", domain: null, region: "Asia", country: "Tajikistan", isVerified: false },
   { name: "Islamic Institute of Tajikistan", domain: "dit.tj", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "N.R.U. Moscow Power Engineering Institute in Dushanbe", domain: "df.mpei.ru", region: "Asia", country: "Tajikistan", isVerified: true },
   { name: "National Research Technological University \"MISA\" in Dushanbe", domain: null, isVerified: false },
   { name: "Institute of Energy of Tajikistan", domain: "det.tj", region: "Asia", country: "Tajikistan", isVerified: true },
]