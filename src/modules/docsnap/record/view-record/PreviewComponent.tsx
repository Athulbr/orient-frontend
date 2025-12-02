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
                    className={`relative flex h-full flex-col gap-6 overflow-auto bg-gray-200 pt-8 pb-[45vh] shadow ${zoom > 120 ? 'items-start' : 'items-center'}`}
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
                    {/* <div className="max-w-200" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: innerHTML }} /> */}
                    <div className="absolute top-0 right-0 z-10 h-full w-1 shadow-2xl shadow-gray-500"></div>
                </div>
            )}
            <AnnotationLine bboxRef={bboxRef} />
        </div>
    );
};

const innerHTML = `<p>---------- Forwarded message ---------<br/>From: Shoulder Sleeper LLC &lt;<a href="mailto:quickbooks@notification.intuit.com">quickbooks@notification.intuit.com</a>&gt;<br/>Date: Fri, Nov 28, 2025 at 6:46&#x202F;PM<br/>Subject: Invoice - Reminder: Your payment to Shoulder Sleeper LLC is due<br/>To: &lt;<a href="mailto:invoicepay@rehabmart.com">invoicepay@rehabmart.com</a>&gt;</p><p>Your invoice is ready!<br/>BALANCE DUE$110.00<br/>View and pay<br/>&lt;<a href="https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8Ib7JikYF6PNXv5VK-2BAfeSpVHPRNy-2BFDtJ-2BhNUfKXTverofrKjvXVKH4ba5KbTX-2BS4WDVX8u-2FXjAUlXwZJvtq1G0rv1QQvMyiZGfn3ujbNrix4HbfcPIj1BGPqzxO-2FudOrpKoIWRF57Pzz-2Fzd7DLB681-2BTSa9DKw8Wyy2IYaNb3KVUj8j4XO36xrnjIkoiSpHmY6KJeQzbs5-2BDFzISKq3QvO-2B4FeMDGjql-2F3WNhWPzzAkRaWCA2Ny3f6FikyxkKqFId2j3Xo01XI9mYPHeiUlh9s-3Df8M7_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7H60oJRmbNU6Hz8DbYOKiGj9AYfUNVtDR5W0Un-2FEZTskBg20sXJKfHO-2FCbX7vjkRNZkW5P99-2B-2BDYCVyjwa1gxpWX7Ijx82JBP5-2Bs3Yf3ZYuWnndLYzneUwWOJAxdXCWxfjNgC89bFhGVo9FDxsVM6BC4ko9mRySZTLDqX-2Br4tRdZ9gKRgUIQSo8R1w2ZiKT-2FbM-3D%22>https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8Ib7JikYF6PNXv5VK-2BAfeSpVHPRNy-2BFDtJ-2BhNUfKXTverofrKjvXVKH4ba5KbTX-2BS4WDVX8u-2FXjAUlXwZJvtq1G0rv1QQvMyiZGfn3ujbNrix4HbfcPIj1BGPqzxO-2FudOrpKoIWRF57Pzz-2Fzd7DLB681-2BTSa9DKw8Wyy2IYaNb3KVUj8j4XO36xrnjIkoiSpHmY6KJeQzbs5-2BDFzISKq3QvO-2B4FeMDGjql-2F3WNhWPzzAkRaWCA2Ny3f6FikyxkKqFId2j3Xo01XI9mYPHeiUlh9s-3Df8M7_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7H60oJRmbNU6Hz8DbYOKiGj9AYfUNVtDR5W0Un-2FEZTskBg20sXJKfHO-2FCbX7vjkRNZkW5P99-2B-2BDYCVyjwa1gxpWX7Ijx82JBP5-2Bs3Yf3ZYuWnndLYzneUwWOJAxdXCWxfjNgC89bFhGVo9FDxsVM6BC4ko9mRySZTLDqX-2Br4tRdZ9gKRgUIQSo8R1w2ZiKT-2FbM-3D</a>></p><p>Dear Rehab Mart,</p><p>We&apos;re sending a reminder to let you know that invoice 10546 has not been<br/>paid. If you already paid this invoice or have any questions, let us know!</p><p>Have a great day!<br/>Shoulder Sleeper LLC<br/>Bill to<br/>Rehab Mart<br/>3651 Mars Hill Rd<br/>Bldg 2400<br/>Watkinsville, GA 30677 US<br/>Ship to<br/>Rehab Mart<br/>3651 Mars Hill Rd<br/>Bldg 2400<br/>Watkinsville, GA 30677 US<br/>Terms<br/>Due on receipt<br/>Shoulder Sleeper Pillow 2.0- Right-Handed, Large<br/>$110.00<br/>Right Large Drop ship<br/>RM290345<br/>1 X $110.00<br/>Subtotal $110.00<br/>Tax $0.00<br/>Total $110.00<br/>Balance due $110.00<br/>View and pay<br/>&lt;<a href="https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8Ib7JikYF6PNXv5VK-2BAfeSpVHPRNy-2BFDtJ-2BhNUfKXTverofrKjvXVKH4ba5KbTX-2BS4WDVX8u-2FXjAUlXwZJvtq1G0rv1QQvMyiZGfn3ujbNrix4HbfcPIj1BGPqzxO-2FudOrpKoIWRF57Pzz-2Fzd7DLB681-2BTSa9DKw8Wyy2IYaNb3KVUj8j4XO36xrnjIkoiSpHmY6KJeQzbs5-2BDFzISKq3QvO-2B4FeMDGjql-2F3WNhWPzzAkRaWCA2Ny3f6FikyxkKqFId2j3Xo01XI9mYPHeiUlh9s-3Df8M7_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7H60oJRmbNU6Hz8DbYOKiGj9AYfUNVtDR5W0Un-2FEZTskBg20sXJKfHO-2FCbX7vjkRNZkW5P99-2B-2BDYCVyjwa1gxpWX7Ijx82JBP5-2Bs3Yf3ZYuWnndLYzneUwWOJAxdXCWxfjNgC89bFhGVo9FDxsVM6BC4ko9mRySZTLDqX-2Br4tRdZ9gKRgUIQSo8R1w2ZiKT-2FbM-3D%22>https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8Ib7JikYF6PNXv5VK-2BAfeSpVHPRNy-2BFDtJ-2BhNUfKXTverofrKjvXVKH4ba5KbTX-2BS4WDVX8u-2FXjAUlXwZJvtq1G0rv1QQvMyiZGfn3ujbNrix4HbfcPIj1BGPqzxO-2FudOrpKoIWRF57Pzz-2Fzd7DLB681-2BTSa9DKw8Wyy2IYaNb3KVUj8j4XO36xrnjIkoiSpHmY6KJeQzbs5-2BDFzISKq3QvO-2B4FeMDGjql-2F3WNhWPzzAkRaWCA2Ny3f6FikyxkKqFId2j3Xo01XI9mYPHeiUlh9s-3Df8M7_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7H60oJRmbNU6Hz8DbYOKiGj9AYfUNVtDR5W0Un-2FEZTskBg20sXJKfHO-2FCbX7vjkRNZkW5P99-2B-2BDYCVyjwa1gxpWX7Ijx82JBP5-2Bs3Yf3ZYuWnndLYzneUwWOJAxdXCWxfjNgC89bFhGVo9FDxsVM6BC4ko9mRySZTLDqX-2Br4tRdZ9gKRgUIQSo8R1w2ZiKT-2FbM-3D</a>></p><p>Dear Sleeper LLC<br/>19 Beaver Dam Dr Westford, MA 018862204 US<br/>(973) 224-7257<br/><a href="mailto:Mike@shouldersleeper.com">Mike@shouldersleeper.com</a><br/>If you receive an email that seems fraudulent, please check with the<br/>business owner before paying.<br/>&lt;<a href="https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8IXstG0lQEhbKa7kC2V-2FUB64-2FNIV-2BoWMCwA7yCrcwS7-2B6M-2FLeZK03KycXQlp7clxLZCCB9Td-2Fl5uEyE6Ey-2Fb8esBRz3XdkamiIe4bKLA0I7trmJZa_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7EYlq3ZA-2F2QgP-2FweB-2Bm8DqSA6FnEBd4d7kg99lgdD9D3q6HTw6S7WVFp5VF7QhhdzsacTuklTxauMSQn4bjaO-2FVj9eXqwvFA8G1mxcUYrzPGU6FzoMtB7P-2FnKiMFhqiWLcBTddn5DacpYuzoMdd3wN8v4dgn8JBV9QJMtcQCxvJ2H3sUym6NNF9pl-2FfYlmmWto-3D%22>https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8IXstG0lQEhbKa7kC2V-2FUB64-2FNIV-2BoWMCwA7yCrcwS7-2B6M-2FLeZK03KycXQlp7clxLZCCB9Td-2Fl5uEyE6Ey-2Fb8esBRz3XdkamiIe4bKLA0I7trmJZa_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7EYlq3ZA-2F2QgP-2FweB-2Bm8DqSA6FnEBd4d7kg99lgdD9D3q6HTw6S7WVFp5VF7QhhdzsacTuklTxauMSQn4bjaO-2FVj9eXqwvFA8G1mxcUYrzPGU6FzoMtB7P-2FnKiMFhqiWLcBTddn5DacpYuzoMdd3wN8v4dgn8JBV9QJMtcQCxvJ2H3sUym6NNF9pl-2FfYlmmWto-3D</a>><br/>Intuit, Inc. All rights reserved.<br/>Privacy<br/>&lt;<a href="https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8IRdZldulIO-2FfHBdaZQ3lQSVSivbtMUkBnLZAIR0mpsEf63lZ_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7HpNMP1u024c16yLIm2PPNmZSpuS0ynmWf5L-2F-2FtY2pDFd4QzJ3jfH8YIxnEDx6PStysAvlkPaPAp7ql6RvWleXaUqRbDe4450fAyE7nbVUm59GOQUi-2FTyzjdYPqxzXwk9P2-2Fu2sQNa9rWz315yLPW7vET595V2D8V6OM0GA7pFuLHVV6uWWABBnBW2dNghVa-2B4-3D%22>https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8IRdZldulIO-2FfHBdaZQ3lQSVSivbtMUkBnLZAIR0mpsEf63lZ_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7HpNMP1u024c16yLIm2PPNmZSpuS0ynmWf5L-2F-2FtY2pDFd4QzJ3jfH8YIxnEDx6PStysAvlkPaPAp7ql6RvWleXaUqRbDe4450fAyE7nbVUm59GOQUi-2FTyzjdYPqxzXwk9P2-2Fu2sQNa9rWz315yLPW7vET595V2D8V6OM0GA7pFuLHVV6uWWABBnBW2dNghVa-2B4-3D</a>><br/>| Security<br/>&lt;<a href="https://links.notification.intuit.com/ls/click?upn=u001.gtgQaRUnrQjLNb12CbROu37hRisIXmdvc6X7p6DEpX1BipFPzs6SqPHPlxZTpg7pqgyF_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7FI0ybpsgIwoZGuFdAUN7aYj1rn5IaMLTXS34YfymvMX4GxdUD83kAUBWRO3M8XEwdR5LJ2MPiOAAdwIp8lFLnLo4br-2B-2FRySG-2BtnHHpD44e9A0H9AIiuutupq8YEZvG7BXWV9ppmxM8Skg2I4TDGWEfXqIxZMXhJujE4xgM4gie0NIGVxqaiBqPT0-2FtMnbZoH8-3D%22>https://links.notification.intuit.com/ls/click?upn=u001.gtgQaRUnrQjLNb12CbROu37hRisIXmdvc6X7p6DEpX1BipFPzs6SqPHPlxZTpg7pqgyF_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7FI0ybpsgIwoZGuFdAUN7aYj1rn5IaMLTXS34YfymvMX4GxdUD83kAUBWRO3M8XEwdR5LJ2MPiOAAdwIp8lFLnLo4br-2B-2FRySG-2BtnHHpD44e9A0H9AIiuutupq8YEZvG7BXWV9ppmxM8Skg2I4TDGWEfXqIxZMXhJujE4xgM4gie0NIGVxqaiBqPT0-2FtMnbZoH8-3D</a>><br/>| Terms of Service<br/>&lt;<a href="https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8Ib7JikYF6PNXv5VK-2BAfeSpWNlrboasHRFFqee7onhKwBLM1mkrmbysYztJEs-2BhTNwg-3D-3DdWxE_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7H4nBESA-2F9okp-2B4s9bbtnICWwHj3ze1QwNwtWNV3hVHV6A1H1jRCN46r6pyKbSIvcC-2ByTjn-2BYtwjy1ZUog6zZaWh5oPkhHUmXsykRtH8gmqacxcn4vN0FmLydX5YCl2RZPDxAgrq7B-2F-2BE96emoj4s0eW2G6DUrdA29I09nXW9Zw3cGC5lnPNFdVoanlQlTT-2FWU-3D">https://links.notification.intuit.com/ls/click?upn=u001.Hu9nToJLxsJSQR8ZHWn8Ib7JikYF6PNXv5VK-2BAfeSpWNlrboasHRFFqee7onhKwBLM1mkrmbysYztJEs-2BhTNwg-3D-3DdWxE_9ChtwYuBGam28h6QiQfyHyiafekTCu-2FJnl-2BzBLuxSsvNSWByEue-2FtJ8XSuYtzOehT-2BJSat1l8s5IjVQJ3lpJGKitoUstm39BAOcBU5Jc-2BWEW0esWtMriPTkcE-2BMKjQ-2FPHW5oztJk-2BlM7GUwCIA6opbK08ZMnWmp3w5g4WPnMz3jRYg7Q-2Ff4O0BzGlfBgzoZUNt5eiduBWQ-2Fici0o7bJPuNKFmhiW1CJbfmo8CUfBh4mUrUlWEDbIgwoka8fO16-2FlANCMR-2FIkkDOPPK1ls1J-2Fj8K4HRhTsb1QcA4WgGm6jtgcuVbJbnUC-2BseOaafUljor8fq86j7oCm9x2GWl-2B3Sx-2BQWm7t5a91LKFeEEXu8FvJF6wug1pv5T4kFvf9CLLkGtWOFT-2BOKUqHtf5-2FZ4Uwq3j9tsGszY5Dk43VSA-2FmuS8z-2BKEEtrCCJPq-2F6FWVakv8WKfszILbFwqlghpXiVWsET4BbybtnjjDRLPmCiAblqpCaQHQvVDUt6MCgM-2FeP3P1HIkoRfhMbsKGrPGk5zOwIkHYK7xCB0OhtS0mK08oAiglCTHuuxe9drhbB1McV0cWNFd6qoUkmXwWUzcG8uGbrkzqvK7IPqm1lT6d-2Ft7q-2BbAR9mW6MZkxZb0towRHaCYi6i1GQsAWoUyPgKR0ehURFlEmiD4DbbJ8W5wbWnmB8ZOHOXSF4IkFpGtinIHXF-2BsVeR4fbYWpzGBzr-2FQTdu4mzK-2Bej8nuGBAip7o3cqV1-2BqfTpt5ezZLgMRTVQbFkk49i6xZFFIwN0KO3cksJs2NogRwtYvKmLWntw-2FanDRTg66uxi-2BVV8MGY4kQzqe5hqqXSVu46eZeO1H0Ffdydn9fsBnS8oECgL34Q9-2FtCkW5fh0oW39PR2KEnhhLHfYhoiBI8H-2FazcPGTOCuxBlRVhnvBb4pmIyrezD-2BFm7KNLAKJ7qEC0Kag-2BBmnMfgISoj4dO5onS-2B0cDLxoW3lTlmLRKyaatQHGhNwVtXTByMAal0LuXQY0sBTJzA8WmldZDdyv5RgTohtEILFy4nIp9cVCayszVQHSHGobaXqJYmSxXFkUrShLukRwzGHe3QXK2OFOsubyHiLG6Dl5ZDzGsv0CiYzoP-2BZhCsx7lkDMRMWnBTl9-2F2EVoW-2B-2FMaDmvQzG2Hcdspw72C4KLeEE9CnX6cuCWc5QmxBtFsUCiNTAAL7nJj3zcf7H4nBESA-2F9okp-2B4s9bbtnICWwHj3ze1QwNwtWNV3hVHV6A1H1jRCN46r6pyKbSIvcC-2ByTjn-2BYtwjy1ZUog6zZaWh5oPkhHUmXsykRtH8gmqacxcn4vN0FmLydX5YCl2RZPDxAgrq7B-2F-2BE96emoj4s0eW2G6DUrdA29I09nXW9Zw3cGC5lnPNFdVoanlQlTT-2FWU-3D</a>&gt;</p>`;
const innerHTML1 = `<p>---------- Forwarded message ---------<br/>From: &lt;<a href="mailto:belinda@clinton-ind.com">belinda@clinton-ind.com</a>&gt;<br/>Date: Fri, Nov 28, 2025 at 7:46&#x202F;PM<br/>Subject: Invoice from Clinton Industries, Inc.<br/>To: &lt;<a href="mailto:accounting@rehabmart.com">accounting@rehabmart.com</a>&gt;, &lt;<a href="mailto:invoicepay@rehabmart.com">invoicepay@rehabmart.com</a>&gt;, &lt;<br/><a href="mailto:order@rehabmart.com">order@rehabmart.com</a>&gt;</p><p>Dear Customer :</p><p>Your invoice appears below. Please remit payment at your earliest<br/>convenience.</p><p>Thank you for your business - we appreciate it very much.</p><p>Sincerely,</p><p>Clinton Industries, Inc.</p>`;
