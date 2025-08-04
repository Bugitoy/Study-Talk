import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Slovenia_universities = [

    // Slovenia
  
    { name: "Univerza v Ljubljani", domain: "uni-lj.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Univerza v Mariboru", domain: "um.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Univerza na Primorskem", domain: "upr.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Univerza v Novi Gorici", domain: "ung.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "IEDC-Bled School of Management", domain: "iedc.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Alma Mater Europaea", domain: "almamater.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Nova univerza", domain: "nova-uni.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "GEA College", domain: "gea-college.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Mednarodna fakulteta za družbene in poslovne študije", domain: "mfdps.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Univerza v Novem mestu", domain: "uni-nm.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Mednarodna podiplomska šola Jožefa Stefana", domain: "mps.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Fakulteta za uporabne družbene študije v Novi Gorici", domain: "fuds.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "B2 Visoka šola za poslovne vede", domain: "b2.eu", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "DOBA Fakultet", domain: "doba.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Fakulteta za zdravstvo Angele Boškin", domain: "fzab.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Fakulteta za pravo in ekonomijo", domain: null, region: "Europe", country: "Slovenia", isVerified: false },
    { name: "Fakulteta za komercialne in poslovne vede", domain: "fkpv.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Fakulteta za varstvo okolja", domain: "fvo.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Fakulteta za tehnologijo polimerov", domain: "ftpo.eu", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Fakulteta za psihoterapevtsko znanost Univerze Sigmunda Freuda v Ljubljani", domain: "sfuds.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Visoka šola za računovodstvo in finance", domain: "vsrf.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "ArtHouse - Šola za risanje in slikanje", domain: "arthouse.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Inštitut in akademija za multimedije", domain: "iam.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "MLC Fakulteta za management in pravo Ljubljana", domain: "mlcljubljana.com", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Visoka šola Ravne na Koroškem", domain: "vsr.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Visoka šola za proizvodno inženirstvo", domain: "vspi.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Visoka šola za management Bled", domain: "vsmb.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "IBS Mednarodna poslovna šola Ljubljana", domain: "ibs.si", region: "Europe", country: "Slovenia", isVerified: true },
    { name: "Visokošolski zavod Fizioterapevtika", domain: "fizioterapevtika.si", region: "Europe", country: "Slovenia", isVerified: true },
]