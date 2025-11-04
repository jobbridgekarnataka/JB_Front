import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import API from '../../axios';
import styles from './AssignForDetail.module.scss'
import { Plus, List, Calendar, Flag, CheckSquare, User, Edit, Trash2, ListFilter,Tags } from 'lucide-react';
import CustomCard from '../../components/UI/CustomCard';
import { useData } from '../../context/DataContext';



function AssignForDetail() {
    const {id} = useParams();
  const [assignFor,setAssignFor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [loading , setLoading] = useState(true);
  const {assignForContext} = useData();

  useEffect(()=>{
    fetchAssignFor();
  },[assignForContext]);
  const fetchAssignFor =async()=>{
    try{
      //const res = await API.get(`assignFor/${id}`);
      const filtered = assignForContext.find(assignFor=>String(assignFor._id)===String(id));
      setAssignFor(filtered);
      setLoading(false);
    }catch(err){
      console.log("Error in fetching AssignFor:",err);
      setLoading(false);
    }
  }


    const getStatusColor = (status) => {
    switch (status) {
      case 'Invited': return '#f0ab2cff';
      case 'Not-Attended': return '#ff0000ff';
      case 'Attended': return '#1ef102ff';
      case 'Completed': return '#2bff00ff';
      case 'Permission': return '#0084ffff';
      case 'Not-Possible': return '#ff80f4ff';
      case 'Waiting': return '#ff8800ff';
      default: return '#f0ab2cff';
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

 if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  if (!assignFor) return ;
 

  return (
     <div className={styles.detailContainer}>
      <h2 style={{ cursor: "pointer" }} onClick={()=>navigate(`/subTask/${assignFor.subTaskId?._id}`)}>{assignFor.subTaskId?.title}</h2>

      <div className={styles.meta}>
        <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/subTask/${assignFor.subTaskId?._id}`)}><Tags size={16} /><strong>SubTask ID:</strong>{assignFor.subTaskId?.customId}</p>
        <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/task/${assignFor.taskId?._id}`)}><CheckSquare size={16} /> <strong>Task:</strong> {assignFor.taskId?.title}</p>
         <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${assignFor.projectId?._id}`)}><Flag size={16} /> <strong>Project:</strong> {assignFor.projectId?.title}</p> 
        {assignFor.description&&<p><List size={16} /><strong>Description:</strong>{assignFor.description}</p>}
      </div>

      <div className={styles.badges}>
        <span style={{ backgroundColor: getStatusColor(assignFor.status) }}>
          Status: {assignFor.status}
        </span>
      </div>

      <div className={styles.dates}>
        <p><Calendar size={16} /> <strong>Created:</strong> {new Date(assignFor.date).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</p>
        
      </div>

      <div className={styles.assignees}>
        <h4><User size={18} /> Assigned For</h4>
        {assignFor.assignedFor?.length > 0 ? (
          <ul>
            {assignFor.assignedFor.map((member) => (
              <li key={member._id} style={{ cursor: "pointer" }} onClick={()=>navigate(`/member/${member._id}`)} >
                <img src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} alt={member.name}  onError={(e) => {
                                        e.target.src = "/members/AnonymousImage.jpg";
                                      }}/>
                <div>
                <span>{member.name}</span>
                <span>{member.currentDistrict}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Unassigned</p>
        )}
      </div>
    </div>
  )
}

export default AssignForDetail
