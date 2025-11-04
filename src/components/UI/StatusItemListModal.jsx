

import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './StatusItemListModal.module.scss';

const StatusItemListModal = ({ open, items, status, title, onClose, type }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X />
        </button>
        <h3 className={styles.title}>
          {title} - {status} ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className={styles.empty}>No items found.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li
                key={item._id}
                className={styles.listItem}
                onClick={() => navigate(`/${type}/${item._id}`)}
              >
                <span className="font-semibold">{item.customId}</span> - {item.title || item.name || item.subTaskId?.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StatusItemListModal;
