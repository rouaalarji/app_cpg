import { useState } from 'react';
import SidebarAdmin from '../sidebar/SidebarAdmin';
function LayoutAdmin({ children }) {
  const [ouvert, setOuvert] = useState(true);
  return (
    <div>
      <SidebarAdmin ouvert={ouvert} setOuvert={setOuvert} />
      <div style={{ marginLeft: ouvert ? '240px' : '70px', transition: 'margin-left 0.2s ease' }} className="p-4">
        {children}
      </div>
    </div>
  );
}

export default LayoutAdmin;