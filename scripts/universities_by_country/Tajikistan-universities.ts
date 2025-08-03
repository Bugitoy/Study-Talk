import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Tajikistan_universities = [

   // Tajikistan

   { name: "Tajik National University", domain: "tnu.tj", isVerified: true },
   { name: "Russian-Tajik Slavonic University", domain: "rtsu.tj", isVerified: true },
   { name: "Kulob State University", domain: "kgu.tj", isVerified: true },
   { name: "Avicenna Tajik State Medical University", domain: "tajmedun.tj", isVerified: true },
   { name: "Technological University of Tajikistan", domain: "tut.tj", isVerified: true },
   { name: "Tajik Technical University", domain: "ttu.tj", isVerified: true },
   { name: "Tajik Agrarian University", domain: "tajagroun.tj", isVerified: true },
   { name: "Tajik State University of Commerce", domain: "tguk.tj", isVerified: true },
   { name: "Tajik State Pedagogical University", domain: "tgpu.tj", isVerified: true },
   { name: "State Financial and Economic University of Tajikistan", domain: "tgfeu.tj", isVerified: true },
   { name: "Tajikistan State University of Law, Business and Politics", domain: "tsulbp.tj", isVerified: true },
   { name: "Khujand State University", domain: "hgu.tj", isVerified: true },
   { name: "Moscow State University Lomonosov in Dushanbe", domain: "msu.tj", isVerified: true },
   { name: "Mining-metallurgy Institute of Tajikistan", domain: "gmit.tj", isVerified: true },
   { name: "International University of Tourism and Entrepreneurship of Tajikistan", domain: "iutet.tj", isVerified: true },
   { name: "Dangara State University", domain: "dsu.tj", isVerified: true },
   { name: "Tajik Institute of Languages", domain: "ddzt.tj", isVerified: true },
   { name: "Khorog State University", domain: "khogu.tj", isVerified: true },
   { name: "Academy of Public Administration under the President of the Republic of Tajikistan", domain: "apa.tj", isVerified: true },
   { name: "Pedagogical Institute of Panjakent", domain: "dotpanj.tj", isVerified: true },
   { name: "Tajikistan State University of Culture and Arts", domain: null, isVerified: false },
   { name: "Tajik National Conservatory", domain: "konservatoriya.tj", isVerified: true },
   { name: "Tajik Institute of Physical Education", domain: null, isVerified: false },
   { name: "Islamic Institute of Tajikistan", domain: "dit.tj", isVerified: true },
   { name: "N.R.U. Moscow Power Engineering Institute in Dushanbe", domain: "df.mpei.ru", isVerified: true },
   { name: "National Research Technological University \"MISA\" in Dushanbe", domain: null, isVerified: false },
   { name: "Institute of Energy of Tajikistan", domain: "det.tj", isVerified: true },
]