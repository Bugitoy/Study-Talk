import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Republic_Of_Congo_universities = [

   // Republic of the Congo

   { name: "Université Marien Ngouabi", domain: "umng.cg", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Université Denis Sassou Nguesso", domain: "udsn.cg", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Université Privée de Loango", domain: "up-loango.com", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Haute École de Gestion (HEG-Brazza)", domain: "hautecoledegestion.org", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Marien Ngouabi University", domain: "umng.cg", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Denis Sassou Nguesso University", domain: "udsn.cg", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Higher Institute of Technology of Central Africa", domain: "iutac.ac.cg", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Private University of Loango", domain: "up-loango.com", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Haute École de Gestion (HEG-Brazza)", domain: "hautecoledegestion.org", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Institut Supérieur des Techniques Professionnelles", domain: "istpcongo.com", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Université Libre du Congo", domain: "universitelibreducongo.org", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "École Supérieure de Gestion et d'Administration des Entreprises (ESGAE)", domain: "esgae.org", region: "Africa", country: "Republic of Congo", isVerified: true },
   { name: "Institut International de Management (IIM)", domain: null, region: "Africa", country: "Republic of Congo", isVerified: false },
]