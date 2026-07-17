import { useState } from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  const [ouvert, setOuvert] = useState(true);
  const largeurSidebar = ouvert ? '220px' : '64px';

  return (
    <div>
      <Sidebar ouvert={ouvert} setOuvert={setOuvert} />
      <div style={{
        marginLeft: largeurSidebar,
        padding: '20px',
        transition: 'margin-left 0.2s ease',
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;