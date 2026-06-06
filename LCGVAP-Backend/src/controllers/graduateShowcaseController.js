const GraduateShowcaseModel = require('../models/graduateShowcaseModel');

class GraduateShowcaseController {
    // Get all featured graduates (public - for homepage slider)
    static async getFeatured(req, res) {
        try {
            const graduates = await GraduateShowcaseModel.getAllFeatured();
            res.json(graduates);
        } catch (error) {
            console.error('Error fetching featured graduates:', error);
            res.status(500).json({ message: 'Error fetching featured graduates' });
        }
    }

    // Get all graduates (admin only)
    static async getAll(req, res) {
        try {
            const graduates = await GraduateShowcaseModel.getAll();
            res.json(graduates);
        } catch (error) {
            console.error('Error fetching graduates:', error);
            res.status(500).json({ message: 'Error fetching graduates' });
        }
    }

    // Get single graduate
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const graduate = await GraduateShowcaseModel.getById(id);
            
            if (!graduate) {
                return res.status(404).json({ message: 'Graduate not found' });
            }
            
            res.json(graduate);
        } catch (error) {
            console.error('Error fetching graduate:', error);
            res.status(500).json({ message: 'Error fetching graduate' });
        }
    }

    // Create new showcase graduate (admin)
    static async create(req, res) {
        try {
            const { user_id, name, department, university, bio, photo_url, degree_type, graduation_year, featured_story, is_featured } = req.body;
            
            if (!name || !department || !university) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const graduate = await GraduateShowcaseModel.create({
                user_id,
                name,
                department,
                university,
                bio,
                photo_url,
                degree_type,
                graduation_year,
                featured_story,
                is_featured: is_featured || false,
                display_order: 0
            });

            res.status(201).json({ message: 'Graduate added to showcase', graduate });
        } catch (error) {
            console.error('Error creating graduate:', error);
            res.status(500).json({ message: 'Error creating graduate' });
        }
    }

    // Update graduate (admin)
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const graduate = await GraduateShowcaseModel.update(id, updates);
            
            if (!graduate) {
                return res.status(404).json({ message: 'Graduate not found' });
            }

            res.json({ message: 'Graduate updated', graduate });
        } catch (error) {
            console.error('Error updating graduate:', error);
            res.status(500).json({ message: 'Error updating graduate' });
        }
    }

    // Delete graduate (admin)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const graduate = await GraduateShowcaseModel.delete(id);
            
            if (!graduate) {
                return res.status(404).json({ message: 'Graduate not found' });
            }

            res.json({ message: 'Graduate removed from showcase', graduate });
        } catch (error) {
            console.error('Error deleting graduate:', error);
            res.status(500).json({ message: 'Error deleting graduate' });
        }
    }
}

module.exports = GraduateShowcaseController;
