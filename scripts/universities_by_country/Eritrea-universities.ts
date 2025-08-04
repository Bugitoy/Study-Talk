import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Eritrea_universities = [

   // Eritrea

   { name: "Orota School of Medicine and Dental Medicine", domain: null, region: "Africa", country: "Eritrea", isVerified: false },
   { name: "Asmara College of Health Sciences", domain: null, region: "Africa", country: "Eritrea", isVerified: false },
   { name: "Adi-Keih College of Arts and Social Sciences", domain: null, region: "Africa", country: "Eritrea", isVerified: false },
   { name: "Halhale College of Business and Economics", domain: null, region: "Africa", country: "Eritrea", isVerified: false },
   { name: "Hamelmalo College of Agriculture", domain: null, region: "Africa", country: "Eritrea", isVerified: false },
   { name: "Massawa College of Marine Science and Technology", domain: null, region: "Africa", country: "Eritrea", isVerified: false },
   { name: "Eritrea Institute of Technology", domain: "eit.edu.er", region: "Africa", country: "Eritrea", isVerified: true },  
]