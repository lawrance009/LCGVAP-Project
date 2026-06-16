/**
 * seed_hero_slides.js
 * ---------------------------------------------------------------
 * One-off seed: replaces whatever is in `hero_slides` with the 3
 * curated home-page hero slides (graduation / togetherness /
 * verification). After this runs, admins can still edit each
 * slide's title/subtitle/order/active state from the existing
 * Slides panel (/patron/slides) — only the initial content and
 * images are seeded here.
 *
 * Run once:  node src/scripts/seed_hero_slides.js
 * ---------------------------------------------------------------
 */
require('dotenv').config();
const pool = require('../config/db');

const SLIDES = [
    {
        title: 'Earned. Verified. Recognized.',
        subtitle: 'Every degree on this platform is independently confirmed — your achievement, permanently on record.',
        image_url: 'https://images.unsplash.com/photo-1690541261286-9f1cf46327fb?auto=format&fit=crop&w=1920&q=80',
        slide_order: 1,
    },
    {
        title: 'One Network, Every Veteran.',
        subtitle: 'Liberian graduates of Cyprus, united in one verified alumni community.',
        image_url: 'https://images.unsplash.com/photo-1758272133693-d2124dbe00de?auto=format&fit=crop&w=1920&q=80',
        slide_order: 2,
    },
    {
        title: 'Your Credentials, Secured.',
        subtitle: 'Identity-anchored verification protects your record from fraud and misrepresentation.',
        image_url: 'https://images.unsplash.com/photo-1725656469709-4d0bcb828bcf?auto=format&fit=crop&w=1920&q=80',
        slide_order: 3,
    },
];

const seedHeroSlides = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query('SELECT id FROM hero_slides');
        console.log(`Found ${existing.rows.length} existing slide(s) — clearing before reseed.`);
        await client.query('DELETE FROM hero_slides');

        for (const slide of SLIDES) {
            await client.query(
                `INSERT INTO hero_slides (image_url, title, subtitle, slide_order, is_active)
                 VALUES ($1, $2, $3, $4, TRUE)`,
                [slide.image_url, slide.title, slide.subtitle, slide.slide_order]
            );
            console.log(`  + Inserted slide: "${slide.title}"`);
        }

        await client.query('COMMIT');
        console.log('✅ Hero slides seeded successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding hero slides:', err);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

seedHeroSlides();
