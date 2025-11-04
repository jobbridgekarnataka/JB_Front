// import React from 'react';

// const StatusTextView = ({ data, onClick }) => {
//   return (
//     <div className="flex flex-wrap gap-2 mt-4">
//       {data.map((item, index) => (
//         <div
//           key={index}
//           className="cursor-pointer px-3 py-1 rounded-lg text-sm font-medium shadow"
//           style={{ backgroundColor: item.color || '#ccc' }}
//           onClick={() => onClick(item.name)}
//         >
//           {item.name} ({item.value})
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StatusTextView;

// components/UI/StatusTextView.jsx
import React from 'react';
import styles from './StatusTextView.module.scss';

const StatusTextView = ({ data, onClick }) => {
  return (
    <div className={styles.statusContainer}>
      {data.map((status) => (
        <div
          key={status.name}
          className={`${styles.statusItem} ${styles[status.name.toLowerCase().replace(/\s+/g, '')]}`}
          onClick={() => onClick(status.name)}
        > 
        <span className={styles.statusColor} style={{ backgroundColor: status.color || '#ccc' }}></span>
          <span className={styles.label}>{status.name}</span>
          <span className={styles.count}>({status.value})</span>
        </div>
      ))}
    </div>
  );
};

export default StatusTextView;
