import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Switzerland_universities = [

    // Switzerland
    
    { name: "Eidgenössische Technische Hochschule Zürich", domain: "ethz.ch", isVerified: true },
    { name: "École Polytechnique Fédérale de Lausanne", domain: "epfl.ch", isVerified: true },
    { name: "Universität Zürich", domain: "uzh.ch", isVerified: true },
    { name: "Université de Genève", domain: "unige.ch", isVerified: true },
    { name: "Universität Bern", domain: "unibe.ch", isVerified: true },
    { name: "Universität Basel", domain: "unibas.ch", isVerified: true },
    { name: "Université de Lausanne", domain: "unil.ch", isVerified: true },
    { name: "Université de Fribourg", domain: "unifr.ch", isVerified: true },
    { name: "Zürcher Hochschule für Angewandte Wissenschaften", domain: "zhaw.ch", isVerified: true },
    { name: "Universität St.Gallen", domain: "unisg.ch", isVerified: true },
    { name: "Fachhochschule Nordwestschweiz", domain: "fhnw.ch", isVerified: true },
    { name: "Berner Fachhochschule", domain: "bfh.ch", isVerified: true },
    { name: "Université de Neuchâtel", domain: "unine.ch", isVerified: true },
    { name: "Hochschule Luzern", domain: "hslu.ch", isVerified: true },
    { name: "Università della Svizzera Italiana", domain: "usi.ch", isVerified: true },
    { name: "Institut de hautes études internationales et du développement", domain: "graduateinstitute.ch", isVerified: true },
    { name: "Ostschweizer Fachhochschule", domain: "ost.ch", isVerified: true },
    { name: "Universität Luzern", domain: "unilu.ch", isVerified: true },
    { name: "Haute École Spécialisée de Suisse Occidentale", domain: "hevs.ch", isVerified: true },
    { name: "Scuola universitaria professionale della Svizzera italiana", domain: "supsi.ch", isVerified: true },
    { name: "Glion Institute of Higher Education", domain: "glion.edu", isVerified: true },
    { name: "Kalaidos Fachhochschule", domain: "kalaidos-fh.ch", isVerified: true },
    { name: "Webster University Geneva", domain: "webster.ch", isVerified: true },

]