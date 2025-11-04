
import React, { useEffect, useState } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag } from 'lucide-react';
import FormInput from '../UI/FormInput';
import DropdownSelect from '../UI/DropdownSelect';
import styles from './AddModel.module.scss';
import API from '../../axios';
import { useData } from '../../context/DataContext';


const AddMemberComments= ({ isOpen, onClose, onSubmit, editComment, onEdit }) => {
  const [formData, setFormData] = useState({
        comment:"",
        memberId:"",
    
  });

  const[memberOptions, setMemberOptions] = useState([]);
  const {memberContext} = useData();
  const [errors, setErrors] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  //For get data in edit form
    useEffect(() => {
        fetchMemberOptions();
    if (editComment) {
    
    setFormData({
         comment: editComment.comment ||"",
        memberId:editComment.memberId?._id  || "",
    });
    } else {
      setFormData({
        comment:"",
        memberId:"",
      });
    }
  }, [editComment, memberContext]);

  //For Member dropdown
    const fetchMemberOptions=async()=>{
      try{
       setMemberOptions(memberContext.map(member=>({
            value: member._id,
            label: member.name,
            image: getDirectImageUrl(member.photoUrl),
        })))
      }
      catch (error) {
            console.error("Error fetching members:", error);
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

  
  const validateForm = () => {
    const newErrors = {};

    if (!formData.comment.trim()) newErrors.comment = 'Comment  is required';
    if (!formData.memberId) newErrors.memberId = 'Member name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     if(btnLoading){
//         return
//       }
    
// if (validateForm()) {
//   setBtnLoading(true);
  

//     if (editComment) {
//       const res = await API.put(`/memberComments/${editComment._id}`,formData);
//       onEdit?.(res.data.data);
//     } else {
//       const res = await API.post("/memberComments", formData);
//       onSubmit(res.data.data);
//     }
//       // Reset after submit
//       setFormData({
//         comment:"",
//         memberId:"",
       
//       });
//       setErrors({});
//       onClose();
//       setBtnLoading(false);
//     }
//   };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (btnLoading) return;
  if (!validateForm()) return;

  try {
    setBtnLoading(true);
    let res;
    if (editComment) {
      res = await API.put(`/memberComments/${editComment._id}`, formData);
      onEdit?.(res.data.data);
    } else {
      res = await API.post("/memberComments", formData);
      onSubmit(res.data.data);
    }
     setFormData({
        comment:"",
        memberId:"",
        
      });
      setErrors({});
    onClose();
  } catch (err) {
    console.error("Error submitting comment:", err);
  } finally {
    setBtnLoading(false);
  }
};


  

  const handleCancel = () => {
    setFormData({
       comment:"",
        memberId:"",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{editComment ? 'Edit Comment' : 'Add New Comment'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <FormInput
              label="Comment"
              value={formData.comment}
              onChange={(value) => setFormData({ ...formData, comment: value })}
              placeholder="Enter comment... "
              required
              error={errors.comment}
              icon={<CheckSquare size={16} />}
            />

            <DropdownSelect
              label="Member Name"
              options={memberOptions}
              value={formData.memberId}
              onChange={(value) => setFormData({ ...formData, memberId: value })}
              searchable
              required
              error={errors.memberId}
            />
           
           
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={btnLoading} className={styles.submitButton}>
              {btnLoading?"Uploading":(editComment ? 'Update Comment' : 'Add Comment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberComments;
