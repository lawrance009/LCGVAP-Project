const FAQModel = require('../models/faqModel');

class FAQController {
    // Get all published FAQs (public - for homepage)
    static async getPublished(req, res) {
        try {
            const faqs = await FAQModel.getAllPublished();
            res.json(faqs);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            res.status(500).json({ message: 'Error fetching FAQs' });
        }
    }

    // Get all FAQs (admin only)
    static async getAll(req, res) {
        try {
            const { is_answered, category } = req.query;
            const filters = {};
            
            if (is_answered !== undefined) {
                filters.is_answered = is_answered === 'true';
            }
            if (category) {
                filters.category = category;
            }

            const faqs = await FAQModel.getAll(filters);
            res.json(faqs);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            res.status(500).json({ message: 'Error fetching FAQs' });
        }
    }

    // Get single FAQ
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const isAdminRequest = req.user && (req.user.role === 'admin' || req.user.role === 'master_admin');
            const faq = isAdminRequest ? await FAQModel.getByIdAdmin(id) : await FAQModel.getById(id);
            
            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }
            
            res.json(faq);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
            res.status(500).json({ message: 'Error fetching FAQ' });
        }
    }

    // Submit new FAQ question (public)
    static async submit(req, res) {
        try {
            const { question, category, submitted_by_email } = req.body;
            
            if (!question || !submitted_by_email) {
                return res.status(400).json({ message: 'Question and email are required' });
            }

            const faq = await FAQModel.create({
                question,
                category,
                submitted_by_email
            });

            res.status(201).json({ message: 'Question submitted successfully', faq });
        } catch (error) {
            console.error('Error submitting question:', error);
            res.status(500).json({ message: 'Error submitting question' });
        }
    }

    // Answer FAQ (admin)
    static async answer(req, res) {
        try {
            const { id } = req.params;
            const { answer, is_published } = req.body;

            if (!answer) {
                return res.status(400).json({ message: 'Answer is required' });
            }

            const faq = await FAQModel.update(id, {
                answer,
                is_answered: true,
                is_published: is_published || false
            });

            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }

            res.json({ message: 'FAQ answered', faq });
        } catch (error) {
            console.error('Error answering FAQ:', error);
            res.status(500).json({ message: 'Error answering FAQ' });
        }
    }

    // Update FAQ (admin)
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const faq = await FAQModel.update(id, updates);
            
            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }

            res.json({ message: 'FAQ updated', faq });
        } catch (error) {
            console.error('Error updating FAQ:', error);
            res.status(500).json({ message: 'Error updating FAQ' });
        }
    }

    // Delete FAQ (admin)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const faq = await FAQModel.delete(id);
            
            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }

            res.json({ message: 'FAQ deleted', faq });
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            res.status(500).json({ message: 'Error deleting FAQ' });
        }
    }

    // Mark FAQ as helpful (public)
    static async markHelpful(req, res) {
        try {
            const { id } = req.params;
            const faq = await FAQModel.markHelpful(id);
            
            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }

            res.json({ message: 'Marked as helpful', faq });
        } catch (error) {
            console.error('Error marking as helpful:', error);
            res.status(500).json({ message: 'Error marking as helpful' });
        }
    }
}

module.exports = FAQController;
