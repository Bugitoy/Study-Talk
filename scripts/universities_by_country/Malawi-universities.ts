import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Malawi_universities = [

    // Malawi

    { name: "University of Malawi", domain: "unima.ac.mw", isVerified: true },
    { name: "Mzuzu University", domain: "mzuni.ac.mw", isVerified: true },
    { name: "Lilongwe University of Agriculture and Natural Resources", domain: "luanar.ac.mw", isVerified: true },
    { name: "Malawi University of Science and Technology", domain: "must.ac.mw", isVerified: true },
    { name: "UNICAF University, Malawi", domain: "unicafuniversity.ac.mw", isVerified: true },
    { name: "The Catholic University of Malawi", domain: "cunima.ac.mw", isVerified: true },
    { name: "University of Livingstonia", domain: "unilia.ac.mw", isVerified: true },
    { name: "Malawi Adventist University", domain: "mau.ac.mw", isVerified: true },
    { name: "Daeyang University", domain: "dyuni.ac.mw", isVerified: true },
    { name: "St. John the Baptist University", domain: "dmisjbu.edu.mw", isVerified: true },
    { name: "Malawi Assemblies of God University", domain: "magu.ac.mw", isVerified: true },
    { name: "Blantyre International University", domain: "biu-edu.com", isVerified: true },
    { name: "Malawi College of Accountancy", domain: "mca.ac.mw", isVerified: true },
    { name: "Lake Malawi Anglican University", domain: "lamau.edu.mw", isVerified: true },
    { name: "Millennium University", domain: "mu.ac.mw", isVerified: true },
    { name: "University of Blantyre Synod", domain: "ubsmw.com", isVerified: true },
    { name: "Nkhoma University", domain: "nkhoma.ac.mw", isVerified: true },
    { name: "Pentecostal Life University", domain: "plu.ac.mw", isVerified: true },
    { name: "Exploits University", domain: "exploitsmw.com", isVerified: true },
    { name: "University of Lilongwe", domain: "unilil.ac.mw", isVerified: true },
]