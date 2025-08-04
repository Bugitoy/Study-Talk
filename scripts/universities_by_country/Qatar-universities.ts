import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Qatar_universities = [

    // Qatar

    { name: "Qatar University", domain: "qu.edu.qa", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Hamad Bin Khalifa University", domain: "hbku.edu.qa", region: "Asia", country: "Qatar", isVerified: true },
    { name: "University of Doha for Science and Technology", domain: "udst.edu.qa", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Weill Cornell Medicine - Qatar", domain: "qatar.weill.cornell.edu", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Virginia Commonwealth University School of the Arts in Qatar", domain: "qatar.vcu.edu", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Doha Institute for Graduate Studies", domain: "dohainstitute.edu.qa", region: "Asia", country: "Qatar", isVerified: true },
    { name: "University of Calgary in Qatar", domain: "ucalgary.edu.qa", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Carnegie Mellon University in Qatar", domain: "qatar.cmu.edu", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Georgetown University in Qatar", domain: "qatar.georgetown.edu", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Texas A&M University at Qatar", domain: "qatar.tamu.edu", region: "Asia", country: "Qatar", isVerified: true },
    { name: "Northwestern University in Qatar", domain: "qatar.northwestern.edu", region: "Asia", country: "Qatar", isVerified: true },
    { name: "CUC Ulster University Qatar", domain: "cuc-ulster.edu.qa", region: "Asia", country: "Qatar", isVerified: true },
    { name: "HEC Paris in Qatar", domain: "qatar.hec.edu", region: "Asia", country: "Qatar", isVerified: true },
]