import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Slovenia_universities = [

    // Slovenia
  
    { name: "Univerza v Ljubljani", domain: "uni-lj.si", isVerified: true },
    { name: "Univerza v Mariboru", domain: "um.si", isVerified: true },
    { name: "Univerza na Primorskem", domain: "upr.si", isVerified: true },
    { name: "Univerza v Novi Gorici", domain: "ung.si", isVerified: true },
    { name: "IEDC-Bled School of Management", domain: "iedc.si", isVerified: true },
    { name: "Alma Mater Europaea", domain: "almamater.si", isVerified: true },
    { name: "Nova univerza", domain: "nova-uni.si", isVerified: true },
    { name: "GEA College", domain: "gea-college.si", isVerified: true },
    { name: "Mednarodna fakulteta za družbene in poslovne študije", domain: "mfdps.si", isVerified: true },
    { name: "Univerza v Novem mestu", domain: "uni-nm.si", isVerified: true },
    { name: "Mednarodna podiplomska šola Jožefa Stefana", domain: "mps.si", isVerified: true },
    { name: "Fakulteta za uporabne družbene študije v Novi Gorici", domain: "fuds.si", isVerified: true },
    { name: "B2 Visoka šola za poslovne vede", domain: "b2.eu", isVerified: true },
    { name: "DOBA Fakultet", domain: "doba.si", isVerified: true },
    { name: "Fakulteta za zdravstvo Angele Boškin", domain: "fzab.si", isVerified: true },
    { name: "Fakulteta za pravo in ekonomijo", domain: null, isVerified: false },
    { name: "Fakulteta za komercialne in poslovne vede", domain: "fkpv.si", isVerified: true },
    { name: "Fakulteta za varstvo okolja", domain: "fvo.si", isVerified: true },
    { name: "Fakulteta za tehnologijo polimerov", domain: "ftpo.eu", isVerified: true },
    { name: "Fakulteta za psihoterapevtsko znanost Univerze Sigmunda Freuda v Ljubljani", domain: "sfuds.si", isVerified: true },
    { name: "Visoka šola za računovodstvo in finance", domain: "vsrf.si", isVerified: true },
    { name: "ArtHouse - Šola za risanje in slikanje", domain: "arthouse.si", isVerified: true },
    { name: "Inštitut in akademija za multimedije", domain: "iam.si", isVerified: true },
    { name: "MLC Fakulteta za management in pravo Ljubljana", domain: "mlcljubljana.com", isVerified: true },
    { name: "Visoka šola Ravne na Koroškem", domain: "vsr.si", isVerified: true },
    { name: "Visoka šola za proizvodno inženirstvo", domain: "vspi.si", isVerified: true },
    { name: "Visoka šola za management Bled", domain: "vsmb.si", isVerified: true },
    { name: "IBS Mednarodna poslovna šola Ljubljana", domain: "ibs.si", isVerified: true },
    { name: "Visokošolski zavod Fizioterapevtika", domain: "fizioterapevtika.si", isVerified: true },
]