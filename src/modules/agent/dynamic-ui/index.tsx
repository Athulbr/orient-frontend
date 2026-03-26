import OrientDocsnapUserInterface from './orient/orient-docsnap';

const dynamicUserInterfaces = {
    orientDocsnap: OrientDocsnapUserInterface
};
const getDynamicUserInterface = (name: string) => {
    return dynamicUserInterfaces[name as keyof typeof dynamicUserInterfaces] || null;
};

export default getDynamicUserInterface;
