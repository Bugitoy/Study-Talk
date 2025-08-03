import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Ivory_Coast_universities = [

    // Ivory Coast

    { name: "Université Félix Houphouët-Boigny", domain: "ufhb.edu.ci", isVerified: true },
    { name: "Institut National Polytechnique Félix Houphouët-Boigny", domain: "inp-hb.net", isVerified: true },
    { name: "École Nationale Supérieure de Statistique et d'Economie Appliquée", domain: "ensae.ci", isVerified: true },
    { name: "Université Alassane Ouattara", domain: "uao.ci", isVerified: true },
    { name: "Université Jean Lorougnon Guédé", domain: "univ-jlg.ci", isVerified: true },
    { name: "Université Nangui Abrogoua", domain: "una.ci", isVerified: true },
    { name: "École Nationale d'Administration de Côte d'Ivoire", domain: "ena.ci", isVerified: true },
    { name: "École Supérieure Africaine des Technologies de l'Information et de la Communication", domain: "esatic.ci", isVerified: true },
    { name: "Université Péléforo-Gbon-Coulibaly", domain: "upgc.ci", isVerified: true },
    { name: "École Normale Supérieure d'Abidjan", domain: "ensab.ci", isVerified: true },
    { name: "Institut des Sciences et Techniques de la Communication", domain: "isic.ci", isVerified: true },
    { name: "Institut National Supérieur des Arts et de l'Action Culturelle", domain: "insaac.ci", isVerified: true },
    { name: "Institut National de la Jeunesse et des Sports", domain: "injs.ci", isVerified: true },
    { name: "Université de San Pedro", domain: "unsp.ci", isVerified: true },
    { name: "Université de Man", domain: "univ-man.ci", isVerified: true },
]