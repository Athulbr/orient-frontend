import OrientDocsnapUserInterface from './orient/orient-docsnap';

const dynamicUserInterfaces = {
    orientDocsnap: OrientDocsnapUserInterface
};
const getDynamicUserInterface = (agentSettings: any) => {
    const DynamicUI = dynamicUserInterfaces[agentSettings?.uiId as keyof typeof dynamicUserInterfaces] || null;
    return <DynamicUI agentSettings={agentSettings} />;
};

export default getDynamicUserInterface;
