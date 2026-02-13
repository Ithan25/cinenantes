import { Cinema } from "./types";

/**
 * Cinémas de Nantes et périphérie.
 *
 * allocineId format: Allociné uses codes like P0052, P0088, etc.
 * URL: https://www.allocine.fr/seance/salle_gen_csalle={allocineId}.html
 *
 * Les IDs ont été vérifiés manuellement sur Allociné.
 * Certains IDs n'ont pas pu être confirmés et sont marqués comme "non vérifié".
 * Si un cinéma ne retourne pas de séances, il faudra corriger son allocineId.
 */
export const CINEMAS: Cinema[] = [
    {
        id: "pathe-nantes",
        name: "Pathé Nantes",
        address: "12 Place du Commerce",
        city: "Nantes",
        postalCode: "44000",
        type: "multiplexe",
        allocineId: "P0196",
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0196.html",
        websiteUrl: "https://www.pathe.fr/cinemas/cinema-pathe-nantes",
        screens: 12,
        lat: 47.2131,
        lng: -1.5583,
    },
    {
        id: "katorza",
        name: "Katorza",
        address: "3 Rue Corneille",
        city: "Nantes",
        postalCode: "44000",
        type: "art-essai",
        allocineId: "P0052",
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0052.html",
        websiteUrl: "https://www.katorza.fr/katorza/accueil/katorza",
        screens: 6,
        lat: 47.2144,
        lng: -1.5606,
    },
    {
        id: "cinematographe",
        name: "Le Cinématographe",
        address: "12bis Rue des Carmélites",
        city: "Nantes",
        postalCode: "44000",
        type: "art-essai",
        allocineId: "P0054", // non vérifié — à corriger si aucune séance
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0054.html",
        websiteUrl: "https://www.lecinematographe.com/",
        screens: 1,
        lat: 47.2179,
        lng: -1.5545,
    },
    {
        id: "concorde",
        name: "Le Concorde",
        address: "79 Boulevard de l'Égalité",
        city: "Nantes",
        postalCode: "44100",
        type: "independant",
        allocineId: "P0088",
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0088.html",
        websiteUrl: "https://leconcorde.fr/",
        screens: 4,
        lat: 47.2065,
        lng: -1.5488,
    },
    {
        id: "bonne-garde",
        name: "Le Bonne Garde",
        address: "20 Rue Frère Louis",
        city: "Nantes",
        postalCode: "44200",
        type: "art-essai",
        allocineId: "P0095",
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0095.html",
        websiteUrl: "https://cinemalebonnegarde.com/FR/9/cinema-bonne-garde-nantes.html",
        screens: 1,
        lat: 47.2023,
        lng: -1.5481,
    },
    {
        id: "pathe-atlantis",
        name: "Pathé Atlantis",
        address: "8 Allée La Pérouse",
        city: "Saint-Herblain",
        postalCode: "44800",
        type: "multiplexe",
        allocineId: "P0197", // non vérifié — à corriger si aucune séance
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0197.html",
        websiteUrl: "https://www.pathe.fr/cinemas/cinema-pathe-atlantis",
        screens: 14,
        lat: 47.2284,
        lng: -1.6285,
    },
    {
        id: "ugc-atlantis",
        name: "UGC Ciné Cité Atlantis",
        address: "Place Jean Bart, Pôle Commercial Atlantis",
        city: "Saint-Herblain",
        postalCode: "44800",
        type: "multiplexe",
        allocineId: "P0198", // non vérifié — à corriger si aucune séance
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0198.html",
        websiteUrl: "https://www.ugc.fr/cinema.html?id=31",
        screens: 12,
        lat: 47.2289,
        lng: -1.6301,
    },
    {
        id: "cineville-saint-sebastien",
        name: "Cinéville Saint-Sébastien",
        address: "Rue Marie Curie",
        city: "Saint-Sébastien-sur-Loire",
        postalCode: "44230",
        type: "multiplexe",
        allocineId: "P0199", // non vérifié — à corriger si aucune séance
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0199.html",
        websiteUrl: "https://saint-sebastien.cineville.fr/programmes/saint-sebastien",
        screens: 10,
        lat: 47.1961,
        lng: -1.5078,
    },
    {
        id: "cine-pole-sud",
        name: "Ciné Pôle Sud",
        address: "Route de Clisson, Centre Commercial Pôle Sud",
        city: "Basse-Goulaine",
        postalCode: "44115",
        type: "multiplexe",
        allocineId: "P0200", // non vérifié — à corriger si aucune séance
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0200.html",
        websiteUrl: "https://www.cinepolesud.fr/",
        screens: 8,
        lat: 47.2006,
        lng: -1.4567,
    },
    {
        id: "saint-paul",
        name: "Le Saint-Paul",
        address: "Place Saint-Paul",
        city: "Rezé",
        postalCode: "44400",
        type: "independant",
        allocineId: "P0201", // non vérifié — à corriger si aucune séance
        allocineUrl: "https://www.allocine.fr/seance/salle_gen_csalle=P0201.html",
        websiteUrl: "https://cinemastpaul.fr/FR/9/cinema-saint-paul-reze.html",
        screens: 1,
        lat: 47.1873,
        lng: -1.5573,
    },
];

export function getCinemaById(id: string): Cinema | undefined {
    return CINEMAS.find((c) => c.id === id);
}

export function getCinemasByCity(city: string): Cinema[] {
    return CINEMAS.filter(
        (c) => c.city.toLowerCase() === city.toLowerCase()
    );
}

export function getCinemasByType(type: Cinema["type"]): Cinema[] {
    return CINEMAS.filter((c) => c.type === type);
}
