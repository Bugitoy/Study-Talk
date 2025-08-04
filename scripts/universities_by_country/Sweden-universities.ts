import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Sweden_universities = [

    // Sweden
  
    { name: "Lunds Universitet", domain: "lu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Uppsala Universitet", domain: "uu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Kungliga Tekniska högskolan", domain: "kth.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Linköpings Universitet", domain: "liu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Göteborgs universitet", domain: "gu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Stockholms universitet", domain: "su.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Umeå universitet", domain: "umu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Chalmers tekniska högskola", domain: "chalmers.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Karolinska Institutet", domain: "ki.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Sveriges lantbruksuniversitet", domain: "slu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Luleå tekniska Universitet", domain: "ltu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Linnéuniversitetet", domain: "lnu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Malmö Universitet", domain: "mau.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Karlstads universitet", domain: "kau.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Mälardalens universitet", domain: "mdu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Örebro Universitet", domain: "oru.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Handelshögskolan i Stockholm", domain: "hhs.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Jönköping University", domain: "ju.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan i Borås", domain: "hb.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Mittuniversitetet", domain: "miun.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan i Halmstad", domain: "hh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Blekinge Tekniska Högskola", domain: "bth.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan i Skövde", domain: "his.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Södertörns högskola", domain: "sh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan Dalarna", domain: "du.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan i Gävle", domain: "hig.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan Väst", domain: "hv.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Högskolan Kristianstad", domain: "hkr.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "World Maritime University", domain: "wmu.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Konstfack", domain: "konstfack.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Stockholms konstnärliga högskola", domain: "uniarts.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Kungliga Musikhögskolan i Stockholm", domain: "kmh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Kungliga Konsthögskolan", domain: "kkh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Gymnastik- och idrottshögskolan", domain: "gih.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Beckmans Designhögskola", domain: "beckmans.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Marie Cederschiöld högskola", domain: "esh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Sophiahemmet Högskola", domain: "shh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Röda Korsets högskola", domain: "rkh.se", region: "Europe", country: "Sweden", isVerified: true },
    { name: "Newmaninstitutet", domain: "newman.se", region: "Europe", country: "Sweden", isVerified: true },

]