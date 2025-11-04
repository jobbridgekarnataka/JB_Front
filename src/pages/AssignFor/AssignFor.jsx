import React, { useState,useEffect } from 'react'
import { Plus, List, Calendar, Flag, CheckSquare, User, Edit, Trash2, Search } from 'lucide-react';
import CustomCard from '../../components/UI/CustomCard';
import styles from './AssignFor.module.scss';
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import DataTable from '../../components/Table/DataTable';
import API from '../../axios';
import AddAssignFor from '../../components/Models/AddAssignFor'
import { useNavigate } from 'react-router';
import Filter from '../../components/Filter/Filter';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import FilterStatus from '../../components/Filter/FIlterStatus';
import { useOutletContext } from 'react-router-dom';
const assignForColumns = [
    {
    accessorKey: 'customId',
    header: 'AssignFor ID',
  },
 
  {
    accessorKey: 'taskId',
    header: 'Task ',
    cell: info => {
      const task = info.getValue();
      return task?.title || 'N/A'; // ✅ Display task name instead of object
    },
  },
  {
    accessorKey: 'subTaskId',
    header: 'SubTask ',
    cell: info => {
      const task = info.getValue();
      return task?.title || 'N/A'; // ✅ Display task name instead of object
    },
  },
  
  {
    accessorKey: 'date',
    header: 'Date',
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    }),
  },
  
  // {
  //   accessorKey: 'currentDistrict',
  //   header: 'Current District',
  // },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => {
      const status = info.getValue() ;
      const bgMap= {
        'Invited': '#f0ab2cff',
        'Not-Attended': '#ff0000ff',
        'Attended': '#1ef102ff',
        'Completed': '#2bff00ff',
        'Permission': '#0084ffff',
        'Not-Possible': '#ff80f4ff',
        'Waiting':'#ff8800ff'

      };
      return (
        <span style={{
          backgroundColor: bgMap[status] || '#e9ecef',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'inline-block'
        }}>
          {status.replace(/-/g, ' ')}
        </span>
      );
    },
  },
  {
    accessorKey: 'assignedFor',
    header: 'Assigned For',
    cell: info => {
      const members = info.getValue();
      return Array.isArray(members) && members.length > 0
        ? members.map(m => m.name).join(', ')
        : 'Unassigned'; // ✅ Display member names properly
    },
  },
  
  {
    accessorKey: 'description',
    header: 'Description',
    cell: info => {
      const value = info.getValue() ;
      return value.length > 50 ? value.slice(0, 50) + '…' : value;
    },
  }
];


function AssignFor() {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
  const [allAssignFor,setAllAssignFor] = useState([]); // all assignFor data
  const [assignFor,setAssignFor]=useState([]); // filtered assignfor data
  const [view,setView]=useState('card');
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAssignFor, setEditAssignFor] = useState(null);
  const [projectOptions,setProjectOptions]= useState([]);
  const [taskOptions,setTaskOptions] =useState([]);
  const [subTaskOptions,setSubTaskOptions] =useState([]);
  const [memberOptions,setMemberOptions] =useState([]);
  const {user} = useAuth();
  const {assignForContext,setAssignForContext,taskContext,subTaskContext,memberContext,projectContext}=useData();
  const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
  const [filterValues,setFilterValues] = useState({});//for two way filter change
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(()=>{
           setAssignFor(assignForContext);
           setAllAssignFor(assignForContext);
           if(user.role==="Admin"){
             setAssignFor(assignForContext);
             setAllAssignFor(assignForContext);
            }
          else{
            const filtered = assignForContext.filter(assignfor=> assignfor.assignedFor?.some(
              (member) => String(member._id) === String(user.memberId)));
              setAssignFor(filtered);
              setAllAssignFor(filtered);
        
          }
           fetchOptions();
        },[assignForContext,subTaskContext,taskContext,memberContext,user]);

    const fetchOptions =()=>{
            setProjectOptions(projectContext.map(project=>({
            value:project._id,
            label:project.title,
          })))
       setTaskOptions(taskContext.map(task=>({
          value:task._id,
          label:task.title,
        })));
        setSubTaskOptions(subTaskContext.map(subtask=>({
          value:subtask._id,
          label:subtask.title,
        })));
         setMemberOptions(memberContext.map(member=>({
          value:member._id,
          label:member.name,
        })));
        setLoading(false);
    }
  

             // Filter the AssignFor based on filter
        const applyFilters = (filters) => {
          if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
          setAssignFor(allAssignFor); // ✅ show all again
           setActiveFilters({}); // Clear active filters
          return;
        }
        let filtered = [...allAssignFor];
           const newActiveFilters = {};
       

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

        if (filters.task) {
          filtered = filtered.filter(
            (p) => p.taskId.title === filters.task
          );
         newActiveFilters.task = filters.task;
        }
         if (filters.subTask) {
          filtered = filtered.filter(
            (p) => p.subTaskId.title === filters.subTask
          );
          newActiveFilters.subTask = filters.subTask;
        }
        
        if (filters.assignfor&& filters.assignfor.length > 0) {
          filtered = filtered.filter(
            (p) => Array.isArray(p.assignedFor) && p.assignedFor.some((member) =>
            filters.assignfor.includes(member.name)
          )
          );
          newActiveFilters.assignfor = filters.assignfor;
        }
        setAssignFor(filtered);
        setActiveFilters(newActiveFilters);
        setFilterValues(filters); // Also store the raw filter values
      };

      // Filter configuration for assignFor
  const assignForFilterConfig = {
    labels: {
      startDate: 'Date From',
      endDate: 'Date To', 
      project: 'Project',
      task: 'Task',
      subTask: 'SubTask',
      status: 'Status',
      assignfor: 'Assign For'
    },
    fieldTypes: {
      startDate: 'date',
      endDate: 'date',
      project: 'string',
      task: 'string',
      subTask: 'string',
      status: 'string',
      assignfor: 'array'
    },
    formatters: {
      status: (value) => {
        const statusMap = {
          'invited': 'Invited',
          'not-attended': 'Not-Attended',
          'attended': 'Attended',
          'completed': 'Completed',
          'permission': 'Permission',
          'not-possible': 'Not-Possible',
          'waiting': 'Waiting'
        };
        return statusMap[value.toLowerCase()] || value;
      },
      array: (value) => {
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      }
    }
  };

         // Clear individual filter
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
    setAssignFor(allAssignFor);
    setActiveFilters({});
    setFilterValues({});
  };


 
 
       const handleToggle = (newView) => {
       setView(newView);
     };
     const handleEdit = (assignFor) => {
     
    setEditAssignFor(assignFor);
    setShowModal(true);
  };

  const handleEditAssignFor = (updated) => {
    const task = taskOptions.find(t => t.value === updated.taskId);
    const project = projectOptions.find(p => p.value === updated.projectId);
   const subTask = subTaskOptions.find(s=>s.value=== updated.subTaskId);
   const members = memberOptions.filter((m) =>
    updated.assignedFor .includes(m.value)
  );
     const updatedAssignForWithNames = {
      ...updated,
      taskId: { _id: updated.taskId, title: task?.label || '' },
      projectId:{_id:updated.projectId,title:project?.label ||''},
      assignedFor: members.map((m) => ({ _id: m.value, name: m.label })),
      subTaskId:{_id:updated.subTaskId,title:subTask?.label || ''},
    };

    setAssignFor(prev =>
      prev.map((assignFor) => assignFor._id === updated._id ? updatedAssignForWithNames : assignFor)
    );
     setAllAssignFor(prev =>
      prev.map((assignFor) => assignFor._id === updated._id ? updatedAssignForWithNames : assignFor)
    );
     setAssignForContext(prev =>
      prev.map((assignFor) => assignFor._id === updated._id ? updatedAssignForWithNames : assignFor)
    );
    setEditAssignFor(null);
    setShowModal(false);
  };

const handleAddAssignFor = (assignForData) => {
  const task = taskOptions.find(t => t.value === assignForData.taskId);
  const project = projectOptions.find(p => p.value === assignForData.projectId);
  const members = memberOptions.filter((m) =>
    assignForData.assignedFor.includes(m.value)
  );

  const subTask = subTaskOptions.find(s=>s.value=== assignForData.subTaskId);

  const newAssignFor = {
    ...assignForData,
    taskId: { _id: assignForData.taskId, title: task?.label || '' },
    projectId:{_id:assignForData.projectId,title:project?.label ||''},
    assignedFor: members.map((m) => ({ _id: m.value, name: m.label })),
    subTaskId:{_id:assignForData.subTaskId,title:subTask?.label || ''},
  };

  setAssignFor(prev => [...prev, newAssignFor]);
  setAllAssignFor(prev => [...prev, newAssignFor]);
  setAssignForContext(prev => [...prev, newAssignFor]);
};



     const handleDelete = async(id) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      
       try{
            await API.delete(`/assignFor/${id}`);
           setAssignFor(assignFor.filter(assignFor => assignFor._id !== id));
           setAllAssignFor(allAssignFor.filter(assignFor => assignFor._id !== id));
           setAssignForContext(assignForContext.filter(assignFor => assignFor._id !== id));
      }
      catch(err){
        console.error("Error deleting subtask:", err);
      }
   
    }
  };

  const handleRowClick = (row) => {
        navigate(`/assignFor/${row._id}`);
    };
      
  const getStatusColor = (status) => {
    switch (status) {
      case 'Invited': return '#f0ab2cff';
      case 'Not-Attended': return '#ff0000ff';
      case 'Attended': return '#1ef102ff';
      case 'Completed': return '#2bff00ff';
      case 'Permission': return '#0084ffff';
      case 'Not-Possible': return '#ff80f4ff';
      case 'Waiting': return '#ff8800ff';
      default: return '#f0ab2cff';
    }
  };
 
  if (loading) return <div className={styles.app}><div className={styles.loader}></div></div> ;
  return (
    <div className={styles.subtasks}>
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
        >
          <Plus size={20} />
          Add AssignFor
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
               { name: "task", label: "Task", type: "select", options: taskOptions.map((t) => t.label) },
               { name: "subTask", label: "SubTask", type: "select", options: subTaskOptions.map((s) => s.label) },
              { name: "status", label: "Status", type: "select", options: ["Invited", "Not-Attended", "Attended","Completed","Permission","Not-Possible","Waiting"] },
              { name: "assignfor", label: "Assign For", type: "multiselect", options: memberOptions.map((m) => m.label) }
            ]}
            onApplyFilters={(filters) => applyFilters(filters)}
            initialValues={filterValues}
          />
      </div>
      </div>
      <div style={{height:120}}></div>
      

      <AddAssignFor
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditAssignFor(null);
        }}
        onSubmit={handleAddAssignFor}
        onEdit={handleEditAssignFor}
        editAssignFor={editAssignFor}
      />

      {view === 'table' &&
        <div>
           {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={assignForFilterConfig}
                data-page-type="assignFor"
              />

          <DataTable data={assignFor} columns={assignForColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick} />
        </div>
      }


     {
        view === 'card' &&

        <div className={styles.cardView}>
        {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={assignForFilterConfig}
                data-page-type="assignFor"
              />


        <div className={styles.subtasksList}>
          {assignFor.filter(assignfor => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            assignfor.title?.toLowerCase().includes(search) ||
            assignfor.customId?.toLowerCase().includes(search) ||
            assignfor.taskId?.title?.toLowerCase().includes(search) ||
            assignfor.subTaskId?.title?.toLowerCase().includes(search) ||
            assignfor.projectId?.title?.toLowerCase().includes(search) ||
            Array.isArray(assignfor.assignedFor)&&assignfor.assignedFor.some(m=>m.name?.toLowerCase().includes(search)) 
            
          );
        }).map((assignfor) => {
             const decription = assignfor.description;
            

            return (
              <CustomCard key={assignfor._id} className={styles.subtaskCard} hover>
                <div className={styles.subtaskHeader}>
                  <div
                    className={styles.colorBar}
                    style={{ backgroundColor: getStatusColor(assignfor.status) }}
                  />
                  <div className={styles.subtaskInfo}>
                    
                     
                      <h3>{assignfor.subTaskId?.title}</h3>
                
                    <p>{assignfor.customId}</p>
                    <p>{ decription.length>30? decription.slice(0,30)+"...":decription }</p> 
                    
                    <div className={styles.badges}>
                      {assignfor.taskId && (
                        <span className={styles.taskBadge}>
                          <CheckSquare size={12} />
                          {assignfor.taskId.title}
                        </span>
                      )}
                      
                    </div>
                  </div>
                  {user.role==="Admin"&&(
                  <div className={styles.subtaskActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(assignfor)}
                      title="Edit assignfor"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(assignfor._id)}
                      title="Delete assignfor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  )}
                </div>
                <div onClick={()=>{navigate(`/assignFor/${assignfor._id}`)}} >
                <div className={styles.subtaskDetails}>
                   <div className={styles.badges}>
                       
                        <span className={styles.badge} style={{ backgroundColor: getStatusColor(assignfor.status) }}>
                          {assignfor.status}
                        </span>
                  </div>
                  <div><Calendar size={16} /> {new Date(assignfor.date).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}  
                                                      
                                                      </div>
                
                  <div>
                    <User size={16} />{" "}
                    {Array.isArray(assignfor.assignedFor) && assignfor.assignedFor.length > 0 ? (
                       assignfor.assignedFor.length === 1 ? (
                        assignfor.assignedFor[0].name
                      ) : (
                     //   "Multiple Members";
                          assignfor.assignedFor.map(m => m.name).join(", ") 
                      )
                    ) : (
                      "Unassigned"
                    )}
                  </div>
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

export default AssignFor