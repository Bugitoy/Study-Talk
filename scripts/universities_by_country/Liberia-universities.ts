import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Liberia_universities = [

    // Liberia

    { name: "University of Liberia", domain: "ul.edu.lr", isVerified: true },
    { name: "Cuttington University", domain: "cu.edu.lr", isVerified: true },
    { name: "African Methodist Episcopal University", domain: "ame.edu.lr", isVerified: true },
    { name: "United Methodist University", domain: "umu.edu.lr", isVerified: true },
    { name: "Nimba University", domain: "nu.edu.lr", isVerified: true },
    { name: "Starz University", domain: "su.edu.lr", isVerified: true },
    { name: "William V. S. Tubman University", domain: "tubmanu.edu.lr", isVerified: true },
    { name: "Adventist University of West Africa", domain: "auwa.edu.lr", isVerified: true },
    { name: "Margibi University", domain: "margibiuniversity.org", isVerified: true },
    { name: "Stella Maris Polytechnic University", domain: "smpu.edu.lr", isVerified: true },
    { name: "Smythe University College", domain: "suc.edu.lr", isVerified: true },
]