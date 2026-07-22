import { useState } from 'react';
import SidebarChef from '../sidebar/SidebarChef';
function LayoutChef({ children }) {
  const [ouvert, setOuvert] = useState(true);
  return (
    <div>
      <SidebarChef ouvert={ouvert} setOuvert={setOuvert} />
      <div style={{ marginLeft: ouvert ? '240px' : '70px', transition: 'margin-left 0.2s ease' }} className="p-4">
        {children}
      </div>
    </div>
  );
}

export default LayoutChef;