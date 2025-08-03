import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const South_Africa_universities = [

    // South Africa

    { name: "University of Cape Town", domain: "uct.ac.za", isVerified: true },
    { name: "University of Pretoria", domain: "up.ac.za", isVerified: true },
    { name: "Stellenbosch University", domain: "sun.ac.za", isVerified: true },
    { name: "University of the Witwatersrand", domain: "wits.ac.za", isVerified: true },
    { name: "University of Johannesburg", domain: "uj.ac.za", isVerified: true },
    { name: "University of KwaZulu‑Natal", domain: "ukzn.ac.za", isVerified: true },
    { name: "Rhodes University", domain: "ru.ac.za", isVerified: true },
    { name: "North‑West University", domain: "nwu.ac.za", isVerified: true },
    { name: "University of the Western Cape", domain: "uwc.ac.za", isVerified: true },
    { name: "Tshwane University of Technology", domain: "tut.ac.za", isVerified: true },
    { name: "University of the Free State", domain: "ufs.ac.za", isVerified: true },
    { name: "Cape Peninsula University of Technology", domain: "cput.ac.za", isVerified: true },
    { name: "Nelson Mandela University", domain: "mandela.ac.za", isVerified: true },
    { name: "Durban University of Technology", domain: "dut.ac.za", isVerified: true },
    { name: "Central University of Technology", domain: "cut.ac.za", isVerified: true },
    { name: "University of Fort Hare", domain: "ufh.ac.za", isVerified: true },
    { name: "University of Limpopo", domain: "ul.ac.za", isVerified: true },
    { name: "University of Zululand", domain: "uzulu.ac.za", isVerified: true },
    { name: "Walter Sisulu University", domain: "wsu.ac.za", isVerified: true },
    { name: "Vaal University of Technology", domain: "vat.ac.za", isVerified: true },
    { name: "University of Venda", domain: "univen.ac.za", isVerified: true },
    { name: "Sefako Makgatho Health Sciences University", domain: "smu.ac.za", isVerified: true },
    { name: "Mangosuthu University of Technology", domain: "mut.ac.za", isVerified: true },
    { name: "Sol Plaatje University", domain: "spu.ac.za", isVerified: true },
    { name: "University of Mpumalanga", domain: "ump.ac.za", isVerified: true },

]