import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Norway_universities = [

    // Norway

    { name: "Universitetet i Oslo", domain: "uio.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Norges teknisk-naturvitenskaplige universitet", domain: "ntnu.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Universitetet i Bergen", domain: "uib.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "UiT Norges arktiske universitet", domain: "uit.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "OsloMet", domain: "oslomet.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Høgskolen i Østfold", domain: "hiof.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Handelshøyskolen BI", domain: "bi.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Unive rsitetet i Stavanger", domain: "uis.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Universitetet i Sørøst-Norge", domain: "usn.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Norges miljø- og biovitenskapelige universitet", domain: "nmbu.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Universitetet i Agder", domain: "uia.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Høgskulen på Vestlandet", domain: "hvl.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Norges Handelshøyskole", domain: "nhh.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Universitetet i Nordland", domain: "uin.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Universitetet i Innlandet", domain: "inn.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Høyskolen Kristiania", domain: "kristiania.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Høgskulen i Volda", domain: "hivolda.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Universitetssenteret på Svalbard", domain: "unis.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Norges idrettshøgskole", domain: "nih.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Arkitektur- og designhøgskolen i Oslo", domain: "aho.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Kunsthøgskolen i Oslo", domain: "khi.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Høgskolen i Molde", domain: "himolde.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Norges musikkhøgskole", domain: "nmh.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "VID vitenskapelige høgskole", domain: "vid.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "MF vitenskapelig høyskole", domain: "mf.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "NLA Høgskolen", domain: "nla.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Sámi allskuvla", domain: "samas.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Dronning Mauds Minne Høgskole for barnehagelærerutdanning", domain: "dmmh.no", region: "Europe", country: "Norway", isVerified: true },
    { name: "Lovisenberg diakonale høgskole", domain: "ldh.no", region: "Europe", country: "Norway", isVerified: true },

]