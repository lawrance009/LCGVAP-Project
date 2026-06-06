import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const AdminFAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [answerText, setAnswerText] = useState('');

    useEffect(() => {
        fetchFAQs();
    }, [filterStatus]);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            let url = '/faq';
            if (filterStatus !== 'all') {
                url += `?is_answered=${filterStatus === 'answered'}`;
            }
            const response = await api.get(url);
            setFaqs(response.data);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            alert('Error loading FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async (id) => {
        if (!answerText.trim()) {
            alert('Please enter an answer');
            return;
        }

        try {
            await api.post(`/faq/${id}/answer`, {
                answer: answerText,
                is_published: true
            });
            alert('Answer published successfully');
            setEditingId(null);
            setAnswerText('');
            fetchFAQs();
        } catch (error) {
            console.error('Error answering FAQ:', error);
            alert('Error answering FAQ');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            await api.delete(`/faq/${id}`);
            alert('Question deleted successfully');
            fetchFAQs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            alert('Error deleting FAQ');
        }
    };

    const handlePublish = async (id, currentStatus) => {
        try {
            await api.put(`/faq/${id}`, {
                is_published: !currentStatus
            });
            alert(`Question ${!currentStatus ? 'published' : 'unpublished'} successfully`);
            fetchFAQs();
        } catch (error) {
            console.error('Error updating FAQ:', error);
            alert('Error updating FAQ');
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-6">FAQ Management</h1>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <p className="text-blue-900 font-semibold">📝 {faqs.length} Question{faqs.length !== 1 ? 's' : ''} to Review</p>
                    <p className="text-blue-700 text-sm mt-1">Monitor and answer questions submitted by users on the homepage</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            filterStatus === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        All Questions ({faqs.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('unanswered')}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            filterStatus === 'unanswered'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        Unanswered
                    </button>
                    <button
                        onClick={() => setFilterStatus('answered')}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            filterStatus === 'answered'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                    >
                        Answered
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {faqs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-600 text-lg">No questions found</p>
                    </div>
                ) : (
                    faqs.map((faq) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex gap-2">
                                                {!faq.is_answered && (
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                                                        Unanswered
                                                    </span>
                                                )}
                                                {faq.is_answered && (
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                                                        Answered
                                                    </span>
                                                )}
                                                {faq.is_published && (
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                                        Published
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                                        <div className="text-sm text-gray-600 mt-2">
                                            <p>📧 From: {faq.submitted_by_email}</p>
                                            <p>📁 Category: <span className="font-semibold">{faq.category}</span></p>
                                            <p>📅 Submitted: {new Date(faq.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                        className="text-2xl text-gray-500 hover:text-gray-700"
                                    >
                                        {expandedId === faq.id ? '▼' : '▶'}
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                {expandedId === faq.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-200 pt-6 mt-6"
                                    >
                                        {/* Current Answer */}
                                        {faq.answer && (
                                            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="font-bold text-green-900 mb-2">✅ Current Answer:</p>
                                                <p className="text-gray-800">{faq.answer}</p>
                                            </div>
                                        )}

                                        {/* Answer Form */}
                                        {editingId === faq.id ? (
                                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <textarea
                                                    value={answerText}
                                                    onChange={(e) => setAnswerText(e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    rows="4"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                                                ></textarea>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAnswerSubmit(faq.id)}
                                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold transition-all"
                                                    >
                                                        Publish Answer
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setAnswerText('');
                                                        }}
                                                        className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 font-bold transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(faq.id);
                                                    setAnswerText(faq.answer || '');
                                                }}
                                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold transition-all"
                                            >
                                                {faq.answer ? '✏️ Edit Answer' : '💬 Answer Question'}
                                            </button>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-4">
                                            {faq.is_answered && (
                                                <button
                                                    onClick={() => handlePublish(faq.id, faq.is_published)}
                                                    className={`px-6 py-2 rounded-lg font-bold transition-all ${
                                                        faq.is_published
                                                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    {faq.is_published ? 'Unpublish' : 'Publish on Homepage'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(faq.id)}
                                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-bold transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminFAQ;
