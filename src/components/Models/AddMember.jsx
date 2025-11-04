import React, {  useState,useEffect } from 'react';
import { X, CheckSquare, FolderOpen, Calendar, Flag } from 'lucide-react';
import FormInput from '../UI/FormInput';
import DropdownSelect from '../UI/DropdownSelect';
import CreatableSelect from 'react-select/creatable';
import styles from './AddModel.module.scss';
import DateSelect from '../UI/DateSelect';
import API from '../../axios';


function AddMember({ isOpen, onClose, editMember, onEdit }) {
    const [formData,setFormData]=useState({
        name:"",
      fathersName:"",
      pointOfContact:"",
      mobileNumber:"",
      dateOfBirth:null,
      collegeName:"",
      department:"",
      workingOrStudyingStatus:"",
      currentInstitutionOrCompany:"",
      profession:"",
      maritalStatus:"",
      otherPersonalNumber:"",
      personalEmail:"",
      areaOfInterest:"",
      ambition:"",
      expectationsFromSolidarity:"",
      currentAddress:"",
      currentDistrict:"",
      nativePlace:"",
      memberType:"",
      forGrouping:[],
       
    });
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState([]);
    const [errors, setErrors] = useState({});
    const [btnLoading, setBtnLoading] = useState(false);
   useEffect(() =>  {
            async function fetchOptions() {
            try {
            const res = await API.get("/dropdown");
            const formatted = res.data.map((item) => ({
                    value: item.name,
                    label: item.name
                }));
                setOptions(formatted);
            } catch (err) {
            console.error("Failed to fetch dropdown options", err);
            }
        }

        fetchOptions();
        if (editMember) {
          setFormData({...editMember,
            dateOfBirth:editMember.dateOfBirth ? new Date(editMember.dateOfBirth) : null,
            forGrouping: editMember.forGrouping?.map((g) => ({ value: g, label: g })) || []
          });
        } else {
          setFormData({
            name:"",
            fathersName:"",
            pointOfContact:"",
            mobileNumber:"",
            dateOfBirth:null,
            collegeName:"",
            department:"",
            workingOrStudyingStatus:"",
            currentInstitutionOrCompany:"",
            profession:"",
            maritalStatus:"",
            otherPersonalNumber:"",
            personalEmail:"",
            areaOfInterest:"",
            ambition:"",
            expectationsFromSolidarity:"",
            currentAddress:"",
            currentDistrict:"",
            nativePlace:"",
            memberType:"",
            forGrouping:[],
          });
        }
      }, [editMember]);


   

  const handleCreate = async(inputValue) => {
    const newOption = { value: inputValue , label: inputValue };
    try{
        await API.post("/dropdown",{name:inputValue});
    
    setOptions((prev) => [...prev, newOption]);
    setFormData((prev) => ({
      ...prev,
      forGrouping: [...(Array.isArray(prev.forGrouping) ? prev.forGrouping : []), newOption],
    }));
    }catch (err) {
      console.error("Error creating dropdown", err);
    }
    
  };
      // Converts YYYY-MM-DD → MM/DD/YYYY for backend
   const formatDateToMMDDYYYY = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};
    const handleSubmit = async (e) => {
         e.preventDefault();
         if(btnLoading){
        return
      }
      setBtnLoading(true);
         const payload = {
                    ...formData,
                    dateOfBirth: formatDateToMMDDYYYY(formData.dateOfBirth), // Convert to MM/DD/YYYY
                    forGrouping:formData.forGrouping.map(dropdown => dropdown.value)
                };
            
               try {
                    const res = await API.patch(`/member/${editMember._id}`, payload); // PATCH only these fields
                    onEdit(res.data); // callback to parent
                    } 
                catch (err) {
                    alert("Failed to update member.");
                    }
                    
       
                setFormData({
                        name:"",
                        fathersName:"",
                        pointOfContact:"",
                        mobileNumber:"",
                        dateOfBirth:"",
                        collegeName:"",
                        department:"",
                        workingOrStudyingStatus:"",
                        currentInstitutionOrCompany:"",
                        profession:"",
                        maritalStatus:"",
                        otherPersonalNumber:"",
                        personalEmail:"",
                        areaOfInterest:"",
                        ambition:"",
                        expectationsFromSolidarity:"",
                        currentAddress:"",
                        currentDistrict:"",
                        nativePlace:"",
                        memberType:"",
                        forGrouping:[]
                       
     
                });
                setErrors({});
                onClose();
                setBtnLoading(false);
            
        };
        const handleCancel = () => {
            setFormData({
            name:"",
            fathersName:"",
            pointOfContact:"",
            mobileNumber:"",
            dateOfBirth:"",
            collegeName:"",
            department:"",
            workingOrStudyingStatus:"",
            currentInstitutionOrCompany:"",
            profession:"",
            maritalStatus:"",
            otherPersonalNumber:"",
            personalEmail:"",
            areaOfInterest:"",
            ambition:"",
            expectationsFromSolidarity:"",
            currentAddress:"",
            currentDistrict:"",
            nativePlace:"",
            memberType:"",
            forGrouping:[]
          
            });
            setErrors({});
            onClose();
  };

        if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.header}>
                            <h2>{editMember ? 'Edit Member' : 'Add New Member'}</h2>
                            <button onClick={handleCancel} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                            </div>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                        <FormInput
                                        label="Name"
                                        value={formData.name}
                                        onChange={(value) => setFormData({ ...formData, name: value })}
                                        placeholder="Enter Member name"
                                        required
                                        error={errors.name}
                                        // icon={<FolderOpen size={16} />}
                                        />

                                        <FormInput
                                        label="Member Type"
                                        value={formData.memberType || ""}
                                        onChange={(value) => setFormData({ ...formData, memberType: value })} 
                                        placeholder="Enter Member Type"
                                        />

                                         <div style={{ width: 300 }}>
                                        <label htmlFor="For Grouping">For Grouping</label>
                                        <CreatableSelect
                                            isMulti
                                            isClearable
                                            onChange={(selected) =>
                                                setFormData((prev) => ({ ...prev, forGrouping: selected || [] }))}
                                            onCreateOption={handleCreate}
                                            options={Array.isArray(options) ? options : []}
                                            value={formData.forGrouping || []}
                                            placeholder="Select or add profession"
                                        />
                                        </div>
                                        <FormInput
                                        label="Father Name"
                                        value={formData.fathersName}
                                        onChange={(value) => setFormData({ ...formData, fathersName: value })}
                                        placeholder="Enter father's name"
                                        />

                                        <FormInput
                                        label="Mobile Number"
                                        value={formData.mobileNumber}
                                        onChange={(value) => setFormData({ ...formData, mobileNumber: value })}
                                        placeholder="Enter Mobile Number"
                                        />

                                        <DateSelect
                                        label="Date of Birth"
                                        value={formData.dateOfBirth}
                                        onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
                                        required
                                       
                                        />
                                   

                                        <FormInput
                                        label="College Name"
                                        value={formData.collegeName}
                                        onChange={(value) => setFormData({ ...formData, collegeName: value })}
                                        placeholder="Enter College Name"
                                        />

                                        <FormInput
                                        label="Department"
                                        value={formData.department}
                                        onChange={(value) => setFormData({ ...formData, department: value })}
                                        placeholder="Enter Department"
                                        />

                                        <DropdownSelect
                                        label="Working / Studying"
                                        options={[{value:"Working",label:"Working"},{value:"Studying",label:"Studying"}]}
                                        value={formData.workingOrStudyingStatus}
                                        onChange={(value) => setFormData({ ...formData, workingOrStudyingStatus: value })}
                                        required
                                        error={errors.status}
                                        />

                                        
                                        <FormInput
                                        label="Current Institutions / Company"
                                        value={formData.currentInstitutionOrCompany}
                                        onChange={(value) => setFormData({ ...formData, currentInstitutionOrCompany: value })}
                                        placeholder="Enter Current Instituton or company name"
                                        />

                                        <FormInput
                                        label="Profession"
                                        value={formData.profession}
                                        onChange={(value) => setFormData({ ...formData, profession: value })}
                                        placeholder="Enter Profession"
                                        />

                                        <DropdownSelect
                                        label="Marital Status"
                                        options={[{value:"Married",label:"Married"},{value:"Unmarried",label:"Unmarried"}]}
                                        value={formData.maritalStatus}
                                        onChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                                        required
                                        error={errors.status}
                                        />

                                        <FormInput
                                        label="Other Personal Number"
                                        value={formData.otherPersonalNumber}
                                        onChange={(value) => setFormData({ ...formData, otherPersonalNumber: value })}
                                        placeholder="Enter Other Personal Number"
                                        />

                                        <FormInput
                                        label="Personal Email"
                                        value={formData.personalEmail}
                                        onChange={(value) => setFormData({ ...formData, personalEmail: value })}
                                        placeholder="Enter Personal Email"
                                        />

                                        <FormInput
                                        label="Address"
                                        value={formData.currentAddress}
                                        onChange={(value) => setFormData({ ...formData, currentAddress: value })}  
                                        placeholder="Enter Address details"
                                        />
                                        
                                </div>                        
                                                              
                                <div className={styles.actions}>
                                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                    Cancel
                                    </button>
                                    <button type="submit" disabled={btnLoading} className={styles.submitButton}>
                                    {btnLoading? "Uploading":(editMember ? 'Update Member' : 'Add Member')}
                                    </button>
                                </div>
                                
                            </form>
                        </div>  
                        </div>
  )
}

export default AddMember
