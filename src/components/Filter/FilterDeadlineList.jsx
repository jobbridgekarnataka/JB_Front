
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './FilterDeadline.module.scss';
import CustomCard from '../UI/CustomCard';
import { useNavigate } from 'react-router';


const FilteredDeadlineList = ({
  data = [],
  type = 'Subtask', // can be 'Projects', 'Tasks', 'Subtasks'
  dateField = 'endDate', // which date field to filter
  titleField = 'title',   // which field to show as heading
  statusField = 'status', // status or progress
}) => {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [filteredItems, setFilteredItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const isDefaultRange =
      startDate.getDate() === 1 &&
      startDate.getMonth() === now.getMonth() &&
      startDate.getFullYear() === now.getFullYear() &&
      endDate.getTime() === endOfMonth(now).getTime();

    const filtered = data.filter((item) => {
      const date = new Date(item.endDate);
      const status = item.status?.toLowerCase();
      const isCompleted = status === 'completed';
      const isPending = status!== 'completed';
      const isInRange = date >= startDate && date <= endDate;
      const isOverduePending = isBefore(date, startDate) && isPending;

      if (isCompleted) return false;
      return isDefaultRange ? (isInRange || isOverduePending) : isInRange;
    }).sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]));;

    setFilteredItems(filtered);
  }, [startDate, endDate, data]);

  return (
    <CustomCard >
    <div className={styles.deadlineCard}>
      <div className={styles.cardHeader}>
        <h3>{type}s Deadlines</h3>
        <p>Total: {filteredItems.length} subtasks</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <DatePicker className={styles.datePicker}
          calendarClassName={styles.customCalendar} // popup calendar styling
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="MMM d, yyyy"
          />
          <DatePicker className={styles.datePicker}
          calendarClassName={styles.customCalendar} // popup calendar styling
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="MMM d, yyyy"
          />
        </div>
      </div>

       <div className={styles.deadlineList}>
         {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div key={index} className={styles.deadlineItem}>
              <div className={styles.deadlineInfo} onClick={()=>navigate(`/${type.toLowerCase()}/${item._id}`)} style={{cursor:'pointer'}}>
                <h4 >{item[titleField]}</h4>
                <span className={styles.date}>
                 Created at: {new Date(item.startDate).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}
                </span><br />
                <span className={styles.date}>
                 Deadline: {new Date(item[dateField]).toLocaleDateString('en-IN',{
                                                        day:"numeric",
                                                        month:"long",
                                                        year:"2-digit"
                                                      })}
                </span>
              </div>
              <div >
                <span className={`${styles.status} ${styles[item.status]}`} >{item[statusField]}    </span>
               <br />
              <span className={`${styles.priority} ${styles[item.priority]}`}>{item.priority}</span></div>
              
            </div>
          ))
        ) : (
          <p className={styles.noSubtasks}>
            No {type.toLowerCase()}s in selected date range.
          </p>
        )}
      </div>
    </div>
    </CustomCard>
  );
};

export default FilteredDeadlineList;
