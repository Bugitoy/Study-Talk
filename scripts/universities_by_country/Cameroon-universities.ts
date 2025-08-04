import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Cameroon_universities = [

   // Cameroon

   { name: "Université de Buéa", domain: "ubuea.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Dschang", domain: "univ-dschang.org", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Institut Catholique de Yaoundé", domain: "ucac-icy.net", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Douala", domain: "univ-douala.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Ngaoundéré", domain: "univ-ndere.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Yaoundé II", domain: "univ-yaounde2.org", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Yaoundé I", domain: "uy1.uninet.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Bamenda", domain: "uniba.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université de Maroua", domain: "univ-maroua.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université des Montagnes", domain: "udm.aed-cm.org", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université Protestante d'Afrique Centrale", domain: "upac.cm", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Université Adventiste Cosendai", domain: "uacosendai-edu.net", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Catholic University of Cameroon, Bamenda", domain: "catuc.org", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Bamenda University of Science and Technology", domain: "bustedu.com", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "Jagora University", domain: "jagora.org", region: "Africa", country: "Cameroon", isVerified: true },
   { name: "International University, Bamenda", domain: "iubda.org", region: "Africa", country: "Cameroon", isVerified: true },
]