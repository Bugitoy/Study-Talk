import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Benin_universities = [

   // Benin

   { name: "Université d'Abomey-Calavi", domain: "uac.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université Protestante de l'Afrique de l'Ouest", domain: "upaopnbenin-edu.org", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université de Parakou", domain: "univ-parakou.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université Nationale d'Agriculture", domain: "una.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques", domain: "unstim.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Institut Supérieur des Métiers de l'Audiovisuel", domain: "isma-benin.org", region: "Africa", country: "Benin", isVerified: true },
   { name: "ISSIC University", domain: "issicuniversity.edu.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Institut Supérieur de Management Adonaï", domain: "ismadonai.net", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université IRGIB Africa", domain: "irgibafrica.university", region: "Africa", country: "Benin", isVerified: true },
   { name: "PIGIER Benin", domain: "pigier-benin.com", region: "Africa", country: "Benin", isVerified: true },
   { name: "Haute École de Commerce et de Management", domain: "hecm-afrique.net", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université Catholique de l'Afrique de l'Ouest, Benin", domain: "ucaoobenin.org", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université Africaine de Technologie et de Management", domain: "uatm-gasa.com", region: "Africa", country: "Benin", isVerified: true },
   { name: "École Supérieure des Métiers des Énergies Renouvelables", domain: "esmer-benin.org", region: "Africa", country: "Benin", isVerified: true },
   { name: "École Supérieure Sainte Félicité", domain: "saintefelicite.com", region: "Africa", country: "Benin", isVerified: true },
   { name: "Esep Le Berger", domain: "esepleberger.edu.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "École Supérieure de Génie Civil Verechaguine AK", domain: "esgcvak.com", region: "Africa", country: "Benin", isVerified: true },
   { name: "École Supérieure de Management Benin", domain: "esm-benin.com", region: "Africa", country: "Benin", isVerified: true },
   { name: "Institut Jean-Paul II", domain: "institutjeanpaul2.org", region: "Africa", country: "Benin", isVerified: true },
   { name: "Les Cours Sonou", domain: "lescoursonou-university.org", region: "Africa", country: "Benin", isVerified: true },
   { name: "École Supérieure d'Administration, d'Economie, de Journalisme et des Métiers de l'Audiovisuel", domain: "esae.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Institut Universitaire Panafricain", domain: "iup-universite.com", region: "Africa", country: "Benin", isVerified: true },
   { name: "Institut Superieur de Communication et de Gestion", domain: "iscg.edu.bj", region: "Africa", country: "Benin", isVerified: true },
   { name: "Université Polytechnique Internationale Obiang Nguema Mbasogo", domain: "upi-onm.com", region: "Africa", country: "Benin", isVerified: true },
]