const slideModel = require('../models/slideModel');
const path = require('path');
const fs = require('fs');

const getAllSlides = async (req, res, next) => {
    try {
        const slides = await slideModel.getAllSlides();
        res.json(slides);
    } catch (error) {
        next(error);
    }
};

const getPublicSlides = async (req, res, next) => {
    try {
        const slides = await slideModel.getActiveSlides();
        res.json(slides);
    } catch (error) {
        next(error);
    }
};

const addSlide = async (req, res, next) => {
    try {
        const { title, subtitle, slide_order } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imageUrl = `uploads/slides/${req.file.filename}`;
        const newSlide = await slideModel.addSlide(imageUrl, title, subtitle, slide_order);
        res.status(201).json(newSlide);
    } catch (error) {
        next(error);
    }
};

const updateSlide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, subtitle, slide_order, is_active } = req.body;

        const updatedSlide = await slideModel.updateSlide(id, title, subtitle, slide_order, is_active);

        if (!updatedSlide) {
            return res.status(404).json({ message: 'Slide not found' });
        }
        res.json(updatedSlide);
    } catch (error) {
        next(error);
    }
};

const deleteSlide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedSlide = await slideModel.deleteSlide(id);

        if (!deletedSlide) {
            return res.status(404).json({ message: 'Slide not found' });
        }

        // Optionally delete the file from filesystem
        if (deletedSlide.image_url) {
            // Adjust path based on where 'uploads' is located relative to this file
            // Assuming uploads is in src/../public/uploads or similar. 
            // Based on previous file uploads (degree certs), let's check authController logic later if needed.
            // For now, we just delete the DB record.
        }

        res.json({ message: 'Slide deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSlides,
    getPublicSlides,
    addSlide,
    updateSlide,
    deleteSlide
};
