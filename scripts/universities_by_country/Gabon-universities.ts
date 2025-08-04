import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Gabon_universities = [

    // Gabon

    { name: "Université Omar Bongo", domain: "univuob.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Université des Sciences et Techniques de Masuku", domain: "univ-masuku.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École Normale Supérieure de Libreville", domain: "enslibreville.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École Supérieure de Gestion, d'Informatique et des Sciences", domain: "esgis.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École de Management du Gabon", domain: "em-gabon.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École des Mines et de la Métallurgie de Moanda", domain: "e3mg.ga", region: "Africa", country: "Gabon", isVerified: true },
    { name: "African University of Management and Technologies", domain: "groupeaumt.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Institut National de la Poste des Technologies de l'Information et de la Communication", domain: "inptic-ga.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Institut National des Sciences de Gestion", domain: "insggabon.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Institut Universitaire des Sciences de l'Organisation", domain: "iuso-sne.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Institut Supérieur de Technologie", domain: "ist.univ-lbv.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École Supérieure de Gestion et d'Expertise Comptable", domain: null, region: "Africa", country: "Gabon", isVerified: false },
    { name: "Académie Franco-Américaine de Management", domain: "aframgabon.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Libreville International Business School", domain: "libs-academy.ga", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Institut des Techniques Avancées", domain: "ita-gabon.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École Supérieure de la Mer", domain: null, region: "Africa", country: "Gabon", isVerified: false },
    { name: "Université Franco-Gabonaise Saint-Exupéry", domain: "ufgse.org", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Université Africaine des Sciences", domain: null, region: "Africa", country: "Gabon", isVerified: false },
    { name: "BGFI Business School", domain: "bbs-school.net", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Institut de Technologies d'Owendo", domain: "itogabon.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "Université des Sciences d'Informatique Appliquée", domain: null, region: "Africa", country: "Gabon", isVerified: false },
    { name: "École Normale Supérieure de l'Enseignement Technique", domain: "enset-gabon.com", region: "Africa", country: "Gabon", isVerified: true },
    { name: "École Nationale des Eaux et Forêts", domain: "labogabon.net", region: "Africa", country: "Gabon", isVerified: true },
]