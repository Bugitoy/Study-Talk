import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Serbia_universities = [

   // Serbia

   { name: "Univerzitet u Beogradu", domain: "bg.ac.rs", isVerified: true },
   { name: "Univerzitet u Novom Sadu", domain: "uns.ac.rs", isVerified: true },
   { name: "Univerzitet u Nišu", domain: "ni.ac.rs", isVerified: true },
   { name: "Univerzitet u Kragujevcu", domain: "kg.ac.rs", isVerified: true },
   { name: "Universiteti i Prishtinës", domain: "uni-pr.edu", isVerified: true },
   { name: "Univerzitet Singidunum", domain: "singidunum.ac.rs", isVerified: true },
   { name: "Univerzitet Metropolitan", domain: "metropolitan.ac.rs", isVerified: true },
   { name: "Državni univerzitet u Novom Pazaru", domain: "np.ac.rs", isVerified: true },
   { name: "Univerzitet Megatrend", domain: "megatrend.edu.rs", isVerified: true },
   { name: "Univerzitet Educons", domain: "educons.edu.rs", isVerified: true },
   { name: "Alfa BK Univerzitet", domain: "alfa.edu.rs", isVerified: true },
   { name: "Universiteti i Prizrenit Ukshin Hoti", domain: "uni-prizren.com", isVerified: true },
   { name: "Universiteti Haxhi Zeka", domain: "unhz.eu", isVerified: true },
   { name: "Univerzitet Privredna akademija", domain: "privrednaakademija.edu.rs", isVerified: true },
   { name: "Universiteti i Gjakovës Fehmi Agani", domain: "uni-gjk.org", isVerified: true },
   { name: "Internacionalni Univerzitet u Novom Pazaru", domain: "uninp.edu.rs", isVerified: true },
   { name: "Universiteti i Mitrovicës Isa Boletini", domain: "umib.net", isVerified: true },
   { name: "Univerzitet Union", domain: "union.edu.rs", isVerified: true },
   { name: "Universiteti Kadri Zeka Gjilan", domain: "uni-gjilan.net", isVerified: true },
   { name: "Evropski Univerzitet", domain: "eu.ac.rs", isVerified: true },
   { name: "Universiteti i Shkencave të Aplikuara në Ferizaj", domain: "ushaf.net", isVerified: true },
   { name: "Univerzitet umetnosti u Beogradu", domain: "arts.bg.ac.rs", isVerified: true },
]