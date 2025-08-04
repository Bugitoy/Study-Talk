import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Guyana_universities = [

   // Guyana

   { name: "Texila American University, Guyana", domain: "tau.edu.gy", region: "South America", country: "Guyana", isVerified: true },           
   { name: "University of Guyana", domain: "uog.edu.gy", region: "South America", country: "Guyana", isVerified: true },                         
   { name: "GreenHeart Medical University", domain: "gmu.edu.gy", region: "South America", country: "Guyana", isVerified: true },                
   { name: "American International School of Medicine", domain: "aism.edu", region: "South America", country: "Guyana", isVerified: true },      
   { name: "Lincoln American University", domain: "laumed.org", region: "South America", country: "Guyana", isVerified: true },                  
   { name: "Georgetown American University", domain: "gau.edu.gy", region: "South America", country: "Guyana", isVerified: true },               
   { name: "Rajiv Gandhi University of Science and Technology", domain: "rgust.edu.gy", region: "South America", country: "Guyana", isVerified: true },
]