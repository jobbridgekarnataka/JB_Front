import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNavigate } from 'react-router-dom';

const valueFormatter = (item) => `${item.name} (${item.value}) `;

const DonutOverviewChart = ({ title, data = [], navigateTo }) => {
  const navigate = useNavigate();

  const chartColors = data.map((item) => item.color || '#ccc');

 const handleClick = (_, item) => {
    if (navigateTo && item?.data?.name) {
      navigate(`${navigateTo}?status=${encodeURIComponent(item.data.name)}`);
    }
  };

  return (
    <div
      className="w-full max-w-full md:max-w-[500px] bg-white rounded-xl p-4 shadow-md"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold">{title} Overview</h4>
          </div>
          <PieChart
            series={[
              {
                data:data,
                // innerRadius: 20,
                 outerRadius: 80,
                valueFormatter,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                onClick: handleClick,
              },
            ]}
            
            colors={chartColors}
            height={200}
            width={250}
          />
         
        {/* <div >
          {data.map((item, idx) => (
            <div key={idx} >
              <span
                className="inline-block w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: item.color || chartColors[idx] }}
              ></span>
              {item.name} ({item.value})
            </div>
          ))}
        </div> */}
          
        </div>

        
      </div>
    </div>
  );
};

export default DonutOverviewChart;