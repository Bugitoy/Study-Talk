import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Senegal_universities = [

   // Senegal

   { name: "Université Cheikh Anta Diop", domain: "ucad.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Gaston Berger", domain: "ugb.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Assane SECK de Ziguinchor", domain: "uasz.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université de Thiès", domain: "univ-thies.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Alioune Diop de Bambey", domain: "uadb.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École Supérieure de Commerce de Dakar", domain: "supdeco.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Sine-Saloum El Hadji Ibrahima Niasse", domain: "ussein.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École polytechnique de Thiès", domain: "ept.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Amadou Mahtar Mbow", domain: "uam.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École Centrale des Logiciels Libres et des Télécommunications", domain: "ec2lt.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École Supérieure d'Electricité, du Bâtiment et des Travaux Publics", domain: "esebat.com", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Ensup Afrique", domain: "ensupafrique.com", region: "Africa", country: "Senegal", isVerified: true },
   { name: "MIT University Dakar", domain: "mit-university.net", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université du Sahel", domain: "sahel.education", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Dakar Bourguiba", domain: "udb-sn.com", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Institut Polytechnique de Dakar", domain: "ipd.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Institut Universitaire de l'Entreprise et du Développement", domain: "iuedsenegal.org", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université de l'Atlantique", domain: "universat.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Institut Privé de Formation et de Recherches Médicales de Dakar", domain: "ipformed.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École Supérieure du Bâtiment", domain: "batisup.com", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Cheikh Ahmadou Bamba", domain: "ucab.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École Supérieure de Génies", domain: "esge-sa.com", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Euro-Afrique", domain: null, region: "Africa", country: "Senegal", isVerified: false },
   { name: "Institut International de Management", domain: "groupe2im.com", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Université Kocc Barma Saint-Louis", domain: "ukb.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Institut Africain de Commerce et de Marketing", domain: "iacm.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "Institut Supérieur des Nouvelles Technologies de Commerce de Bâtiment et de Santé", domain: "instnctbs.sn", region: "Africa", country: "Senegal", isVerified: true },
   { name: "École Supérieure de Télécommunication d'Informatique et de Management", domain: "estm.sn", region: "Africa", country: "Senegal", isVerified: true },
]