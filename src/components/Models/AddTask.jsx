
import React, { useEffect, useState } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag } from 'lucide-react';
import FormInput from '../UI/FormInput';
import DropdownSelect from '../UI/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../UI/DateSelect';
import API from '../../axios';


const AddTask= ({ isOpen, onClose, onSubmit, editTask, onEdit }) => {
  const [formData, setFormData] = useState({
        title:"",
        description:"",
        startDate:null,
        endDate:null,
        projectId:"",
        priority:"",
        status:"",
    
  });
  const[projectOptions, setProjectOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  //For get data in edit form
    useEffect(() => {
        fetchProjectOptions();
    if (editTask) {
    
    setFormData({
      title: editTask.title || '',
      description: editTask.description || '',
      projectId: editTask.projectId?._id || '',
      startDate: editTask.startDate ? new Date(editTask.startDate) : null,
      endDate: editTask.endDate ? new Date(editTask.endDate) : null,
      priority: editTask.priority || '',
      status: editTask.status || '',
    });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: '',
        startDate: null,
        endDate:  null,
        priority: '',
        status: '',
      });
    }
  }, [editTask]);

  //For project dropdown
    const fetchProjectOptions=async()=>{
      try{
        const res = await API.get("/project");
        setProjectOptions(res.data.map(project=>({
          value:project._id,
          label:project.title,
        })))
      }
      catch (error) {
            console.error("Error fetching projects:", error);
            }
      };

   const priorityOptions = [
    { value: 'low', label: 'Low',color:'#e4ee8cff' },
    { value: 'medium', label: 'Medium',color:'#63b5ecff' },
    { value: 'high', label: 'High',color:'#00ff2aff' },
    {value:'urgent',label:'Urgent',color:'#fd3300ff'}
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning',color: '#f0ab2cff'  },
    { value: 'in-progress', label: 'In Progress',color: '#3daae9ff' },
    { value: 'completed', label: 'Completed',color: '#1ef102ff' },
    { value: 'on-hold', label: 'On Hold',color: '#f72525ff' },
  ];
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Task name is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.status) newErrors.status = 'Status is required';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      startDate: formData.startDate ? formData.startDate.toISOString().split("T")[0] : "",
      endDate: formData.endDate ? formData.endDate.toISOString().split("T")[0] : "",
    };

    if (editTask) {
      const res = await API.put(`/task/${editTask._id}`, payload);
      onEdit?.(res.data.data);
    } else {
      const res = await API.post("/task", payload);
      onSubmit(res.data.data);
    }
      // Reset after submit
      setFormData({
        title: '',
        description: '',
        projectId: '',
        startDate: null,
        endDate:null,
        priority: '',
        status: '',
       
      });
      setErrors({});
      onClose();
      setBtnLoading(false);
    }
  };


  

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      projectId: '',
      startDate: null,
      endDate:null,
      priority: '',
      status: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{editTask ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <FormInput
              label="Task Name"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Enter task name"
              required
              error={errors.title}
              icon={<CheckSquare size={16} />}
            />

            <FormInput
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter task description"
              multiline
            />

            <DropdownSelect
              label="Project"
              options={projectOptions}
              value={formData.projectId}
              onChange={(value) => setFormData({ ...formData, projectId: value })}
              required
              searchable
              error={errors.projectId}
            />

            <DropdownSelect
              label="Priority"
              options={priorityOptions}
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value })}
              required
              error={errors.priority}
            />

             <DateSelect
              label="Start Date"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value })}
              required
              
              />

              <DateSelect
              label="End Date"
              value={formData.endDate}
              onChange={(value) => setFormData({ ...formData, endDate: value })}
              required
              min={formData.startDate}
              />

            <DropdownSelect
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              required
              error={errors.status}
            />
           
           
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={btnLoading} className={styles.submitButton}>
              {btnLoading?"Uploading":(editTask ? 'Update Task' : 'Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
