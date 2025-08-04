import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Fiji_universities = [

   // Fiji

   { name: "The University of the South Pacific", domain: "usp.ac.fj", region: "Oceania", country: "Fiji", isVerified: true },   
   { name: "Fiji National University", domain: "fnu.ac.fj", region: "Oceania", country: "Fiji", isVerified: true },            
   { name: "The University of Fiji", domain: "unifiji.ac.fj", region: "Oceania", country: "Fiji", isVerified: true },
]