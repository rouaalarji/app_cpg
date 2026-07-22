import { useState } from 'react';
import SidebarEmploye from '../sidebar/SidebarEmploye';

function LayoutEmploye({ children }) {
  const [ouvert, setOuvert] = useState(true);
  return (
    <div>
      <SidebarEmploye ouvert={ouvert} setOuvert={setOuvert} />
      <div style={{ marginLeft: ouvert ? '240px' : '70px', transition: 'margin-left 0.2s ease' }} className="p-4">
        {children}
      </div>
    </div>
  );
}

export default LayoutEmploye;