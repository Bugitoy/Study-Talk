import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Estonia_universities = [

    // Estonia

    { name: "Tartu Ülikool", domain: "ut.ee", isVerified: true },
    { name: "Tallinna Tehnikaülikool", domain: "taltech.ee", isVerified: true },
    { name: "Tallinna Ülikool", domain: "tlu.ee", isVerified: true },
    { name: "Eesti Maaülikool", domain: "emu.ee", isVerified: true },
    { name: "Eesti Kunstiakadeemia", domain: "eaa.ee", isVerified: true },
    { name: "Tallinna Tehnikakõrgkool", domain: "ttk.ee", isVerified: true },
    { name: "Eesti Muusika- ja Teatriakadeemia", domain: "eamt.ee", isVerified: true },
    { name: "EBS Rahvusvaheline ülikool", domain: "ebs.ee", isVerified: true },
    { name: "Tartu Tervishoiu Kõrgkool", domain: "tartuh.ee", isVerified: true },
    { name: "Sisekaitseakadeemia", domain: "sisekaitse.ee", isVerified: true },
    { name: "Tallinna Tervishoiu Kõrgkool", domain: "ttk.ee", isVerified: true },
    { name: "Eesti Ettevõtluskõrgkool Mainor", domain: "mainor.ee", isVerified: true },
    { name: "Eesti Lennuakadeemia", domain: "ela.ee", isVerified: true },
    { name: "Kõrgem Kunstikool Pallas", domain: "pallas.ee", isVerified: true },
    { name: "EELK Usuteaduse Instituut", domain: "usuteadus.ee", isVerified: true },
]