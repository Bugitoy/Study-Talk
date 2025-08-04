import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Palestine_universities = [

    // Palestine

    { name: "Birzeit University", domain: "birzeit.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "An-Najah National University", domain: "najah.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Al-Quds University", domain: "alquds.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Islamic University of Gaza", domain: "iugaza.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Bethlehem University", domain: "bethlehem.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Arab American University", domain: "aaup.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Palestine Polytechnic University", domain: "ppu.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Al-Aqsa University", domain: "alaqsa.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Hebron University", domain: "hebron.edu", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Al Azhar University-Gaza", domain: "alazhar.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Palestine Ahliya University", domain: "paluniv.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Palestine Technical University Kadoorie", domain: "ptuk.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Gaza University", domain: "gu.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "University of Palestine", domain: "up.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "University College of Applied Sciences", domain: "ucas.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Dar Al-Kalima University", domain: "daralkalima.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Al Istiqlal University", domain: "istiqlal.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Israa University", domain: "iu.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Palestine Technical College", domain: null, region: "Asia", country: "Palestine", isVerified: false },
    { name: "University College of Science and Technology", domain: "ucst.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Modern University College", domain: "muc.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "Arab College of Applied Sciences", domain: "acas.edu.ps", region: "Asia", country: "Palestine", isVerified: true },
    { name: "ESF College of Women's Society in Ramallah", domain: null, region: "Asia", country: "Palestine", isVerified: false },
    { name: "Palestine College of Nursing", domain: null, region: "Asia", country: "Palestine", isVerified: false },
    { name: "Ibn Sina College for Health Sciences", domain: null, region: "Asia", country: "Palestine", isVerified: false },
    { name: "Palestine Technical College Arroub", domain: null, region: "Asia", country: "Palestine", isVerified: false },
]