import React, { useEffect, useState } from 'react';
import { Plus, FolderOpen, Calendar, Users, Clock, Edit, Trash2, Tags, Search } from 'lucide-react';
import ViewToggleSwitch from '../../components/Toggle/ViewToggleSwitch';
import styles from './Projects.module.scss';
import CustomCard from '../../components/UI/CustomCard';
import DataTable from '../../components/Table/DataTable';
import AddProject from '../../components/Models/AddProject';
import API from '../../axios';
import { useNavigate } from 'react-router';
import Filter from '../../components/Filter/Filter';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import FilterStatus from '../../components/Filter/FIlterStatus';
import { useOutletContext } from 'react-router-dom';
const projectColumns= [
  {
    accessorKey: 'customId',
    header: 'Project ID',
  },
  {
    accessorKey: 'title',
    header: 'Project title',
  },
  
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: info => new Date(info.getValue() ).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    }),
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: info => new Date(info.getValue()).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    }),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: info => {
      const value = info.getValue();
      const color =
        value === 'high' ? '#00ff2aff' :
          value === 'medium' ? '#63b5ecff' :
            value === 'low'? '#d0e03bff':
            value=== 'urgent'? '#fd3300ff':'#63b5ecff'; 

      return <span style={{ color, fontSize: '16px',fontWeight: 600  }}>{value.toUpperCase()}</span>;
    },
  },

  
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
    cell: info => info.getValue()?.toString().slice(0, 50) || '-', // truncate if long
  },
];


function Projects() {
  const { sidebarCollapsed } = useOutletContext();
  const sidebarWidth = sidebarCollapsed ? 90 : 280; // match sidebar
      const [projects, setProjects] = useState([]); // displays data
      const [allProjects, setAllProjects] = useState([]); // ✅ store original data
      const [view, setView] = useState('card');
      const [globalFilter, setGlobalFilter] = useState('');
      const [showModal, setShowModal] = useState(false);
      const [editingProject, setEditProject] = useState(null);
      const [loading, setLoading] = useState(true);
      const {projectContext,setProjectContext}= useData(); // get All project data from datacontext (Initial fetch during login)
      const [activeFilters, setActiveFilters] = useState({}); //for to show the which filter is applied
      const [filterValues,setFilterValues] = useState({});//for two way filter change
      const {user} = useAuth();
      const navigate = useNavigate();

    useEffect(()=>{
        setProjects(projectContext);
        setAllProjects(projectContext);
        setLoading(false);
    },[projectContext]);


      const handleToggle = (newView) => {
      setView(newView);
    };


    // Filter the project based on filter
  const applyFilters = (filters) => {
     if (!filters || Object.values(filters).every((v) => v === ""||  v === null ||(Array.isArray(v) && v.length === 0))) {
    setProjects(allProjects); // ✅ show all again
    setActiveFilters({}); // Clear active filters
    return;
  }
  let filtered = [...allProjects];
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

   setProjects(filtered);
    setActiveFilters(newActiveFilters);
    setFilterValues(filters); // Also store the raw filter values
};


const projectsFilterConfig = {
  labels: {
    startDate: 'Date From',
    endDate: 'Date To', 
    priority: 'Priority',
    status: 'Status'
  },
  fieldTypes: {
    startDate: 'date',
    endDate: 'date',
    priority: 'string',
    status: 'string'
  },
  formatters: {
    // Custom formatter for priority
    priority: (value) => {
      const priorityMap = {
        'urgent': 'Urgent',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };
      return priorityMap[value.toLowerCase()] || value;
    },
    // Custom formatter for status
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
    setProjects(allProjects);
    setActiveFilters({});
    setFilterValues({});
  };
    //  Delete Project (Backend)
     const handleDelete =async (id) => {
       try{
          const res =await API.get(`/task`);
          const filteredTasks = res.data.data.filter((task) => String(task.projectId._id) === String(id) );
          if(filteredTasks.length>0){
            alert("This project is used for creating tasks. You can't delete this project.");
            return;
          }
          if (window.confirm('Are you sure you want to delete this project?')) {
          
            
            await API.delete(`/project/${id}`);
            setProjects(projects.filter(project => project._id !== id));
            setAllProjects(allProjects.filter(project => project._id !== id));
            setProjectContext(projectContext.filter(project=> project._id !== id));
            alert("Project deleted successfully");
            }
        }
        catch(err){
            console.error(err);
            alert("Failed to delete Project")
          }
     }
      //  Open Edit Modal
  const handleEdit = (project) => {
    setEditProject(project); // force new reference
    setShowModal(true);
  };

  // ✅ Update Project in front end for quick response
    const handleEditProject = async(updated) => {
     
        setProjects(prev =>
          prev.map((project) => project._id === updated._id ? updated : project)
        );
       setAllProjects(prev =>
          prev.map((project) => project._id === updated._id ? updated : project)
        );
        setProjectContext(prev =>
          prev.map((project) => project._id === updated._id ? updated : project)
        );
      setEditProject(null);
      setShowModal(false);
  };

   // ✅ Add Project (Backend) +Local state
  const handleAddProject = async (projectData) => {
    try {

      setProjects(prev => [...prev, projectData]);
      setAllProjects(prev => [...prev, projectData]);
      setProjectContext(prev=>[...prev,projectData]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleRowClick = (row) => {
        navigate(`/project/${row._id}`);
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
    <>
   
   <div className={styles.projects}>
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
          Add Project
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
            { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low","Urgent"] },
            { name: "status", label: "Status", type: "select", options: ["Planning", "In-Progress", "Completed","On-Hold"] }
          ]}
          onApplyFilters={(filters) => applyFilters(filters)}
          initialValues={filterValues}
        />
      </div>
      </div>
      <div style={{height:120}}></div>
       
      
      
      <AddProject
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditProject(null);
        }}
        onSubmit={handleAddProject}
        onEdit={handleEditProject}
        editProject={editingProject}
      />

            {view === 'table' &&
        <div>
          {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={projectsFilterConfig}
                data-page-type="projects"
              />

          <DataTable data={projects} columns={projectColumns} globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter} onRowClick={handleRowClick}/>
        </div>
      }

        {view === 'card' &&
        <div className={styles.cardView}>
             
           {/* Add the FilterStatus component */}
              {/* Filter Status Indicator */}
              <FilterStatus 
                activeFilters={activeFilters}
                onClearFilter={clearFilter}
                onClearAll={clearAllFilters}
                filterConfig={projectsFilterConfig}
                data-page-type="projects"
              />
        <div className={styles.projectsList}>
          
          {projects.filter(project => {
          const search = globalFilter?.toLowerCase() || '';
          return (
            project.title?.toLowerCase().includes(search) ||
            project.customId?.toLowerCase().includes(search) 
            
          );
        }).map((project) => (
            <CustomCard key={project._id} className={styles.projectCard} hover>
              <div className={styles.projectHeader}>
                <div className={styles.projectIcon} style={{ backgroundColor: project.color }}>
                  <FolderOpen size={24} />
                </div>
                <div onClick={()=>{navigate(`/project/${project._id}`)}} className={styles.projectInfo}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p><Tags size={16}/> {project.customId}</p>
                </div>
                {user?.role === 'Admin' && (
                
                  
                <div className={styles.projectActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(project)}
                    title="Edit project"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(project._id)}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                 
                </div>
                )}
              </div>
              
              <div className={styles.badges}>
                <span className={styles.badge} style={{ backgroundColor: getPriorityColor(project.priority) }}>
                  {project.priority}
                </span>
                <span className={styles.badge} style={{ backgroundColor: getStatusColor(project.status) }}>
                  {project.status}
                </span>
              </div>
              <div onClick={()=>{navigate(`/project/${project._id}`)}} >
              <div className={styles.projectDetails}>
                <div><Calendar size={16} /> {new Date(project.startDate).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    })}  -  {new Date(project.endDate).toLocaleDateString('en-IN',{
                                      day:"numeric",
                                      month:"long",
                                      year:"2-digit"
                                    })}</div>
                <div><Clock size={16} /> Status: {project.status}</div>
              </div>
              </div>
            </CustomCard>
          ))}
        </div>
        </div>
      }
 
    </div>
    </>
  )
}

export default Projects