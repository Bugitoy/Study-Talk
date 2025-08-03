import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Gabon_universities = [

    // Gabon

    { name: "Université Omar Bongo", domain: "univuob.org", isVerified: true },
    { name: "Université des Sciences et Techniques de Masuku", domain: "univ-masuku.org", isVerified: true },
    { name: "École Normale Supérieure de Libreville", domain: "enslibreville.org", isVerified: true },
    { name: "École Supérieure de Gestion, d'Informatique et des Sciences", domain: "esgis.org", isVerified: true },
    { name: "École de Management du Gabon", domain: "em-gabon.com", isVerified: true },
    { name: "École des Mines et de la Métallurgie de Moanda", domain: "e3mg.ga", isVerified: true },
    { name: "African University of Management and Technologies", domain: "groupeaumt.com", isVerified: true },
    { name: "Institut National de la Poste des Technologies de l'Information et de la Communication", domain: "inptic-ga.org", isVerified: true },
    { name: "Institut National des Sciences de Gestion", domain: "insggabon.org", isVerified: true },
    { name: "Institut Universitaire des Sciences de l'Organisation", domain: "iuso-sne.com", isVerified: true },
    { name: "Institut Supérieur de Technologie", domain: "ist.univ-lbv.com", isVerified: true },
    { name: "École Supérieure de Gestion et d'Expertise Comptable", domain: null, isVerified: false },
    { name: "Académie Franco-Américaine de Management", domain: "aframgabon.com", isVerified: true },
    { name: "Libreville International Business School", domain: "libs-academy.ga", isVerified: true },
    { name: "Institut des Techniques Avancées", domain: "ita-gabon.com", isVerified: true },
    { name: "École Supérieure de la Mer", domain: null, isVerified: false },
    { name: "Université Franco-Gabonaise Saint-Exupéry", domain: "ufgse.org", isVerified: true },
    { name: "Université Africaine des Sciences", domain: null, isVerified: false },
    { name: "BGFI Business School", domain: "bbs-school.net", isVerified: true },
    { name: "Institut de Technologies d'Owendo", domain: "itogabon.com", isVerified: true },
    { name: "Université des Sciences d'Informatique Appliquée", domain: null, isVerified: false },
    { name: "École Normale Supérieure de l'Enseignement Technique", domain: "enset-gabon.com", isVerified: true },
    { name: "École Nationale des Eaux et Forêts", domain: "labogabon.net", isVerified: true },
]