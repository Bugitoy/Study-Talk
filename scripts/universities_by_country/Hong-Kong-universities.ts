import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Hong_Kong_universities = [

   // Hong Kong

   { name: "The University of Hong Kong", domain: "hku.hk", isVerified: true },
   { name: "The Chinese University of Hong Kong", domain: "cuhk.edu.hk", isVerified: true },
   { name: "The Hong Kong University of Science and Technology", domain: "ust.hk", isVerified: true },
   { name: "City University of Hong Kong", domain: "cityu.edu.hk", isVerified: true },
   { name: "The Hong Kong Polytechnic University", domain: "polyu.edu.hk", isVerified: true },
   { name: "Hong Kong Baptist University", domain: "hkbu.edu.hk", isVerified: true },
   { name: "The Education University of Hong Kong", domain: "eduhk.hk", isVerified: true },
   { name: "Lingnan University", domain: "ln.edu.hk", isVerified: true },
   { name: "Hong Kong Metropolitan University", domain: "ouhk.edu.hk", isVerified: true },
   { name: "Hong Kong Shue Yan University", domain: "hksyu.edu.hk", isVerified: true },
   { name: "Hang Seng University of Hong Kong", domain: "hsu.edu.hk", isVerified: true },
   { name: "Hong Kong Chu Hai College", domain: "chuhai.edu.hk", isVerified: true },
   { name: "Saint Francis University", domain: "sfu.edu.hk", isVerified: true },
   { name: "UOW College Hong Kong", domain: "uowchk.edu.hk", isVerified: true },
]