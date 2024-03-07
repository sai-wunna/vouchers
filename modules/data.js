// make it to customize
const chartBaseSetUp = {
  'b/r/n': {
    borderColor: 'rgba(246, 255, 0, 0.6)',
    backgroundColor: 'rgba(246, 255, 0, 0.6)',
    label: 'White - by viss',
  },
  'b/r/wn': {
    label: 'Black - by viss',
    borderColor: 'rgba(0, 60, 255, 0.6)',
    backgroundColor: 'rgba(0, 60, 255, 0.6)',
  },
  'w/r/n': {
    label: 'Green - by viss',
    borderColor: 'rgba(255, 0, 0, 0.6)',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
}

const chartData = {
  thisYear: {
    labels: ['Jan', 'Feb', 'Mar', 'April', 'May'],
    datasets: [
      {
        data: [
          ...Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        ],
      },
      {
        data: [
          ...Array.from({ length: 5 }, () => Math.floor(Math.random() * 80)),
        ],
      },
      {
        data: [
          ...Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        ],
      },
    ],
  },
  jan: {
    labels: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
    datasets: [
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 80)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
    ],
  },
  feb: {
    labels: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
    datasets: [
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 80)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
    ],
  },
  mar: {
    labels: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
    datasets: [
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 80)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
    ],
  },
  april: {
    labels: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
    datasets: [
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 80)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
    ],
  },
  may: {
    labels: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
    datasets: [
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 80)),
      },
      {
        data: Array.from({ length: 31 }, () => Math.floor(Math.random() * 100)),
      },
    ],
  },
}

const tableData = {
  thisYear: {
    percentage: '',
    goodInfo: [
      { type: 'b/r/n', amount: 15000000, percentage: 33 },
      { type: 'b/r/n', amount: 15000000, percentage: 33 },
      { type: 'b/r/n', amount: 15000000, percentage: 33 },
    ],
    total: 45000000,
  },
  jan: {
    percentage: '20%',
    goodInfo: [
      { type: 'b/r/n', amount: 4000000, percentage: 43 },
      { type: 'b/r/n', amount: 3000000, percentage: 33 },
      { type: 'b/r/n', amount: 2000000, percentage: 23 },
    ],
    total: 9000000,
  },
  feb: {
    percentage: '24%',
    goodInfo: [
      { type: 'b/r/n', amount: 5000000, percentage: 45 },
      { type: 'b/r/n', amount: 3500000, percentage: 33 },
      { type: 'b/r/n', amount: 2300000, percentage: 22 },
    ],
    total: 10800000,
  },
  mar: {
    percentage: '22%',
    goodInfo: [
      { type: 'b/r/n', amount: 4500000, percentage: 45 },
      { type: 'b/r/n', amount: 2500000, percentage: 25 },
      { type: 'b/r/n', amount: 1500000, percentage: 15 },
    ],
    total: 8500000,
  },
  april: {
    percentage: '25%',
    goodInfo: [
      { type: 'b/r/n', amount: 5030000, percentage: 50 },
      { type: 'b/r/n', amount: 3220000, percentage: 32 },
      { type: 'b/r/n', amount: 3000000, percentage: 30 },
    ],
    total: 11250000,
  },
  may: {
    percentage: '9%',
    goodInfo: [
      { type: 'b/r/n', amount: 2050000, percentage: 45 },
      { type: 'b/r/n', amount: 1000000, percentage: 27 },
      { type: 'b/r/n', amount: 1000000, percentage: 27 },
    ],
    total: 4050000,
  },
}

export { tableData, chartBaseSetUp, chartData }
