import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Slovakia_universities = [

    // Slovakia

    { name: "Univerzita Komenského v Bratislave", domain: "uniba.sk", isVerified: true },
    { name: "Slovenská technická univerzita v Bratislave", domain: "stuba.sk", isVerified: true },
    { name: "Technická univerzita v Košiciach", domain: "tuke.sk", isVerified: true },
    { name: "Univerzita Pavla Jozefa Šafárika v Košiciach", domain: "upjs.sk", isVerified: true },
    { name: "Žilinská univerzita v Žiline", domain: "uniza.sk", isVerified: true },
    { name: "Univerzita Mateja Bela v Banskej Bystrici", domain: "umb.sk", isVerified: true },
    { name: "Slovenská poľnohospodárska univerzita v Nitre", domain: "uniag.sk", isVerified: true },
    { name: "Univerzita Konštantína Filozofa v Nitre", domain: "ukf.sk", isVerified: true },
    { name: "Ekonomická univerzita v Bratislave", domain: "euba.sk", isVerified: true },
    { name: "Prešovská univerzita v Prešove", domain: "unipo.sk", isVerified: true },
    { name: "Trnavská univerzita v Trnave", domain: "truni.sk", isVerified: true },
    { name: "Technická univerzita vo Zvolene", domain: "tuzvo.sk", isVerified: true },
    { name: "Univerzita sv. Cyrila a Metoda v Trnave", domain: "ucm.sk", isVerified: true },
    { name: "Katolícka Univerzita v Ružomberku", domain: "ku.sk", isVerified: true },
    { name: "Univerzita Veterinárskeho Lekárstva a Farmácie v Košiciach", domain: "uvlf.sk", isVerified: true },
    { name: "Vysoká škola výtvarných umení v Bratislave", domain: "vsvu.sk", isVerified: true },
    { name: "Trenčianska Univerzita Alexandra Dubčeka v Trenčíne", domain: "tnuni.sk", isVerified: true },
    { name: "Univerzita J. Selyeho", domain: "ujs.sk", isVerified: true },
    { name: "Vysoká škola múzických umení v Bratislave", domain: "vsmu.sk", isVerified: true },
    { name: "Paneurópska vysoká škola", domain: "paneurouni.com", isVerified: true },
    { name: "Akadémia umení v Banskej Bystrici", domain: "aku.sk", isVerified: true },
    { name: "Vysoká škola ekonómie a manažmentu verejnej správy v Bratislave", domain: "vsemvs.sk", isVerified: true },
    { name: "Vysoká Škola Zdravotníctva a Sociálnej Práce sv. Alžbety v Bratislave", domain: "vssvalzbety.sk", isVerified: true },
    { name: "Vysoká škola medzinárodného podnikania ISM Slovakia v Prešove", domain: "ismpo.sk", isVerified: true },
    { name: "Vysoká škola manažmentu, City University of Seattle", domain: "vsm.sk", isVerified: true },
    { name: "Vysoká škola Danubius", domain: "vsdanubius.sk", isVerified: true },
    { name: "Vysoká Škola Bezpečnostného Manažérstva v Košiciach", domain: "vsbm.sk", isVerified: true },
    { name: "Vysoká škola DTI", domain: "dti.sk", isVerified: true },
    { name: "Slovenská zdravotnícka univerzita v Bratislave", domain: "szu.sk", isVerified: true },
    { name: "Bratislavská medzinárodná škola liberálnych štúdií", domain: "bisla.sk", isVerified: true },
    { name: "Hudobná a umelecká akadémia Jána Albrechta", domain: "hua.sk", isVerified: true },
]