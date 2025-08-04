import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Lithuania_universities = [

    // Lithuania

    { name: "Vilniaus Universitetas", domain: "vu.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Kauno technologijos universitetas", domain: "ktu.edu", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vytauto Didžiojo universitetas", domain: "vdu.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vilniaus Gedimino Technikos Universitetas", domain: "vilniustech.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Lietuvos sveikatos mokslų universitetas", domain: "lsmu.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Mykolo Romerio Universitetas", domain: "mruni.eu", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Klaipėdos Universitetas", domain: "ku.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vilniaus kolegija", domain: "viko.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "ISM Vadybos ir ekonomikos universitetas", domain: "ism.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vilniaus Dailės Akademija", domain: "vda.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Europos Humanitarinis Universitetas", domain: "ehu.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Kauno Kolegija", domain: "kaunokolegija.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Lietuvos sporto universitetas", domain: "lsu.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Lietuvos muzikos ir teatro akademija", domain: "lmta.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Klaipėdos valstybinė kolegija", domain: "kvk.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "LCC tarptautinis universitetas", domain: "lcc.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Generolo Jono Žemaičio Lietuvos karo akademija", domain: "lka.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Socialinių mokslų kolegija", domain: "smk.lt", region: "Europe", country: "Lithuania", isVerified: true },    
    { name: "Lietuvos inžinerijos kolegija", domain: "lik.tech", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Utenos kolegija", domain: "utenos-kolegija.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Panevėžio kolegija", domain: "panko.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Mykolo Romerio universiteto Sūduvos akademija", domain: "suduvosakademija.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Lietuvos verslo kolegija", domain: "ltvk.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Šiaulių valstybinė kolegija", domain: "svako.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Kazimiero Simonavičiaus universitetas", domain: "ksu.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vilniaus technologijų ir dizaino kolegija", domain: "vtdk.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vilniaus verslo kolegija", domain: "kolegija.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Alytaus kolegija", domain: "alytauskolegija.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Lietuvos aukštoji jūreivystės mokykla", domain: "lajm.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Kauno miškų ir aplinkos inžinerijos kolegija", domain: "kmaik.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Vilniaus dizaino kolegija", domain: "dizainokolegija.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Šiaurės Lietuvos kolegija", domain: "slk.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Kolpingo kolegija", domain: "kolping.lt", region: "Europe", country: "Lithuania", isVerified: true },
    { name: "Graičiūno aukštoji vadybos mokykla", domain: "avm.lt", region: "Europe", country: "Lithuania", isVerified: true },
]