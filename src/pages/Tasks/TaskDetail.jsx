import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import API from '../../axios';
import styles from './TaskDetail.module.scss'
import { Plus, List, Calendar, Flag, CheckSquare, User, Edit, Trash2, ListFilter, Tags } from 'lucide-react';
import CustomCard from '../../components/UI/CustomCard';
import styles1 from '../Subtasks/Subtasks.module.scss'
import AddSubtask from '../../components/Models/AddSubTask';
import { useAuth } from '../../context/AuthContext';
import AddTask from '../../components/Models/AddTask';
import { useData } from '../../context/DataContext';
function TaskDetail() {
  const {id} = useParams();
  const [task, setTask]= useState('');
  const [subTasks, setSubTasks] = useState([]);
  const subtaskCount = subTasks.length;
   const [showTaskModal, setShowTaskModal] = useState(false);
   const [showSubtaskModal, setShowSubtaskModal] = useState(false);
   const [editingSubtask, setEditingSubtask] = useState(null);
   const [loading, setLoading] = useState(true);
   const {taskContext,subTaskContext} = useData();
   const {user} = useAuth();
  const navigate = useNavigate();
  useEffect(()=>{
    fetchTask();
  },[taskContext,subTaskContext]);

  const fetchTask= async()=>{
    try{
     // const res = await API.get(`/task/${id}`);
     const filtered = await taskContext.find(task=>String(task._id)===String(id));
      setTask(filtered);
      fetchSubTask(id);
    }catch(error){
      console.log("Error in fetching Task:",error);
      setLoading(false);
    }
  }

  const fetchSubTask = async(taskId)=>{
      try{
       // const res = await API.get(`/subTask`);
       // const allSubTasks = res.data.data;
        const filteredSubTasks = subTaskContext.filter((subtask)=>String(subtask.taskId._id)===String(taskId));
        setSubTasks(filteredSubTasks)
        setLoading(false);
      }
      catch(err){
        console.log("Error in fetching subtasks:",err);
      }
  }

  const handleAddSubtask = (newSubtask) => {

        setSubTasks(prev => [...prev, newSubtask]);
      };

      const handleEditSubtask = (updated) => {
   

    setSubTasks(prev =>
      prev.map((subTask) => subTask._id === updated._id ? updated : subTask)
    );
    setEditingSubtask(null);
    setShowSubtaskModal(true);
  };
      const handleSubTaskEdit = (subtask) => {
    setEditingSubtask(subtask);
    setShowSubtaskModal(true);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#1ef102ff';
      case 'in-progress': return '#3daae9ff';
      case 'planning': return '#f0ab2cff';
      case 'on-hold': return '#f72525ff';
      case 'Assigned': return '#a5ee74ff';
      case 'dropped' : return '#f72525ff'
      default: return '#f0ab2cff';
    }
  };

    if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    <div className={styles.projectBoard}>
                    <header className={styles.header}>
                            <h3>{task?.title}</h3>
                        
                      {/* <button 
                        className={styles.addButton}
                        onClick={() => handleEdit(task)}
                              title="Edit Task"
                      >
                        <Edit size={20} />
                
                      </button> */}
                        
                    </header>
                    {/* <button
                        className={styles.addButton1}
                        onClick={() => handleEdit(task)}
                      >
                        <Edit size={20} />
                        
                      </button>
                       <AddTask
                            isOpen={showTaskModal}
                            onClose={() => {
                              setTaskShowModal(false)
                              setEditingSubtask(null); // ✅ Also clear on modal close
                            }}
                          onEdit={handleEditSubtask} 
                          editSubtask={editingSubtask}
                        /> */}
                    <div className={styles.statsGrid} style={{ margin: 10 }}>
                        <CustomCard className={styles.statCard}  hover>
                        <div className={styles.statIcon} style={{ backgroundColor: '#FFEAA7' }}>
                        <CheckSquare size={24} />
                        </div>
                        <div className={styles.statInfo}>
                             <p><strong>No.of SubTasks</strong></p>
                        <h3>{subtaskCount}</h3>
                       
                        </div>
                        
                    </CustomCard>
                     <CustomCard  className={styles.statCard} hover>
                        <div className={styles.statIcon} style={{ backgroundColor: '#DDA0DD' }}>
                        <List size={24} />
                        </div>
                        <div className={styles.statInfo}>
                             <p><strong>No.of Completed SubTasks</strong></p>
                        <h3>{subtaskCount}</h3>
                       
                        </div>
                        
                    </CustomCard>
                     </div>

                       <div className={styles.detailContainer}>
      
      <div className={styles.meta}>
         <p><Tags size={16}/><strong>Task ID: </strong>{task?.customId}</p>
        <p style={{ cursor: "pointer" }} onClick={()=>navigate(`/project/${task.projectId?._id}`)}><Flag size={16} /> <strong>Project:</strong> {task?.projectId?.title}</p>
       
      </div>
      <div className={styles.meta}>
        {task?.description&&<p><List size={16}/><strong>Description: </strong>{task?.description}</p>}
      </div>

      <div className={styles.badges}>
        <span style={{ backgroundColor: getPriorityColor(task?.priority) }}>
          Priority: {task?.priority}
        </span>
        <span style={{ backgroundColor: getStatusColor(task?.status) }}>
          Status: {task?.status}
        </span>
      </div>

      <div className={styles.dates}>
        <p><Calendar size={16} /> <strong>Created:</strong> {new Date(task?.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</p>
        <p><Calendar size={16} /> <strong>Deadline:</strong> {new Date(task?.endDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</p>
      </div>

    </div>
                        <AddSubtask
                            isOpen={showSubtaskModal}
                            onClose={() => {
                              setShowSubtaskModal(false)
                             // setSelectedTask(null); // Clear after close
                             setEditingSubtask(null); // Reset edit mode on close
                            }}
                            onSubmit={handleAddSubtask}
                            selectedTask={task} // ✅ Pass current task as selectedTask
                            selectedProject={task?.projectId} // ✅ Pass project as selectedProject
                            onEdit={handleEditSubtask}
                            editSubtask={editingSubtask}
                          />

                        <div className={styles1.subtasksList}>
                        
                {subTasks.filter((s) => s.taskId._id === task._id).map((subtask) => (
                       <CustomCard key={subtask?._id} className={styles1.subtaskCard} hover >
                <div className={styles1.subtaskHeader}>
                  <div className={styles1.colorBar} style={{ backgroundColor: getPriorityColor(subtask?.priority) }}/>
                  <div className={styles1.subtaskInfo}>
                    <h3>{subtask?.title}</h3>
                    <p><Tags size={12}/> {subtask?.customId}</p>
                    <div className={styles1.badges}>
                      {subtask?.taskId && (
                        <span className={styles1.taskBadge}>
                          <CheckSquare size={12} />
                          {subtask?.taskId?.title}
                        </span>
                      )}
                      
                    </div>
                  </div>
                  {user?.role==="Admin"&&(
                  <div className={styles1.subtaskActions}>
                    <button
                      className={styles1.editButton}
                      onClick={() => handleSubTaskEdit(subtask)}
                      title="Edit subtask"
                    >
                      <Edit size={16} />
                    </button>
                    {/* <button
                      className={styles1.deleteButton}
                      onClick={() => handleDelete(subtask._id)}
                      title="Delete subtask"
                    >
                      <Trash2 size={16} />
                    </button> */}
                  </div>
                  )}
                </div>
                 <div onClick={()=>{navigate(`/subtask/${subtask._id}`)}} >
                <div className={styles1.subtaskDetails}>
                   <div className={styles1.badges}>
                        <span className={styles1.badge}  style={{ backgroundColor: getPriorityColor(subtask?.priority) }}>
                        
                          {subtask?.priority}
                        </span>
                        <span className={styles1.badge} style={{ backgroundColor: getStatusColor(subtask?.status) }}>
                        
                          {subtask?.status}
                        </span>
                  </div>
                  <div><Calendar size={16} /> {new Date(subtask?.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}  -  {new Date(subtask?.endDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</div>
             
                  <div>
                    <User size={16} />{" "}
                    {Array.isArray(subtask?.assignedTo) && subtask?.assignedTo.length > 0 ? (
                      subtask.assignedTo.length === 1 ? (
                        subtask?.assignedTo[0].name
                      ) : (
                     //   "Multiple Members";
                          subtask?.assignedTo.map(m => m.name).join(", ") 
                      )
                    ) : (
                      "Unassigned"
                    )}
                  </div>
                </div>
                </div>
              </CustomCard>
               
                ))}
                </div>
      
    </div>
  )
}

export default TaskDetail
