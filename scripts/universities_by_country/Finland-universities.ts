import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Finland_universities = [

    // Finland

    { name: "Helsingin yliopisto", domain: "helsinki.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Tampereen yliopisto", domain: "tuni.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Aalto‑yliopisto", domain: "aalto.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Jyväskylän yliopisto", domain: "jyu.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Turun yliopisto", domain: "utu.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Oulun yliopisto", domain: "oulu.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Itä‑Suomen yliopisto", domain: "uef.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Åbo Akademi", domain: "abo.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Lappeenrannan teknillinen yliopisto", domain: "lut.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Vaasan yliopisto", domain: "uwasa.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Metropolia Ammattikorkeakoulu", domain: "metropolia.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Taideyliopisto", domain: "uniarts.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Turun ammattikorkeakoulu", domain: "turkuamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Lapin yliopisto", domain: "ulapland.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Jyväskylän ammattikorkeakoulu", domain: "jamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Kaakkois‑Suomen ammattikorkeakoulu", domain: "xamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Hämeen ammattikorkeakoulu", domain: "hamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "LAB University of Applied Sciences", domain: "lab.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "HAAGA‑HELIA ammattikorkeakoulu", domain: "haaga‑helia.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Laurea‑ammattikorkeakoulu", domain: "laurea.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Oulun Seudun ammattikorkeakoulu", domain: "osao.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Hanken Svenska handelshögskolan", domain: "hanken.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Savonia‑ammattikorkeakoulu", domain: "savonia.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Satakunnan ammattikorkeakoulu", domain: "samk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Seinäjoen ammattikorkeakoulu", domain: "seinamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Yrkeshögskolan Arcada", domain: "arcada.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Vaasan ammattikorkeakoulu", domain: "vassa.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Yrkeshögskolan Novia", domain: "novia.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Kajaanin ammattikorkeakoulu", domain: "kamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Humanistinen ammattikorkeakoulu", domain: "humak.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Diakonia‑ammattikorkeakoulu", domain: "diak.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Karelia‑ammattikorkeakoulu", domain: "karelia.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Lapin Ammattikorkeakoulu", domain: "lapinamk.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Centria ammattikorkeakoulu", domain: "centria.fi", region: "Europe", country: "Finland", isVerified: true },
    { name: "Högskolan på Åland", domain: "hanken.ax", region: "Europe", country: "Finland", isVerified: true },

]