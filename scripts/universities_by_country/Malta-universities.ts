import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Malta_universities = [

    // Malta

    { name: "L-Università ta' Malta", domain: "um.edu.mt", region: "Europe", country: "Malta", isVerified: true },
    { name: "Malta College of Arts, Science and Technology", domain: "mcast.edu.mt", region: "Europe", country: "Malta", isVerified: true },
    { name: "Institute of Tourism Studies Malta", domain: "its.edu.mt", region: "Europe", country: "Malta", isVerified: true },
    { name: "American University of Malta", domain: "aum.edu.mt", region: "Europe", country: "Malta", isVerified: true },
    { name: "The European Graduate School", domain: "egs.edu", region: "Europe", country: "Malta", isVerified: true },
   
]