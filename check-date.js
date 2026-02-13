
const cheerio = require("cheerio");

async function checkParam(paramName) {
    const cinemaId = "P0196"; // Pathé Nantes
    const date = "2026-02-16"; // Lundi

    // Allociné URL
    const url = `https://www.allocine.fr/seance/salle_gen_csalle=${cinemaId}.html?${paramName}=${date}`;
    console.log(`Testing param '${paramName}' with URL: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        let foundDate = "None";
        $(".date-selector .item, .showtimes-date-list .item, .calendar .item").each((_i, el) => {
            if ($(el).hasClass("active") || $(el).hasClass("selected")) {
                const day = $(el).find(".day").text().trim();
                const number = $(el).find(".number").text().trim();
                const month = $(el).find(".month").text().trim();
                foundDate = `${day} ${number} ${month}`;
            }
        });
        console.log(`  -> Active date: ${foundDate}`);

    } catch (e) {
        console.error(e);
    }
}

async function runTests() {
    await checkParam("dt");
    await checkParam("d");
    await checkParam("date");
}

runTests();
