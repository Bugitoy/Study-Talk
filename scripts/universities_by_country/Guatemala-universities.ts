import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Guatemala_universities = [

   // Guatemala

   { name: "Universidad de San Carlos de Guatemala", domain: "usac.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Rafael Landívar", domain: "url.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Francisco Marroquín", domain: "ufm.edu", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Galileo", domain: "galileo.edu", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Mariano Gálvez de Guatemala", domain: "umg.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad del Valle de Guatemala", domain: "uvg.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Mesoamericana, Guatemala", domain: "umes.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Da Vinci de Guatemala", domain: "udv.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad de Occidente, Guatemala", domain: "udeo.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad del Istmo, Guatemala", domain: "unis.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Panamericana, Guatemala", domain: "upana.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad InterNaciones", domain: "uni.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Rural de Guatemala", domain: "urural.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad San Pablo de Guatemala", domain: "uspg.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
   { name: "Universidad Regional de Guatemala", domain: "uregional.edu.gt", region: "North America", country: "Guatemala", isVerified: true },
]