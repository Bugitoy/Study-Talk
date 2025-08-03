import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Turkmenistan_universities = [

    // Turkmenistan
   
    { name: "International University of Humanities and Development", domain: "iuhd.edu.tm", isVerified: true },
    { name: "Turkmen State Institute of Economics and Management", domain: "tsiem.edu.tm", isVerified: true },
    { name: "Oguz Han Engineering and Technology University of Turkmenistan", domain: "etut.edu.tm", isVerified: true },
    { name: "Institute of International Relations", domain: "iir.edu.tm", isVerified: true },
    { name: "Magtymguly adyndaky Türkmen döwlet uniwersiteti", domain: "tdu.edu.tm", isVerified: true },
    { name: "Turkmen Agricultural University", domain: "tdau.edu.tm", isVerified: true },
    { name: "Turkmen State Institute of Architecture and Construction", domain: "tsiac.edu.tm", isVerified: true },
    { name: "International Oil and Gas University", domain: "iogu.edu.tm", isVerified: true },
    { name: "Dovletmammet Azadi Turkmen National Institute of World Languages", domain: null, isVerified: false },
    { name: "State Energy Institute of Turkmenistan", domain: "seit.edu.tm", isVerified: true },
    { name: "Turkmen State Institute of Finance", domain: "tsif.edu.tm", isVerified: true },
    { name: "Turkmen State Medical University", domain: "tsmedu.edu.tm", isVerified: true },
    { name: "Turkmen State Pedagogical Institute", domain: "tspi.edu.tm", isVerified: true },
    { name: "The Institute of Telecommunications and Informatics of Turkmenistan", domain: "titi.edu.tm", isVerified: true },
    { name: "National Institute of Sports and Tourism of Turkmenistan", domain: "nist.edu.tm", isVerified: true },
    { name: "Turkmen National Conservatory", domain: "tnc.edu.tm", isVerified: true },
    { name: "Turkmen State Institute of Culture", domain: "tsic.edu.tm", isVerified: true },
    { name: "State Academy of Fine Arts of Turkmenistan", domain: "safa.edu.tm", isVerified: true },
]