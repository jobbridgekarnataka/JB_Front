import React from 'react'
import { FaWhatsapp } from 'react-icons/fa';
function WhatsAppButton({ phone, message }) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <div>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <FaWhatsapp className="whatsapp-icon" size={35}/>
      </a>
    </div>
  )
}

export default WhatsAppButton