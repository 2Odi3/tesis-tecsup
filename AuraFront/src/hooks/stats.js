import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// gráfico de línea
export const createLineChart = (ctx, labels, datasets) => {
    const gradientBackgroundFaltas = ctx.createLinearGradient(0, 0, 0, 400);
    gradientBackgroundFaltas.addColorStop(0, 'rgba(247, 55, 87, 1)'); 
    gradientBackgroundFaltas.addColorStop(1, 'rgba(247, 55, 87, 0)'); 

    const gradientBackgroundAsistencias = ctx.createLinearGradient(0, 0, 0, 400); 
    gradientBackgroundAsistencias.addColorStop(0, 'rgba(24, 187, 107, 1)'); 
    gradientBackgroundAsistencias.addColorStop(1, 'rgba(24, 187, 107, 0)'); 

    const formattedDataSets = datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: index === 0 ? gradientBackgroundFaltas : gradientBackgroundAsistencias, 
        borderColor: dataset.borderColor,
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
    }));

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: formattedDataSets,
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { display: false }
                },
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#969696',
                        boxWidth: 12,
                        padding: 10,
                    },
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#333',
                    bodyColor: '#333',
                    borderColor: '#ddd',
                    borderWidth: 1,
                },
            },
        },
    });
};


// gráfico de barras
export const createBarChart = (ctx, labels, datasets) => {
    const gradientBackgroundFaltas = ctx.createLinearGradient(0, 0, 0, 400); 
    gradientBackgroundFaltas.addColorStop(0, 'rgba(247, 55, 87, 1)'); 
    gradientBackgroundFaltas.addColorStop(1, 'rgba(247, 55, 87, 0)'); 

    const gradientBackgroundAsistencias = ctx.createLinearGradient(0, 0, 0, 400); 
    gradientBackgroundAsistencias.addColorStop(0, 'rgba(24, 187, 107, 1)'); 
    gradientBackgroundAsistencias.addColorStop(1, 'rgba(24, 187, 107, 0)'); 

    const formattedDataSets = datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: index === 0 ? gradientBackgroundFaltas : gradientBackgroundAsistencias, 
        borderWidth: 0,
        borderRadius: 8,
    }));

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: formattedDataSets,
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false,
                    },
                    ticks: { display: false }
                },
                x: {
                    grid: {
                        display: false,
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#969696',
                        boxWidth: 12, 
                        padding: 10,  
                    },
                },
            },
        },
    });
};

// gráfico de radar
export const createRadarChart = (ctx, labels, data) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400); 
    gradient.addColorStop(0, 'rgba(255, 55, 87, 1)'); 
    gradient.addColorStop(1, 'rgba(255, 55, 87, 0.1)'); 

    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '% Faltas',
                data: data,
                backgroundColor: gradient, 
                borderWidth: 0,
            }],
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        display: false, 
                    },
                    grid: {
                        color: '#969696',
                    },
                    pointLabels: {
                        font: {
                            size: 11, 
                        },
                        color: '#969696',
                    },
                },
            },
        },
    });
};