import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Liberia_universities = [

    // Liberia

    { name: "University of Liberia", domain: "ul.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Cuttington University", domain: "cu.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "African Methodist Episcopal University", domain: "ame.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "United Methodist University", domain: "umu.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Nimba University", domain: "nu.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Starz University", domain: "su.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "William V. S. Tubman University", domain: "tubmanu.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Adventist University of West Africa", domain: "auwa.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Margibi University", domain: "margibiuniversity.org", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Stella Maris Polytechnic University", domain: "smpu.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
    { name: "Smythe University College", domain: "suc.edu.lr", region: "Africa", country: "Liberia", isVerified: true },
]