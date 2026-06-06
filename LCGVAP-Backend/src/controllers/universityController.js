const universityModel = require('../models/universityModel');

const getAllUniversities = async (req, res, next) => {
    try {
        const universities = await universityModel.getAllUniversities();
        res.json(universities);
    } catch (error) {
        next(error);
    }
};

const getFeaturedUniversities = async (req, res, next) => {
    try {
        const universities = await universityModel.getFeaturedUniversities();
        res.json(universities);
    } catch (error) {
        next(error);
    }
};

const getDepartmentsByUniversity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const departments = await universityModel.getDepartmentsByUniversity(id);
        res.json(departments);
    } catch (error) {
        next(error);
    }
};

const getAdvisorsByDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const advisors = await universityModel.getAdvisorsByDepartment(id);
        res.json(advisors);
    } catch (error) {
        next(error);
    }
};

const createUniversity = async (req, res, next) => {
    try {
        const { name, acronym, country, logo_url, website_url, short_description, is_featured, display_order } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'University name is required' });
        }
        const newUni = await universityModel.createUniversity(name, acronym, country, logo_url, website_url, short_description, is_featured, display_order);
        res.status(201).json(newUni);
    } catch (error) {
        next(error);
    }
};

const updateUniversity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedUni = await universityModel.updateUniversity(id, data);
        if (!updatedUni) {
            return res.status(404).json({ message: 'University not found' });
        }
        res.json(updatedUni);
    } catch (error) {
        next(error);
    }
};

const deleteUniversity = async (req, res, next) => {
    try {
        const { id } = req.params;
        try {
            const success = await universityModel.deleteUniversity(id);
            if (!success) {
                return res.status(404).json({ message: 'University not found' });
            }
            res.json({ message: 'University deleted successfully' });
        } catch (dbError) {
            if (dbError.code === '23503') { // Foreign key violation
                return res.status(400).json({
                    message: 'Cannot delete university. It has associated departments or students.'
                });
            }
            throw dbError;
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUniversities,
    getFeaturedUniversities,
    getDepartmentsByUniversity,
    getAdvisorsByDepartment,
    createUniversity,
    updateUniversity,
    deleteUniversity
};
