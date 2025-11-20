'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Users, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
    inviteCode: string;
    members: any[];
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchGroups();
    }, [user, router]);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        }
    };

    const createGroup = async () => {
        try {
            await api.post('/groups', { name: newGroupName });
            setNewGroupName('');
            setShowCreateModal(false);
            fetchGroups();
        } catch (error) {
            console.error('Failed to create group', error);
        }
    };

    const joinGroup = async () => {
        try {
            await api.post('/groups/join', { inviteCode });
            setInviteCode('');
            setShowJoinModal(false);
            fetchGroups();
        } catch (error) {
            console.error('Failed to join group', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">CoLiving Expense</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-white/90">Welcome, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Your Groups</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition backdrop-blur-sm border border-white/30"
                        >
                            <Users size={18} />
                            Join Group
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-white/90 transition font-semibold shadow-lg"
                        >
                            <Plus size={18} />
                            Create Group
                        </button>
                    </div>
                </div>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <Link key={group.id} href={`/groups/${group.id}`}>
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition cursor-pointer transform hover:scale-105 shadow-xl">
                                <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                                <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                                    <Users size={16} />
                                    <span>{group.members.length} members</span>
                                </div>
                                <div className="bg-white/10 rounded-lg px-3 py-2 text-white/90 text-sm font-mono">
                                    Code: {group.inviteCode}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {groups.length === 0 && (
                    <div className="text-center text-white/80 mt-12">
                        <p className="text-xl">No groups yet. Create or join one to get started!</p>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Group</h2>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createGroup}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Join Group</h2>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Invite code"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={joinGroup}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
