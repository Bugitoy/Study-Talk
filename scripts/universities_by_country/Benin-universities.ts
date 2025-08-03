import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Benin_universities = [

   // Benin

   { name: "Université d'Abomey-Calavi", domain: "uac.bj", isVerified: true },
   { name: "Université Protestante de l'Afrique de l'Ouest", domain: "upaopnbenin-edu.org", isVerified: true },
   { name: "Université de Parakou", domain: "univ-parakou.bj", isVerified: true },
   { name: "Université Nationale d'Agriculture", domain: "una.bj", isVerified: true },
   { name: "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques", domain: "unstim.bj", isVerified: true },
   { name: "Institut Supérieur des Métiers de l'Audiovisuel", domain: "isma-benin.org", isVerified: true },
   { name: "ISSIC University", domain: "issicuniversity.edu.bj", isVerified: true },
   { name: "Institut Supérieur de Management Adonaï", domain: "ismadonai.net", isVerified: true },
   { name: "Université IRGIB Africa", domain: "irgibafrica.university", isVerified: true },
   { name: "PIGIER Benin", domain: "pigier-benin.com", isVerified: true },
   { name: "Haute École de Commerce et de Management", domain: "hecm-afrique.net", isVerified: true },
   { name: "Université Catholique de l'Afrique de l'Ouest, Benin", domain: "ucaoobenin.org", isVerified: true },
   { name: "Université Africaine de Technologie et de Management", domain: "uatm-gasa.com", isVerified: true },
   { name: "École Supérieure des Métiers des Énergies Renouvelables", domain: "esmer-benin.org", isVerified: true },
   { name: "École Supérieure Sainte Félicité", domain: "saintefelicite.com", isVerified: true },
   { name: "Esep Le Berger", domain: "esepleberger.edu.bj", isVerified: true },
   { name: "École Supérieure de Génie Civil Verechaguine AK", domain: "esgcvak.com", isVerified: true },
   { name: "École Supérieure de Management Benin", domain: "esm-benin.com", isVerified: true },
   { name: "Institut Jean-Paul II", domain: "institutjeanpaul2.org", isVerified: true },
   { name: "Les Cours Sonou", domain: "lescoursonou-university.org", isVerified: true },
   { name: "École Supérieure d'Administration, d'Economie, de Journalisme et des Métiers de l'Audiovisuel", domain: "esae.bj", isVerified: true },
   { name: "Institut Universitaire Panafricain", domain: "iup-universite.com", isVerified: true },
   { name: "Institut Superieur de Communication et de Gestion", domain: "iscg.edu.bj", isVerified: true },
   { name: "Université Polytechnique Internationale Obiang Nguema Mbasogo", domain: "upi-onm.com", isVerified: true },
]