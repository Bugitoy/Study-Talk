import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Burkina_Faso_universities = [

    // Burkina Faso
  
    { name: "Université Ouaga I Joseph Ki-Zerbo", domain: "ujkz.bf", isVerified: true },
    { name: "Université Nazi Boni", domain: "univ-bobo.gov.bf", isVerified: true },
    { name: "Université Aube Nouvelle", domain: "u-auben.com", isVerified: true },
    { name: "Université Norbert Zongo", domain: "unz.bf", isVerified: true },
    { name: "Université de Dédougou", domain: "univ-dedougou.gov.bf", isVerified: true },
    { name: "Université Saint Thomas d'Aquin", domain: "usta.bf", isVerified: true },
    { name: "Université Ouaga II", domain: "univ-ouaga2.gov.bf", isVerified: true },
    { name: "University of United Popular Nations", domain: "uupn-edubf.org", isVerified: true },
    { name: "Université Catholique de l'Afrique de l'Ouest, Burkina Faso", domain: "ucao-uub.com", isVerified: true },
    { name: "Université Privée de Ouagadougou", domain: "univ-priveouaga.com", isVerified: true },
    { name: "Université Libre du Burkina", domain: "ulburkina.org", isVerified: true },
    { name: "Université du Faso", domain: "univ-faso.org", isVerified: true },
    { name: "Institut Polytechnique Africain", domain: "ipacfm-edu.org", isVerified: true },
    { name: "Institut privé des hautes Etudes Cheick Modibo Diarra", domain: null, isVerified: false },
    { name: "Institut Sciences Campus", domain: null, isVerified: false },
    { name: "Université de Ouahigouya", domain: "univ-ouahigouya.org", isVerified: true },
]