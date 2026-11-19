import { ConfigProvider } from 'antd';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

// antd is used by two admin pages. Map its theme onto the design tokens
// (docs/redesign/design-system.md) so it matches the rest of the app.
const antdTheme = {
  token: {
    colorPrimary: '#002868',
    colorError: '#bf0a30',
    colorText: '#0e1a33',
    colorTextSecondary: '#56627a',
    colorBorder: '#d5dbe5',
    colorBgLayout: '#f3f6fb',
    borderRadius: 2,
    borderRadiusLG: 6,
    fontFamily: '"Public Sans", ui-sans-serif, system-ui, sans-serif',
    fontSize: 14,
  },
};

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
