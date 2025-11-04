import React, { useEffect, useState } from 'react';
import API from '../../axios';
import styles from './StatusRequests.module.scss';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

function StatusRequests() {
  const [requests, setRequests] = useState([]);
  const { toggleNotificationRefresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await API.get('/request/status-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }finally{
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await API.post(`/request/status-requests/${id}/action`, { action });
      alert(`Request ${action}d`);
      toggleNotificationRefresh();
      fetchRequests(); // Refresh list
      
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
    }
  };
//   const getDirectImageUrl = (driveUrl) => {
//   if (!driveUrl) return null;
//   const match = driveUrl.match(/id=([^&]+)/);
//   return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
// };

const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;

  let fileId = null;

  // Case 1: id= in query params (open?id=FILE_ID, uc?id=FILE_ID, etc.)
  let match = driveUrl.match(/[?&]id=([^&]+)/);
  if (match) fileId = match[1];

  // Case 2: /d/{fileId}/ in path
  if (!fileId) {
    match = driveUrl.match(/\/d\/([^/]+)/);
    if (match) fileId = match[1];
  }

  // Case 3: uc?id=FILE_ID format
  if (!fileId) {
    match = driveUrl.match(/uc\?id=([^&]+)/);
    if (match) fileId = match[1];
  }

  // Case 4: direct fileId pasted (25+ chars, alphanumeric + _-)
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(driveUrl)) {
    fileId = driveUrl;
  }

  // If still not found, return original link
  if (!fileId) return driveUrl;

  // Default: always return a working thumbnail link
  return `https://drive.google.com/thumbnail?id=${fileId}`;
};

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    <div className={styles.container}>
      <h2>Status Change Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
               <th>SubTask Id</th>
              <th>SubTask</th>
              <th>Current</th>
              <th>Requested</th>
              <th>Requested By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${req.subTaskId?._id}`)}>{req.subTaskId?.customId}</td>
                <td style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${req.subTaskId?._id}`)}>{req.subTaskId?.title}</td>
                <td>{req.subTaskId?.status}</td>
                <td>{req.requestedStatus}</td>
                <td style={{cursor:"pointer"}} onClick={()=>navigate(`/member/${req.requestedBy?._id}`)}> <img src={req.requestedBy?.photoUrl ? getDirectImageUrl(req.requestedBy?.photoUrl) : "/members/AnonymousImage.jpg"} alt="Profile"  onError={(e) => {
                                        e.target.src = "/members/AnonymousImage.jpg";
                                      }} />{req.requestedBy?.name}</td>
                <td>
                  <button onClick={() => handleAction(req._id, 'approve')} className={styles.approve}>Approve</button>
                  <button onClick={() => handleAction(req._id, 'reject')} className={styles.reject}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StatusRequests;
