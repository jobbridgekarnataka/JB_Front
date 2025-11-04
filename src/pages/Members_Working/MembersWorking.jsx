import React, { useEffect, useState } from 'react'
import styles from './MembersTaskCard.module.scss'
import { useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';

function MembersWorking() {

  const [members, setMembers] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const {memberContext,subTaskContext} = useData();
  const navigate = useNavigate();

  useEffect(()=>{
    setMembers(memberContext);
    fetchSubTasks();
  },[memberContext,subTaskContext])
  
  
  const fetchSubTasks= async()=>{
            try{ 
                const sortedData = await subTaskContext.sort((a,b)=>a.customId-b.customId)
                const filteredSubTask = sortedData.filter(subtask=> String(subtask.status) !== "completed"&&String(subtask.status)!=="dropped");
                setSubTasks(filteredSubTask);
                setLoading(false);
            
            }
           catch(err){
            console.error("Error in fetching subtasks",err);
            setLoading(false);
           }
        }
    const getMemberSubtasks = (memberId) =>
    subTasks.filter((s) =>
      s.assignedTo.some((member) => member._id === memberId)
    );

     const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#1ef102ff';
      case 'in-progress': return '#3daae9ff';
      case 'planning': return '#fbff00ff';
      case 'on-hold': return '#f72525ff';
      case 'Assigned': return '#a5ee74ff';
      case 'dropped' : return '#f72525ff'
      default: return '#f0ab2cff';
    }
  };
const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#00ff2aff';
      case 'medium': return '#63b5ecff';
      case 'low': return '#e4ee8cff';
      case 'urgent': return '#fd3300ff' ;
      default: return '#63b5ecff';
    }
  };


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
  return (
    <div style={{ padding: '2rem' }}>
      
      <h2 style={{ marginBottom: '2rem' }}></h2>
      {members.map(member => {
        const mySubtasks = getMemberSubtasks(member._id);
         if (mySubtasks.length === 0) return null;
        return(
               <div key={member._id} className={styles.memberCard}>
      <div className={styles.memberHeader} style={{cursor:"pointer"}} onClick={()=>navigate(`/member/${member._id}`)}>
        <div className={styles.profileImg}>
          <img src={member.photoUrl ? getDirectImageUrl(member.photoUrl) : "/members/AnonymousImage.jpg"} alt="Profile"  onError={(e) => {
                                        e.target.src = "/members/AnonymousImage.jpg";
                                      }} />
        </div>
        <div className={styles.memberInfo}>
          <strong>{member.name}</strong>
          <div>Ref No:{member.memberReferenceNumber}</div>
          <div>No of subTasks: {mySubtasks.length}</div>
        </div>
      </div>
        <div className={styles.taskTableWrapper}>
      <div className={styles.taskTable}>
       
        <div className={`${styles.taskRow} ${styles.taskHeader}`}>
          <div>Subtask ID</div>
          <div>Subtask Name</div>
          <div>Task Name</div>
          <div>Project Name</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Priority</div>
          <div>Status</div>
        </div>
      
        {mySubtasks.map((subtask) => (
           <div className={`${styles.taskRow} ${styles.taskData}`} key={subtask._id}>

            <div style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${subtask._id}`)}>{subtask.customId}</div>
            <div style={{cursor:"pointer"}} onClick={()=>navigate(`/subTask/${subtask._id}`)}>{subtask.title}</div>
            <div style={{cursor:"pointer"}} onClick={()=>navigate(`/task/${subtask.taskId._id}`)}>{subtask.taskId?.title}</div>
            <div style={{cursor:"pointer"}} onClick={()=>navigate(`/project/${subtask.taskId?.projectId._id}`)}>{subtask.taskId?.projectId?.title}</div>
            <div>{new Date(subtask.startDate).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"numeric"
                                    })}</div>
            <div>{new Date(subtask.endDate).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"numeric"
                                    })}</div>
            <div className={styles.badges}>
            <span  style={{ backgroundColor: getPriorityColor(subtask.priority) }}>{subtask.priority}</span>
             </div>
             <div className={styles.badges}>
            <span  className={styles.badge} style={{ backgroundColor: getStatusColor(subtask.status) }}>{subtask.status}</span >
                </div>                   
          </div>
          
       
        ))}
      </div>
      </div>
    </div>
        )
     
})}
    </div>
  )
}

export default MembersWorking
