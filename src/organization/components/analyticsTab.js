import React from "react";
import ReactApexChart from "react-apexcharts";

const AnalyticsTab = ({ eventData }) => {
  if (!eventData) return <div className="text-center py-10">Loading event data...</div>;

  // Process data for charts
  const processData = () => {
    // Ticket data
    const ticketTypes = eventData.ticketTypes || [];
    const ticketNames = ticketTypes.map(ticket => ticket.name);
    const ticketPrices = ticketTypes.map(ticket => ticket.price);
    const ticketQuantities = ticketTypes.map(ticket => ticket.quantity);
    const ticketSales = ticketTypes.map(ticket => ticket.quantity * ticket.price);
    const ticketAvailability = ticketTypes.map(ticket => ({
      name: ticket.name,
      data: [ticket.quantity, Math.floor(ticket.quantity * 0.8)] // Current vs projected sold
    }));

    // Schedule data
    const schedule = eventData.schedule || [];
    const activities = schedule.map(item => item.activity);
    const activityDurations = schedule.map(item => {
      const start = new Date(`01/01/2000 ${item.startTime}`);
      const end = new Date(`01/01/2000 ${item.endTime}`);
      return (end - start) / (1000 * 60 * 60); // duration in hours
    });

    // Speaker data
    const speakers = eventData.speakers || [];
    const speakerNames = speakers.map(speaker => speaker.name);
    const speakerActivities = speakers.map(speaker => 
      schedule.filter(item => item.speakerId === speaker._id).length
    );
    const speakerEngagement = speakers.map(speaker => ({
      x: speaker.name,
      y: schedule.filter(item => item.speakerId === speaker._id).length
    }));

    // Event duration
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const eventDurationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return {
      ticketNames,
      ticketPrices,
      ticketQuantities: ticketQuantities,
      ticketSales,
      ticketAvailability,
      activities,
      activityDurations,
      speakerNames,
      speakerActivities,
      speakerEngagement,
      eventDurationDays
    };
  };

  const {
    ticketNames,
    ticketPrices,
    ticketQuantities,
    ticketSales,
    ticketAvailability,
    activities,
    activityDurations,
    speakerNames,
    speakerActivities,
    speakerEngagement,
    eventDurationDays
  } = processData();

  // Chart configurations
  const ticketSalesBarChart = {
    series: [{
      name: 'Price (ZAR)',
      data: ticketPrices
    }, {
      name: 'Quantity Available',
      data: ticketQuantities
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          borderRadius: 14 // ✅ Add border radius
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ticketNames,
        title: {
          text: 'Ticket Type'
        }
      },
      yaxis: {
        title: {
          text: 'Value'
        }
      },
      fill: {
        opacity: 1
      },
      colors: ['#3B82F6', '#10B981'],
      grid: {
        show: false // ✅ Hide grid lines
      },
      title: {
        text: undefined
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + (val === Math.floor(val) ? ' tickets' : ' ZAR');
          }
        }
      }
    }
  };
  

 const revenueProjectionBarChart = {
  series: [{
    name: 'Potential Revenue',
    data: ticketSales
  }],
  options: {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 14, // ✅ Increased border radius
        horizontal: false
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ticketNames,
      title: {
        text: 'Ticket Type'
      }
    },
    yaxis: {
      title: {
        text: 'Revenue (ZAR)'
      }
    },
    colors: ['#6366F1'],
    grid: {
      show: false // ✅ Hide grid lines
    },
    title: {
      text: undefined
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "ZAR " + val.toLocaleString();
        }
      }
    }
  }
};


const ticketAvailabilityLineChart = {
  series: ticketAvailability,
  options: {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    markers: {
      size: 5
    },
    xaxis: {
      categories: ['Available', 'Projected Sold'],
      title: {
        text: 'Availability Status'
      }
    },
    yaxis: {
      title: {
        text: 'Ticket Count'
      }
    },
    grid: {
      show: false // ✅ Removed grid lines
    },
    colors: ['#F59E0B', '#EF4444', '#10B981'],
    title: {
      text: undefined
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tickets";
        }
      }
    }
  }
};


  const activityDurationPieChart = {
    series: activityDurations,
    options: {
      chart: {
        type: 'pie',
        height: 350,
      },
      labels: activities,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      title: {
        text: undefined
      },
      legend: {
        position: 'bottom', // ✅ Move legend under the chart
        horizontalAlign: 'center',
        fontSize: '14px',
        markers: {
          width: 12,
          height: 12,
          radius: 12
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " hours";
          }
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 250
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };
  

  const speakerEngagementDonutChart = {
    series: speakerActivities,
    options: {
      chart: {
        type: 'donut',
        height: 350,
      },
      labels: speakerNames,
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      title: {
        text: undefined
      },
      legend: {
        position: 'bottom', // ✅ Legend under chart
        horizontalAlign: 'center',
        fontSize: '14px',
        markers: {
          width: 12,
          height: 12,
          radius: 12
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151'
              },
              value: {
                show: true,
                fontSize: '14px',
                fontWeight: 500,
                color: '#6B7280'
              },
              total: {
                show: true,
                label: 'Total Activities',
                fontSize: '14px',
                fontWeight: 500,
                color: '#6B7280',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                }
              }
            }
          }
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 250
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };
  

  const ticketPriceRadialChart = {
    series: ticketPrices,
    options: {
      chart: {
        type: 'radialBar',
        height: 350
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '14px',
            },
            value: {
              fontSize: '16px',
              formatter: function (val) {
                return "ZAR " + val;
              }
            },
            total: {
              show: true,
              label: 'Average Price',
              formatter: function (w) {
                const sum = w.globals.series.reduce((a, b) => a + b, 0);
                const avg = sum / w.globals.series.length;
                return "ZAR " + avg.toFixed(2);
              }
            }
          }
        }
      },
      labels: ticketNames,
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      title: {
        text: undefined
      }
      
    }
  };

  const speakerActivityRadarChart = {
    series: [{
      name: 'Activities',
      data: speakerActivities
    }],
    options: {
      chart: {
        type: 'radar',
        height: 420, // Increased height
        toolbar: {
          show: false
        },
        dropShadow: {
          enabled: true,
          blur: 4,
          left: 2,
          top: 2
        }
      },
      stroke: {
        width: 2,
        colors: ['#3B82F6']
      },
      fill: {
        opacity: 0.3,
        colors: ['#3B82F6']
      },
      markers: {
        size: 6,
        colors: ['#3B82F6'],
        strokeColor: '#fff',
        strokeWidth: 2
      },
      xaxis: {
        categories: speakerNames,
        labels: {
          style: {
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        show: false,
        min: 0
      },
      colors: ['#3B82F6'],
      title: {
        text: undefined
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + (val === 1 ? ' activity' : ' activities');
          }
        }
      }
    }
  };
  
  const eventDurationGaugeChart = {
    series: [eventDurationDays],
    options: {
      chart: {
        type: 'radialBar',
        height: 350,
        offsetY: -10
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            margin: 0,
            size: '70%',
          },
          dataLabels: {
            name: {
              offsetY: -10,
              color: '#6B7280',
              fontSize: '13px'
            },
            value: {
              color: '#111',
              fontSize: '30px',
              show: true,
              formatter: function (val) {
                return val + (val === 1 ? ' day' : ' days');
              }
            }
          },
          track: {
            background: '#E5E7EB',
            strokeWidth: '97%',
            margin: 5,
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91]
        },
      },
      stroke: {
        dashArray: 4
      },
      labels: ['Event Duration'],
      colors: ['#10B981'],
      title: {
        text: undefined
      }
      
    }
  };
  const speakerEngagementHeatmap = {
    series: [{
      name: 'Engagement',
      data: speakerEngagement
    }],
    options: {
      chart: {
        type: 'heatmap',
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#D1FAE5', '#6EE7B7', '#10B981', '#047857'], // Gradient green shades
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 14, // ✅ Rounded corners
          useFillColorAsStroke: true,
          colorScale: {
            ranges: [
              {
                from: 0,
                to: 1,
                name: 'Low',
                color: '#D1FAE5'
              },
              {
                from: 2,
                to: 4,
                name: 'Medium',
                color: '#6EE7B7'
              },
              {
                from: 5,
                to: 7,
                name: 'High',
                color: '#10B981'
              },
              {
                from: 8,
                to: 100,
                name: 'Very High',
                color: '#047857'
              }
            ]
          }
        }
      },
      xaxis: {
        type: 'category',
        categories: speakerNames
      },
      title: {
        text: undefined
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + (val === 1 ? ' activity' : ' activities');
          }
        }
      }
    }
  };
  

  const ticketPriceTrendAreaChart = {
    series: [{
      name: 'Ticket Price',
      data: ticketPrices
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: ticketNames,
        title: {
          text: 'Ticket Type'
        }
      },
      yaxis: {
        title: {
          text: 'Price (ZAR)'
        }
      },
      grid: {
        show: false // ✅ Grid removed
      },
      colors: ['#8B5CF6'],
      title: {
        text: undefined
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "ZAR " + val;
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      }
    }
  };
  

  return (
    <div className="bg-gray-50 p-0 rounded-lg">
  
  {/* First Row - 2 charts with 3/8 and 5/8 split */}
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
    {/* Chart 1 - Takes 3/12 (25%) of the row */}
    <div className="md:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Ticket Types</h3>
      <ReactApexChart 
        options={ticketSalesBarChart.options} 
        series={ticketSalesBarChart.series} 
        type="bar" 
        height={300} 
      />
    </div>
    
    {/* Chart 2 - Takes 9/12 (75%) of the row */}
    <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Projection</h3>
      <ReactApexChart 
        options={revenueProjectionBarChart.options} 
        series={revenueProjectionBarChart.series} 
        type="bar" 
        height={300} 
      />
    </div>
  </div>
  
  {/* Second Row - Full width charts */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    {/* Chart 3 */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Duration</h3>
      <ReactApexChart 
        options={activityDurationPieChart.options} 
        series={activityDurationPieChart.series} 
        type="pie" 
        height={300} 
      />
    </div>
    
    {/* Chart 4 */}
 
    
 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Speaker Activities</h3>
  
  <ReactApexChart 
        options={speakerActivityRadarChart.options} 
        series={speakerActivityRadarChart.series} 
        type="radar" 
        height={300} 
      />


    </div>

    {/* Chart 5 */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Speaker Engagement</h3>
      <ReactApexChart 
        options={speakerEngagementDonutChart.options} 
        series={speakerEngagementDonutChart.series} 
        type="donut" 
        height={300} 
      />
    </div>
  </div>
  
  {/* Third Row - 2 charts with 3/8 and 5/8 split */}
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
    {/* Chart 6 - Takes 3/12 (25%) of the row */}
    <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Ticket Prices</h3>
      <ReactApexChart 
        options={ticketPriceRadialChart.options} 
        series={ticketPriceRadialChart.series} 
        type="radialBar" 
        height={300} 
      />
    </div>
    
    {/* Chart 7 - Takes 9/12 (75%) of the row */}
    <div className="md:col-span-9 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Ticket Availability</h3>
    
          <ReactApexChart 
        options={ticketAvailabilityLineChart.options} 
        series={ticketAvailabilityLineChart.series} 
        type="line" 
        height={300} 
      />
    </div>


  </div>

  {/* Additional charts in a standard grid below */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    {/* Chart 8 */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Event Duration</h3>
      <ReactApexChart 
        options={eventDurationGaugeChart.options} 
        series={eventDurationGaugeChart.series} 
        type="radialBar" 
        height={300} 
      />
    </div>
    
    {/* Chart 9 */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Speaker Heatmap</h3>
      <ReactApexChart 
        options={speakerEngagementHeatmap.options} 
        series={speakerEngagementHeatmap.series} 
        type="heatmap" 
        height={300} 
      />
    </div>
    
    {/* Chart 10 */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Price Trend</h3>
      <ReactApexChart 
        options={ticketPriceTrendAreaChart.options} 
        series={ticketPriceTrendAreaChart.series} 
        type="area" 
        height={300} 
      />
    </div>
  </div>
</div>
  );
};

export default AnalyticsTab;