import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const South_Sudan_universities = [

   // South Sudan

   { name: "University of Juba", domain: "uoj.edu.ss", region: "Africa", country: "South Sudan", isVerified: true },
   { name: "John Garang Memorial University of Science and Technology", domain: "drjgmu.edu.ss", region: "Africa", country: "South Sudan", isVerified: true },
   { name: "Catholic University of South Sudan", domain: "cuofssd.org", region: "Africa", country: "South Sudan", isVerified: true },
   { name: "Rumbek University of Science and Technology", domain: "rust.edu.ss", region: "Africa", country: "South Sudan", isVerified: true },
   { name: "Upper Nile University", domain: "unu.edu.ss", region: "Africa", country: "South Sudan", isVerified: true },
   { name: "University of Bahr El-Ghazal", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
   { name: "University of Northern Bahr El-Ghazal", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
   { name: "University of Western Equatoria", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
   { name: "University of Torit", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
   { name: "St Mary's University in Juba", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
   { name: "Akobo Heritage and Memorial University", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
   { name: "Yei Agricultural and Mechanical University", domain: null, region: "Africa", country: "South Sudan", isVerified: false },
]