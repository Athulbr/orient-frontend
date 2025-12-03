import { FC, useState, useRef, useEffect, Fragment } from 'react';
import { Download, Expand, Shrink, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../../../global-utils/twMerge';
import BackButton from '../../../../components/BackButton';
import { PreviewHeaderComponent } from './components/PreviewHeader';
import { formatFieldLabel } from './utils';
import { useViewRecordState } from './hooks/viewRecordContext';
import { BoundingBox } from './components/BoundingBox';
import { HoveredFieldCard } from './components/HoveredFieldCard';
import { AnnotationLine } from './components/AnnotationLine';
import { LoadingDataSpinner } from './components/Loaders';
import Spinner from '../../../../components/Spinner';
import FullScreenLoader from '../../../../components/FullScreenLoader';
interface PreviewComponentProps {
    fieldRefs: any;
    containerRef: any;
}
interface WirePoints {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export const PreviewComponent: FC<PreviewComponentProps> = ({ fieldRefs, containerRef }) => {
    const [zoom, setZoom] = useState(100);
    const [shrinked, setShrinked] = useState(true);
    const imageContainerRef = useRef<HTMLDivElement | null>(null);
    const { state, setState } = useViewRecordState();
    const bboxRef = useRef<Record<string, HTMLDivElement | null>>({});
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateWirePosition = () => {
        try {
            const boxEl = bboxRef.current[1234];

            const containerBox = containerRef.current?.getBoundingClientRect();
            if (!boxEl || !containerBox) return;

            const stBox = boxEl.getBoundingClientRect();
            const x1 = stBox.left - containerBox.left + stBox.width;
            const y1 = stBox.top + stBox.height / 2 - containerBox.top;

            setState(prev => ({
                ...prev,
                wire: {
                    x1,
                    y1,
                    x2: prev?.wire?.x2 || 0,
                    y2: prev?.wire?.y2 || 0
                } as WirePoints
            }));
        } catch (error) {
            console.error('Error updating wire position:', error);
        }
    };

    useEffect(() => {
        updateWirePosition();

        const container = imageContainerRef.current;
        const fieldEl = bboxRef.current[1234];
        if (!container || !fieldEl) return;

        const containerRect = container.getBoundingClientRect();
        const fieldRect = fieldEl.getBoundingClientRect();

        // Calculate vertical scroll amount
        const bboxCenterY = fieldRect.top + fieldRect.height / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;
        const scrollAmountY = bboxCenterY - containerCenterY;

        // Calculate horizontal scroll amount
        const bboxCenterX = fieldRect.left + fieldRect.width / 2;
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const scrollAmountX = bboxCenterX - containerCenterX;

        container.scrollTo({
            top: container.scrollTop + scrollAmountY,
            left: container.scrollLeft + scrollAmountX,
            behavior: 'smooth'
        });
    }, [state.hoveredFieldId, zoom, state.leftWidthPercent]);

    useEffect(() => {
        const container = imageContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            requestAnimationFrame(updateWirePosition);

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {}, 150);
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [containerRef]);

    const zoomIn = () => {
        const newZoom = Math.min(zoom + 10, 250);
        setZoom(newZoom);
    };

    const zoomOut = () => {
        const newZoom = Math.max(zoom - 10, 30);
        setZoom(newZoom);
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = Number(e.target.value);
        setZoom(newZoom);
    };

    useEffect(() => {
        if (state.hoveredFieldId) return;
        if (zoom > 130 && imageContainerRef.current) {
            const container = imageContainerRef.current;
            const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [zoom]);

    const shrinkExpandHandler = () => {
        setZoom(shrinked ? 110 : 60);
        setShrinked(!shrinked);
    };

    const handleFieldClick = (hoveredFieldId: string, bbox: any, pageNumber: number) => {
        if (bbox) {
            const fieldEl = fieldRefs.current[hoveredFieldId];
            const containerBox = containerRef.current?.getBoundingClientRect();

            let wireCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };

            if (fieldEl && containerBox) {
                const fieldBox = fieldEl.getBoundingClientRect();
                wireCoords = {
                    x1: 0,
                    y1: 0,
                    x2: state.hoveredOnArrayField ? fieldBox.left + fieldBox.width / 2 : fieldBox.left,
                    y2: state.hoveredOnArrayField ? fieldBox.top : fieldBox.top + fieldBox.height / 2
                };
            }

            setState(prev => ({
                ...prev,
                bbox,
                hoveredFieldId,
                pageNumber,
                wire: wireCoords
            }));
        }
    };
    const handleValueChange = (value: string) => {
        const keysArray = state.hoveredFieldId?.split(':');

        if (keysArray?.length === 3) {
            const [fieldType, fieldKey, subFieldKey] = keysArray;
            setState(prev => {
                const newState = { ...prev };
                if (fieldType === 'objectFields') {
                    newState.objectFields = {
                        ...prev.objectFields,
                        [fieldKey]: {
                            ...prev.objectFields[fieldKey],
                            [subFieldKey]: {
                                ...prev.objectFields[fieldKey][subFieldKey],
                                value
                            }
                        }
                    };
                }
                return newState;
            });
        }
        if (keysArray?.length === 4) {
            const [fieldType, fieldKey, subFieldKey, subSubFieldKey] = keysArray;
            setState(prev => ({
                ...prev,
                arrayFields: prev.arrayFields.map((table, tableIdx) => {
                    if (tableIdx !== Number(fieldKey)) return table;
                    return {
                        ...table,
                        [subFieldKey]: {
                            ...table[subFieldKey],
                            [subSubFieldKey]: {
                                ...table[subFieldKey][subSubFieldKey],
                                value
                            }
                        }
                    };
                })
            }));
        }
    };

    const handleCheckToggle = (checked?: boolean) => {
        const hoveredFieldId = state.hoveredFieldId;
        const keysArray: any = hoveredFieldId?.split(':') ?? [];
        if (keysArray.length === 3) {
            const [fieldType, fieldKey, subFieldKey] = keysArray;
            setState(prev => {
                const newState = { ...prev };
                newState.objectFields[fieldKey][subFieldKey].checked = Boolean(checked);
                return newState;
            });
        }
        if (keysArray.length === 4) {
            const [fieldType, fieldKey, subFieldKey, subSubFieldKey] = keysArray;
            setState(prev => {
                const newState = { ...prev };
                // @ts-ignore
                newState.arrayFields[fieldKey][subFieldKey][subSubFieldKey].checked = Boolean(checked);
                return newState;
            });
        }
    };

    const getHoveredField = () => {
        const hoveredFieldId = state.hoveredFieldId;
        const keysArray = hoveredFieldId?.split(':');

        if (keysArray?.length === 3) {
            const [fieldType, fieldKey, subFieldKey] = keysArray;
            if (fieldType === 'arrayFields') {
                const tableIndex = Number(fieldKey);
                const table = state.arrayFields[tableIndex];
                if (!table) return null;
                const row = table[subFieldKey];
                if (!row) return null;
                return row;
            }
            if (fieldType === 'objectFields') {
                return state.objectFields[fieldKey]?.[subFieldKey] || null;
            }
            return null;
        }
        if (keysArray?.length === 4) {
            const [fieldType, fieldKey, subFieldKey, subSubFieldKey] = keysArray;
            if (fieldType === 'arrayFields') {
                const tableIndex = Number(fieldKey);
                const table = state.arrayFields[tableIndex];
                if (!table) return null;
                const row = table[subFieldKey];
                if (!row) return null;
                const data = row[subSubFieldKey];
                if (!data) return null;
                return data;
            }
            return null;
        }
        return null;
    };
    const arrayLength = state.hoveredFieldId?.split(':').length;
    const mainKey = state.hoveredFieldId?.split(':')[0] as string;
    const subKey = state.hoveredFieldId?.split(':')[1] as string;
    const subSubKey = (state.hoveredFieldId?.split(':')[2] as string) || '';
    const label = (state.hoveredFieldId?.split(':')[3] as string) || '';

    return (
        <div className="flex h-full w-full flex-col">
            <PreviewHeaderComponent
                zoom={zoom}
                zoomOut={zoomOut}
                zoomIn={zoomIn}
                handleZoomChange={handleZoomChange}
                shrinked={shrinked}
                shrinkExpandHandler={shrinkExpandHandler}
                name={state.record?.name}
            />

            {state.loadingS3File ? (
                <div className="flex h-full w-full flex-col items-center justify-center">
                    <FullScreenLoader text="Loading Document..." />
                </div>
            ) : (
                <div
                    ref={imageContainerRef}
                    className={`relative flex h-full flex-col gap-6 overflow-auto bg-gray-200 pt-8 shadow ${zoom > 120 ? 'items-start' : 'items-center'}`}
                >
                    {state.images.map((imgSrc, index) => (
                        <div
                            className="relative w-fit bg-green-500 shadow-xl shadow-gray-400"
                            style={{
                                width: `${zoom - 10}%`,
                                height: 'auto'
                            }}
                            key={index}
                        >
                            {(state.reExtracting || (state.generatingInvoice && state.tabIndex === 2)) && (
                                <div className="absolute top-0 left-0 z-1000 flex h-full w-full items-center justify-center overflow-hidden border-3 border-sky-300 bg-[#1fa9f033]">
                                    <div className="animate-scan animate-pdf-scanner absolute top-0 left-0 h-[10px] w-full bg-[rgba(98,209,243,0.8)] shadow-[0_0_10px_2px_rgba(98,209,243,0.8)]"></div>
                                </div>
                            )}
                            <img src={imgSrc} alt={`image-${index}`} className="h-full w-full transition-all duration-300" />
                            {/* ========================== Object Fields ========================== */}
                            {Object.entries(state.objectFields).map(([mainKey, mainValue], mainIndex) => {
                                return (
                                    <Fragment key={`${mainKey}_${mainIndex}`}>
                                        {Object.entries(mainValue).map(([key, field]: any, i: number) => {
                                            const bbox = field?.bbox;
                                            if (!bbox || `${field?.page}` !== `${index + 1}`) return null;
                                            const hoveredFieldId = `objectFields:${mainKey}:${key}`;

                                            return (
                                                <div
                                                    key={`${hoveredFieldId}_${i}_${field?.confidence}_${field?.page}_${mainKey}_${key}`}
                                                    className={`${field?.checked ? 'bg-[#53cd1b25]' : 'bg-[#dfea3f33]'} group absolute cursor-pointer hover:border-2 hover:border-blue-600`}
                                                    style={{
                                                        left: `${bbox.x_min * 100 - 0.4}%`,
                                                        top: `${bbox.y_min * 100 - 0.4}%`,
                                                        width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                                                        height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`
                                                    }}
                                                    onClick={() => {
                                                        if (state.reExtracting) return;
                                                        handleFieldClick(hoveredFieldId, bbox, index + 1);
                                                        setState(prev => ({
                                                            ...prev,
                                                            scrollToViewField: prev.scrollToViewField + 1,
                                                            hoveredOnArrayField: false,
                                                            selectedTableName: ''
                                                        }));
                                                    }}
                                                >
                                                    <div className="pointer-events-none absolute top-[-15px] left-0 z-10 mt-1 -translate-y-full rounded-md bg-gray-800 px-2 py-1 text-sm text-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                        {formatFieldLabel(key)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </Fragment>
                                );
                            })}
                            {/* ========================== Array Fields ========================== */}
                            {state.arrayFields.map((table, mainIndex) => {
                                return (
                                    <div key={`${mainIndex}`}>
                                        {Object.entries(table).map(([mainKey, row]: any, i: number) => {
                                            return (
                                                <div key={`${mainKey}_${i}`}>
                                                    {Object.entries(row).map(([key, field]: any, i: number) => {
                                                        const bbox = field?.bbox;
                                                        if (!bbox || field?.page !== index + 1) return null;
                                                        const hoveredFieldId = `arrayFields:${mainIndex}:${mainKey}:${key}`;
                                                        return (
                                                            <div
                                                                key={`${mainKey}_${i}`}
                                                                className={`${field?.checked ? 'bg-[#53cd1b48]' : 'bg-[#dfea3f33]'} group absolute cursor-pointer hover:border-2 hover:border-blue-600`}
                                                                style={{
                                                                    left: `${bbox.x_min * 100 - 0.4}%`,
                                                                    top: `${bbox.y_min * 100 - 0.4}%`,
                                                                    width: `${(bbox.x_max - bbox.x_min) * 100 + 0.8}%`,
                                                                    height: `${(bbox.y_max - bbox.y_min) * 100 + 0.6}%`
                                                                }}
                                                                onClick={() => {
                                                                    if (state.reExtracting) return;
                                                                    handleFieldClick(hoveredFieldId, bbox, index + 1);
                                                                    setState(prev => ({
                                                                        ...prev,
                                                                        scrollToViewField: prev.scrollToViewField + 1,
                                                                        hoveredOnArrayField: true,
                                                                        selectedTableName: state.tableNames[mainIndex]
                                                                    }));
                                                                }}
                                                            >
                                                                <div className="pointer-events-none absolute top-[-15px] left-0 z-10 mt-1 -translate-y-full rounded-md bg-gray-800 px-2 py-1 text-sm text-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                    {formatFieldLabel(key)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {state.bbox && state.tabIndex === 0 && !state.loadingS3File && index === state.pageNumber - 1 && (
                                <div
                                    ref={el => {
                                        bboxRef.current[1234] = el;
                                    }}
                                    className="absolute border-2 border-blue-600"
                                    style={{
                                        left: `${state.bbox.x_min * 100 - 0.4}%`,
                                        top: `${state.bbox.y_min * 100 - 0.4}%`,
                                        width: `${(state.bbox.x_max - state.bbox.x_min) * 100 + 0.8}%`,
                                        height: `${(state.bbox.y_max - state.bbox.y_min) * 100 + 0.6}%`
                                    }}
                                >
                                    {getHoveredField() && (
                                        <HoveredFieldCard
                                            hoveredField={getHoveredField()}
                                            hoveredFieldId={state.hoveredFieldId || ''}
                                            bbox={state.bbox}
                                            onValueChange={handleValueChange}
                                            onCheckToggle={handleCheckToggle}
                                            arrayLength={arrayLength}
                                            isChecked={
                                                arrayLength === 4
                                                    ? // @ts-ignore
                                                      state.arrayFields[Number(subKey)]?.[subSubKey]?.[label]?.checked || false
                                                    : arrayLength === 3
                                                      ? // @ts-ignore
                                                        state[mainKey]?.[subKey]?.[subSubKey]?.checked || false
                                                      : // @ts-ignore
                                                        state[mainKey]?.[subKey]?.checked || false
                                            }
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {state.inputText && state.inputText !== 'Email Body' && (
                        <div className="p-10 max-w-200 bg-white shadow-2xl shadow-gray-500">
                            <h2 className="font-semibold text-lg text-center">Email Body</h2>

                            {state.inputText.split('\n').map((line, index) => {
                                // const trackingId = state.objectFields?.order_details?.tracking_id?.value || '';
                                // const orderId = state.objectFields?.order_details?.order_id?.value || '';

                                // const isMatched =
                                //     (trackingId.length >= 5 && line.includes(trackingId.substring(0, 5))) ||
                                //     (orderId.length >= 5 && line.includes(orderId.substring(0, 5)));

                                return (
                                    <div key={index} className={`mt-2 overflow-x-hidden`}>
                                        {line}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="absolute top-0 right-0 z-10 h-full w-1 shadow-2xl shadow-gray-500"></div>
                </div>
            )}
            <AnnotationLine bboxRef={bboxRef} />
        </div>
    );
};

const innerText =
    "--------- Forwarded message ---------\nFrom: Bhuvaneswaran V <bhuvaneswaran.v@xfactr.ai>\nDate: Thu, Nov 20, 2025 at 12:11 PM\nSubject: UPS Ship Notification, Tracking Number 1ZE030W80393189853\nTo: admin@makez.ai <admin@makez.ai>\n\n\n\n[image: UPS logo]\n\n*You have a package coming.*\n*Estimated Delivery Date:*\nMonday, 11/10/2025\n*Estimated Delivery Time:*\nby 7:00 PM\n\nThis message was sent to you at the request of Sunset Healthcare Solutions\nInc to notify you that the shipment information below has been transmitted\nto UPS. The physical package may or may not have actually been tendered to\nUPS for shipment. To verify the actual transit status of your shipment,\nclick on the tracking link below.\nShipment Details\n------------------------------\n*From:*\nSUNSET HEALTHCARE SOLUTIONS\n*Tracking Number:*\n*1ZE030W80393189853\n<https://www.ups.com/track?loc=en_US&Requester=NES&tracknum=1ZE030W80393189853&AgreeToTermsAndConditions=yes&WT.z_eCTAid=ct1_eml_Tracking__ct1_eml_qvn_eml_5shp&WT.z_edatesent=11062025>*\n*Ship To:*\nShipping\nREHABMART, LLC\n3651 Mars Hill Rd\nBLDG 2400\nWatkinsville, GA 306775985\nUS\n*UPS Service:*\nUPS GROUND\n*Number of Packages:*\n1\n*Weight:*\n1.0 LBS\n*Reference Number 1:*\n909845\n*Reference Number 2:*\nRM289380\n\n© 2025 United Parcel Service of America, Inc. UPS, the UPS brandmark, and\nthe color brown are trademarks of United Parcel Service of America, Inc.\nAll rights reserved.\n\nAll trademarks, trade names, or service marks that appear in connection\nwith UPS's services are the property of their respective owners.\n\nPlease do not reply directly to this email. UPS will not receive any reply\nmessage.\n*Review the UPS Privacy Notice\n<https://www.ups.com/us/en/support/shipping-support/legal-terms-conditions/privacy-notice?WT.svl=eFooter>*\n*For Questions, Visit Our Help and Support Center\n<https://www.ups.com/us/en/support/tracking-support.page?WT.svl=eFooter>*\n";
const innerHTML1 = `<p>---------- Forwarded message ---------<br/>From: &lt;<a href="mailto:belinda@clinton-ind.com">belinda@clinton-ind.com</a>&gt;<br/>Date: Fri, Nov 28, 2025 at 7:46&#x202F;PM<br/>Subject: Invoice from Clinton Industries, Inc.<br/>To: &lt;<a href="mailto:accounting@rehabmart.com">accounting@rehabmart.com</a>&gt;, &lt;<a href="mailto:invoicepay@rehabmart.com">invoicepay@rehabmart.com</a>&gt;, &lt;<br/><a href="mailto:order@rehabmart.com">order@rehabmart.com</a>&gt;</p><p>Dear Customer :</p><p>Your invoice appears below. Please remit payment at your earliest<br/>convenience.</p><p>Thank you for your business - we appreciate it very much.</p><p>Sincerely,</p><p>Clinton Industries, Inc.</p>`;
