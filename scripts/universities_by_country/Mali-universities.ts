import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Mali_universities = [

   // Mali

   { name: "Université des sciences, des techniques et des technologies de Bamako", domain: "usttb.edu.ml", isVerified: true },
   { name: "Université des lettres et des sciences humaines de Bamako", domain: "ulshb.edu.ml", isVerified: true },
   { name: "Institut Polytechnique Rural de Formation et de Recherches Appliquées de Katibougou", domain: "iprifra.org", isVerified: true },
   { name: "Université des sciences juridiques et politiques de Bamako", domain: "usjpb.edu.ml", isVerified: true },
   { name: "Université des sciences sociales et de gestion de Bamako", domain: "ussgb.edu.ml", isVerified: true },
   { name: "École Nationale d'Ingénieurs Abderhame Baba Touré", domain: "eni-ml.edu.ml", isVerified: true },
   { name: "École Normale Supérieure de Bamako", domain: "ensup.ml", isVerified: true },
   { name: "École Normale d'Enseignement Technique et Professionnel", domain: "enetp.ml", isVerified: true },
   { name: "Université de Ségou", domain: "univ-segou.ml", isVerified: true },
   { name: "Université Mandé Bukari", domain: "umb.edu.ml", isVerified: true },
]