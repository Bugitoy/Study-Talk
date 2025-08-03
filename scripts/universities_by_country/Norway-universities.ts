import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Norway_universities = [

    // Norway

    { name: "Universitetet i Oslo", domain: "uio.no", isVerified: true },
    { name: "Norges teknisk-naturvitenskaplige universitet", domain: "ntnu.no", isVerified: true },
    { name: "Universitetet i Bergen", domain: "uib.no", isVerified: true },
    { name: "UiT Norges arktiske universitet", domain: "uit.no", isVerified: true },
    { name: "OsloMet", domain: "oslomet.no", isVerified: true },
    { name: "Høgskolen i Østfold", domain: "hiof.no", isVerified: true },
    { name: "Handelshøyskolen BI", domain: "bi.no", isVerified: true },
    { name: "Unive rsitetet i Stavanger", domain: "uis.no", isVerified: true },
    { name: "Universitetet i Sørøst-Norge", domain: "usn.no", isVerified: true },
    { name: "Norges miljø- og biovitenskapelige universitet", domain: "nmbu.no", isVerified: true },
    { name: "Universitetet i Agder", domain: "uia.no", isVerified: true },
    { name: "Høgskulen på Vestlandet", domain: "hvl.no", isVerified: true },
    { name: "Norges Handelshøyskole", domain: "nhh.no", isVerified: true },
    { name: "Universitetet i Nordland", domain: "uin.no", isVerified: true },
    { name: "Universitetet i Innlandet", domain: "inn.no", isVerified: true },
    { name: "Høyskolen Kristiania", domain: "kristiania.no", isVerified: true },
    { name: "Høgskulen i Volda", domain: "hivolda.no", isVerified: true },
    { name: "Universitetssenteret på Svalbard", domain: "unis.no", isVerified: true },
    { name: "Norges idrettshøgskole", domain: "nih.no", isVerified: true },
    { name: "Arkitektur- og designhøgskolen i Oslo", domain: "aho.no", isVerified: true },
    { name: "Kunsthøgskolen i Oslo", domain: "khi.no", isVerified: true },
    { name: "Høgskolen i Molde", domain: "himolde.no", isVerified: true },
    { name: "Norges musikkhøgskole", domain: "nmh.no", isVerified: true },
    { name: "VID vitenskapelige høgskole", domain: "vid.no", isVerified: true },
    { name: "MF vitenskapelig høyskole", domain: "mf.no", isVerified: true },
    { name: "NLA Høgskolen", domain: "nla.no", isVerified: true },
    { name: "Sámi allskuvla", domain: "samas.no", isVerified: true },
    { name: "Dronning Mauds Minne Høgskole for barnehagelærerutdanning", domain: "dmmh.no", isVerified: true },
    { name: "Lovisenberg diakonale høgskole", domain: "ldh.no", isVerified: true },

]