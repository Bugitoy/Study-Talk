import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Lebanon_universities = [

    // Lebanon

    { name: "American University of Beirut", domain: "aub.edu.lb", isVerified: true },
    { name: "Lebanese American University", domain: "lau.edu.lb", isVerified: true },
    { name: "Université Saint-Joseph de Beyrouth", domain: "usj.edu.lb", isVerified: true },
    { name: "University of Balamand", domain: "balamand.edu.lb", isVerified: true },
    { name: "Université Libanaise", domain: "ul.edu.lb", isVerified: true },
    { name: "Beirut Arab University", domain: "bau.edu.lb", isVerified: true },
    { name: "Université Saint-Esprit de Kaslik", domain: "usek.edu.lb", isVerified: true },
    { name: "Notre Dame University", domain: "ndu.edu.lb", isVerified: true },
    { name: "Lebanese International University", domain: "liu.edu.lb", isVerified: true },
    { name: "Haigazian University", domain: "haigazian.edu.lb", isVerified: true },
    { name: "Université Antonine", domain: "ua.edu.lb", isVerified: true },
    { name: "Jinan University of Lebanon", domain: "jinan.edu.lb", isVerified: true },
    { name: "École Supérieure des Affaires", domain: "esa.edu.lb", isVerified: true },
    { name: "American University of Science and Technology", domain: "aust.edu.lb", isVerified: true },
    { name: "Middle East University", domain: "meu.edu.lb", isVerified: true },
    { name: "Université la Sagesse", domain: "uls.edu.lb", isVerified: true },
    { name: "Modern University for Business and Science", domain: "mubs.edu.lb", isVerified: true },
    { name: "Al Imam Al-Ouzai University", domain: "iau.edu.lb", isVerified: true },
    { name: "American University of Technology", domain: "aut.edu.lb", isVerified: true },
    { name: "Islamic University of Lebanon", domain: "iul.edu.lb", isVerified: true },
    { name: "Arab Open University Lebanon", domain: "aou.edu.lb", isVerified: true },
    { name: "Arts, Sciences and Technology University in Lebanon", domain: "astu.edu.lb", isVerified: true },
    { name: "Rafik Hariri University", domain: "rhu.edu.lb", isVerified: true },
    { name: "Global University", domain: "globaluniversity.edu.lb", isVerified: true },
    { name: "Université Libano-Canadienne", domain: "ulc.edu.lb", isVerified: true },
    { name: "Matn University College of Technology", domain: "muct.edu.lb", isVerified: true },
    { name: "Université du Tripoli", domain: "uot.edu.lb", isVerified: true },
    { name: "City University", domain: "cityu.edu.lb", isVerified: true },
    { name: "American University of Culture and Education", domain: "auce.edu.lb", isVerified: true },
    { name: "Université Sainte Famille", domain: "usf.edu.lb", isVerified: true },
    { name: "Lebanese German University", domain: "lgu.edu.lb", isVerified: true },
    { name: "Université de Technologie et de Sciences Appliquées Libano-Française", domain: "utsa-lf.edu.lb", isVerified: true },
    { name: "Beirut Islamic University", domain: "biu.edu.lb", isVerified: true },
    { name: "Université Al-Kafaat", domain: "alkafaat.edu.lb", isVerified: true },
    { name: "Makassed University of Beirut", domain: "mub.edu.lb", isVerified: true },
]