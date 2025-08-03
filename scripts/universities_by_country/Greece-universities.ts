import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Greece_universities = [

    // Greece
  
    { name: "National and Kapodistrian University of Athens", domain: "uoa.gr", isVerified: true },
    { name: "Aristotle University of Thessaloniki", domain: "auth.gr", isVerified: true },
    { name: "National Technical University of Athens", domain: "ntua.gr", isVerified: true },
    { name: "University of Patras", domain: "upatras.gr", isVerified: true },
    { name: "University of Crete", domain: "uoc.gr", isVerified: true },
    { name: "University of Thessaly", domain: "uth.gr", isVerified: true },
    { name: "Athens University of Economics and Business", domain: "aueb.gr", isVerified: true },
    { name: "University of Ioannina", domain: "uoi.gr", isVerified: true },
    { name: "University of the Aegean", domain: "aegean.gr", isVerified: true },
    { name: "International Hellenic University", domain: "ihu.edu.gr", isVerified: true },
    { name: "Democritus University of Thrace", domain: "duth.gr", isVerified: true },
    { name: "University of West Attica", domain: "uniwa.gr", isVerified: true },
    { name: "University of Macedonia", domain: "uom.gr", isVerified: true },
    { name: "Technical University of Crete", domain: "tuc.gr", isVerified: true },
    { name: "University of Piraeus", domain: "unipi.gr", isVerified: true },
    { name: "University of Western Macedonia", domain: "uowm.gr", isVerified: true },
    { name: "Ionian University", domain: "ionio.gr", isVerified: true },
    { name: "University of Peloponnese", domain: "uop.gr", isVerified: true },
    { name: "Agricultural University of Athens", domain: "aua.gr", isVerified: true },
    { name: "Hellenic Mediterranean University", domain: "hmu.gr", isVerified: true },
    { name: "The American College of Greece", domain: "acg.edu", isVerified: true },
    { name: "Panteion University", domain: "panteion.gr", isVerified: true },
    { name: "Harokopio University", domain: "hua.gr", isVerified: true },
    { name: "Athens School of Fine Arts", domain: "asfa.gr", isVerified: true },
    { name: "The American College of Thessaloniki", domain: "act.edu", isVerified: true },
    { name: "Hellenic Naval Academy", domain: null, isVerified: false },
]