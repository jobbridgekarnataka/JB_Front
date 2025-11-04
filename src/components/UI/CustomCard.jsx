
import React from 'react';
import styles from './CustomCard.module.scss';
import PropTypes from 'prop-types'


function CustomCard({ 
  children, 
  className = '', 
  padding = 'medium',
  hover = false 
})  {
  return (
    <div className={`${styles.card} ${styles[padding]} ${hover ? styles.hover : ''} ${className}`}>
      {children}
    </div>
  );
};
{/*** 
CustomCard.propTypes={
    children:PropTypes.node.isRequired, 
  className:PropTypes.string, 
  padding:PropTypes.oneOf(['small','medium','large']),
  hover:PropTypes.bool
};

*/}
export default CustomCard;
