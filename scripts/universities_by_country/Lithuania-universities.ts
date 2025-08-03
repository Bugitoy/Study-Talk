import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Lithuania_universities = [

    // Lithuania

    { name: "Vilniaus Universitetas", domain: "vu.lt", isVerified: true },
    { name: "Kauno technologijos universitetas", domain: "ktu.edu", isVerified: true },
    { name: "Vytauto Didžiojo universitetas", domain: "vdu.lt", isVerified: true },
    { name: "Vilniaus Gedimino Technikos Universitetas", domain: "vilniustech.lt", isVerified: true },
    { name: "Lietuvos sveikatos mokslų universitetas", domain: "lsmu.lt", isVerified: true },
    { name: "Mykolo Romerio Universitetas", domain: "mruni.eu", isVerified: true },
    { name: "Klaipėdos Universitetas", domain: "ku.lt", isVerified: true },
    { name: "Vilniaus kolegija", domain: "viko.lt", isVerified: true },
    { name: "ISM Vadybos ir ekonomikos universitetas", domain: "ism.lt", isVerified: true },
    { name: "Vilniaus Dailės Akademija", domain: "vda.lt", isVerified: true },
    { name: "Europos Humanitarinis Universitetas", domain: "ehu.lt", isVerified: true },
    { name: "Kauno Kolegija", domain: "kaunokolegija.lt", isVerified: true },
    { name: "Lietuvos sporto universitetas", domain: "lsu.lt", isVerified: true },
    { name: "Lietuvos muzikos ir teatro akademija", domain: "lmta.lt", isVerified: true },
    { name: "Klaipėdos valstybinė kolegija", domain: "kvk.lt", isVerified: true },
    { name: "LCC tarptautinis universitetas", domain: "lcc.lt", isVerified: true },
    { name: "Generolo Jono Žemaičio Lietuvos karo akademija", domain: "lka.lt", isVerified: true },
    { name: "Socialinių mokslų kolegija", domain: "smk.lt", isVerified: true },    
    { name: "Lietuvos inžinerijos kolegija", domain: "lik.tech", isVerified: true },
    { name: "Utenos kolegija", domain: "utenos-kolegija.lt", isVerified: true },
    { name: "Panevėžio kolegija", domain: "panko.lt", isVerified: true },
    { name: "Mykolo Romerio universiteto Sūduvos akademija", domain: "suduvosakademija.lt", isVerified: true },
    { name: "Lietuvos verslo kolegija", domain: "ltvk.lt", isVerified: true },
    { name: "Šiaulių valstybinė kolegija", domain: "svako.lt", isVerified: true },
    { name: "Kazimiero Simonavičiaus universitetas", domain: "ksu.lt", isVerified: true },
    { name: "Vilniaus technologijų ir dizaino kolegija", domain: "vtdk.lt", isVerified: true },
    { name: "Vilniaus verslo kolegija", domain: "kolegija.lt", isVerified: true },
    { name: "Alytaus kolegija", domain: "alytauskolegija.lt", isVerified: true },
    { name: "Lietuvos aukštoji jūreivystės mokykla", domain: "lajm.lt", isVerified: true },
    { name: "Kauno miškų ir aplinkos inžinerijos kolegija", domain: "kmaik.lt", isVerified: true },
    { name: "Vilniaus dizaino kolegija", domain: "dizainokolegija.lt", isVerified: true },
    { name: "Šiaurės Lietuvos kolegija", domain: "slk.lt", isVerified: true },
    { name: "Kolpingo kolegija", domain: "kolping.lt", isVerified: true },
    { name: "Graičiūno aukštoji vadybos mokykla", domain: "avm.lt", isVerified: true },
]