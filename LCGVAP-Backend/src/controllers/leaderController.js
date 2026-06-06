const leaderModel = require('../models/leaderModel');

/**
 * Get all leaders
 */
const getLeaders = async (req, res, next) => {
    try {
        const leaders = await leaderModel.getAllLeaders();
        const current = leaders.filter(l => l.is_current);
        const past = leaders.filter(l => !l.is_current);
        res.json({ current, past });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a leader (Admin)
 */
const createLeader = async (req, res, next) => {
    try {
        const { name, position, bio, start_date, end_date, is_current, order_index } = req.body;
        let image_url = null;

        if (req.file) {
            image_url = `${req.app.locals.baseUrl}/uploads/${req.file.filename}`;
        }

        const newLeader = await leaderModel.createLeader({
            name,
            position,
            bio,
            image_url,
            start_date,
            end_date: end_date || null,
            is_current: is_current === 'true' || is_current === true,
            order_index: parseInt(order_index) || 0
        });

        res.status(201).json(newLeader);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a leader (Admin)
 */
const updateLeader = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, position, bio, start_date, end_date, is_current, order_index } = req.body;
        let image_url = undefined;

        if (req.file) {
            image_url = `${req.app.locals.baseUrl}/uploads/${req.file.filename}`;
        }

        const updatedLeader = await leaderModel.updateLeader(id, {
            name,
            position,
            bio,
            image_url,
            start_date,
            end_date: end_date || null,
            is_current: is_current === 'true' || is_current === true,
            order_index: parseInt(order_index) || 0
        });

        if (!updatedLeader) {
            return res.status(404).json({ error: 'Leader not found' });
        }

        res.json(updatedLeader);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a leader (Admin)
 */
const deleteLeader = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await leaderModel.deleteLeader(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Leader not found' });
        }

        res.json({ message: 'Leader deleted', leader: deleted });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeaders,
    createLeader,
    updateLeader,
    deleteLeader
};
