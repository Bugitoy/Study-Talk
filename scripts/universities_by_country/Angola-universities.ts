import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Angola_universities = [

    // Angola

    { name: "Universidade Agostinho Neto", domain: "uan.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Católica de Angola", domain: "ucan.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Técnica de Angola", domain: "utanga.co.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Metodista de Angola", domain: "uma.co.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Privada de Angola", domain: "upra.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Independente de Angola", domain: "unia.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Jean Piaget de Angola", domain: "unipiaget-angola.org", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Lusíada de Angola", domain: "ula.co.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Óscar Ribas", domain: "uor.ed.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Gregório Semedo", domain: "ugs.ed.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade José Eduardo dos Santos", domain: "ujes.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Kimpa Vita", domain: "unikivi.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade de Luanda", domain: "uniluanda.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Lueji A'Nkonde", domain: "ulan.ed.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Rainha Njinga a Mbande", domain: "uninjingambande.ed.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Mandume Ya Ndemufayo", domain: "umn.ed.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade de Belas", domain: "unibelas.online", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Cuíto Cuanavale", domain: null, region: "Africa", country: "Angola", isVerified: false },
    { name: "Universidade 11 de Novembro", domain: "uon.ed.ao", region: "Africa", country: "Angola", isVerified: true },
    { name: "Universidade Katyavala Bwila", domain: "ukb.ed.ao", region: "Africa", country: "Angola", isVerified: true },
]