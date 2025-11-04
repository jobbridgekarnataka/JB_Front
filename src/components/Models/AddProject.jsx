import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag } from 'lucide-react';
import FormInput from '../UI/FormInput';
import DropdownSelect from '../UI/DropdownSelect';
import styles from './AddModel.module.scss';
import DateSelect from '../UI/DateSelect';
import API from '../../axios';



function AddProject({ isOpen, onClose, onSubmit, editProject, onEdit }) {
    const [formData,setFormData]=useState({
        title:"",
        description:"",
        startDate:null,
        endDate:null,
        priority:"",
        status:"",
       
    });
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
   const [errors, setErrors] = useState({});
   const [btnLoading, setBtnLoading] = useState(false);
   
   useEffect(() => {
        if (editProject) {
          setFormData({...editProject,
            startDate: editProject.startDate ? new Date(editProject.startDate) : null,
      endDate: editProject.endDate ? new Date(editProject.endDate) : null,});
        } else {
          setFormData({
            title:"",
            description:"",
             startDate:null,
            endDate:null,
            priority:"",
            status:"",
           
          });
        }
      }, [editProject]);

    const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Project name is required';
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
    const handleSubmit = async (e) => {
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
                if (editProject) {
                  const res=await API.put(`/project/${editProject._id}`, payload);
                    onEdit?.(res.data.project);
                    
                } else {
                     const response = await API.post("/project",payload);

                      // Call parent to add to local state instantly
                      onSubmit(response.data.project);
                      
                       }
                    
       
                setFormData({
                        title:"",
                        description:"",
                        startDate:null,
                        endDate:null,
                        priority:"",
                        status:"",
                       
     
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
            startDate:null,
            endDate: null,
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
                            <h2>{editProject ? 'Edit Project' : 'Add New Project'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Project Name"
                                        value={formData.title}
                                        onChange={(value) => setFormData({ ...formData, title: value })}
                                        placeholder="Enter project name"
                                        required
                                        error={errors.title}
                                        icon={<FolderOpen size={16} />}
                                        />

                                        <FormInput
                                        label="Description"
                                        value={formData.description}
                                        onChange={(value) => setFormData({ ...formData, description: value })}
                                        placeholder="Enter project description"
                                        multiline
                                        />

                                   

                                        <DropdownSelect
                                        label="Priority"
                                        options={priorityOptions}
                                        value={formData.priority}
                                        onChange={(value) => setFormData({ ...formData, priority: value })}
                                        required
                                        error={errors.priority}
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
                                        label="Start Date"
                                        value={formData.startDate}
                                        onChange={(value) => setFormData({ ...formData, startDate: value })}
                                        required
                                        error={errors.startDate}
                                       
                                        />

                                        <DateSelect
                                        label="End Date"
                                        value={formData.endDate}
                                        onChange={(value) => setFormData({ ...formData, endDate: value })}
                                        required
                                        min={formData.startDate}
                                        error={errors.endDate}
                                        />
                                 

                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading" : (editProject ? 'Update Project' : 'Add Project')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddProject
