import React, { useEffect, useMemo, useState } from 'react'
import styles from './Services.module.scss'
import { BriefcaseBusiness, NotebookPen, Plus, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns';
import classNames from "classnames";
import ProvidedForm from './ServiceForm/ProvidedForm';
import { useAuth } from '../../context/AuthContext';
import API from '../../axios';

function Services() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [serviceRequests,setServiceRequests] = useState([]);
    const [myPost,setMyPost] = useState([]);
    const [view,setView] = useState('request');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showProvidedModal,setShowProvidedModal] = useState(false);
    const {user} = useAuth();
    
    useEffect(()=>{
        fetchServiceRequest();
    },[])

    const fetchServiceRequest = async()=>{
      const res =await API.get('/service');
      setServiceRequests( res.data.data);
      const filtered = res.data.data.filter(service=>String(service.memberId._id)===String(user.memberId));
      
      setMyPost(filtered);
    }


      const provided =
      [
        {
          title:" Demo 1",
          date:"2025-07-25"
        },
         {
          title:" Demo 2",
          date:"2025-07-24"
        },
         {
          title:" Demo 3",
          date:"2025-07-23"
        },
         {
          title:" Demo 4",
          date:"2025-07-22"
        },
      ]


      const handleAddProvided = async(serviceData) =>{
        try{
          setServiceRequests(prev=>[...prev,serviceData]);
        }catch (error) {
            console.error("Error adding Service:", error);
          }
      }
     const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleView = (newView) => {setView(newView); };

const getDirectImageUrl = (driveUrl) => {
  if (!driveUrl) return null;
  const match = driveUrl.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : driveUrl;
};

  return (
    <div className={styles.services} >
        <div className={styles.header}>
            <div className={styles.cardSearch}>
              <Search size={20}/>
              <input
                type="text"
                placeholder="Search..."
                value={globalFilter || ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <div>

            </div>
            <div className={styles.center1}>
              
            <div className={classNames(styles.center, {[styles.active]: view === "request",})} onClick={()=>handleView("request")} >
                <NotebookPen size={35}  />
                <button className={styles.label}>Service Requests</button>
            </div>
            <div className={classNames(styles.center, {[styles.active]: view === "provided",})} onClick={()=>handleView("provided")}>
                <BriefcaseBusiness size={35}  />
                <button className={styles.label}>Service Provided</button>
            </div>
            <div className={classNames(styles.center, {[styles.active]: view === "myPost",})} onClick={()=>handleView("myPost")}>
                <BriefcaseBusiness size={35}  />
                <button className={styles.label}>My Posts</button>
            </div>
            </div>
            
            
            <div className={styles.right}>
               
            </div>
  
            

        </div>
               {view==='request'&& <>
            
                <div className={styles.pagination} style={{marginBottom:20, marginTop:120}}>
                  <button onClick={handlePrev} disabled={page === 1}>Previous</button>
                  <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                  <button onClick={handleNext} disabled={page === totalPages}>Next</button>
                </div>
               <div className={styles.container}>
        
       <h2 className={styles.heading}>Service Requests List</h2>
     <ul className={styles.activityList}>
        {serviceRequests.map((request) => (
          <li key={request._id} className={styles.activityItem} style={{cursor:'pointer'}} onClick={()=>handleClick(request)}>
           
           <div className={styles.details}>
            <img 
            // onClick={()=>{navigate(`/member/${member._id}`)}}
                                  src={request.memberId.photoUrl ? getDirectImageUrl(request.memberId.photoUrl) : "/members/AnonymousImage.jpg"}
                                  alt={request.title}
                                  className={styles.avatar}
                                  // onError={(e) => {
                                  //   e.target.src = "/members/AnonymousImage.jpg";
                                  // }}
                                />
                          
            <p>
              {/* {renderActivityDetails(activity)} */}
              {request.title}
            </p>
            </div> 
            <div className={styles.timeInfo}>
              {new Date(request.createdAt).toLocaleString('en-IN', {
                day: "numeric",
                month: "long",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{' • '}
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </div>
            <div className={styles.timeInfo}>
              <p>Post created by {request.memberId.name}</p>
            </div>
          </li>
        ))}
      </ul> 

      
    </div>
       </>} 
       {view==='provided'&& <>
            
                <div className={styles.pagination} style={{marginBottom:20, marginTop:120}}>
                  <button onClick={handlePrev} disabled={page === 1}>Previous</button>
                  <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                  <button onClick={handleNext} disabled={page === totalPages}>Next</button>
                </div>
               <div className={styles.container}>
        
       <h2 className={styles.heading}>Service Provided List</h2>
     <ul className={styles.activityList}>
        {provided.map((provide, index) => (
          <li key={index} className={styles.activityItem} style={{cursor:'pointer'}} onClick={()=>handleClick(provide)}>
           <div className={styles.details}>
            <img 
            // onClick={()=>{navigate(`/member/${member._id}`)}}
                                  src={provide.photoUrl ? getDirectImageUrl(provide.photoUrl) : "/members/AnonymousImage.jpg"}
                                  alt={provide.title}
                                  className={styles.avatar}
                                  onError={(e) => {
                                    e.target.src = "/members/AnonymousImage.jpg";
                                  }}
                                />
                          
            <p>
              {/* {renderActivityDetails(activity)} */}
              {provide.title}
            </p>
            </div> 
            <div className={styles.timeInfo}>
              {new Date(provide.date).toLocaleString('en-IN', {
                day: "numeric",
                month: "long",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{' • '}
              {formatDistanceToNow(new Date(provide.date), { addSuffix: true })}
            </div>
          </li>
        ))}
      </ul> 

      
    </div>
       </>} 
       {view==="myPost"&& <>
                <div className={styles.pagination} style={{marginBottom:20, marginTop:120}}>
                          <button onClick={handlePrev} disabled={page === 1}>Previous</button>
                          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                          <button onClick={handleNext} disabled={page === totalPages}>Next</button>
                        </div>
                      <div className={styles.container}>
                
              <h2 className={styles.heading}>My Posts</h2>
            <ul className={styles.activityList}>
                {myPost.map((request) => (
                  <li key={request._id} className={styles.activityItem} style={{cursor:'pointer'}} onClick={()=>handleClick(request)}>
                  
                  <div className={styles.details}>
                    <img 
                    // onClick={()=>{navigate(`/member/${member._id}`)}}
                                          src={request.memberId.photoUrl ? getDirectImageUrl(request.memberId.photoUrl) : "/members/AnonymousImage.jpg"}
                                          alt={request.title}
                                          className={styles.avatar}
                                          onError={(e) => {
                                            e.target.src = "/members/AnonymousImage.jpg";
                                          }}
                                        />
                                  
                    <p>
                      {/* {renderActivityDetails(activity)} */}
                      {request.title}
                    </p>
                    </div> 
                    <div className={styles.timeInfo}>
                      {new Date(request.createdAt).toLocaleString('en-IN', {
                        day: "numeric",
                        month: "long",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}{' • '}
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </div>
                    <div className={styles.timeInfo}>
                      <p>Post created by {request.memberId.name}</p>
                    </div>
                  </li>
                ))}
              </ul> 

              
            </div>
              
        </>
       }
              {/* Add button */}
    
              {user.memberId&&
                  <button
                  className={styles.addButton1}
                  onClick={() => setShowProvidedModal(true)}
                >
                  <Plus size={20} />
                  
                </button>
              }  

                <ProvidedForm
                isOpen={showProvidedModal}
                onClose={()=>{
                  setShowProvidedModal(false);
                }}
                onSubmit={handleAddProvided}
                />
                
             </div> 
  )
}

export default Services
