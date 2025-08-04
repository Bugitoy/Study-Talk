import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Switzerland_universities = [

    // Switzerland
    
    { name: "Eidgenössische Technische Hochschule Zürich", domain: "ethz.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "École Polytechnique Fédérale de Lausanne", domain: "epfl.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Universität Zürich", domain: "uzh.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Université de Genève", domain: "unige.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Universität Bern", domain: "unibe.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Universität Basel", domain: "unibas.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Université de Lausanne", domain: "unil.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Université de Fribourg", domain: "unifr.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Zürcher Hochschule für Angewandte Wissenschaften", domain: "zhaw.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Universität St.Gallen", domain: "unisg.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Fachhochschule Nordwestschweiz", domain: "fhnw.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Berner Fachhochschule", domain: "bfh.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Université de Neuchâtel", domain: "unine.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Hochschule Luzern", domain: "hslu.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Università della Svizzera Italiana", domain: "usi.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Institut de hautes études internationales et du développement", domain: "graduateinstitute.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Ostschweizer Fachhochschule", domain: "ost.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Universität Luzern", domain: "unilu.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Haute École Spécialisée de Suisse Occidentale", domain: "hevs.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Scuola universitaria professionale della Svizzera italiana", domain: "supsi.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Glion Institute of Higher Education", domain: "glion.edu", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Kalaidos Fachhochschule", domain: "kalaidos-fh.ch", region: "Europe", country: "Switzerland", isVerified: true },
    { name: "Webster University Geneva", domain: "webster.ch", region: "Europe", country: "Switzerland", isVerified: true },

]