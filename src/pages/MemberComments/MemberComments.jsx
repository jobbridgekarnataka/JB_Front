import React, { useEffect, useState } from 'react'
import styles from './MemberComments.module.scss'
import { useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import AddMemberComments from '../../components/Models/AddMemberComments';
import { useOutletContext } from 'react-router-dom';
import API from '../../axios';

function MemberComments() {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal,setShowModal]= useState(false);
  const [editingComments,setEditingComments] = useState(null);
  const [memberOptions, setMemberOptions] = useState()
  const {memberContext,memberCommentsContext,setMemberCommentsContext} = useData();
  const navigate = useNavigate();

  useEffect(()=>{
    setMembers(memberContext);
    setComments([...memberCommentsContext].sort((a, b) => a.customId - b.customId))
     setMemberOptions(memberContext.map(member=>({
              value:member._id,
              label:member.name,
              photoUrl: getDirectImageUrl(member.photoUrl),
      })
      ))
      setLoading(false); 
  },[memberContext,memberCommentsContext])
  
  
   const getMemberComments = (memberId) =>
  comments.filter((c) => c.memberId?._id === memberId);


    
      //  Open Edit Modal
  const handleEdit = (comment) => {
    setEditingComments(comment); // force new reference
    setShowModal(true);
  };

 
const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Comment?')) {
      try{
         await API.delete(`/memberComments/${id}`);
        alert("Comment deleted successfully");
          setComments(comments.filter(comment => comment._id !== id));
          setMemberCommentsContext(comments.filter(comment => comment._id !== id));
           
        }catch(err){
          alert("Failed to delete Comment")
        }
    }
  };

  // ✅ Update comment in front end for quick response
    const handleEditMemberComment = async(updated) => {
       const member = memberOptions.find(m=> m.value === updated.memberId);
        const updatedComment = {
        ...updated,
        memberId:{_id:updated.memberId,name:member?.label||""},
       
      }  
        setMemberCommentsContext(prev =>
          prev.map((comment) => comment._id === updated._id ? updatedComment : comment)
        );
      setEditingComments(null);
      setShowModal(false);
  };

   // ✅ Add Comments (Backend) +Local state
  const handleAddMemberComment = async (commentData) => {
    try {
      const member = memberOptions.find(m => m.value === commentData.memberId);
      const newComment ={
        ...commentData,
        memberId:{_id:commentData.memberId,name:member?.label ||""}
      }
      setMemberCommentsContext(prev=>[...prev,newComment]);
    } catch (error) {
      console.error("Error adding comment:", error);
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
    <>
        <div
          className={styles.headerWrapper}
          style={{ left: sidebarWidth + 'px' }} // dynamically adjust according to sidebarCollapsed
        >
      <div className={styles.headerContent}>
         {/* Global Filter Input */}
         
            <div className={styles.cardSearch}>
              <Search size={20}/>
              <input
                type="text"
                placeholder="Search..."
                // value={globalFilter || ''}
                // onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

      
       <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          Add Comments
        </button>
      
        
      </div>
      </div>
      <AddMemberComments
            isOpen={showModal}
            onClose={() => {
                setShowModal(false);
               setEditingComments(null);
            }}
             onSubmit={handleAddMemberComment}
             onEdit={handleEditMemberComment}
             editComment={editingComments}
      />
    
    <div style={{ padding: '2rem' }}>
      
      <h2 style={{ marginBottom: '2rem' }}></h2>
      {members.map(member => {
        const myComments = getMemberComments(member._id);
         if (myComments.length === 0) return null;
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
          
        </div>
      </div>
       <div className={styles.taskTableWrapper}> 
        <table className={styles.taskTable}> 
          <thead> 
            <tr className={styles.taskHeader}>
              <th>Actions</th>
              <th>ID</th>
              <th>Member Name</th>
              <th>Comment</th>
              </tr> 
               </thead> 
               <tbody> 
                {myComments.map((comment) => ( 
                 <tr className={styles.taskData} key={comment._id}>
                  <td>
                    <div className={styles.memberActions}>
                      <button className={styles.editButton} onClick={() => handleEdit(comment)} title="Edit member">
                        <Edit size={16} />
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDelete(comment._id)} title="Delete member">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                  <td>{comment.customId}</td>
                  <td onClick={() => navigate(`/member/${member._id}`)} style={{ cursor: "pointer" }}>{comment?.memberId?.name}</td>
                  <td>{comment.comment}</td>
                </tr>
                 ))} 
                     </tbody> 
                     </table> 
                     </div> 
                     </div> 
                    ); 
                    })}
    
    </div>
    </>
  )
}

export default MemberComments
