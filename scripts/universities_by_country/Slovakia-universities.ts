import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Slovakia_universities = [

    // Slovakia

    { name: "Univerzita Komenského v Bratislave", domain: "uniba.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Slovenská technická univerzita v Bratislave", domain: "stuba.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Technická univerzita v Košiciach", domain: "tuke.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Univerzita Pavla Jozefa Šafárika v Košiciach", domain: "upjs.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Žilinská univerzita v Žiline", domain: "uniza.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Univerzita Mateja Bela v Banskej Bystrici", domain: "umb.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Slovenská poľnohospodárska univerzita v Nitre", domain: "uniag.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Univerzita Konštantína Filozofa v Nitre", domain: "ukf.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Ekonomická univerzita v Bratislave", domain: "euba.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Prešovská univerzita v Prešove", domain: "unipo.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Trnavská univerzita v Trnave", domain: "truni.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Technická univerzita vo Zvolene", domain: "tuzvo.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Univerzita sv. Cyrila a Metoda v Trnave", domain: "ucm.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Katolícka Univerzita v Ružomberku", domain: "ku.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Univerzita Veterinárskeho Lekárstva a Farmácie v Košiciach", domain: "uvlf.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola výtvarných umení v Bratislave", domain: "vsvu.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Trenčianska Univerzita Alexandra Dubčeka v Trenčíne", domain: "tnuni.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Univerzita J. Selyeho", domain: "ujs.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola múzických umení v Bratislave", domain: "vsmu.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Paneurópska vysoká škola", domain: "paneurouni.com", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Akadémia umení v Banskej Bystrici", domain: "aku.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola ekonómie a manažmentu verejnej správy v Bratislave", domain: "vsemvs.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká Škola Zdravotníctva a Sociálnej Práce sv. Alžbety v Bratislave", domain: "vssvalzbety.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola medzinárodného podnikania ISM Slovakia v Prešove", domain: "ismpo.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola manažmentu, City University of Seattle", domain: "vsm.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola Danubius", domain: "vsdanubius.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká Škola Bezpečnostného Manažérstva v Košiciach", domain: "vsbm.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Vysoká škola DTI", domain: "dti.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Slovenská zdravotnícka univerzita v Bratislave", domain: "szu.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Bratislavská medzinárodná škola liberálnych štúdií", domain: "bisla.sk", region: "Europe", country: "Slovakia", isVerified: true },
    { name: "Hudobná a umelecká akadémia Jána Albrechta", domain: "hua.sk", region: "Europe", country: "Slovakia", isVerified: true },
]