// components/Models/RequestStatusModal.jsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import DropdownSelect from '../UI/DropdownSelect';
import styles from './AddModel.module.scss';
import API from '../../axios';
import { useAuth } from '../../context/AuthContext';



const RequestStatusModal = ({ isOpen, onClose, onSubmit, editRequest,onEdit }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  const {user} = useAuth();
  const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'Idea', label: 'Idea' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

  useEffect(()=>{
    if(editRequest){
      setSelectedStatus(editRequest.status || '');
    }
    else{
      setSelectedStatus('');
    }
  },[editRequest])



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return alert('Please select a status');
    if(btnLoading){
        return
      }
      setBtnLoading(true);
    try {
      const res = await API.post('/request/status-request', {
      subTaskId:editRequest._id,
      requestedStatus: selectedStatus,
      requestedBy:user.memberId,
    });
    alert('Status change request sent to admin.');
    onSubmit(res.data.data);
    setSelectedStatus('');
    setErrors({});
    onClose();
    
  }
  catch (err) {
    console.error('Request failed:', err);
    alert('Failed to send request.');
  }
  finally{
    setBtnLoading(false);
  }
};

  const handleCancel =()=>{
    setSelectedStatus('');
    setErrors({});
    onClose();
  }
  if (!isOpen) return null;

return (
  <div className={styles.overlay} >
    <div className={styles.modal} >
      <div className={styles.header}>
        <h2>Request Status Change</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={20} />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
        <DropdownSelect
          label="New Status"
          options={statusOptions}
          value={selectedStatus}
          onChange={(value)=>setSelectedStatus(value)}
          required
          // error={errors.status}
        />
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
          <button type='submit' disabled={btnLoading} className={styles.submitButton}>{btnLoading? "Uploading" :"Send Request"}</button>
        </div>
      </form>
    </div>
    </div>

);
}
export default RequestStatusModal
