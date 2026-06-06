const AdminUsers = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Graduates Management</h1>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-lg font-medium">Graduates Database</h3>
                <p>Coming soon: Full user management table.</p>
            </div>
        </div>
    );
};

export default AdminUsers;
