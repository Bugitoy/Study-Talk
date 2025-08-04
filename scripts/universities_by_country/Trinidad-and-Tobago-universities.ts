import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Trinidad_and_Tobago_universities = [

   // Trinidad and Tobago

   { name: "The University of the West Indies, St. Augustine", domain: "sta.uwi.edu", region: "North America", country: "Trinidad and Tobago", isVerified: true },
   { name: "The University of Trinidad and Tobago", domain: "utt.edu.tt", region: "North America", country: "Trinidad and Tobago", isVerified: true },
   { name: "College of Science, Technology and Applied Arts of Trinidad and Tobago", domain: "costaatt.edu.tt", region: "North America", country: "Trinidad and Tobago", isVerified: true },
   { name: "University of the Southern Caribbean", domain: "usc.edu.tt", region: "North America", country: "Trinidad and Tobago", isVerified: true },
   { name: "Tobago Hospitality and Tourism Institute", domain: "thti.edu.tt", region: "North America", country: "Trinidad and Tobago", isVerified: true },
   { name: "Cipriani College of Labour and Co-operative Studies", domain: "cclcs.edu.tt", region: "North America", country: "Trinidad and Tobago", isVerified: true },
   { name: "Caribbean Nazarene College", domain: "cnc.edu", region: "North America", country: "Trinidad and Tobago", isVerified: true },
]