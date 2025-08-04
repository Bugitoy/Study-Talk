import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Haiti_universities = [

     // Haiti

     { name: "Université d'État d'Haiti", domain: "ueh.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Quisqueya", domain: "quisqueya.edu", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Notre Dame d'Haïti", domain: "undh.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Chrétienne du Nord d'Haïti", domain: "ucnh.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Queensland University Haiti", domain: "uqstegnetwork.org", region: "North America", country: "Haiti", isVerified: true },
     { name: "American University of the Caribbean", domain: "aucmed.edu", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Caraïbe", domain: "uniq.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université G.O.C.", domain: "ugoc.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université INUKA", domain: "inuka.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Adventiste d'Haïti", domain: "unah.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Autonome de Port-au-Prince", domain: "unapedu.net", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Franco-Haïtienne du Cap-Haïtien", domain: "ufch.org", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université de Port-au-Prince", domain: "uportauprince.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Lumière MEBSH", domain: "ulum.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Américaine des Sciences Modernes d'Haïti", domain: "unasmoh.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Publique de l'Artibonite aux Gonaïves", domain: "upag.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université de Fondwa", domain: "unif.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Roi Henri Christophe", domain: "urhc.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Royale d'Haïti", domain: "uroyalehaiti.onlc.fr", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Publique du Sud au Cayes", domain: "upsac.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Publique du Nord au Cap-Haïtien", domain: "upnch.univ.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Nobel d'Haiti", domain: "unh.edu.ht", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université de la Nouvelle Grand'Anse", domain: "universitynouvellegrandanse.org", region: "North America", country: "Haiti", isVerified: true },
     { name: "Université Joseph Lafortune", domain: null, region: "North America", country: "Haiti", isVerified: false },
     { name: "Université Épiscopale d'Haiti", domain: "uneph.edu.ht", region: "North America", country: "Haiti", isVerified: true },
]