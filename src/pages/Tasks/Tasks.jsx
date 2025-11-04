import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Calendar, Flag, FolderOpen, Edit, Trash2,Tags, Search } from 'lucide-react';
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import styles from './Tasks.module.scss';
import CustomCard from '../../components/UI/CustomCard';
import DataTable from '../../components/Table/DataTable';
import AddTask from '../../components/Models/AddTask';
import API from '../../axios';
import { useNavigate } from 'react-router';
import Filter from '../../components/Filter/Filter';
import { useAuth } from '../../context/AuthContext';
import RequestStatusModal from '../../components/Models/RequestStatusModal';
import { useData } from '../../context/DataContext';
import FilterStatus from '../../components/Filter/FIlterStatus';
import { useOutletContext } from 'react-router-dom';
const taskColumns = [
  {
    accessorKey: 'customId',
    header: 'Task ID',
  },
  {
    accessorKey: 'title',
    header: 'Task Name',
  },
  
  {
    accessorKey: 'projectId',
    header: 'Project Name',
     cell: info => {
      const project = info.getValue();
      return project?.title || project?.title || 'N/A'; 
      // ✅ Display the project title instead of [object Object]
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: info => new Date(info.getValue()).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    }),
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    }),
  },
  // {
  //   accessorKey: 'priority',
  //   header: 'Priority',
  //   cell: info => {
  //     const priority = info.getValue();
  //     const color =
  //      priority === 'high' ? '#00ff2aff' :
  //         priority === 'medium' ? '#63b5ecff' :
  //           priority === 'low'? '#d0e03bff':
  //           priority === 'urgent'? '#fd3300ff': '#63b5ecff';

  //     return (
  //       <span style={{ color, fontWeight: 600 }}>
  //         {priority.toUpperCase()}
  //       </span>
  //     );
  //   },
  // },
 
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => {
      const status = info.getValue() ;
      const bgMap = {
        'planning': '#f0ab2cff',
        'in-progress': '#3daae9ff',
        'completed': '#1ef102ff',
        'on-hold': '#f72525ff',
      };
      return (
        <span
          style={{
            backgroundColor: bgMap[status] || '#e9ecef',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            display: 'inline-block'
          }}
        >
          {status.replace(/-/g, ' ')}
        </span>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: info => {
      const text = info.getValue() ;
      return text.length > 50 ? text.slice(0, 50) + '…' : text;
    },
  },
 
];


function Tasks() {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
  const [allTasks,setAllTasks] = useState([]); // Store all data
  const [tasks,setTasks]=useState([]); //Displays data
  const [view,setView]=useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projectOptions,setProjectOptions] = useState([]);
  const {user} = useAuth();
  const {taskContext, setTaskContext,projectContext} = useData(); // get All Task data from datacontext (Initial fetch during login)
  const [statusRequestModalOpen, setStatusRequestModalOpen] = useState(false);
  const [requestTask, setRequestTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const navigate = useNavigate();
  

    useEffect(()=>{
      setTasks(taskContext);
      setAllTasks(taskContext);
      fetchProject();
      setLoading(false);

    },[taskContext,projectContext]);

    const fetchProject = ()=>{
        setProjectOptions(projectContext.map(project=>({
          value:project._id,
          label:project.title,
        })))
    }


          // Filter the tasks based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setTasks(allTasks); // ✅ show all again
          setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allTasks];
        const newActiveFilters = {};
        if (filters.priority) {
          filtered = filtered.filter(
            (p) => p.priority.toLowerCase() === filters.priority.toLowerCase()
          );
          newActiveFilters.priority = filters.priority;
        }

        if (filters.status) {
          filtered = filtered.filter(
            (p) => p.status.toLowerCase() === filters.status.toLowerCase()
          );
          newActiveFilters.status = filters.status;

        }

        if (filters.startDate) {
          const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (p) => new Date(p.startDate).setHours(0, 0, 0, 0) >= start
          );
         newActiveFilters.startDate = filters.startDate;
        }

        if (filters.endDate) {
          const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
          filtered = filtered.filter(
            (p) => new Date(p.startDate).setHours(0, 0, 0, 0) <= end
          );
          newActiveFilters.endDate = filters.endDate;
        }

        if (filters.project) {
          filtered = filtered.filter(
            (p) => p.projectId.title === filters.project
          );
          newActiveFilters.project = filters.project;
        }

        setTasks(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters); // Also store the raw filter values
      };


    //For project dropdown
    // const fetchProjectOptions=async()=>{
    //   try{
    //     const res = await API.get("/project");
    //     setProjectOptions(res.data.map(project=>({
    //       value:project._id,
    //       label:project.title,
    //     })))
    //   }
    //   catch (error) {
    //         console.error("Error fetching projects:", error);
    //         }
    //         finally{
    //           setLoading(false);
    //         }
    //   };
    

  
  // Filter configuration for tasks
  const tasksFilterConfig = {
    labels: {
      startDate: 'Date From',
      endDate: 'Date To', 
      project: 'Project',
      priority: 'Priority',
      status: 'Status'
    },
    fieldTypes: {
      startDate: 'date',
      endDate: 'date',
      project: 'string',
      priority: 'string',
      status: 'string'
    },
    formatters: {
      priority: (value) => {
        const priorityMap = {
          'urgent': 'Urgent',
          'high': 'High',
          'medium': 'Medium',
          'low': 'Low'
        };
        return priorityMap[value.toLowerCase()] || value;
      },
      status: (value) => {
        const statusMap = {
          'planning': 'Planning',
          'in-progress': 'In-Progress',
          'completed': 'Completed',
          'on-hold': 'On-Hold'
        };
        return statusMap[value.toLowerCase()] || value;
      }
    }
  };
    // Modify clearFilter to also update filterValues
const clearFilter = (filterKey) => {
  const newActiveFilters = { ...activeFilters };
  const newFilterValues = { ...filterValues };
  
  delete newActiveFilters[filterKey];
  delete newFilterValues[filterKey];
  
  setActiveFilters(newActiveFilters);
  setFilterValues(newFilterValues);
  
  applyFilters(newFilterValues);
};


  // Clear all filters
  const clearAllFilters = () => {
    setTasks(allTasks);
    setActiveFilters({});
    setFilterValues({});
  };
      
   const handleToggle = (newView) => {
      setView(newView);
    };


    const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

const handleEditTask = async(updatedTask) => {
          const project = projectOptions.find(p => p.value === updatedTask.projectId);
          const updatedTaskWithProject = {
              ...updatedTask,
              projectId: { _id: updatedTask.projectId, title: project?.label || "" }
            };
          setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTaskWithProject : task));
          setAllTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTaskWithProject : task));
          setTaskContext(prev => prev.map(task => task._id === updatedTask._id ? updatedTaskWithProject : task));
          setEditingTask(null);
          setShowModal(false);
        }
  

    const handleDelete = async (id) => {
      try{
        const res =await API.get(`/subTask`);
        const filteredSubtask = res.data.data.filter((subtask)=>String(subtask.taskId._id) === String(id));
        if(filteredSubtask.length>0){
          alert("This Task is used for creating subtask. So you can't delete this task");
          return
        }

        if (window.confirm('Are you sure you want to delete this task?')) {
          
                await API.delete(`/task/${id}`);
              setTasks(tasks.filter(task => task._id !== id));
              setAllTasks(allTasks.filter(task => task._id !== id));
              setTaskContext(taskContext.filter(task => task._id !== id));
              alert("Task deleted successfully");
          }
      }
      catch(err){
        console.error("Error deleting task:", err);
      }
  };
 
const handleAddTask = (taskData) => {
  const project = projectOptions.find(p => p.value === taskData.projectId);

  const newTask = {
    ...taskData,
    projectId: { _id: taskData.projectId,title: project?.label || "" }
  };

  setTasks(prev => [...prev, newTask]);
  setAllTasks(prev => [...prev, newTask]);
  setTaskContext(prev => [...prev, newTask]);
};

const handleRowClick = (row) => {
        navigate(`/task/${row._id}`);
    };
 

    // for status request
    const handleStatusRequest = async (taskId, newStatus) => {
  try {
    await API.post('/status-request', {
      taskId,
      requestedStatus: newStatus,
    });
    alert('Status change request sent to admin.');
  } catch (err) {
    console.error('Request failed:', err);
    alert('Failed to send request.');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#1ef102ff';
      case 'in-progress': return '#3daae9ff';
      case 'planning': return '#f0ab2cff';
      case 'on-hold': return '#f72525ff';
      default: return '#f0ab2cff';
    }
  };

  if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    <div className={styles.tasks}>
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
                value={globalFilter || ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
        <ViewToggleSwitch currentView={view} onToggle={handleToggle} />
        {user?.role==="Admin"&&(
          <>
          <button
          className={styles.addButton}
          onClick={() => setShowModal(true)}
          style={{}}
        >
          <Plus size={20} />
          Add Task
        </button>
         <button
          className={styles.addButton1}
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          
        </button>
          </>
        
        )}
        <Filter
            fields={[
              { name: "startDate", label: "Date From", type: "startDate" },
              { name: "endDate", label: "Date To", type: "endDate" },
              { name: "project", label: "Project", type: "select", options: projectOptions.map((p) => p.label) },
              { name: "priority", label: "Priority", type: "select", options: ["Urgent","High", "Medium", "Low"] },
              { name: "status", label: "Status", type: "select", options: ["Planning", "In-Progress", "Completed","On-Hold"] }
            ]}
            onApplyFilters={(filters) => applyFilters(filters)}
            initialValues={filterValues}
          />

      </div>
      </div>
      <div style={{height:120}}></div>

       
      <AddTask
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleAddTask}
        onEdit={handleEditTask}
        editTask={editingTask}
      />
      

        {view === 'table' &&
        <div>
        {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={tasksFilterConfig}
                data-page-type="tasks"
              />
          <DataTable data={tasks} columns={taskColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick} />
        </div>
      }
      
      {view === 'card' &&

        <div className={styles.cardView}>
           {/* Filter Status Indicator */}
              {activeFilters&&<div className={styles.filterStatus}>
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={tasksFilterConfig}
                data-page-type="tasks"
              />
              </div>}

        <div className={styles.tasksList}>

          
          {tasks.filter(task => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            task.title?.toLowerCase().includes(search) ||
            task.customId?.toLowerCase().includes(search) ||
            task.projectId?.title?.toLowerCase().includes(search)
           
          );
        }).map(task => {
            const project = projectOptions.find(p => p.value === task.projectId?._id);
            
           
            return (
              <CustomCard key={task._id} className={styles.taskCard} hover>
                <div className={styles.taskHeader}>
                  <div
                    className={styles.colorBar}
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <div className={styles.taskInfo}>
                    <h3>{task.title}</h3>
                    <p><Tags size={12}/>  {task.customId}</p>
                 {/** <p>{task.description}</p>  */}  
                    <div className={styles.badges}>
                      {project && (
                        <span className={styles.projectBadge}>
                          <FolderOpen size={12} />
                          {project.label}
                        </span>
                      )}
                      
                     
                    </div>
                  </div>
                 

                  
                  <div className={styles.taskActions}>
                     {user.role==="Admin"&&(
                      <>
                     
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(task)}
                      title="Edit task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(task._id)}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                     </>
                    )}
                    
                  </div>
                  
                </div>
                 <div onClick={()=>{navigate(`/task/${task._id}`)}} >
                <div className={styles.taskDetails}>
                  <div className={styles.badges}>
                                  <span className={styles.badge} style={{ backgroundColor: getPriorityColor(task.priority) }}>
                                    {task.priority}
                                  </span>
                                  <span className={styles.badge} style={{ backgroundColor: getStatusColor(task.status) }}>
                                    {task.status}
                                  </span>
                                </div>
                  <div><Calendar size={16} /> {new Date(task.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}  -  {new Date(task.endDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}</div>
                </div>
                </div>
              </CustomCard>
            );
          })}
        </div>
        </div>
      }

      </div>
  )
}

export default Tasks