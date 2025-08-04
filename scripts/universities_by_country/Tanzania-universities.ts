import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Tanzania_universities = [

   // Tanzania

   { name: "University of Dar es Salaam", domain: "udsm.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Mzumbe University", domain: "mzumbe.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Sokoine University of Agriculture", domain: "sua.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "The University of Dodoma", domain: "udom.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Muhimbili University of Health and Allied Sciences", domain: "muhas.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "The State University of Zanzibar", domain: "suza.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Ruaha Catholic University", domain: "rucu.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Nelson Mandela African Institution of Science and Technology", domain: "nmaist.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Ardhi University", domain: "aru.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Catholic University of Health and Allied Sciences", domain: "cuhas.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },    
   { name: "Mbeya University of Science and Technology", domain: "must.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Tumaini University Makumira", domain: "tumaini.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Mwenge Catholic University", domain: "mwecau.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Hubert Kairuki Memorial University", domain: "hkmu.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "St. Augustine University of Tanzania", domain: "saut.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },    
   { name: "St John's University of Tanzania", domain: "stjohn.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Moshi Co-operative University", domain: "mocu.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "St. Joseph University in Tanzania", domain: "sjuit.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Zanzibar University", domain: "zanvarsity.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "International Medical and Technological University", domain: "imtu.edu", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "The University of Arusha", domain: "uoa.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "University of Iringa", domain: null, region: "Africa", country: "Tanzania", isVerified: false },
   { name: "Muslim University of Morogoro", domain: "mum.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Teofilo Kisanji University", domain: "teku.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Mwalimu Julius K. Nyerere University of Agriculture and Technology", domain: "mjnuat.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Abdulrahman Al-Sumait University", domain: "sumait.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "United African University of Tanzania", domain: "uaut.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Mount Meru University", domain: "mmu.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
   { name: "Katavi University of Agriculture", domain: null, region: "Africa", country: "Tanzania", isVerified: false },
   { name: "Eckernforde Tanga University", domain: "eckernfordetangauniversity.ac.tz", region: "Africa", country: "Tanzania", isVerified: true },
]