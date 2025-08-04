import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Greece_universities = [

    // Greece
  
    { name: "National and Kapodistrian University of Athens", domain: "uoa.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Aristotle University of Thessaloniki", domain: "auth.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "National Technical University of Athens", domain: "ntua.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Patras", domain: "upatras.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Crete", domain: "uoc.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Thessaly", domain: "uth.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Athens University of Economics and Business", domain: "aueb.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Ioannina", domain: "uoi.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of the Aegean", domain: "aegean.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "International Hellenic University", domain: "ihu.edu.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Democritus University of Thrace", domain: "duth.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of West Attica", domain: "uniwa.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Macedonia", domain: "uom.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Technical University of Crete", domain: "tuc.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Piraeus", domain: "unipi.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Western Macedonia", domain: "uowm.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Ionian University", domain: "ionio.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "University of Peloponnese", domain: "uop.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Agricultural University of Athens", domain: "aua.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Hellenic Mediterranean University", domain: "hmu.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "The American College of Greece", domain: "acg.edu", region: "Europe", country: "Greece", isVerified: true },
    { name: "Panteion University", domain: "panteion.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Harokopio University", domain: "hua.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "Athens School of Fine Arts", domain: "asfa.gr", region: "Europe", country: "Greece", isVerified: true },
    { name: "The American College of Thessaloniki", domain: "act.edu", region: "Europe", country: "Greece", isVerified: true },
    { name: "Hellenic Naval Academy", domain: null, region: "Europe", country: "Greece", isVerified: false },
]