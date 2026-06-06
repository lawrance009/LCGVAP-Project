const newsModel = require('../models/newsModel');

/**
 * Get News Feed (Posts + Birthdays)
 * GET /news
 */
const getNews = async (req, res, next) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        // 1. Fetch News Posts
        const posts = await newsModel.getAllNews(limit, offset);

        // 2. Fetch Recent Birthdays (only on first page to avoid duplication/complexity for now)
        // or check if offset is 0
        let birthdays = [];
        if (offset == 0) {
            const rawBirthdays = await newsModel.getRecentBirthdays(5); // Last 5 days

            birthdays = rawBirthdays.map(user => {
                const dob = new Date(user.date_of_birth);
                const today = new Date();
                const currentYear = today.getFullYear();

                // Construct birthday date for this year to sort correctly
                const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());

                return {
                    type: 'birthday',
                    id: `bday-${user.first_name}-${user.last_name}`,
                    title: `Happy Birthday, ${user.first_name}! 🎂`,
                    subtitle: `Celebrated on ${dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
                    content: `Join us in wishing ${user.first_name} ${user.last_name} a wonderful birthday!`,
                    image_url: user.profile_photo,
                    created_at: birthdayThisYear, // Use this for sorting
                    is_birthday: true
                };
            });
        }

        // 3. Merge and Sort
        // We want to mix them. Since news has `created_at` and birthdays have specialized date.
        // Let's combine and sort by date descending.
        const combinedFeed = [...posts, ...birthdays].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        res.json(combinedFeed);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Single News Post
 * GET /news/:id
 */
const getNewsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await newsModel.getNewsById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        next(error);
    }
};

/**
 * Create News Post (Admin)
 * POST /news
 */
const createNews = async (req, res, next) => {
    try {
        const { title, subtitle, content } = req.body;
        let image_url = null;

        if (req.file) {
            image_url = `${req.app.locals.baseUrl}/uploads/${req.file.filename}`;
        }

        const newPost = await newsModel.createNews({
            title,
            subtitle,
            content,
            image_url,
            author_id: req.user.id
        });

        res.status(201).json(newPost);
    } catch (error) {
        next(error);
    }
};

/**
 * Update News Post (Admin)
 * PUT /news/:id
 */
const updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, subtitle, content } = req.body;
        let image_url = undefined;

        if (req.file) {
            image_url = `${req.app.locals.baseUrl}/uploads/${req.file.filename}`;
        }

        const updatedPost = await newsModel.updateNews(id, {
            title,
            subtitle,
            content,
            image_url
        });

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(updatedPost);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete News Post (Admin)
 */
const deleteNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await newsModel.deleteNews(id);
        res.json({ message: 'Post deleted', post: deleted });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
