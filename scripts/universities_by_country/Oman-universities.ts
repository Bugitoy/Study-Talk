import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Oman_universities = [

    // Oman

    { name: "Sultan Qaboos University", domain: "squ.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "The University of Nizwa", domain: "unizwa.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "University of Technology and Applied Sciences", domain: "utas.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "German University of Technology in Oman", domain: "gutech.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Sohar University", domain: "su.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "National University of Science and Technology", domain: "nu.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Dhofar University", domain: "du.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Middle East College", domain: "mec.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Majan University College", domain: "majancollege.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Modern College of Business and Science", domain: "mcbs.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Al Sharqiyah University", domain: "asu.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Muscat University", domain: "muscatuniversity.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Gulf College", domain: "gulfcollege.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Sur University College", domain: "suc.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "University of Buraimi", domain: "uob.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Muscat College", domain: "muscatcollege.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Al-Buraimi University College", domain: "buc.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Scientific College of Design", domain: "scd.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "College of Banking and Financial Studies", domain: "cbfs.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Mazoon College", domain: "mazcol.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Oman College of Management and Technology", domain: "ocmt.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Global College of Engineering and Technology", domain: "gcet.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Oman Tourism College", domain: "otc.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "College of Shari'a Sciences", domain: "css.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Al-Zahra College for Women", domain: "zcw.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "International Maritime College Oman", domain: "imco.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Waljat Colleges of Applied Sciences", domain: "waljatcollege.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Bayan College", domain: "bayancollege.edu.om", region: "Asia", country: "Oman", isVerified: true },
    { name: "Oman Dental College", domain: "odc.edu.om", region: "Asia", country: "Oman", isVerified: true },
]