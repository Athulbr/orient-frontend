export const sampleNodes = [
    {
        id: 'delayNode-1767275635953',
        type: 'delayNode',
        position: {
            x: 62.64970599241451,
            y: -86.70098982311697
        },
        data: {
            delay: '8000'
        },
        width: 180,
        height: 96,
        selected: false,
        positionAbsolute: {
            x: 62.64970599241451,
            y: -86.70098982311697
        },
        dragging: false
    },
    {
        id: 'logNode-1767275642808',
        type: 'logNode',
        position: {
            x: 278.23546410806375,
            y: 102.58355970200469
        },
        data: {
            message: 'Hello test 1'
        },
        width: 180,
        height: 107,
        selected: false,
        dragging: false,
        positionAbsolute: {
            x: 278.23546410806375,
            y: 102.58355970200469
        }
    },
    {
        id: 'logNode-1767275688536',
        type: 'logNode',
        position: {
            x: -143.02875777579476,
            y: -266.84609753601694
        },
        data: {
            message: 'Hello start'
        },
        width: 180,
        height: 107,
        selected: false,
        positionAbsolute: {
            x: -143.02875777579476,
            y: -266.84609753601694
        },
        dragging: false
    },
    {
        id: 'delayNode-1767275943345',
        type: 'delayNode',
        position: {
            x: 491.9968779187019,
            y: 323.465017266125
        },
        data: {
            delay: 1000
        },
        width: 180,
        height: 96,
        selected: false,
        positionAbsolute: {
            x: 491.9968779187019,
            y: 323.465017266125
        },
        dragging: false
    },
    {
        id: 'logNode-1767275992091',
        type: 'logNode',
        position: {
            x: 724.859477989021,
            y: 520.1655073630034
        },
        data: {
            message: 'Hello end'
        },
        width: 180,
        height: 107,
        selected: true,
        positionAbsolute: {
            x: 724.859477989021,
            y: 520.1655073630034
        },
        dragging: false
    }
];

export const sampleEdges = [
    {
        source: 'logNode-1766468563099',
        sourceHandle: null,
        target: 'delayNode-1766468578718',
        targetHandle: null,
        animated: true,
        style: {
            stroke: '#6366f1',
            strokeWidth: 2
        },
        id: 'reactflow__edge-logNode-1766468563099-delayNode-1766468578718'
    },
    {
        source: 'delayNode-1766468578718',
        sourceHandle: null,
        target: 'logNode-1766468592864',
        targetHandle: null,
        animated: true,
        style: {
            stroke: '#6366f1',
            strokeWidth: 2
        },
        id: 'reactflow__edge-delayNode-1766468578718-logNode-1766468592864'
    },
    {
        source: 'logNode-1767275688536',
        sourceHandle: null,
        target: 'delayNode-1767275635953',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-logNode-1767275688536-delayNode-1767275635953'
    },
    {
        source: 'delayNode-1767275635953',
        sourceHandle: null,
        target: 'logNode-1767275642808',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-delayNode-1767275635953-logNode-1767275642808'
    },
    {
        source: 'logNode-1767275642808',
        sourceHandle: null,
        target: 'delayNode-1767275943345',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-logNode-1767275642808-delayNode-1767275943345'
    },
    {
        source: 'delayNode-1767275943345',
        sourceHandle: null,
        target: 'logNode-1767275992091',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-delayNode-1767275943345-logNode-1767275992091'
    }
];
