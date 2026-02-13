
const cheerio = require("cheerio");
const fs = require("fs");

async function diagnose() {
    const cinemaId = "P0196";
    const url = `https://www.allocine.fr/seance/salle_gen_csalle=${cinemaId}.html`;
    let log = `Fetching ${url}...\n`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        log += "\n--- LD-JSON ---\n";
        $('script[type="application/ld+json"]').each((_, el) => {
            log += $(el).html() + "\n\n";
        });

        fs.writeFileSync("output.txt", log);
        console.log("Written to output.txt");

    } catch (e) {
        console.error(e);
        fs.writeFileSync("output.txt", "Error: " + e.message);
    }
}

diagnose();
