import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Oman_universities = [

    // Oman

    { name: "Sultan Qaboos University", domain: "squ.edu.om", isVerified: true },
    { name: "The University of Nizwa", domain: "unizwa.edu.om", isVerified: true },
    { name: "University of Technology and Applied Sciences", domain: "utas.edu.om", isVerified: true },
    { name: "German University of Technology in Oman", domain: "gutech.edu.om", isVerified: true },
    { name: "Sohar University", domain: "su.edu.om", isVerified: true },
    { name: "National University of Science and Technology", domain: "nu.edu.om", isVerified: true },
    { name: "Dhofar University", domain: "du.edu.om", isVerified: true },
    { name: "Middle East College", domain: "mec.edu.om", isVerified: true },
    { name: "Majan University College", domain: "majancollege.edu.om", isVerified: true },
    { name: "Modern College of Business and Science", domain: "mcbs.edu.om", isVerified: true },
    { name: "Al Sharqiyah University", domain: "asu.edu.om", isVerified: true },
    { name: "Muscat University", domain: "muscatuniversity.edu.om", isVerified: true },
    { name: "Gulf College", domain: "gulfcollege.edu.om", isVerified: true },
    { name: "Sur University College", domain: "suc.edu.om", isVerified: true },
    { name: "University of Buraimi", domain: "uob.edu.om", isVerified: true },
    { name: "Muscat College", domain: "muscatcollege.edu.om", isVerified: true },
    { name: "Al-Buraimi University College", domain: "buc.edu.om", isVerified: true },
    { name: "Scientific College of Design", domain: "scd.edu.om", isVerified: true },
    { name: "College of Banking and Financial Studies", domain: "cbfs.edu.om", isVerified: true },
    { name: "Mazoon College", domain: "mazcol.edu.om", isVerified: true },
    { name: "Oman College of Management and Technology", domain: "ocmt.edu.om", isVerified: true },
    { name: "Global College of Engineering and Technology", domain: "gcet.edu.om", isVerified: true },
    { name: "Oman Tourism College", domain: "otc.edu.om", isVerified: true },
    { name: "College of Shari'a Sciences", domain: "css.edu.om", isVerified: true },
    { name: "Al-Zahra College for Women", domain: "zcw.edu.om", isVerified: true },
    { name: "International Maritime College Oman", domain: "imco.edu.om", isVerified: true },
    { name: "Waljat Colleges of Applied Sciences", domain: "waljatcollege.edu.om", isVerified: true },
    { name: "Bayan College", domain: "bayancollege.edu.om", isVerified: true },
    { name: "Oman Dental College", domain: "odc.edu.om", isVerified: true },
]