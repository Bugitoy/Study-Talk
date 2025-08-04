import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Serbia_universities = [

   // Serbia

   { name: "Univerzitet u Beogradu", domain: "bg.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet u Novom Sadu", domain: "uns.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet u Nišu", domain: "ni.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet u Kragujevcu", domain: "kg.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti i Prishtinës", domain: "uni-pr.edu", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet Singidunum", domain: "singidunum.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet Metropolitan", domain: "metropolitan.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Državni univerzitet u Novom Pazaru", domain: "np.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet Megatrend", domain: "megatrend.edu.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet Educons", domain: "educons.edu.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Alfa BK Univerzitet", domain: "alfa.edu.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti i Prizrenit Ukshin Hoti", domain: "uni-prizren.com", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti Haxhi Zeka", domain: "unhz.eu", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet Privredna akademija", domain: "privrednaakademija.edu.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti i Gjakovës Fehmi Agani", domain: "uni-gjk.org", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Internacionalni Univerzitet u Novom Pazaru", domain: "uninp.edu.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti i Mitrovicës Isa Boletini", domain: "umib.net", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet Union", domain: "union.edu.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti Kadri Zeka Gjilan", domain: "uni-gjilan.net", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Evropski Univerzitet", domain: "eu.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Universiteti i Shkencave të Aplikuara në Ferizaj", domain: "ushaf.net", region: "Europe", country: "Serbia", isVerified: true },
   { name: "Univerzitet umetnosti u Beogradu", domain: "arts.bg.ac.rs", region: "Europe", country: "Serbia", isVerified: true },
]