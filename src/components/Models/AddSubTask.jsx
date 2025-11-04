
import React, { useEffect, useState } from 'react';
import { X, List, CheckSquare, Calendar, Flag, User } from 'lucide-react';
import FormInput from '../UI/FormInput';
import DropdownSelect from '../UI/DropdownSelect';
import DateSelect from '../UI/DateSelect';
import API from '../../axios';
import styles from './AddModel.module.scss';




const AddSubtask = ({ isOpen, onClose, onSubmit, editSubtask, onEdit,selectedTask,selectedProject }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId:'',
    taskId: '',
    assignedTo: [],
    startDate:null,
    endDate:null,
    status: '',
    priority: '',
    place:'',
    

    
  });

  const [errors, setErrors] = useState({});
  const [projectOptions,setProjectOptions] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const[taskOptions, setTaskOptions] = useState([]);
  const[memberOptions,setMemberOptions]  = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [placeOptions,setPlaceOptions] = useState([]);
 const [selectedPlaceInfo, setSelectedPlaceInfo] = useState(null);
 
  const [btnLoading, setBtnLoading] = useState(false);
 const priorityOptions = [
    { value: 'low', label: 'Low',color:'#e4ee8cff' },
    { value: 'medium', label: 'Medium',color:'#63b5ecff' },
    { value: 'high', label: 'High',color:'#00ff2aff' },
    {value:'urgent',label:'Urgent',color:'#fd3300ff'}
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning',color: '#fbff00ff'  },
    { value: 'Idea', label: 'Idea',color: '#ff9100c5' },
    { value: 'Assigned', label: 'Assigned',color: '#a5ee74ff' },
    { value: 'in-progress', label: 'In Progress',color: '#3daae9ff' },
    { value: 'completed', label: 'Completed',color: '#1ef102ff' },
    { value: 'on-hold', label: 'On Hold',color: '#f72525ff' },
    { value: 'dropped', label: 'Dropped',color: '#f72525ff' },
    

  ];



  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Subtask name is required';
    if (!formData.taskId) newErrors.taskId = 'Task is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.assignedTo || formData.assignedTo.length === 0)
    newErrors.assignedTo = 'Assigned person(s) required';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(()=>{
const initialize = async () => {

      const [tasksRes, projectsRes, membersRes,placeRes] = await Promise.all([
      API.get('/task'),
      API.get('/project'),
      API.get('/member'),
      API.get('/place'),
    ]);
  
     setAllPlaces(placeRes.data);

     // ✅ Build unique district list
    const uniqueDistricts = [
      ...new Map(
        placeRes.data.map((p) => [p.district, { value: p.district, label: p.district }])
      ).values(),
    ];
    setDistrictOptions(uniqueDistricts);

      setPlaceOptions(placeRes.data.map(place=>({
        value:place._id,
        label:place.place,
        type:place.type,
        organisationalStatus:place.organisationalStatus,
      }))
    );
    // setDistrictOptions(placeRes.data.map(place=>({
    //    value:place._id,
    //     label:place.district
    // })))
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
    
  };
   initialize();
  },[])

  useEffect(() => {
     
      if (!editSubtask && !selectedProject && allTasks.length === 0) return;

     let projectIdFromEdit = '';
  let taskIdFromEdit = '';

  if (editSubtask) {
    projectIdFromEdit = editSubtask.projectId?._id || editSubtask.projectId;
    taskIdFromEdit = editSubtask.taskId?._id || editSubtask.taskId;
  } else {
    projectIdFromEdit = selectedProject?._id || '';
    taskIdFromEdit = selectedTask?._id || '';
  }
 // Filter tasks for the selected project
  const filteredTasks = allTasks.filter(task => {
    const pid = typeof task.projectId === 'object' ? task.projectId._id : task.projectId;
    return pid === projectIdFromEdit;
  });
  setTaskOptions(filteredTasks);


    if (editSubtask) {
      setFormData({
      title: editSubtask.title || '',
      description: editSubtask.description || '',
      taskId: taskIdFromEdit,
      projectId: projectIdFromEdit,
      assignedTo: Array.isArray(editSubtask.assignedTo)
        ? editSubtask.assignedTo.map(m => m._id) // ✅ multiple members pre-selected
        : [],
      startDate: editSubtask.startDate ? new Date(editSubtask.startDate) : null,
      endDate: editSubtask.endDate ? new Date(editSubtask.endDate) : null,
      priority: editSubtask.priority || '',
      status: editSubtask.status || '',
       district: editSubtask.district || '',
        unit: editSubtask.unit || '',
        place:editSubtask?.place?._id || '',
    });
    } else {
      setFormData({
        title: '',
        description: '',
        taskId: selectedTask ? selectedTask._id : '', 
        projectId: selectedProject? selectedProject._id : '',
        startDate: null,
        endDate: null,
        status: '',
        priority: '',
        assignedTo: [],
        place:'',
      });
    }
    // Filter task options if adding new subtask
    if (selectedProject?._id) {
      const filtered = allTasks.filter(task => {
        const pid = typeof task.projectId === 'object' ? task.projectId._id : task.projectId;
        return pid === selectedProject._id;
      });
      setTaskOptions(filtered);
    }
  

 
  }, [ editSubtask, selectedTask, selectedProject, allTasks]);


  
  
        const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  const match = driveUrl.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
};
  const handleSubmit =async (e) => {
    e.preventDefault();
    if(btnLoading){
        return
      }
    if (validateForm()) {
      setBtnLoading(true);
      try{
       
      const payload = {
      ...formData,
      startDate: formData.startDate ? formData.startDate.toISOString().split("T")[0] : "",
      endDate: formData.endDate ? formData.endDate.toISOString().split("T")[0] : "",
      assignedTo: formData.assignedTo, // ✅ Array of member IDs
    };
    // 🚨 remove empty place (avoid ObjectId cast error)
      if (!payload.place) {
        delete payload.place;
      }

      if (editSubtask) {
         const res=await API.put(`/subtask/${editSubtask._id}`, payload);
        onEdit?.(res.data.data);
      } else {
        const response = await API.post("/subTask",payload);
        onSubmit(response.data.data);
      }

      setFormData({
        title: '',
        description: '',
        projectId:'',
        taskId: '',
        assignedTo: [],
        startDate:null,
        endDate:null,
        status: '',
        priority: '',
        place:'',
      });
      setSelectedPlaceInfo(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error saving subtask:", error);
      alert("Failed to save subtask. Please try again.");
    } finally {
      setBtnLoading(false);
    }
      
    }
  };


  const handleCancel = () => {
    setFormData({
        title: '',
        description: '',
        projectId:'',
        taskId: '',
        assignedTo: [],
        startDate:null,
        endDate:null,
        status: '',
        priority: '',
        place:'',
    });
    setSelectedPlaceInfo(null);
    setErrors({});
    onClose();
  };

  const handleProjectChange = (projectId) => {
    const filtered = allTasks.filter(task => {
    const pid = typeof task.projectId === 'object' ? task.projectId._id : task.projectId;
    return pid === projectId;
  });
    setTaskOptions(filtered);
   
    setFormData(prev => ({
      ...prev,
      projectId,
      taskId: filtered.some(t => t.value === prev.taskId) ? prev.taskId : '',
    }));
  };

  // const handleDistrictChange =(districtId) =>{

  //       const filtered = allPlaces.filter(place => {
  //   const pid =  place._id;
  //   return pid === districtId;
  // });
  //   setPlaceOptions(filtered);
  
  //   setFormData(prev => ({
  //     ...prev,
  //     district:districtId,
  //   }));
  // }

  const handleDistrictChange = (district) => {
  // Filter places in this district
  const filteredPlaces = allPlaces.filter((p) => p.district === district);

  setPlaceOptions(
    filteredPlaces.map((p) => ({
      value: p._id,
      label: p.place,
      type: p.type,
      organisationalStatus: p.organisationalStatus,
    }))
  );

  setFormData((prev) => ({
    ...prev,
    district,
    place: '', // reset place when district changes
  }));

  setSelectedPlaceInfo(null);
};

const handlePlaceChange = (placeId) => {
  const selected = allPlaces.find((p) => p._id === placeId);

  setFormData((prev) => ({
    ...prev,
    place: placeId,
  }));

  setSelectedPlaceInfo(selected || null);
};

//   const handlePlaceChange = (placeId) => {
//   const selected = placeOptions.find((p) => p.value === placeId);

//   setFormData((prev) => ({
//     ...prev,
//     place: placeId,
//   }));

//   setSelectedPlaceInfo(selected || null);
// };
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{editSubtask ? 'Edit Subtask' : 'Add New Subtask'}</h2>
          <button onClick={handleCancel} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <FormInput
              label="Subtask Name"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="Enter subtask name"
              required
              error={errors.title}
              icon={<List size={16} />}
            />

            <FormInput
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter subtask description"
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
              disabled={!!selectedProject}
            />

            <DropdownSelect
              label="Task"
              options={taskOptions}
              value={formData.taskId}
              onChange={(value) => setFormData({ ...formData, taskId:value })}
              searchable
              required
              error={errors.taskId}
              disabled={!!selectedTask}
            />
            <DropdownSelect
              label="Assign To"
              options={memberOptions}
              value={formData.assignedTo}
              onChange={(value) => setFormData({ ...formData, assignedTo: value })}
              searchable
              multiple
              required
              error={errors.assignedTo}
            />
            <DropdownSelect
              label="District"
              options={districtOptions}
              value={formData.district}
              onChange={(value) => handleDistrictChange(value)}
              searchable
            />
            <DropdownSelect
              label="Place"
              options={placeOptions}
              value={formData.place}
              onChange={(value) => handlePlaceChange(value)}
              searchable
            />
            {/* // Show only when place selected */}
            {selectedPlaceInfo && (
              <>
                <FormInput
                  label="Place Type"
                  value={selectedPlaceInfo.type}
                  onChange={() => {}}
                  disabled
                />
                <FormInput
                  label="Organisational Status"
                  value={selectedPlaceInfo.organisationalStatus}
                  onChange={() => {}}
                  disabled
                />
              </>
            )}
            <DropdownSelect
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              required
              error={errors.status}
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
              {btnLoading?"Uploading":(editSubtask ? 'Update Subtask' : 'Add Subtask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubtask;
