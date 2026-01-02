export const sampleNodes = [
    {
        id: 'logNode-1766468563099',

        type: 'logNode',

        position: {
            x: -226.6624725748766,

            y: -107.39335872257152
        },

        data: {
            label: 'New logNode',

            message: 'Hello World'
        },

        width: 180,

        height: 118,

        selected: false,

        positionAbsolute: {
            x: -226.6624725748766,

            y: -107.39335872257152
        },

        dragging: false
    },

    {
        id: 'delayNode-1766468578718',

        type: 'delayNode',

        position: {
            x: 56.64924908259695,

            y: -111.78336259927323
        },

        data: {
            label: 'New delayNode',

            delay: '5000'
        },

        width: 180,

        height: 128,

        selected: false,

        positionAbsolute: {
            x: 56.64924908259695,

            y: -111.78336259927323
        },

        dragging: false
    },

    {
        id: 'logNode-1766468592864',

        type: 'logNode',

        position: {
            x: 350.07741184305604,

            y: -99.85748597288465
        },

        data: {
            label: 'New logNode',

            message: 'Hello World Completed!'
        },

        width: 196,

        height: 118,

        selected: false,

        positionAbsolute: {
            x: 350.07741184305604,

            y: -99.85748597288465
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
    }
];
