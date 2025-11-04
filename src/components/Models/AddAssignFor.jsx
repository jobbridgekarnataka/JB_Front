
import React, { useEffect, useState } from 'react';
import { X, List, CheckSquare, Calendar, Flag, User } from 'lucide-react';
import FormInput from '../UI/FormInput';
import DropdownSelect from '../UI/DropdownSelect';
import DateSelect from '../UI/DateSelect';
import styles from './AddModel.module.scss';
import API from '../../axios';




const AddAssignFor = ({ isOpen, onClose, onSubmit, editAssignFor, onEdit }) => {
  const [formData, setFormData] = useState({
    description: '',
    projectId:'',
    taskId: '',
    subTaskId:'',
    assignedFor: [],
    date: null,
    status: '',
    currentDistrict:'',
    
  });

  const [errors, setErrors] = useState({});
    const [projectOptions,setProjectOptions] = useState([]);
  const[taskOptions, setTaskOptions] = useState([]);
   const[subTaskOptions, setSubTaskOptions] = useState([]);
  const[memberOptions,setMemberOptions]  = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
 const [allTasks, setAllTasks] = useState([]);
 const [allSubtasks, setAllSubtasks] = useState([]);
   
 const statusOptions = [
    { value: 'Invited', label: 'Invited',color: '#f0ab2cff'  },
    { value: 'Not-Attended', label: 'Not Attended',color: '#ff0000ff' },
    { value: 'Attended', label: 'Attended',color: '#1ef102ff' },
    { value: 'Completed', label: 'Completed',color: '#2bff00ff' },
    { value: 'Permission', label: 'Permission',color: '#0084ffff' },
    { value: 'Not-Possible', label: 'Not-Possible',color: '#ff80f4ff' },
    { value: 'Waiting', label: 'Waiting',color: '#ff8800ff' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = 'SubTask is required';
    if (!formData.subTaskId) newErrors.subTaskId = 'SubTask is required';
    if (!formData.taskId) newErrors.taskId = 'Task is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.assignedFor || formData.assignedFor.length===0) newErrors.assignedFor = 'Assigned person(s) required';


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  
   useEffect(()=>{
const initialize = async () => {

      const [tasksRes, projectsRes, membersRes,subTaskRes] = await Promise.all([
      API.get('/task'),
      API.get('/project'),
      API.get('/member'),
      API.get('/subTask'),
    ]);
  
     // 1. Fetch all tasks and store in allTasks
    
    const tasks = tasksRes.data.data.map(task => ({
      value: task._id,
      label: task.title,
      projectId: task.projectId?._id || task.projectId,
    }));
    setAllTasks(tasks);

    // 2. Fetch projects
    
    setProjectOptions(
      projectsRes.data.map(project => ({
        value: project._id,
        label: project.title,
      }))
    );

    // 3. Fetch members
    
    const sortedMembers = membersRes.data.sort(
      (a, b) => a.memberReferenceNumber - b.memberReferenceNumber
    );
    setMemberOptions(
      sortedMembers.map(member => ({
        value: member._id,
        label: member.name,
        image: getDirectImageUrl(member.photoUrl),
      }))
    );
    setAllSubtasks(
      subTaskRes.data.data.map(subtask => ({
        value: subtask._id,
        label: subtask.place
          ? `${subtask.title} (${subtask.place.place})`
          : subtask.title,
        taskId: subtask.taskId,
      }))
    );
 
  };
   initialize();
  },[])

  // 👇 separate effect to handle pre-filling once data is ready
useEffect(() => {
  if (!editAssignFor) return;

  const projectIdFromEdit = editAssignFor?.projectId._id || '';
  const taskIdFromEdit = editAssignFor?.taskId?._id || '';
  const subTaskFromEdit = editAssignFor?.subTaskId?._id || '';

  if (projectIdFromEdit && allTasks.length) {
    setTaskOptions(allTasks.filter(t => t.projectId === projectIdFromEdit));
  }

  if (taskIdFromEdit && allSubtasks.length) {
    setSubTaskOptions(
      allSubtasks.filter(
        st => st.taskId === taskIdFromEdit || st.taskId?._id === taskIdFromEdit
      )
    );
  }

  setFormData({
    description: editAssignFor.description || '',
    projectId: projectIdFromEdit,
    taskId: taskIdFromEdit,
    subTaskId: subTaskFromEdit,
    assignedFor: Array.isArray(editAssignFor.assignedFor)
      ? editAssignFor.assignedFor.map(m => m._id)
      : [],
    date: editAssignFor.date ? new Date(editAssignFor.date) : null,
    status: editAssignFor.status || '',
    currentDistrict: editAssignFor.currentDistrict || '',
  });
}, [editAssignFor, allTasks, allSubtasks]);

         const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  const match = driveUrl.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
};
  
      

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(btnLoading){
        return
      }
      
    if (validateForm()) {
      setBtnLoading(true);
      const payload = {
      ...formData,
     // subTaskId: formData.subTaskId || null, // ✅ important
      date: formData.date ? formData.date.toISOString().split("T")[0] : "",
      assignedFor: formData.assignedFor, // ✅ Array of member IDs
    };
      if (editAssignFor) {
        const res=await API.put(`/assignFor/${editAssignFor._id}`, payload);
        onEdit?.(res.data.data);
      } else {
       const response = await API.post("/assignFor",payload);
        console.log(response.data);
        onSubmit(response.data.data);
      }

      setFormData({
        description: '',
        projectId: '',
        taskId: '',
        subTaskId:'',
        date: null,
        status: '',
        assignedFor: [],
        currentDistrict:'',
      });
      setErrors({});
      onClose();
      setBtnLoading(false);
    }
  };


  const handleCancel = () => {
    setFormData({
        description: '',
        projectId: '',
        taskId: '',
        subTaskId:'',
        date: null,
        status: '',
        assignedFor: [],
        currentDistrict:'',
    });
    setErrors({});
    onClose();
  };

  const handleProjectChange = (projectId) => {
  const filteredTasks = allTasks.filter(task => {
    const pid = task.projectId?._id || task.projectId;
    return pid === projectId;
  });

  setTaskOptions(filteredTasks);
  setSubTaskOptions([]); // Reset subtasks

  setFormData(prev => ({
    ...prev,
    projectId,
    taskId: '',
    subTaskId: '',
  }));
};

const handleTaskChange = (taskId) => {
  const filteredSubtasks = allSubtasks.filter(subtask => {
    return subtask.taskId === taskId || subtask.taskId?._id === taskId;
  });

  setSubTaskOptions(filteredSubtasks);

  setFormData(prev => ({
    ...prev,
    taskId,
    subTaskId: '',
  }));
};
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{editAssignFor ? 'Edit AssignFor' : 'Add New AssignFor'}</h2>
          <button onClick={handleCancel} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
           
            <FormInput
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter AssignFor description"
              multiline
            />

             <DropdownSelect
              label="Project"
              options={projectOptions}
              value={formData.projectId}
              onChange={(value) => {handleProjectChange(value)}}
              searchable
              required
              error={errors.projectId}
            />

            <DropdownSelect
              label="Task"
              options={taskOptions}
              value={formData.taskId}
              onChange={(value) => handleTaskChange(value)}
              required
              searchable
              error={errors.taskId}
            />
            <DropdownSelect
              label="Sub Task"
              options={subTaskOptions}
              value={formData.subTaskId}
              onChange={(value) => setFormData({ ...formData, subTaskId:value })}
              required
              searchable
              error={errors.subTaskId}
            />
            <DropdownSelect
              label="Assign For"
              options={memberOptions}
              value={formData.assignedFor}
              onChange={(value) => setFormData({ ...formData, assignedFor: value })}
              searchable
              multiple
              required
              error={errors.assignedFor}
            />

            <DropdownSelect
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              required
              error={errors.status}
            />
          
              <DateSelect
              label="Date"
              value={formData.date}
              onChange={(value) => setFormData({ ...formData, date: value })}
              required
              error={errors.date}
              />
            

           

          </div>

          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={btnLoading} className={styles.submitButton}>
             {btnLoading? 'Uploading':(editAssignFor ? 'Update AssignFor' : 'Add AssignFor')} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssignFor;
