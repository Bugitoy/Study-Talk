import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Cameroon_universities = [

   // Cameroon

   { name: "Université de Buéa", domain: "ubuea.cm", isVerified: true },
   { name: "Université de Dschang", domain: "univ-dschang.org", isVerified: true },
   { name: "Institut Catholique de Yaoundé", domain: "ucac-icy.net", isVerified: true },
   { name: "Université de Douala", domain: "univ-douala.cm", isVerified: true },
   { name: "Université de Ngaoundéré", domain: "univ-ndere.cm", isVerified: true },
   { name: "Université de Yaoundé II", domain: "univ-yaounde2.org", isVerified: true },
   { name: "Université de Yaoundé I", domain: "uy1.uninet.cm", isVerified: true },
   { name: "Université de Bamenda", domain: "uniba.cm", isVerified: true },
   { name: "Université de Maroua", domain: "univ-maroua.cm", isVerified: true },
   { name: "Université des Montagnes", domain: "udm.aed-cm.org", isVerified: true },
   { name: "Université Protestante d'Afrique Centrale", domain: "upac.cm", isVerified: true },
   { name: "Université Adventiste Cosendai", domain: "uacosendai-edu.net", isVerified: true },
   { name: "Catholic University of Cameroon, Bamenda", domain: "catuc.org", isVerified: true },
   { name: "Bamenda University of Science and Technology", domain: "bustedu.com", isVerified: true },
   { name: "Jagora University", domain: "jagora.org", isVerified: true },
   { name: "International University, Bamenda", domain: "iubda.org", isVerified: true },
]