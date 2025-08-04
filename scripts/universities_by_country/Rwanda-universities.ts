import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Rwanda_universities = [

   // Rwanda

   { name: "University of Rwanda", domain: "ur.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "African Leadership University, Rwanda", domain: "alu.edu", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "University of Global Health Equity", domain: "ughe.org", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "Kibogora Polytechnic", domain: "kibogorapoly.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                                 
   { name: "Université Libre de Kigali", domain: "ulk.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                                    
   { name: "University of Kigali", domain: "uok.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "Institut d'Enseignement Supérieur de Ruhengeri", domain: "ines.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "Catholic University of Rwanda", domain: "cur.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "Adventist University of Central Africa", domain: "auca.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "University of Technology and Arts of Byumba", domain: "utab.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                  
   { name: "Protestant University of Rwanda", domain: "pur.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                               
   { name: "University of Lay Adventists of Kigali", domain: "unilak.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                     
   { name: "Institut Catholique de Kabgayi", domain: "uck.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "University of Tourism Technology and Business Studies", domain: "utb.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },         
   { name: "Institute of Legal Practice and Development", domain: "ilpd.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                  
   { name: "East African University Rwanda", domain: "eau.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },                                 
   { name: "Vatel School Rwanda", domain: "vatel.rw", region: "Africa", country: "Rwanda", isVerified: true },                                           
   { name: "Mount Kigali University", domain: "mkur.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
   { name: "University of Gitwe", domain: "uog.ac.rw", region: "Africa", country: "Rwanda", isVerified: true },
]