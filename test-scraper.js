
const cheerio = require("cheerio");

async function checkCalendarLinks() {
    const cinemaId = "P0196"; // Pathé Nantes

    // Default URL (today)
    const url = `https://www.allocine.fr/seance/salle_gen_csalle=${cinemaId}.html`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        console.log("Calendar Links:");
        $(".date-selector .item a, .showtimes-date-list .item a, .calendar .item a").each((_i, el) => {
            const href = $(el).attr("href");
            const day = $(el).find(".day").text().trim();
            const number = $(el).find(".number").text().trim();
            console.log(`- ${day} ${number}: ${href}`);
        });

    } catch (e) {
        console.error(e);
    }
}

checkCalendarLinks();
