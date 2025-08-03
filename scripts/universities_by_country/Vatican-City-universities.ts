import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Vatican_City_universities = [

   // Vatican City

   { name: "Pontificia Università Gregoriana", domain: "unigre.it", isVerified: true },
   { name: "Pontificia Università della Santa Croce", domain: "pusc.it", isVerified: true },
   { name: "Pontificia Università Lateranense", domain: "pul.va", isVerified: true },
   { name: "Università Pontificia Salesiana", domain: "unisal.it", isVerified: true },
   { name: "Pontificia Università San Tommaso d'Aquino", domain: "angelicum.it", isVerified: true },
   { name: "Pontificia Università Antonianum", domain: "antonianum.eu", isVerified: true },
   { name: "Pontificia Università Urbaniana", domain: "urbaniana.edu", isVerified: true },
   { name: "Pontificia Facoltà di Scienze dell'Educazione Auxilium", domain: "pfse-auxilium.org", isVerified: true },
   { name: "Pontificio Istituto di Archeologia Cristiana", domain: "piacr.it", isVerified: true },
]