import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Vatican_City_universities = [

   // Vatican City

   { name: "Pontificia Università Gregoriana", domain: "unigre.it", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificia Università della Santa Croce", domain: "pusc.it", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificia Università Lateranense", domain: "pul.va", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Università Pontificia Salesiana", domain: "unisal.it", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificia Università San Tommaso d'Aquino", domain: "angelicum.it", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificia Università Antonianum", domain: "antonianum.eu", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificia Università Urbaniana", domain: "urbaniana.edu", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificia Facoltà di Scienze dell'Educazione Auxilium", domain: "pfse-auxilium.org", region: "Europe", country: "Vatican City", isVerified: true },
   { name: "Pontificio Istituto di Archeologia Cristiana", domain: "piacr.it", region: "Europe", country: "Vatican City", isVerified: true },
]