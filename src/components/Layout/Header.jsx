import React, { useEffect, useState } from 'react'
import styles from './Header.module.scss'
import { Menu, Bell, Search } from 'lucide-react';

import Logout from '../UI/Logout';
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';
import { useNavigate } from 'react-router';

function Header({title,onMenuClick}) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // smooth scrolling
    });}
    const {user,notificationCount,setNotificationCount,refreshNotifications} = useAuth();
   
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown]= useState(false);
    const navigate = useNavigate();
    const toggleDropdown = () => {
  setShowDropdown(prev => !prev);
};

   

    useEffect(()=>{
       if (user) fetchNotification();
}, [user, refreshNotifications]); // 👈 now also refetch when toggled


    const fetchNotification = async()=>{
      try{
        let res;
        if (user?.role === 'Admin') {
          res = await API.get('/request/status-requests'); // pending only
         } 
         else if (user?.role === 'IT_Member' || user?.role === 'Member') {
            res = await API.get('/request/status-requests/user'); // approved/rejected
          }
  
        const count = res.data.length;
        setNotifications(res.data);
        setNotificationCount(count);
      }
      catch (err) {
        console.error("Notification fetch error:", err);
      }
    };


  return (
     <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <button className={styles.title} onClick={scrollToTop}>{title}</button>
      </div>
     
       
 
      <div className={styles.right}>
        <div className={styles.notificationWrapper}>
        {/* <button className={styles.iconButton} onClick={toggleDropdown}>
          <Bell size={20} />
          {notificationCount > 0 && (
              <span className={styles.notificationBadge}>{notificationCount}</span>
            )}
        </button> */}
                  {showDropdown && (
              <div className={styles.notificationDropdown}>
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className={styles.notificationItem}
                      onClick={() => {
                        navigate('/status-requests');
                        setShowDropdown(false);
                      }}
                    >
                      {user.role === 'Admin' ? (
                        <> <strong>{item.subTaskId?.title || 'Unnamed'}</strong> → <em>{item.requestedStatus}</em></>
                      ) : (
                        <>Your request for <strong>{item.subTaskId?.title || 'Unnamed'}</strong> was <em>{item.status}</em></>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.notificationItem}>No new notifications</div>
                )}
                <div className={styles.viewAll} onClick={() => {
                  navigate('/status-requests');
                  setShowDropdown(false);
                }}>
                  View All →
                </div>
              </div>
            )}
                  </div>
        <Logout/>
      </div>
    </header>
  )
}

export default Header