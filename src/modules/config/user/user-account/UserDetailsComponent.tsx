import { useEffect, useState } from 'react';
import { User, Camera, Eye, EyeOff, Save, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useUserAccountState } from './hooks/userAccountContext';
import { useUserAccountApi } from './hooks/useUserAccountApi';

interface UserDetailsComponentIF {
  test?: string;
}

interface UserData {
  sso: boolean;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
    _id: string;
  };
  active: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  tenantId: string;
  profilePicture?: string;
}

const UserDetailsComponent: React.FC<UserDetailsComponentIF> = () => {
  const { getUserApi } = useUserAccountApi();
  const { setState } = useUserAccountState();
  const { id } = useParams();

  // Sample user data for demo
  const [userData] = useState<UserData>({
    sso: false,
    _id: '66f40c566f7ba4a901a39d4b',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@demo.com',
    role: {
      name: 'user',
      _id: '66f408342bc315fb871abfb9',
    },
    active: true,
    verified: false,
    createdAt: '2024-09-25T13:12:54.997Z',
    updatedAt: '2025-06-23T09:24:16.397Z',
    lastLogin: '2025-06-23T06:24:06.049Z',
    tenantId: '673ee4031091754575288de9',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  });

  // Form states
  const [nameForm, setNameForm] = useState({
    firstName: '',
    lastName: '',
    isEditing: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isEditing: false,
  });

  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);

  useEffect(() => {
    if (!id) return;
    getUserApi(id);
    setState(prev => ({ ...prev, id }));
  }, [id]);

  useEffect(() => {
    if (userData) {
      setNameForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        isEditing: false,
      });
    }
  }, [userData]);

  const handleNameEdit = () => {
    setNameForm(prev => ({ ...prev, isEditing: true }));
  };

  const handleNameCancel = () => {
    setNameForm({
      firstName: userData.firstName,
      lastName: userData.lastName,
      isEditing: false,
    });
  };

  const handleNameSave = () => {
    // Here you would call your API to update the name
    console.log('Updating name:', nameForm.firstName, nameForm.lastName);
    setNameForm(prev => ({ ...prev, isEditing: false }));
  };

  const handlePasswordEdit = () => {
    setPasswordForm(prev => ({ ...prev, isEditing: true }));
  };

  const handlePasswordCancel = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      isEditing: false,
    });
  };

  const handlePasswordSave = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    // Here you would call your API to update the password
    console.log('Updating password');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      isEditing: false,
    });
  };

  const handleProfilePictureUpdate = () => {
    if (!profilePictureUrl.trim()) {
      alert('Please enter a valid image URL');
      return;
    }
    setIsUpdatingPicture(true);
    // Here you would call your API to update the profile picture
    setTimeout(() => {
      console.log('Updating profile picture:', profilePictureUrl);
      setIsUpdatingPicture(false);
      setProfilePictureUrl('');
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-full w-full justify-center overflow-y-auto px-6 pb-6">
      <div className="w-full max-w-[1280px] px-8">
        {/* Profile Picture Section */}
        <div className="mb-8 rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Camera className="h-5 w-5" />
            Profile Picture
          </h2>
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                {userData.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-end gap-3">
                <button
                  onClick={handleProfilePictureUpdate}
                  disabled={isUpdatingPicture}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingPicture ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="mb-8 rounded-lg border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <User className="h-5 w-5" />
              Name
            </h2>
            {!nameForm.isEditing ? (
              <button onClick={handleNameEdit} className="px-3 py-1 font-medium text-blue-600 hover:text-blue-800">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleNameSave} className="flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700">
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button onClick={handleNameCancel} className="flex items-center gap-1 rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600">
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!nameForm.isEditing ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
                <p className="text-lg text-gray-900">{userData.firstName}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
                <p className="text-lg text-gray-900">{userData.lastName}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={nameForm.firstName}
                  onChange={e => setNameForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={nameForm.lastName}
                  onChange={e => setNameForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="mb-8 rounded-lg border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Password</h2>
            {!passwordForm.isEditing ? (
              <button onClick={handlePasswordEdit} className="px-3 py-1 font-medium text-blue-600 hover:text-blue-800">
                Change Password
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handlePasswordSave} className="flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700">
                  <Save className="h-3 w-3" />
                  Update
                </button>
                <button onClick={handlePasswordCancel} className="flex items-center gap-1 rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600">
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!passwordForm.isEditing ? (
            <p className="text-gray-600">••••••••••••</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Current Password</label>
                <div className="relative">
                  <input
                    type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordForm(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  >
                    {passwordForm.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={passwordForm.showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordForm(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  >
                    {passwordForm.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  >
                    {passwordForm.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">Password must be at least 8 characters long.</p>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Account Information</h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <label className="block font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{userData.email}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-600">Role</label>
              <p className="text-gray-900 capitalize">{userData.role.name}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-600">Account Status</label>
              <p className={`font-medium ${userData.active ? 'text-green-600' : 'text-red-600'}`}>{userData.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-600">Email Verified</label>
              <p className={`font-medium ${userData.verified ? 'text-green-600' : 'text-orange-600'}`}>{userData.verified ? 'Verified' : 'Pending'}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-600">Member Since</label>
              <p className="text-gray-900">{formatDate(userData.createdAt)}</p>
            </div>
            <div>
              <label className="block font-medium text-gray-600">Last Login</label>
              <p className="text-gray-900">{formatDate(userData.lastLogin)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsComponent;
