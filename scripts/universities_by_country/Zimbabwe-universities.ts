import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Zimbabwe_universities = [

   // Zimbabwe

   { name: "University of Zimbabwe", domain: "uz.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Midlands State University", domain: "msu.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "National University of Science and Technology", domain: "nust.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Chinhoyi University of Technology", domain: "cut.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Bindura University of Science Education", domain: "buse.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Harare Institute of Technology", domain: "hit.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Great Zimbabwe University", domain: "gzu.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Lupane State University", domain: "lsu.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Gwanda State University", domain: "gsu.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Manicaland State University of Applied Sciences", domain: "msuas.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
   { name: "Marondera University of Agricultural Sciences and Technology", domain: "muast.ac.zw", region: "Africa", country: "Zimbabwe", isVerified: true },
]