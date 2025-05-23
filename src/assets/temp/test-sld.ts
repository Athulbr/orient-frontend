const output = {
  next: null,
  relation: 'eq',
  results: [
    {
      label: 'circuit breaker',
      ranges: [
        {
          name: 'NSXm160E',
          products: [
            {
              productId: 'C12E4TM160B',
              description: 'Circuit breaker, ComPacT NSXm 160E, 16kA/415VAC, 4 poles 4D (neutral fully protected), TMD trip unit 160A, lugs/busbars',
            },
            {
              productId: 'C12E6TM160B',
              description: 'Circuit breaker, ComPacT NSXm 160E, 16kA/415VAC, 4 poles 3D (neutral not protected), TMD trip unit 160A, lugs/busbars',
            },
            {
              productId: 'C12E4TM160L',
              description: 'Circuit breaker, ComPacT NSXm 160E, 16kA/415VAC, 4 poles 4D (neutral fully protected), TMD trip unit 160A, EverLink lugs',
            },
            {
              productId: 'C12E6TM160L',
              description: 'Circuit breaker, ComPacT NSXm 160E, 16kA/415VAC, 4 poles 3D (neutral not protected), TMD trip unit 160A, EverLink lugs',
            },
          ],
        },
        {
          name: 'NSX400F',
          products: [
            {
              productId: 'C40F4TM400G',
              description: 'Circuit breaker,ComPacT NSX400F,36kA,AC,TMD,4P4D, G',
            },
            {
              productId: 'C40F45E400',
            },
            {
              productId: 'C40F4TM400',
              description: 'Circuit breaker,ComPacT NSX400F,36kA,AC,TMD,4P4D',
            },
          ],
        },
        {
          name: 'NSX250B',
          products: [
            {
              productId: 'C25B6TM160',
              description: 'Circuit breaker, ComPacT NSX250B, 25kA/415VAC, 4 poles 3D (neutral not protected), TMD trip unit 160A',
            },
            {
              productId: 'C25B4TM160C',
              description: 'Circuit breaker, ComPacT NSX250B, 25kA/415VAC, 4 poles 4D (neutral fully protected), TMD trip unit 160A, 50 degrees C',
            },
            {
              productId: 'C25B4TM250',
              description: 'Circuit breaker, ComPacT NSX250B, 25kA/415VAC, 4 poles 4D (neutral fully protected), TMD trip unit 250A',
            },
            {
              productId: 'C25B6TM250',
              description: 'Circuit breaker, ComPacT NSX250B, 25kA/415VAC, 4 poles 3D (neutral not protected), TMD trip unit 250A',
            },
            {
              productId: 'C25B4TM160',
              description: 'Circuit breaker, ComPacT NSX250B, 25kA/415VAC, 4 poles 4D (neutral fully protected), TMD trip unit 160A',
            },
            {
              productId: 'C25B4TM250C',
              description: 'Circuit breaker ComPacT NSX250B, 25kA at 415VAC, TMD trip unit 250A, 50 degrees C, 4 poles 4D',
            },
            {
              productId: 'C25B6TM160C',
              description: 'Circuit breaker ComPacT NSX250B, 25kA at 415VAC, TMD trip unit 160A, 50 degrees C, 4 poles 3D',
            },
            {
              productId: 'C25B6TM250C',
              description: 'Circuit breaker, ComPacT NSX250B, 25kA/415VAC, 4 poles 3D (neutral not protected), TMD trip unit 250A, 50 degrees C',
            },
          ],
        },
      ],
    },
  ],
  total: 15,
};

const input = [
  {
    pct: 'circuit breaker',
    range: ['NSX4OOF'],
    chars: [
      {
        name: '[In] rated current',
        value: ['400 A'],
      },
      {
        name: 'Trip unit name',
        value: ['Micrologic 5.3 E'],
      },
      {
        name: 'Poles description',
        value: ['4P'],
      },
    ],
  },
  {
    pct: 'circuit breaker',
    range: ['NSX2SOB'],
    chars: [
      {
        name: '[In] rated current',
        value: ['250 A'],
      },
      {
        name: 'Trip unit name',
        value: ['Micrologic 5.2 E'],
      },
      {
        name: 'Poles description',
        value: ['4P'],
      },
    ],
  },
  {
    pct: 'circuit breaker',
    range: ['NSXm16OE'],
    chars: [
      {
        name: '[In] rated current',
        value: ['160 A'],
      },
      {
        name: 'Trip unit name',
        value: ['TM-D'],
      },
      {
        name: 'Poles description',
        value: ['4P'],
      },
    ],
  },
];

const correction = [
  {
    key: 'NSX400F',
    possibilities: ['NSX4OOF', 'N5X400F', 'N5X4OOF'],
  },
];

// 2/4/2025	Wednesday	8hr	Onboarded to XFactr
// 3/4/2025	Thursday	8hr	Started working on Tablebuilder
// 4/4/2025	Friday	8hr	Worked on dynamic table body
// 5/4/2025	Saturday		Week Off
// 6/4/2025	Sunday		Week Off
// 7/4/2025	Monday	8hr	Worked on dynamic table header
// 8/4/2025	Tuesday	8hr	Worked on dynamic table toolbar
// 9/4/2025	Wednesday	8hr	Worked on dynamic table toolbar
// 10/4/2025	Thursday	8hr	Worked on dynamic table pagination
// 11/4/2025	Friday	8hr	Worked on dynamic tablebuilder config
// 12/4/2025	Saturday		Week Off
// 13/4/2025	Sunday		Week Off
// 14/4/2025	Monday	8hr	Started working on document bot
// 15/4/2025	Tuesday	8hr	Designed new UI
// 16/4/2025	Wednesday	8hr	Document-bot API integration
// 17/4/2025	Thursday	8hr	Worked on Promate
// 18/4/2025	Friday	8hr	Started working on new Makez application
// 19/4/2025	Saturday		Week Off
// 20/4/2025	Sunday		Week Off
// 21/4/2025	Monday	8hr	Worked on repo and editor setup
// 22/4/2025	Tuesday	8hr	Worked on App setup
// 23/4/2025	Wednesday	0hr	Leave
// 24/4/2025	Thursday	8hr	Worked on layout
// 25/4/2025	Friday	8hr	Worked on Routes
// 26/4/2025	Saturday		Week Off
// 27/4/2025	Sunday		Week Off
// 28/4/2025	Monday	8hr	Worked on SLD API isues
// 29/4/2025	Tuesday	8hr	Worked on SLD API isues
// 30/4/2025	Wednesday	8hr	Worked on SLD API isues

// roles:{
//   admin:{
// module:{
//   name
//   create
// }
//   }
// }
// user:{
//   name:'ahha',
//   permissions:["createDocument:true","createUser:any","deleteDocument:ownDepartment"]
// }

// if(User.permissions.includes('deleteDocument:ownDepartment')){
//   if(id === '27733636')deleteDocument('id')
// }
// if(User.permissions.includes('deleteDocument:any')){
// deleteDocument('id')
// }
