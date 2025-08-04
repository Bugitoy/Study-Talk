import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Panama_universities = [

   // Panama

   { name: "Universidad de Panamá", domain: "up.ac.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Tecnológica de Panamá", domain: "utp.ac.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Latina de Panamá", domain: "ulatina.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Autónoma de Chiriquí", domain: "unachi.ac.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Católica Santa María La Antigua", domain: "usma.ac.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Interamericana de Panamá", domain: "uip.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Metropolitana de Educación, Ciencia y Tecnología", domain: "umecit.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad del Istmo", domain: "udelistmo.edu", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Especializada de Las Américas", domain: "udelas.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Tecnológica Oteima", domain: "oteima.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "ISAE Universidad", domain: "isae.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Quality Leadership University", domain: "qlu.edu.pa", region: "North America", country: "Panama", isVerified: true },  
   { name: "Universidad del Arte Ganexa", domain: "ganexa.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Marítima Internacional de Panamá", domain: "umip.ac.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Columbus University", domain: "columbus.edu", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Americana, Panama", domain: "uam.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Florida State University Republic of Panama Campus", domain: "international.fsu.edu", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Latinoamericana de Comercio Exterior", domain: "ulacex.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Santander", domain: "usantander.edu.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Cristiana de Panamá", domain: "ucp.ac.pa", region: "North America", country: "Panama", isVerified: true },
   { name: "Universidad Especializada del Contador Público de Panamá", domain: null, region: "North America", country: "Panama", isVerified: false },
]