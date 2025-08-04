import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Caymanian_Islands_universities = [

   // Caymanian Islands

   { name: "St. Matthew's University", domain: "stmatthews.edu", region: "North America", country: "Cayman Islands", isVerified: true },
   { name: "University College of the Cayman Islands", domain: "ucci.edu.ky", region: "North America", country: "Cayman Islands", isVerified: true },
   { name: "International College of the Cayman Islands", domain: "icci.edu.ky", region: "North America", country: "Cayman Islands", isVerified: true },
   { name: "Truman Bodden Law School", domain: "caymanlawschool.ky", region: "North America", country: "Cayman Islands", isVerified: true },
]