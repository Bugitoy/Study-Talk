import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Burundi_universities = [

    // Burundi

    { name: "Université du Burundi", domain: "ub.edu.bi", isVerified: true },
    { name: "Université Espoir d'Afrique", domain: "uea.edu.bi", isVerified: true },
    { name: "Institut National de Santé Publique", domain: "insp.bi", isVerified: true },
    { name: "Université de Ngozi", domain: "univ-ngozi.bi", isVerified: true },
    { name: "Université Lumière de Bujumbura", domain: "ulbu.bi", isVerified: true },
    { name: "École Normale Supérieure de Bujumbura", domain: "ens.edu.bi", isVerified: true },
    { name: "Université des Grands Lacs", domain: "ugl.bi", isVerified: true },
    { name: "Institut Supérieur de Gestion des Entreprises", domain: "isge.bi", isVerified: true },
    { name: "Université du Lac Tanganyika", domain: "ult.bi", isVerified: true },
    { name: "Université Polytechnique de Gitega", domain: "upg.edu.bi", isVerified: true },
    { name: "Université Chrétienne de Bujumbura", domain: "bcu.edu.bi", isVerified: true },
    { name: "Bujumbura International University", domain: "biu.bi", isVerified: true },
    { name: "École Nationale d'Administration, Burundi", domain: "ena.bi", isVerified: true },
    { name: "Université Sagesse d'Afrique", domain: "usa.edu.bi", isVerified: true },
    { name: "Université de Mwaro", domain: "umo.edu.bi", isVerified: true },
    { name: "East Africa Star University", domain: "easu-burundi.com", isVerified: true },
    { name: "Université Polytechnique Intégrée", domain: "upi.edu.bi", isVerified: true },
    { name: "Université Martin Luther King", domain: "umlk.net", isVerified: true },
    { name: "International Leadership University, Burundi", domain: "ilu-burundi-edu.com", isVerified: true },
    { name: "International University of Equator", domain: "iue.edu.bi", isVerified: true }, 
]