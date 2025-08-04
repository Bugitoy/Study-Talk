import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Hong_Kong_universities = [

   // Hong Kong

   { name: "The University of Hong Kong", domain: "hku.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "The Chinese University of Hong Kong", domain: "cuhk.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "The Hong Kong University of Science and Technology", domain: "ust.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "City University of Hong Kong", domain: "cityu.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "The Hong Kong Polytechnic University", domain: "polyu.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Hong Kong Baptist University", domain: "hkbu.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "The Education University of Hong Kong", domain: "eduhk.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Lingnan University", domain: "ln.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Hong Kong Metropolitan University", domain: "ouhk.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Hong Kong Shue Yan University", domain: "hksyu.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Hang Seng University of Hong Kong", domain: "hsu.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Hong Kong Chu Hai College", domain: "chuhai.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "Saint Francis University", domain: "sfu.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
   { name: "UOW College Hong Kong", domain: "uowchk.edu.hk", region: "Asia", country: "Hong Kong", isVerified: true },
]