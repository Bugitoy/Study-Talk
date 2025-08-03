import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Finland_universities = [

    // Finland

    { name: "Helsingin yliopisto", domain: "helsinki.fi", isVerified: true },
    { name: "Tampereen yliopisto", domain: "tuni.fi", isVerified: true },
    { name: "Aalto‑yliopisto", domain: "aalto.fi", isVerified: true },
    { name: "Jyväskylän yliopisto", domain: "jyu.fi", isVerified: true },
    { name: "Turun yliopisto", domain: "utu.fi", isVerified: true },
    { name: "Oulun yliopisto", domain: "oulu.fi", isVerified: true },
    { name: "Itä‑Suomen yliopisto", domain: "uef.fi", isVerified: true },
    { name: "Åbo Akademi", domain: "abo.fi", isVerified: true },
    { name: "Lappeenrannan teknillinen yliopisto", domain: "lut.fi", isVerified: true },
    { name: "Vaasan yliopisto", domain: "uwasa.fi", isVerified: true },
    { name: "Metropolia Ammattikorkeakoulu", domain: "metropolia.fi", isVerified: true },
    { name: "Taideyliopisto", domain: "uniarts.fi", isVerified: true },
    { name: "Turun ammattikorkeakoulu", domain: "turkuamk.fi", isVerified: true },
    { name: "Lapin yliopisto", domain: "ulapland.fi", isVerified: true },
    { name: "Jyväskylän ammattikorkeakoulu", domain: "jamk.fi", isVerified: true },
    { name: "Kaakkois‑Suomen ammattikorkeakoulu", domain: "xamk.fi", isVerified: true },
    { name: "Hämeen ammattikorkeakoulu", domain: "hamk.fi", isVerified: true },
    { name: "LAB University of Applied Sciences", domain: "lab.fi", isVerified: true },
    { name: "HAAGA‑HELIA ammattikorkeakoulu", domain: "haaga‑helia.fi", isVerified: true },
    { name: "Laurea‑ammattikorkeakoulu", domain: "laurea.fi", isVerified: true },
    { name: "Oulun Seudun ammattikorkeakoulu", domain: "osao.fi", isVerified: true },
    { name: "Hanken Svenska handelshögskolan", domain: "hanken.fi", isVerified: true },
    { name: "Savonia‑ammattikorkeakoulu", domain: "savonia.fi", isVerified: true },
    { name: "Satakunnan ammattikorkeakoulu", domain: "samk.fi", isVerified: true },
    { name: "Seinäjoen ammattikorkeakoulu", domain: "seinamk.fi", isVerified: true },
    { name: "Yrkeshögskolan Arcada", domain: "arcada.fi", isVerified: true },
    { name: "Vaasan ammattikorkeakoulu", domain: "vassa.fi", isVerified: true },
    { name: "Yrkeshögskolan Novia", domain: "novia.fi", isVerified: true },
    { name: "Kajaanin ammattikorkeakoulu", domain: "kamk.fi", isVerified: true },
    { name: "Humanistinen ammattikorkeakoulu", domain: "humak.fi", isVerified: true },
    { name: "Diakonia‑ammattikorkeakoulu", domain: "diak.fi", isVerified: true },
    { name: "Karelia‑ammattikorkeakoulu", domain: "karelia.fi", isVerified: true },
    { name: "Lapin Ammattikorkeakoulu", domain: "lapinamk.fi", isVerified: true },
    { name: "Centria ammattikorkeakoulu", domain: "centria.fi", isVerified: true },
    { name: "Högskolan på Åland", domain: "hanken.ax", isVerified: true },

]