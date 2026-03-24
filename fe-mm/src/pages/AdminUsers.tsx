import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Crown, Users, Shield, Loader2, X, Mail, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  is_pro: boolean;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [showTotalUsers, setShowTotalUsers] = useState(false);
  const [showProUsers, setShowProUsers] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);

  // Only allow specific admin email
  const isSuperAdmin = user?.email === 'h4554n.abdul@gmail.com';

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/');
      return;
    }
    fetchAdmins();
  }, [isSuperAdmin, navigate]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    setAddingAdmin(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_email: newAdminEmail.trim() }),
      });

      if (response.ok) {
        setNewAdminEmail('');
        fetchAdmins(); // Refresh the list
      } else {
        console.error('Failed to add admin');
      }
    } catch (err) {
      console.error('Add admin error:', err);
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdmin = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/demote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_email: email }),
      });

      if (response.ok) {
        fetchAdmins(); // Refresh the list
      }
    } catch (err) {
      console.error('Remove admin error:', err);
    }
  };

  if (!isSuperAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="bg-[#16161a] border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Management</h1>
            <p className="text-slate-400">Manage admin access and permissions</p>
          </div>
        </div>

        {/* Add New Admin */}
        <div className="bg-[#0a0a0c] border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-500" />
            Add New Admin
          </h2>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Enter admin email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 p-3 bg-[#16161a] border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none"
            />
            <button
              onClick={addAdmin}
              disabled={addingAdmin || !newAdminEmail.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all active:scale-95 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addingAdmin ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Admin
            </button>
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-[#0a0a0c] border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Users size={20} className="text-green-500" />
            Current Admins ({admins.filter(a => a.is_admin).length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {admins.filter(admin => admin.is_admin).map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-[#16161a] border border-slate-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{admin.email}</p>
                      <p className="text-slate-500 text-sm">
                        Added {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {admin.email !== 'h4554n.abdul@gmail.com' && (
                    <button
                      onClick={() => removeAdmin(admin.email)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove admin access"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}

              {admins.filter(a => a.is_admin).length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Shield size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No admins found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Special Admin Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setShowTotalUsers(true)}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 cursor-pointer hover:bg-blue-500/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-500" />
              <span className="text-blue-400 font-semibold">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{admins.length}</p>
            <p className="text-blue-300/70 text-sm mt-1">Click to view details</p>
          </div>

          <div 
            onClick={() => setShowProUsers(true)}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 cursor-pointer hover:bg-green-500/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-green-500" />
              <span className="text-green-400 font-semibold">Pro Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{admins.filter(a => a.is_pro).length}</p>
            <p className="text-green-300/70 text-sm mt-1">Click to view details</p>
          </div>

          <div 
            onClick={() => setShowAdmins(true)}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 cursor-pointer hover:bg-purple-500/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="text-purple-400 font-semibold">Admins</span>
            </div>
            <p className="text-2xl font-bold text-white">{admins.filter(a => a.is_admin).length}</p>
            <p className="text-purple-300/70 text-sm mt-1">Click to view details</p>
          </div>
        </div>

        {/* Total Users Modal */}
        {showTotalUsers && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#16161a] border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-white">All Users ({admins.length})</h2>
                  </div>
                  <button
                    onClick={() => setShowTotalUsers(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {admins.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-[#0a0a0c] border border-slate-700 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.email.split('@')[0]}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_pro && <Crown className="w-4 h-4 text-green-500" />}
                        {user.is_admin && <Shield className="w-4 h-4 text-purple-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pro Users Modal */}
        {showProUsers && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#16161a] border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-green-500" />
                    <h2 className="text-xl font-bold text-white">Pro Users ({admins.filter(a => a.is_pro).length})</h2>
                  </div>
                  <button
                    onClick={() => setShowProUsers(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {admins.filter(user => user.is_pro).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-[#0a0a0c] border border-slate-700 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Crown className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.email.split('@')[0]}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-500 text-sm">
                        Since {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admins Modal */}
        {showAdmins && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#16161a] border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-bold text-white">Administrators ({admins.filter(a => a.is_admin).length})</h2>
                  </div>
                  <button
                    onClick={() => setShowAdmins(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {admins.filter(user => user.is_admin).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-[#0a0a0c] border border-slate-700 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Shield className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.email.split('@')[0]}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-500 text-sm">
                        Since {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;