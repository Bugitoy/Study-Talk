import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Estonia_universities = [

    // Estonia

    { name: "Tartu Ülikool", domain: "ut.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Tallinna Tehnikaülikool", domain: "taltech.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Tallinna Ülikool", domain: "tlu.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Eesti Maaülikool", domain: "emu.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Eesti Kunstiakadeemia", domain: "eaa.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Tallinna Tehnikakõrgkool", domain: "ttk.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Eesti Muusika- ja Teatriakadeemia", domain: "eamt.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "EBS Rahvusvaheline ülikool", domain: "ebs.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Tartu Tervishoiu Kõrgkool", domain: "tartuh.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Sisekaitseakadeemia", domain: "sisekaitse.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Tallinna Tervishoiu Kõrgkool", domain: "ttk.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Eesti Ettevõtluskõrgkool Mainor", domain: "mainor.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Eesti Lennuakadeemia", domain: "ela.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "Kõrgem Kunstikool Pallas", domain: "pallas.ee", region: "Europe", country: "Estonia", isVerified: true },
    { name: "EELK Usuteaduse Instituut", domain: "usuteadus.ee", region: "Europe", country: "Estonia", isVerified: true },
]