import { Node, Edge } from 'reactflow';

export const sampleNodes: Node[] = [
    {
        id: 'random-1',
        type: 'randomNumberNode',
        position: {
            x: 24,
            y: 39
        },
        data: {
            min: 1,
            max: 10
        },
        width: 180,
        height: 116,
        selected: true,
        dragging: false,
        positionAbsolute: {
            x: 24,
            y: 39
        }
    },
    {
        id: 'if-1',
        type: 'ifNode',
        position: {
            x: 548,
            y: 254
        },
        data: {
            conditions: [
                {
                    field: 'random',
                    operation: 'greaterThan',
                    value: '5'
                }
            ],
            combineOperation: 'AND'
        },
        width: 240,
        height: 127,
        selected: false,
        positionAbsolute: {
            x: 548,
            y: 254
        },
        dragging: false
    },
    {
        id: 'log-true',
        type: 'logNode',
        position: {
            x: 1053,
            y: 90
        },
        data: {
            message: 'TRUE ✅ Random number > 8'
        },
        width: 214,
        height: 107,
        selected: false,
        positionAbsolute: {
            x: 1053,
            y: 90
        },
        dragging: false
    },
    {
        id: 'log-false',
        type: 'logNode',
        position: {
            x: 1136,
            y: 583
        },
        data: {
            message: 'FALSE ❌ Random number ≤ 5'
        },
        width: 220,
        height: 107,
        selected: false,
        positionAbsolute: {
            x: 1136,
            y: 583
        },
        dragging: false
    },
    {
        id: 'delayNode-1768487023076',
        type: 'delayNode',
        position: {
            x: 309,
            y: 138
        },
        data: {
            delay: '2000'
        },
        width: 180,
        height: 96,
        selected: false,
        positionAbsolute: {
            x: 309,
            y: 138
        },
        dragging: false
    },
    {
        id: 'delayNode-1768487098855',
        type: 'delayNode',
        position: {
            x: 926,
            y: 378
        },
        data: {
            delay: '2000'
        },
        width: 180,
        height: 96,
        selected: false,
        positionAbsolute: {
            x: 926,
            y: 378
        },
        dragging: false
    }
];

export const sampleEdges: Edge[] = [
    {
        source: 'random-1',
        sourceHandle: null,
        target: 'delayNode-1768487023076',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-random-1-delayNode-1768487023076'
    },
    {
        source: 'delayNode-1768487023076',
        sourceHandle: null,
        target: 'if-1',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-delayNode-1768487023076-if-1'
    },
    {
        source: 'if-1',
        sourceHandle: 'false',
        target: 'delayNode-1768487098855',
        targetHandle: null,
        animated: true,
        label: 'FALSE',
        style: {
            stroke: '#ef4444'
        },
        labelBgStyle: {
            fill: '#fee2e2'
        },
        id: 'reactflow__edge-if-1false-delayNode-1768487098855'
    },
    {
        source: 'delayNode-1768487098855',
        sourceHandle: null,
        target: 'log-false',
        targetHandle: null,
        animated: true,
        id: 'reactflow__edge-delayNode-1768487098855-log-false'
    },
    {
        source: 'if-1',
        sourceHandle: 'true',
        target: 'log-true',
        targetHandle: null,
        animated: true,
        label: 'TRUE',
        style: {
            stroke: '#10b981'
        },
        labelBgStyle: {
            fill: '#d1fae5'
        },
        id: 'reactflow__edge-if-1true-log-true'
    }
];
