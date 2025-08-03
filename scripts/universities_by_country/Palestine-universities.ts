import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Palestine_universities = [

    // Palestine

    { name: "Birzeit University", domain: "birzeit.edu", isVerified: true },
    { name: "An-Najah National University", domain: "najah.edu", isVerified: true },
    { name: "Al-Quds University", domain: "alquds.edu", isVerified: true },
    { name: "Islamic University of Gaza", domain: "iugaza.edu.ps", isVerified: true },
    { name: "Bethlehem University", domain: "bethlehem.edu", isVerified: true },
    { name: "Arab American University", domain: "aaup.edu", isVerified: true },
    { name: "Palestine Polytechnic University", domain: "ppu.edu", isVerified: true },
    { name: "Al-Aqsa University", domain: "alaqsa.edu.ps", isVerified: true },
    { name: "Hebron University", domain: "hebron.edu", isVerified: true },
    { name: "Al Azhar University-Gaza", domain: "alazhar.edu.ps", isVerified: true },
    { name: "Palestine Ahliya University", domain: "paluniv.edu.ps", isVerified: true },
    { name: "Palestine Technical University Kadoorie", domain: "ptuk.edu.ps", isVerified: true },
    { name: "Gaza University", domain: "gu.edu.ps", isVerified: true },
    { name: "University of Palestine", domain: "up.edu.ps", isVerified: true },
    { name: "University College of Applied Sciences", domain: "ucas.edu.ps", isVerified: true },
    { name: "Dar Al-Kalima University", domain: "daralkalima.edu.ps", isVerified: true },
    { name: "Al Istiqlal University", domain: "istiqlal.edu.ps", isVerified: true },
    { name: "Israa University", domain: "iu.edu.ps", isVerified: true },
    { name: "Palestine Technical College", domain: null, isVerified: false },
    { name: "University College of Science and Technology", domain: "ucst.edu.ps", isVerified: true },
    { name: "Modern University College", domain: "muc.edu.ps", isVerified: true },
    { name: "Arab College of Applied Sciences", domain: "acas.edu.ps", isVerified: true },
    { name: "ESF College of Women's Society in Ramallah", domain: null, isVerified: false },
    { name: "Palestine College of Nursing", domain: null, isVerified: false },
    { name: "Ibn Sina College for Health Sciences", domain: null, isVerified: false },
    { name: "Palestine Technical College Arroub", domain: null, isVerified: false },
]