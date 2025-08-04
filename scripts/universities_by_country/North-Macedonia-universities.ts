import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const North_Macedonia_universities = [

    // North Macedonia

    { name: "Univerzitet Sv. Kiril i Metódij vo Skopje", domain: "ukim.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "Goce Delčev University of Štip", domain: "ugd.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "Univerzitet Sv. Kliment Ohridski vo Bitola", domain: "uklo.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "South East European University", domain: "seeu.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "International Balkan University", domain: "ibu.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "Universiteti i Tetovës", domain: "unite.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "University for Information Science and Technology St. Paul the Apostle", domain: "uist.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "University American College Skopje", domain: "uacs.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "International Slavic University G. R. Derzhavin", domain: "msu.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "American University of Europe", domain: "aue.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "University of Skopje", domain: "utms.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "Uluslararasi Vizyon Üniversitesi", domain: "vision.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "European University", domain: "eu.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "Universiteti Nderkombetar i Struges", domain: "iust.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
    { name: "MIT Univerzitet", domain: "mit.edu.mk", region: "Europe", country: "North Macedonia", isVerified: true },
]