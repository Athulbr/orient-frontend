import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, GripHorizontal, Loader2 } from 'lucide-react';

import { Order } from '../types';

type ResultMessage = {
    type: 'success' | 'error';
    messages: string[];
};

interface DraggableResultCardProps {
    result: ResultMessage;
    onClose: () => void;
}

const DraggableResultCard: React.FC<DraggableResultCardProps> = ({ result, onClose }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const isSuccess = result.type === 'success';

    return (
        <div
            className={`absolute bottom-[calc(100%+1rem)] right-0 z-50 flex w-120 flex-col overflow-hidden rounded-xl border bg-white shadow-2xl transition-shadow ${
                isSuccess ? 'border-green-200' : 'border-red-200'
            } ${isDragging ? 'cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.2)]' : 'shadow-lg'}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`
            }}
        >
            {/* Header (Draggable handle) */}
            <div
                className={`flex cursor-grab items-center justify-between px-4 py-3 active:cursor-grabbing ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 font-semibold">
                    <GripHorizontal size={18} className={isSuccess ? 'text-green-500/50' : 'text-red-500/50'} />
                    {isSuccess ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />}
                    <span>{isSuccess ? 'Success' : 'Validation Failed'}</span>
                </div>
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className={`rounded-md p-1 transition-colors ${isSuccess ? 'hover:bg-green-200/50' : 'hover:bg-red-200/50'}`}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="max-h-60 overflow-y-auto bg-white p-4 text-sm text-gray-700">
                <ul className="flex flex-col gap-3">
                    {result.messages.map((msg, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="leading-snug">{msg}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

interface SubmitToMaraekatIF {
    order: Order;
    extractedData: any;
}

const SubmitToMaraekat: React.FC<SubmitToMaraekatIF> = ({ order, extractedData }) => {
    const [token, setToken] = useState('');
    const [resultMessage, setResultMessage] = useState<ResultMessage | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const makeAuthentication = async () => {
        if (token) return token;
        try {
            const workflowServiceUrl = import.meta.env.VITE_WORKFLOW_SERVICE_LOCAL || 'http://localhost:6007';
            const response = await fetch(`${workflowServiceUrl}/api/orient/login`, {
                method: 'POST'
            });
            const data = await response.json();
            setToken(data.Result);
            return data.Result;
        } catch (error) {
            console.error('Authentication Error:', error);
            return '';
        }
    };

    // const order = {
    //     _id: '69d3bfed69a03177939636a4',
    //     orderDetails: {
    //         orderId: 20356183,
    //         productType: 'card',
    //         orderNumber: 20260406909684,
    //         orderType: 'sell',
    //         branch: 'Bangalore-Basavangudi',
    //         branchId: 5,
    //         totalAmount: 0,
    //         actualAmount: 0,
    //         orderStatus: 'extracted',
    //         documentSubmitStatus: 'Offline'
    //     },
    //     userDetails: {
    //         userId: 868123,
    //         name: 'Vinayak Manjunath naik',
    //         email: 'vinayaknaik403@gmail.com',
    //         phone: '08217724539'
    //     },
    //     currencyDetails: [],
    //     webDocuments: [],
    //     manualDocuments: [
    //         {
    //             documentName: 'temp_1775485064224_a9n7w0_1775485063834-job_letter-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485064224_a9n7w0_1775485063834-job_letter-1.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485064224_a9n7w0_1775485063834-job_letter-2.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485065560_o0qt4m_1775485063847-pancard-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485065560_o0qt4m_1775485063847-pancard-1.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485066109_c55kcc_1775485063851-Passport_Front_page-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485066109_c55kcc_1775485063851-Passport_Front_page-1.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485066644_sp8cqq_1775485063854-Passport_last_page-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485066644_sp8cqq_1775485063854-Passport_last_page-1.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485067170_jfecjk_1775485063855-return_ticket-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485067170_jfecjk_1775485063855-return_ticket-1.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485067170_jfecjk_1775485063855-return_ticket-2.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485067170_jfecjk_1775485063855-return_ticket-3.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485067724_q6evy6_1775485063857-Ticket_copy-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485067724_q6evy6_1775485063857-Ticket_copy-1.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485067724_q6evy6_1775485063857-Ticket_copy-2.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485067724_q6evy6_1775485063857-Ticket_copy-3.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485068266_nt2l4j_1775485063858-university_letter-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485068266_nt2l4j_1775485063858-university_letter-1.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485068266_nt2l4j_1775485063858-university_letter-2.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485068266_nt2l4j_1775485063858-university_letter-3.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485068266_nt2l4j_1775485063858-university_letter-4.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485068266_nt2l4j_1775485063858-university_letter-5.webp',
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485068266_nt2l4j_1775485063858-university_letter-6.webp'
    //             ]
    //         },
    //         {
    //             documentName: 'temp_1775485069094_1y2d1h_1775485063858-visa-1.webp',
    //             documentPages: [
    //                 '/Users/apple/Documents/Workflow_Automation_All_Versions/Workflow_Automation_V34/workflow-service/temp/1775485063824_8ddf0c0e-b6bc-4ac7-933f-b9acbdf3c2b0/temp_1775485069094_1y2d1h_1775485063858-visa-1.webp'
    //             ]
    //         }
    //     ],
    //     emailDocuments: [],
    //     linkedEmailIds: [],
    //     extractionDetails: {
    //         extractedData: {
    //             passport: {
    //                 pax_name: {
    //                     value: 'ANWESHAN BHATTACHARYA',
    //                     page: 4,
    //                     wordIndexes: [1325, 1314],
    //                     bbox: {
    //                         x_min: 0.148486981,
    //                         y_min: 0.36,
    //                         x_max: 0.7776213934,
    //                         y_max: 0.592
    //                     },
    //                     confidence: 0.98985
    //                 },
    //                 passport_number: {
    //                     value: 'R1905362',
    //                     page: 4,
    //                     wordIndexes: [1294],
    //                     bbox: {
    //                         x_min: 0.0654468684,
    //                         y_min: 0.052,
    //                         x_max: 0.1076706545,
    //                         y_max: 0.2025
    //                     },
    //                     confidence: 0.9867
    //                 },
    //                 passport_issued_from: {
    //                     value: 'RANCHI',
    //                     page: 4,
    //                     wordIndexes: [1331],
    //                     bbox: {
    //                         x_min: 0.384940183,
    //                         y_min: 0.4475,
    //                         x_max: 0.4095707248,
    //                         y_max: 0.539
    //                     },
    //                     confidence: 0.9914
    //                 },
    //                 passport_issue_date: {
    //                     value: '02/08/2017',
    //                     page: 4,
    //                     wordIndexes: [1330],
    //                     bbox: {
    //                         x_min: 0.287825475,
    //                         y_min: 0.4455,
    //                         x_max: 0.3173821253,
    //                         y_max: 0.605
    //                     },
    //                     confidence: 0.9879
    //                 },
    //                 passport_expiry_date: {
    //                     value: '01/08/2027',
    //                     page: 4,
    //                     wordIndexes: [1386],
    //                     bbox: {
    //                         x_min: 0.296973962,
    //                         y_min: 0.754,
    //                         x_max: 0.3258268825,
    //                         y_max: 0.9155
    //                     },
    //                     confidence: 0.9891
    //                 },
    //                 date_of_birth: {
    //                     value: '12/08/1996',
    //                     page: 4,
    //                     wordIndexes: [1387],
    //                     bbox: {
    //                         x_min: 0.5798733286,
    //                         y_min: 0.7605,
    //                         x_max: 0.6101337087,
    //                         y_max: 0.919
    //                     },
    //                     confidence: 0.9915
    //                 },
    //                 gender: {
    //                     value: 'Male',
    //                     page: 4,
    //                     wordIndexes: [1371],
    //                     bbox: {
    //                         x_min: 0.5812807882,
    //                         y_min: 0.659,
    //                         x_max: 0.6002814919,
    //                         y_max: 0.673
    //                     },
    //                     confidence: 0.9675
    //                 },
    //                 nationality: {
    //                     value: 'INDIAN',
    //                     page: 4,
    //                     wordIndexes: [1335],
    //                     bbox: {
    //                         x_min: 0.5608726249,
    //                         y_min: 0.455,
    //                         x_max: 0.5967628431,
    //                         y_max: 0.5475
    //                     },
    //                     confidence: 0.9819
    //                 },
    //                 first_name: {
    //                     value: 'ANWESHAN',
    //                     page: 4,
    //                     wordIndexes: [1325],
    //                     bbox: {
    //                         x_min: 0.148486981,
    //                         y_min: 0.4305,
    //                         x_max: 0.187895848,
    //                         y_max: 0.592
    //                     },
    //                     confidence: 0.989
    //                 },
    //                 last_name: {
    //                     value: 'BHATTACHARYA',
    //                     page: 4,
    //                     wordIndexes: [1314],
    //                     bbox: {
    //                         x_min: 0.751583392,
    //                         y_min: 0.36,
    //                         x_max: 0.7776213934,
    //                         y_max: 0.5515
    //                     },
    //                     confidence: 0.9907
    //                 }
    //             },
    //             pan_card: {
    //                 pan_number: {
    //                     value: 'CBZPB3322G',
    //                     page: 3,
    //                     wordIndexes: [1274],
    //                     bbox: {
    //                         x_min: 0.2662912309,
    //                         y_min: 0.061,
    //                         x_max: 0.3049074819,
    //                         y_max: 0.2695
    //                     },
    //                     confidence: 0.9856
    //                 },
    //                 pan_card_holder_name: {
    //                     value: 'ANWESHAN BHATTACHARYA',
    //                     page: 3,
    //                     wordIndexes: [1271, 1278],
    //                     bbox: {
    //                         x_min: 0.533386967,
    //                         y_min: 0.053,
    //                         x_max: 0.7039420756,
    //                         y_max: 0.4815
    //                     },
    //                     confidence: 0.99235
    //                 },
    //                 father_name: {
    //                     value: 'SHAIBAL BHATTACHARYA',
    //                     page: 3,
    //                     wordIndexes: [1270, 1280],
    //                     bbox: {
    //                         x_min: 0.5341914722,
    //                         y_min: 0.055,
    //                         x_max: 0.7039420756,
    //                         y_max: 0.5275
    //                     },
    //                     confidence: 0.99095
    //                 },
    //                 first_name: {
    //                     value: 'ANWESHAN',
    //                     page: 3,
    //                     wordIndexes: [1271],
    //                     bbox: {
    //                         x_min: 0.6653258246,
    //                         y_min: 0.053,
    //                         x_max: 0.7039420756,
    //                         y_max: 0.2435
    //                     },
    //                     confidence: 0.9914
    //                 },
    //                 last_name: {
    //                     value: 'BHATTACHARYA',
    //                     page: 3,
    //                     wordIndexes: [1278],
    //                     bbox: {
    //                         x_min: 0.533386967,
    //                         y_min: 0.2105,
    //                         x_max: 0.5752212389,
    //                         y_max: 0.4815
    //                     },
    //                     confidence: 0.9933
    //                 },
    //                 type_of_person: {
    //                     value: 'Person',
    //                     page: 3,
    //                     wordIndexes: [1277],
    //                     bbox: {
    //                         x_min: 0.3419147224,
    //                         y_min: 0.182,
    //                         x_max: 0.3724859212,
    //                         y_max: 0.285
    //                     },
    //                     confidence: 0.9392
    //                 }
    //             },
    //             user_identity_details: {
    //                 aadhaar_card_number: {
    //                     value: '',
    //                     page: -1,
    //                     wordIndexes: []
    //                 },
    //                 passenger_address: {
    //                     value: 'UTTARAN,MAIN ROAD,NEAR SAHARA BUILDING GHATSILA,EAST SINGHBHUM PIN:832303,JHARKHAND,INDIA',
    //                     page: 5,
    //                     wordIndexes: [1450, 1452, 1447, 1448, 1449, 1453, 1455, 1456, 1457, 1459, 1461, 1463],
    //                     bbox: {
    //                         x_min: 0.0605,
    //                         y_min: 0.4923486361,
    //                         x_max: 0.6665,
    //                         y_max: 0.7079174983
    //                     },
    //                     confidence: 0.9845
    //                 },
    //                 building_or_flat_number: {
    //                     value: 'UTTARAN',
    //                     page: 5,
    //                     wordIndexes: [1450],
    //                     bbox: {
    //                         x_min: 0.062,
    //                         y_min: 0.50499002,
    //                         x_max: 0.1725,
    //                         y_max: 0.5375914837
    //                     },
    //                     confidence: 0.9728
    //                 },
    //                 street_name: {
    //                     value: 'MAIN ROAD,NEAR SAHARA BUILDING',
    //                     page: 5,
    //                     wordIndexes: [1452, 1447, 1448, 1449],
    //                     bbox: {
    //                         x_min: 0.19,
    //                         y_min: 0.4923486361,
    //                         x_max: 0.6665,
    //                         y_max: 0.5342648037
    //                     },
    //                     confidence: 0.9822249999999999
    //                 },
    //                 location: {
    //                     value: 'GHATSILA',
    //                     page: 5,
    //                     wordIndexes: [1453],
    //                     bbox: {
    //                         x_min: 0.0615,
    //                         y_min: 0.5894876913,
    //                         x_max: 0.1865,
    //                         y_max: 0.620758483
    //                     },
    //                     confidence: 0.9858
    //                 },
    //                 city: {
    //                     value: 'GHATSILA',
    //                     page: 5,
    //                     wordIndexes: [1453],
    //                     bbox: {
    //                         x_min: 0.0615,
    //                         y_min: 0.5894876913,
    //                         x_max: 0.1865,
    //                         y_max: 0.620758483
    //                     },
    //                     confidence: 0.9858
    //                 },
    //                 pin_code: {
    //                     value: '832303',
    //                     page: 5,
    //                     wordIndexes: [1459],
    //                     bbox: {
    //                         x_min: 0.1235,
    //                         y_min: 0.6753160346,
    //                         x_max: 0.218,
    //                         y_max: 0.7065868263
    //                     },
    //                     confidence: 0.9884
    //                 },
    //                 state_name: {
    //                     value: 'JHARKHAND',
    //                     page: 5,
    //                     wordIndexes: [1461],
    //                     bbox: {
    //                         x_min: 0.236,
    //                         y_min: 0.6726546906,
    //                         x_max: 0.377,
    //                         y_max: 0.7045908184
    //                     },
    //                     confidence: 0.9823
    //                 }
    //             },
    //             customer_declaration: {
    //                 passenger_address: {
    //                     value: 'UTTARAN,MAIN ROAD,NEAR SAHARA BUILDING GHATSILA,EAST SINGHBHUM PIN:832303,JHARKHAND,INDIA',
    //                     page: 5,
    //                     wordIndexes: [1450, 1452, 1447, 1448, 1449, 1453, 1455, 1456, 1457, 1459, 1461, 1463],
    //                     bbox: {
    //                         x_min: 0.0605,
    //                         y_min: 0.4923486361,
    //                         x_max: 0.6665,
    //                         y_max: 0.7079174983
    //                     },
    //                     confidence: 0.9845
    //                 },
    //                 parent_name: {
    //                     value: 'SHAIBAL BHATTACHERJEE',
    //                     page: 5,
    //                     wordIndexes: [1422, 1423],
    //                     bbox: {
    //                         x_min: 0.063,
    //                         y_min: 0.2228875582,
    //                         x_max: 0.401,
    //                         y_max: 0.252827678
    //                     },
    //                     confidence: 0.9836
    //                 },
    //                 building_or_flat_number: {
    //                     value: 'UTTARAN',
    //                     page: 5,
    //                     wordIndexes: [1450],
    //                     bbox: {
    //                         x_min: 0.062,
    //                         y_min: 0.50499002,
    //                         x_max: 0.1725,
    //                         y_max: 0.5375914837
    //                     },
    //                     confidence: 0.9728
    //                 },
    //                 street_name: {
    //                     value: 'MAIN ROAD,NEAR SAHARA BUILDING',
    //                     page: 5,
    //                     wordIndexes: [1452, 1447, 1448, 1449],
    //                     bbox: {
    //                         x_min: 0.19,
    //                         y_min: 0.4923486361,
    //                         x_max: 0.6665,
    //                         y_max: 0.5342648037
    //                     },
    //                     confidence: 0.9822249999999999
    //                 }
    //             },
    //             voter_id_card: {
    //                 voter_card_number: {
    //                     value: '',
    //                     page: -1,
    //                     wordIndexes: []
    //                 }
    //             },
    //             driving_licence: {
    //                 driving_licence_number: {
    //                     value: '',
    //                     page: -1,
    //                     wordIndexes: []
    //                 }
    //             },
    //             travel_itinerary: {
    //                 pnr_number: {
    //                     value: 'T38Q8L',
    //                     page: 9,
    //                     wordIndexes: [2263],
    //                     bbox: {
    //                         x_min: 0.8366336634,
    //                         y_min: 0.136,
    //                         x_max: 0.900990099,
    //                         y_max: 0.1455
    //                     },
    //                     confidence: 0.985
    //                 },
    //                 ticket_number: {
    //                     value: 'T38Q8L/1/1',
    //                     page: 9,
    //                     wordIndexes: [2263, 2342, 2441],
    //                     bbox: {
    //                         x_min: 0.360678925,
    //                         y_min: 0.136,
    //                         x_max: 0.900990099,
    //                         y_max: 0.923
    //                     },
    //                     confidence: 0.9813999999999999
    //                 },
    //                 airline_name: {
    //                     value: 'IndiGo',
    //                     page: 9,
    //                     wordIndexes: [2264],
    //                     bbox: {
    //                         x_min: 0.1605374823,
    //                         y_min: 0.198,
    //                         x_max: 0.2093352192,
    //                         y_max: 0.2055
    //                     },
    //                     confidence: 0.9838
    //                 },
    //                 departure_from: {
    //                     value: 'BLR',
    //                     page: 9,
    //                     wordIndexes: [2283],
    //                     bbox: {
    //                         x_min: 0.3316831683,
    //                         y_min: 0.247,
    //                         x_max: 0.3727015559,
    //                         y_max: 0.2575
    //                     },
    //                     confidence: 0.966
    //                 },
    //                 departure_date: {
    //                     value: '02-APR-2026',
    //                     page: 9,
    //                     wordIndexes: [2257, 2258, 2260],
    //                     bbox: {
    //                         x_min: 0.1683168317,
    //                         y_min: 0.137,
    //                         x_max: 0.2687411598,
    //                         y_max: 0.1475
    //                     },
    //                     confidence: 0.9819666666666667
    //                 },
    //                 traveling_country: {
    //                     value: 'Mauritius',
    //                     page: 9,
    //                     wordIndexes: [2253],
    //                     bbox: {
    //                         x_min: 0.2213578501,
    //                         y_min: 0.12,
    //                         x_max: 0.3005657709,
    //                         y_max: 0.1325
    //                     },
    //                     confidence: 0.9798
    //                 },
    //                 arrival_date: {
    //                     value: '02-APR-2026',
    //                     page: 9,
    //                     wordIndexes: [2257, 2258, 2260],
    //                     bbox: {
    //                         x_min: 0.1683168317,
    //                         y_min: 0.137,
    //                         x_max: 0.2687411598,
    //                         y_max: 0.1475
    //                     },
    //                     confidence: 0.9819666666666667
    //                 },
    //                 route: {
    //                     value: 'Bengaluru -> Mauritius',
    //                     page: 9,
    //                     wordIndexes: [2252, 2253],
    //                     bbox: {
    //                         x_min: 0.0933521924,
    //                         y_min: 0.12,
    //                         x_max: 0.3005657709,
    //                         y_max: 0.1335
    //                     },
    //                     confidence: 0.9843500000000001
    //                 }
    //             }
    //         },
    //         recordId: '69d3c1a269a03177939636e5'
    //     },
    //     createdAt: '2026-04-06T14:15:09.703Z',
    //     updatedAt: '2026-04-06T14:22:35.708Z',
    //     __v: 0
    // };

    // const extractedData = {
    //     passport: {
    //         pax_name: {
    //             value: 'ANWESHAN BHATTACHARYA',
    //             page: 4,
    //             wordIndexes: [1325, 1314],
    //             bbox: {
    //                 x_min: 0.148486981,
    //                 y_min: 0.36,
    //                 x_max: 0.7776213934,
    //                 y_max: 0.592
    //             },
    //             confidence: 0.98985
    //         },
    //         passport_number: {
    //             value: 'R1905362',
    //             page: 4,
    //             wordIndexes: [1294],
    //             bbox: {
    //                 x_min: 0.0654468684,
    //                 y_min: 0.052,
    //                 x_max: 0.1076706545,
    //                 y_max: 0.2025
    //             },
    //             confidence: 0.9867
    //         },
    //         passport_issued_from: {
    //             value: 'RANCHI',
    //             page: 4,
    //             wordIndexes: [1331],
    //             bbox: {
    //                 x_min: 0.384940183,
    //                 y_min: 0.4475,
    //                 x_max: 0.4095707248,
    //                 y_max: 0.539
    //             },
    //             confidence: 0.9914
    //         },
    //         passport_issue_date: {
    //             value: '02/08/2017',
    //             page: 4,
    //             wordIndexes: [1330],
    //             bbox: {
    //                 x_min: 0.287825475,
    //                 y_min: 0.4455,
    //                 x_max: 0.3173821253,
    //                 y_max: 0.605
    //             },
    //             confidence: 0.9879
    //         },
    //         passport_expiry_date: {
    //             value: '01/08/2027',
    //             page: 4,
    //             wordIndexes: [1386],
    //             bbox: {
    //                 x_min: 0.296973962,
    //                 y_min: 0.754,
    //                 x_max: 0.3258268825,
    //                 y_max: 0.9155
    //             },
    //             confidence: 0.9891
    //         },
    //         date_of_birth: {
    //             value: '12/08/1996',
    //             page: 4,
    //             wordIndexes: [1387],
    //             bbox: {
    //                 x_min: 0.5798733286,
    //                 y_min: 0.7605,
    //                 x_max: 0.6101337087,
    //                 y_max: 0.919
    //             },
    //             confidence: 0.9915
    //         },
    //         gender: {
    //             value: 'Male',
    //             page: 4,
    //             wordIndexes: [1371],
    //             bbox: {
    //                 x_min: 0.5812807882,
    //                 y_min: 0.659,
    //                 x_max: 0.6002814919,
    //                 y_max: 0.673
    //             },
    //             confidence: 0.9675
    //         },
    //         nationality: {
    //             value: 'INDIAN',
    //             page: 4,
    //             wordIndexes: [1335],
    //             bbox: {
    //                 x_min: 0.5608726249,
    //                 y_min: 0.455,
    //                 x_max: 0.5967628431,
    //                 y_max: 0.5475
    //             },
    //             confidence: 0.9819
    //         },
    //         first_name: {
    //             value: 'ANWESHAN',
    //             page: 4,
    //             wordIndexes: [1325],
    //             bbox: {
    //                 x_min: 0.148486981,
    //                 y_min: 0.4305,
    //                 x_max: 0.187895848,
    //                 y_max: 0.592
    //             },
    //             confidence: 0.989
    //         },
    //         last_name: {
    //             value: 'BHATTACHARYA',
    //             page: 4,
    //             wordIndexes: [1314],
    //             bbox: {
    //                 x_min: 0.751583392,
    //                 y_min: 0.36,
    //                 x_max: 0.7776213934,
    //                 y_max: 0.5515
    //             },
    //             confidence: 0.9907
    //         }
    //     },
    //     pan_card: {
    //         pan_number: {
    //             value: 'CBZPB3322G',
    //             page: 3,
    //             wordIndexes: [1274],
    //             bbox: {
    //                 x_min: 0.2662912309,
    //                 y_min: 0.061,
    //                 x_max: 0.3049074819,
    //                 y_max: 0.2695
    //             },
    //             confidence: 0.9856
    //         },
    //         pan_card_holder_name: {
    //             value: 'ANWESHAN BHATTACHARYA',
    //             page: 3,
    //             wordIndexes: [1271, 1278],
    //             bbox: {
    //                 x_min: 0.533386967,
    //                 y_min: 0.053,
    //                 x_max: 0.7039420756,
    //                 y_max: 0.4815
    //             },
    //             confidence: 0.99235
    //         },
    //         father_name: {
    //             value: 'SHAIBAL BHATTACHARYA',
    //             page: 3,
    //             wordIndexes: [1270, 1280],
    //             bbox: {
    //                 x_min: 0.5341914722,
    //                 y_min: 0.055,
    //                 x_max: 0.7039420756,
    //                 y_max: 0.5275
    //             },
    //             confidence: 0.99095
    //         },
    //         first_name: {
    //             value: 'ANWESHAN',
    //             page: 3,
    //             wordIndexes: [1271],
    //             bbox: {
    //                 x_min: 0.6653258246,
    //                 y_min: 0.053,
    //                 x_max: 0.7039420756,
    //                 y_max: 0.2435
    //             },
    //             confidence: 0.9914
    //         },
    //         last_name: {
    //             value: 'BHATTACHARYA',
    //             page: 3,
    //             wordIndexes: [1278],
    //             bbox: {
    //                 x_min: 0.533386967,
    //                 y_min: 0.2105,
    //                 x_max: 0.5752212389,
    //                 y_max: 0.4815
    //             },
    //             confidence: 0.9933
    //         },
    //         type_of_person: {
    //             value: 'Person',
    //             page: 3,
    //             wordIndexes: [1277],
    //             bbox: {
    //                 x_min: 0.3419147224,
    //                 y_min: 0.182,
    //                 x_max: 0.3724859212,
    //                 y_max: 0.285
    //             },
    //             confidence: 0.9392
    //         }
    //     },
    //     user_identity_details: {
    //         aadhaar_card_number: {
    //             value: '',
    //             page: -1,
    //             wordIndexes: []
    //         },
    //         passenger_address: {
    //             value: 'UTTARAN,MAIN ROAD,NEAR SAHARA BUILDING GHATSILA,EAST SINGHBHUM PIN:832303,JHARKHAND,INDIA',
    //             page: 5,
    //             wordIndexes: [1450, 1452, 1447, 1448, 1449, 1453, 1455, 1456, 1457, 1459, 1461, 1463],
    //             bbox: {
    //                 x_min: 0.0605,
    //                 y_min: 0.4923486361,
    //                 x_max: 0.6665,
    //                 y_max: 0.7079174983
    //             },
    //             confidence: 0.9845
    //         },
    //         building_or_flat_number: {
    //             value: 'UTTARAN',
    //             page: 5,
    //             wordIndexes: [1450],
    //             bbox: {
    //                 x_min: 0.062,
    //                 y_min: 0.50499002,
    //                 x_max: 0.1725,
    //                 y_max: 0.5375914837
    //             },
    //             confidence: 0.9728
    //         },
    //         street_name: {
    //             value: 'MAIN ROAD,NEAR SAHARA BUILDING',
    //             page: 5,
    //             wordIndexes: [1452, 1447, 1448, 1449],
    //             bbox: {
    //                 x_min: 0.19,
    //                 y_min: 0.4923486361,
    //                 x_max: 0.6665,
    //                 y_max: 0.5342648037
    //             },
    //             confidence: 0.9822249999999999
    //         },
    //         location: {
    //             value: 'GHATSILA',
    //             page: 5,
    //             wordIndexes: [1453],
    //             bbox: {
    //                 x_min: 0.0615,
    //                 y_min: 0.5894876913,
    //                 x_max: 0.1865,
    //                 y_max: 0.620758483
    //             },
    //             confidence: 0.9858
    //         },
    //         city: {
    //             value: 'GHATSILA',
    //             page: 5,
    //             wordIndexes: [1453],
    //             bbox: {
    //                 x_min: 0.0615,
    //                 y_min: 0.5894876913,
    //                 x_max: 0.1865,
    //                 y_max: 0.620758483
    //             },
    //             confidence: 0.9858
    //         },
    //         pin_code: {
    //             value: '832303',
    //             page: 5,
    //             wordIndexes: [1459],
    //             bbox: {
    //                 x_min: 0.1235,
    //                 y_min: 0.6753160346,
    //                 x_max: 0.218,
    //                 y_max: 0.7065868263
    //             },
    //             confidence: 0.9884
    //         },
    //         state_name: {
    //             value: 'JHARKHAND',
    //             page: 5,
    //             wordIndexes: [1461],
    //             bbox: {
    //                 x_min: 0.236,
    //                 y_min: 0.6726546906,
    //                 x_max: 0.377,
    //                 y_max: 0.7045908184
    //             },
    //             confidence: 0.9823
    //         },
    //         country: {
    //             value: 'INDIA',
    //             page: 5
    //         }
    //     },
    //     customer_declaration: {
    //         passenger_address: {
    //             value: 'UTTARAN,MAIN ROAD,NEAR SAHARA BUILDING GHATSILA,EAST SINGHBHUM PIN:832303,JHARKHAND,INDIA',
    //             page: 5,
    //             wordIndexes: [1450, 1452, 1447, 1448, 1449, 1453, 1455, 1456, 1457, 1459, 1461, 1463],
    //             bbox: {
    //                 x_min: 0.0605,
    //                 y_min: 0.4923486361,
    //                 x_max: 0.6665,
    //                 y_max: 0.7079174983
    //             },
    //             confidence: 0.9845
    //         },
    //         parent_name: {
    //             value: 'SHAIBAL BHATTACHERJEE',
    //             page: 5,
    //             wordIndexes: [1422, 1423],
    //             bbox: {
    //                 x_min: 0.063,
    //                 y_min: 0.2228875582,
    //                 x_max: 0.401,
    //                 y_max: 0.252827678
    //             },
    //             confidence: 0.9836
    //         },
    //         building_or_flat_number: {
    //             value: 'UTTARAN',
    //             page: 5,
    //             wordIndexes: [1450],
    //             bbox: {
    //                 x_min: 0.062,
    //                 y_min: 0.50499002,
    //                 x_max: 0.1725,
    //                 y_max: 0.5375914837
    //             },
    //             confidence: 0.9728
    //         },
    //         street_name: {
    //             value: 'MAIN ROAD,NEAR SAHARA BUILDING',
    //             page: 5,
    //             wordIndexes: [1452, 1447, 1448, 1449],
    //             bbox: {
    //                 x_min: 0.19,
    //                 y_min: 0.4923486361,
    //                 x_max: 0.6665,
    //                 y_max: 0.5342648037
    //             },
    //             confidence: 0.9822249999999999
    //         }
    //     },
    //     voter_id_card: {
    //         voter_card_number: {
    //             value: '',
    //             page: -1,
    //             wordIndexes: []
    //         }
    //     },
    //     driving_licence: {
    //         driving_licence_number: {
    //             value: '',
    //             page: -1,
    //             wordIndexes: []
    //         }
    //     },
    //     travel_itinerary: {
    //         pnr_number: {
    //             value: 'T38Q8L',
    //             page: 9,
    //             wordIndexes: [2263],
    //             bbox: {
    //                 x_min: 0.8366336634,
    //                 y_min: 0.136,
    //                 x_max: 0.900990099,
    //                 y_max: 0.1455
    //             },
    //             confidence: 0.985
    //         },
    //         ticket_number: {
    //             value: 'T38Q8L/1/1',
    //             page: 9,
    //             wordIndexes: [2263, 2342, 2441],
    //             bbox: {
    //                 x_min: 0.360678925,
    //                 y_min: 0.136,
    //                 x_max: 0.900990099,
    //                 y_max: 0.923
    //             },
    //             confidence: 0.9813999999999999
    //         },
    //         airline_name: {
    //             value: 'IndiGo',
    //             page: 9,
    //             wordIndexes: [2264],
    //             bbox: {
    //                 x_min: 0.1605374823,
    //                 y_min: 0.198,
    //                 x_max: 0.2093352192,
    //                 y_max: 0.2055
    //             },
    //             confidence: 0.9838
    //         },
    //         departure_from: {
    //             value: 'BLR',
    //             page: 9,
    //             wordIndexes: [2283],
    //             bbox: {
    //                 x_min: 0.3316831683,
    //                 y_min: 0.247,
    //                 x_max: 0.3727015559,
    //                 y_max: 0.2575
    //             },
    //             confidence: 0.966
    //         },
    //         departure_date: {
    //             value: '02-APR-2026',
    //             page: 9,
    //             wordIndexes: [2257, 2258, 2260],
    //             bbox: {
    //                 x_min: 0.1683168317,
    //                 y_min: 0.137,
    //                 x_max: 0.2687411598,
    //                 y_max: 0.1475
    //             },
    //             confidence: 0.9819666666666667
    //         },
    //         traveling_country: {
    //             value: 'Mauritius',
    //             page: 9,
    //             wordIndexes: [2253],
    //             bbox: {
    //                 x_min: 0.2213578501,
    //                 y_min: 0.12,
    //                 x_max: 0.3005657709,
    //                 y_max: 0.1325
    //             },
    //             confidence: 0.9798
    //         },
    //         arrival_date: {
    //             value: '02-APR-2026',
    //             page: 9,
    //             wordIndexes: [2257, 2258, 2260],
    //             bbox: {
    //                 x_min: 0.1683168317,
    //                 y_min: 0.137,
    //                 x_max: 0.2687411598,
    //                 y_max: 0.1475
    //             },
    //             confidence: 0.9819666666666667
    //         },
    //         route: {
    //             value: 'Bengaluru -> Mauritius',
    //             page: 9,
    //             wordIndexes: [2252, 2253],
    //             bbox: {
    //                 x_min: 0.0933521924,
    //                 y_min: 0.12,
    //                 x_max: 0.3005657709,
    //                 y_max: 0.1335
    //             },
    //             confidence: 0.9843500000000001
    //         }
    //     }
    // };

    // console.log('extractedData?.passport:===========', extractedData?.passport);

    const payload = {
        BRANCHCODE: 'BANH',
        BOOKINGTYPE: order.orderDetails?.orderType,
        BOOKINGNO: String(order.orderDetails?.orderNumber),
        BOOKINGDATE: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-').toUpperCase(),
        SOURCEFROM: order.orderDetails?.documentSubmitStatus === 'online' ? 'OEONLINE' : 'OEOFFLINE',
        HANDLEDBY: 'SAJI',
        BOOKEDBY: 'SHAILESH',
        PAXNAME: extractedData?.passport?.pax_name?.value || '',
        PASSPORTNO: extractedData?.passport?.passport_number?.value || '',
        PASSPORT_ISSUEFROM: extractedData?.passport?.passport_issued_from?.value || '',
        PASSPORT_ISSUEDATE: extractedData?.passport?.passport_issue_date?.value || '',
        PASSPORT_EXPIRYDATE: extractedData?.passport?.passport_expiry_date?.value || '',
        DOB: extractedData?.passport?.date_of_birth?.value || '',
        GENDER: extractedData?.passport?.gender?.value || '',
        NATIONALITY: extractedData?.passport?.nationality?.value || '',
        PANNO: extractedData?.pan_card?.pan_number?.value || '',
        PANCARDHOLDERNAME: extractedData?.pan_card?.pan_card_holder_name?.value || '',
        FATHERNAME: extractedData?.pan_card?.father_name?.value || '',
        TYPEOFPERSON: extractedData?.pan_card?.type_of_person?.value || '',
        ADHAARCARDNO: extractedData?.user_identity_details?.aadhaar_card_number?.value || '',
        PAXADDRESS: extractedData?.user_identity_details?.passenger_address?.value || '',
        MOBILENO: order.userDetails?.phone,
        EMAILID: order.userDetails?.email,
        PARENTNAME: extractedData?.customer_declaration?.parent_name?.value || '',
        VOTERCARDNO: extractedData?.voter_id_card?.voter_card_number?.value || '',
        FIRSTNAME: extractedData?.passport?.first_name?.value || '',
        LASTNAME: extractedData?.passport?.last_name?.value || '',
        DRIVINGLICNO: extractedData?.driving_licence?.driving_licence_number?.value || '',
        BuildingFlatNO: extractedData?.user_identity_details?.building_or_flat_number?.value || '',
        STREETNAME: extractedData?.user_identity_details?.street_name?.value || '',
        LOCATION: extractedData?.user_identity_details?.location?.value || '',
        CITY: extractedData?.user_identity_details?.city?.value || '',
        PINCODE: extractedData?.user_identity_details?.pin_code?.value || '',
        STATENAME: extractedData?.user_identity_details?.state_name?.value || '',
        COUNTRY: extractedData?.user_identity_details?.country?.value || '',
        PNRNO: extractedData?.travel_itinerary?.pnr_number?.value || '',
        TICKETNO: extractedData?.travel_itinerary?.ticket_number?.value || '',
        AIRLINENAME: extractedData?.travel_itinerary?.airline_name?.value || '',
        DEPARTUREFROM: extractedData?.travel_itinerary?.departure_from?.value || '',
        DEPARTUREDATE: extractedData?.travel_itinerary?.departure_date?.value || '',
        TRAVELINGCOUNTRY: extractedData?.travel_itinerary?.traveling_country?.value || '',
        ARRIVALDATE: extractedData?.travel_itinerary?.arrival_date?.value || '',
        ROUTE: extractedData?.travel_itinerary?.route?.value || ''
    };

    const submitDataToMaraekat = async (token: string) => {
        try {
            const workflowServiceUrl = import.meta.env.VITE_WORKFLOW_SERVICE_LOCAL || 'http://localhost:6007';
            const response = await fetch(`${workflowServiceUrl}/api/orient/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            console.log('Submit Response:', data.Result);

            if (!data.Result) {
                setResultMessage({ type: 'error', messages: ['API response was null. Submission failed.'] });
                return;
            }

            if (Array.isArray(data.Result)) {
                // Check if it's a success format (has BOOKINGSTATUS) or error format (has APISTATUS === 'FAILED' or ERRORDESC)
                const isSuccess = data.Result.some((item: any) => item.BOOKINGSTATUS);
                if (isSuccess) {
                    const successItem = data.Result.find((item: any) => item.BOOKINGSTATUS);
                    setResultMessage({
                        type: 'success',
                        messages: [`Booking No: ${successItem.BOOKINGNO}`, successItem.BOOKINGSTATUS]
                    });
                } else {
                    // Formulate error messages
                    const errors = data.Result.map((item: any) => `${item.ERRORCODE ? `[${item.ERRORCODE}] ` : ''}${item.ERRORDESC || 'Unknown Error'}`);
                    setResultMessage({ type: 'error', messages: errors });
                }
            } else {
                setResultMessage({ type: 'error', messages: ['Unexpected response format.'] });
            }
        } catch (error) {
            console.error('Submit Error:', error);
            setResultMessage({ type: 'error', messages: ['Network or server error occurred while submitting.'] });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setResultMessage(null);
        try {
            const token = await makeAuthentication();
            if (!token) {
                setResultMessage({ type: 'error', messages: ['Authentication failed'] });
                return;
            }
            await submitDataToMaraekat(token);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="relative">
            {resultMessage && <DraggableResultCard result={resultMessage} onClose={() => setResultMessage(null)} />}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-400 bg-white px-3 py-1 text-base font-light text-gray-500 transition-all duration-200 ease-in-out hover:border-blue-500 hover:bg-blue-400 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Submit
            </button>
        </div>
    );
};

export default SubmitToMaraekat;
