import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import SiteFooter from '../../components/SiteFooter';
import StudentDashboard from '../StudentDashboard';
import ProfilePage from '../ProfilePage';

/**
 * DEV ONLY (route /__member, never in production builds).
 * Renders the signed-in member pages with a sample graduate and sample API
 * responses, so they can be reviewed without signing in as a real person.
 *   /__member?page=dashboard&state=pending
 *   /__member?page=profile&state=verified
 */
const sampleDegrees = (verified) => [
  {
    id: 1,
    degree_type: 'BACHELOR',
    field_of_study: 'Civil Engineering',
    university_name: 'Near East University',
    department_name: 'Civil Engineering',
    graduation_year: 2019,
    is_verified: true,
    verified_at: '2026-03-02T00:00:00Z',
    badge: { id: 1, name: 'Bachelor Graduate', icon: '🎓', description: 'Verified bachelor credential' },
  },
  {
    id: 2,
    degree_type: 'MASTER',
    field_of_study: 'Business Administration',
    university_name: 'Eastern Mediterranean University',
    department_name: 'Business Administration',
    graduation_year: 2022,
    is_verified: verified,
    verified_at: verified ? '2026-05-14T00:00:00Z' : null,
    badge: verified ? { id: 2, name: "Master's Scholar", icon: '🥇', description: 'Verified master credential' } : null,
  },
  ...(verified
    ? []
    : [{
        id: 3,
        degree_type: 'PHD',
        university_name: 'Cyprus International University',
        graduation_year: 2025,
        is_verified: false,
        rejection_reason: 'The certificate scan is cut off on the right side. Upload the full page.',
      }]),
];

const sampleUser = (verified) => ({
  id: 99,
  role: 'graduate',
  first_name: 'Ruth',
  last_name: 'Kollie',
  email: 'ruth.kollie@example.com',
  bio: 'Finance lead at a logistics company in Monrovia. Mentors new graduates returning from Cyprus.',
  profile_photo: null,
  is_verified: verified,
});

// Installed once when this dev-only module loads. It only answers while the
// browser is on /__member; everywhere else requests go to the real API.
// (Restoring on unmount does not work: React StrictMode's double effect run
// restores it before the child pages fetch.)
const realAdapter = axios.getAdapter(api.defaults.adapter);
api.defaults.adapter = async (config) => {
  if (window.location.pathname !== '/__member') return realAdapter(config);
  const verified = new URLSearchParams(window.location.search).get('state') !== 'pending';
  const url = config.url || '';
  const reply = (data) => ({ data, status: 200, statusText: 'OK', headers: {}, config, request: {} });
  if (url.endsWith('/users/me/degrees')) return reply({ degrees: sampleDegrees(verified), is_premium_veteran: verified });
  if (url.endsWith('/users/me')) return reply(sampleUser(verified));
  if (url.endsWith('/universities')) return reply([{ id: 1, name: 'Near East University' }, { id: 2, name: 'Eastern Mediterranean University' }]);
  if (url.endsWith('/departments')) return reply([{ id: 1, name: 'Civil Engineering', university_id: 1 }]);
  return realAdapter(config);
};

export default function MemberPreview() {
  const [params] = useSearchParams();
  const verified = params.get('state') !== 'pending';
  const page = params.get('page') || 'dashboard';
  const user = sampleUser(verified);
  const auth = { user, logout: () => {} };

  return (
    <AuthContext.Provider value={auth}>
      <div className="flex min-h-screen flex-col bg-paper text-ink">
        <Navbar user={user} logout={() => {}} />
        <main className="flex-1">{page === 'profile' ? <ProfilePage /> : <StudentDashboard />}</main>
        <SiteFooter />
      </div>
    </AuthContext.Provider>
  );
}
