import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const NewsDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await api.get(`/news/${id}`);
            setPost(response.data);
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
                <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
                <Link to="/news" className="text-indigo-600 hover:text-indigo-800">Return to News Feed</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Image */}
            <div className="w-full h-72 sm:h-96 bg-gray-200 relative">
                {post.image_url ? (
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-indigo-900 flex items-center justify-center">
                        <span className="text-indigo-200 text-6xl opacity-20 font-bold">VCLGC NEWS</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-5xl mx-auto">
                    <div className="mb-4">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
                            Updates
                        </span>
                        <span className="ml-4 text-gray-300 text-sm">
                            {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 shadow-lg">
                        {post.title}
                    </h1>
                    {post.subtitle && (
                        <p className="text-xl md:text-2xl text-indigo-200 font-light">
                            {post.subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Content Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-indigo prose-lg max-w-none text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <hr className="my-12 border-gray-200" />

                <div className="flex justify-between items-center">
                    <Link to="/news" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to News
                    </Link>

                    {post.author_first && (
                        <div className="text-sm text-gray-500 italic">
                            Posted by {post.author_first} {post.author_last}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
