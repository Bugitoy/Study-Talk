import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Sweden_universities = [

    // Sweden
  
    { name: "Lunds Universitet", domain: "lu.se", isVerified: true },
    { name: "Uppsala Universitet", domain: "uu.se", isVerified: true },
    { name: "Kungliga Tekniska högskolan", domain: "kth.se", isVerified: true },
    { name: "Linköpings Universitet", domain: "liu.se", isVerified: true },
    { name: "Göteborgs universitet", domain: "gu.se", isVerified: true },
    { name: "Stockholms universitet", domain: "su.se", isVerified: true },
    { name: "Umeå universitet", domain: "umu.se", isVerified: true },
    { name: "Chalmers tekniska högskola", domain: "chalmers.se", isVerified: true },
    { name: "Karolinska Institutet", domain: "ki.se", isVerified: true },
    { name: "Sveriges lantbruksuniversitet", domain: "slu.se", isVerified: true },
    { name: "Luleå tekniska Universitet", domain: "ltu.se", isVerified: true },
    { name: "Linnéuniversitetet", domain: "lnu.se", isVerified: true },
    { name: "Malmö Universitet", domain: "mau.se", isVerified: true },
    { name: "Karlstads universitet", domain: "kau.se", isVerified: true },
    { name: "Mälardalens universitet", domain: "mdu.se", isVerified: true },
    { name: "Örebro Universitet", domain: "oru.se", isVerified: true },
    { name: "Handelshögskolan i Stockholm", domain: "hhs.se", isVerified: true },
    { name: "Jönköping University", domain: "ju.se", isVerified: true },
    { name: "Högskolan i Borås", domain: "hb.se", isVerified: true },
    { name: "Mittuniversitetet", domain: "miun.se", isVerified: true },
    { name: "Högskolan i Halmstad", domain: "hh.se", isVerified: true },
    { name: "Blekinge Tekniska Högskola", domain: "bth.se", isVerified: true },
    { name: "Högskolan i Skövde", domain: "his.se", isVerified: true },
    { name: "Södertörns högskola", domain: "sh.se", isVerified: true },
    { name: "Högskolan Dalarna", domain: "du.se", isVerified: true },
    { name: "Högskolan i Gävle", domain: "hig.se", isVerified: true },
    { name: "Högskolan Väst", domain: "hv.se", isVerified: true },
    { name: "Högskolan Kristianstad", domain: "hkr.se", isVerified: true },
    { name: "World Maritime University", domain: "wmu.se", isVerified: true },
    { name: "Konstfack", domain: "konstfack.se", isVerified: true },
    { name: "Stockholms konstnärliga högskola", domain: "uniarts.se", isVerified: true },
    { name: "Kungliga Musikhögskolan i Stockholm", domain: "kmh.se", isVerified: true },
    { name: "Kungliga Konsthögskolan", domain: "kkh.se", isVerified: true },
    { name: "Gymnastik- och idrottshögskolan", domain: "gih.se", isVerified: true },
    { name: "Beckmans Designhögskola", domain: "beckmans.se", isVerified: true },
    { name: "Marie Cederschiöld högskola", domain: "esh.se", isVerified: true },
    { name: "Sophiahemmet Högskola", domain: "shh.se", isVerified: true },
    { name: "Röda Korsets högskola", domain: "rkh.se", isVerified: true },
    { name: "Newmaninstitutet", domain: "newman.se", isVerified: true },

]