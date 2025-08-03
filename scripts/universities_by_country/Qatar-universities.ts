import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Qatar_universities = [

    // Qatar

    { name: "Qatar University", domain: "qu.edu.qa", isVerified: true },
    { name: "Hamad Bin Khalifa University", domain: "hbku.edu.qa", isVerified: true },
    { name: "University of Doha for Science and Technology", domain: "udst.edu.qa", isVerified: true },
    { name: "Weill Cornell Medicine - Qatar", domain: "qatar.weill.cornell.edu", isVerified: true },
    { name: "Virginia Commonwealth University School of the Arts in Qatar", domain: "qatar.vcu.edu", isVerified: true },
    { name: "Doha Institute for Graduate Studies", domain: "dohainstitute.edu.qa", isVerified: true },
    { name: "University of Calgary in Qatar", domain: "ucalgary.edu.qa", isVerified: true },
    { name: "Carnegie Mellon University in Qatar", domain: "qatar.cmu.edu", isVerified: true },
    { name: "Georgetown University in Qatar", domain: "qatar.georgetown.edu", isVerified: true },
    { name: "Texas A&M University at Qatar", domain: "qatar.tamu.edu", isVerified: true },
    { name: "Northwestern University in Qatar", domain: "qatar.northwestern.edu", isVerified: true },
    { name: "CUC Ulster University Qatar", domain: "cuc-ulster.edu.qa", isVerified: true },
    { name: "HEC Paris in Qatar", domain: "qatar.hec.edu", isVerified: true },
]