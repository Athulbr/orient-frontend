import { CircleUser, Menu } from 'lucide-react';
import { MakezLogoHeader } from '../../assets/svg-icons/MakezLogoHeader';
import { useToastStore } from '../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '../../components/Dropdown';
import ExtractionFloatingWindow from '../docsnap/upload-document/ExtractionFloatingWindow';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Button } from '../../components/Button';
import httpRequest from '../../global-utils/httpRequest';
import { SingleSelect } from '../../components/SingleSelect';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../zustand-store/SettingsStore';

interface HeaderComponentIF {
    showSidebar?: boolean;
    setShowSidebar: (state: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentIF> = ({ showSidebar, setShowSidebar }) => {
    const toast = useToastStore();
    const navigate = useNavigate();
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [tenantList, setTenantList] = useState([]);
    const { setSelectedTenant, selectedTenant } = useSettingsStore();

    const user = JSON.parse(window?.sessionStorage.getItem(`${'user'}`) as string);

    useEffect(() => {
        if (user?.role?.name !== 'superadmin') return;
        const getTenantList = async () => {
            const res = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/tenant/option-list`, {});
            setTenantList(res.data);
        };
        getTenantList();
    }, [user]);

    const logOut = async () => {
        const logoutRes = await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/auth/logout`, {});
        toast.success('Logged out successfully');
        if (isAuthenticated) {
            instance.logoutRedirect({
                postLogoutRedirectUri: import.meta.env.VITE_BASR_URL || 'https://demo.makez.ai'
            });
            return;
        }
        setTimeout(() => {
            window.sessionStorage.clear();
            window?.location?.replace('/');
        }, 500);
    };
    const onChangeDropDown = (e: string) => {
        if (e === 'Logout') logOut();
        if (e === 'Account') navigate(`/user/account/${user._id}`);
    };

    const callExtractionApi = async () => {
        await httpRequest('POST', 'http://localhost:4000/idp/document-extractor/v1', payload);
    };

    return (
        // <div className="flex min-h-16 justify-between bg-black">
        // <div className="flex min-h-16 justify-between bg-[#042443]">
        <div className="flex min-h-16 justify-between bg-[#012D56]">
            {!showSidebar && (
                <div tabIndex={0} className="flex h-17 w-16 items-center justify-center md:hidden">
                    <Menu onClick={() => setShowSidebar(true)} className="cursor-pointer" color="white" size={30} />
                </div>
            )}
            <div tabIndex={0} className="flex h-full cursor-pointer items-center md:pl-6" onClick={() => navigate('/')}>
                <MakezLogoHeader />
            </div>
            <div className="flex flex-1 items-center justify-end">
                <div className="hidden items-center gap-6 px-6 md:flex">
                    {/* <LogIn tabIndex={0} onClick={refreshAuth} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
                    {/* <CircleHelp tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          <Bell tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
                    {user?.role?.name === 'superadmin' && (
                        <SingleSelect className="min-w-40" value={selectedTenant} onValueChange={e => setSelectedTenant(e)} options={tenantList} />
                    )}
                    <Dropdown onChange={onChangeDropDown} options={['Account', 'Logout']}>
                        <span className="flex items-center gap-2 text-sm text-gray-300 capitalize">
                            <CircleUser size={20} className="cursor-pointer text-gray-300 hover:text-white" />
                            {user?.firstName}
                        </span>
                    </Dropdown>
                    <Button hidden onClick={callExtractionApi}>
                        Call API
                    </Button>
                    {/* <Dropdown onChange={onChangeDropDown} options={['Light', 'Dark', 'Default']}>
            <Sun size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          </Dropdown> */}

                    {/* <Settings tabIndex={0} onClick={() => navigate('/config')} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
                    {/* <MoonStar size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
                </div>
            </div>
            <ExtractionFloatingWindow />
        </div>
    );
};

export default HeaderComponent;

const payload = {
    templateFields: [
        {
            name: 'Basic Information',
            dataType: 'dict',
            jsonKey: 'basic_info',
            excludeExtraction: false,
            description: 'Basic Information',
            instruction: 'Extract Basic Information from the Invoice',
            isHidden: false,
            subFields: [
                {
                    name: 'Delear Name',
                    dataType: 'str',
                    jsonKey: 'delear_name',
                    required: false,
                    excludeExtraction: false,
                    description: 'Main Delear Name',
                    instruction:
                        "Extract Main Delear Name in the doc.\n Look at the top portion of the PDF. \n The dealer's name will usually be written in a prominent or uppercase format (e.g., V.R.ENTERPRISES) near the top. \n Only extract values from the top section of the document (before product or billing details begin). \n Ignore “Buyer” or “Consignee” sections – they are not the dealer.",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40c6'
                },
                {
                    name: 'Delear Branch',
                    dataType: 'str',
                    jsonKey: 'delear_branch',
                    required: false,
                    excludeExtraction: false,
                    description: 'Main Delear Branch',
                    instruction:
                        'Extract Main Delear branch in the doc.\n Look at the top portion of the PDF. \n The branch is typically the city or location associated with the address directly beneath the dealer name (e.g., RAIPUR). \n Only extract values from the top section of the document (before product or billing details begin). \n Ignore “Buyer” or “Consignee” sections – they are not the dealer. \n Normalize branch casing to Title Case (e.g., Raipur, Ahmedabad).',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40c7'
                },
                {
                    name: 'Sub-dealer Name',
                    dataType: 'str',
                    jsonKey: 'sub_dealer',
                    required: false,
                    excludeExtraction: false,
                    description: 'Name of the Sub-dealer (could be buyer, consignee, or ship-to party)',
                    instruction:
                        "Extract the name of the Sub-dealer from the document.\nThis is typically labeled as 'Buyer', 'Consignee', or 'Ship To'.\nLook below the Main Dealer section, after the top portion of the document.\nPrioritize the first 'Buyer', 'Consignee', or 'Ship To' label.",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40c8'
                },
                {
                    name: 'Invoice No.',
                    dataType: 'str',
                    jsonKey: 'invoice',
                    required: false,
                    excludeExtraction: false,
                    description: 'extarct invoice',
                    instruction: 'Extract invoice in the doc',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40c9'
                },
                {
                    name: 'Dated',
                    dataType: 'str',
                    jsonKey: 'invoice_date',
                    required: false,
                    excludeExtraction: false,
                    description: 'extarct invoice date',
                    instruction: 'Extract invoice date in the doc',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40ca'
                },
                {
                    name: 'Delivery Note',
                    dataType: 'str',
                    jsonKey: 'delivery_note',
                    required: false,
                    excludeExtraction: false,
                    description: 'extarct Delivery Note',
                    instruction: 'Extract Delivery Note in the doc',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40cb'
                },
                {
                    name: 'Delivery Note Date',
                    dataType: 'str',
                    jsonKey: 'delivery_note_date',
                    required: false,
                    excludeExtraction: false,
                    description: 'extarct Delivery Note Date',
                    instruction: 'Extract Delivery Note Date in the doc',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40cc'
                },
                {
                    name: 'CGST',
                    dataType: 'str',
                    jsonKey: 'cgst',
                    required: false,
                    excludeExtraction: false,
                    description: 'Extract total CGST',
                    instruction: 'Extract the CGST if present. If not leave it as blank.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40cd'
                },
                {
                    name: 'SGST',
                    dataType: 'str',
                    jsonKey: 'sgst',
                    required: false,
                    excludeExtraction: false,
                    description: 'Extract total SGST',
                    instruction: 'Extract the SGST if present. If not leave it as blank.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40ce'
                },
                {
                    name: 'Total Tax',
                    dataType: 'str',
                    jsonKey: 'total_tax',
                    required: false,
                    excludeExtraction: false,
                    description: 'extarct Total tax',
                    instruction: 'Extract Total tax Amount in the doc',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40cf'
                },
                {
                    name: 'Total Amount',
                    dataType: 'str',
                    jsonKey: 'total_amount',
                    required: false,
                    excludeExtraction: false,
                    description: 'extarct Total Amount',
                    instruction: 'Extract Total Amount in the doc',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d0'
                }
            ],
            _id: '68931921af5ce6bc525f40c5'
        },
        {
            name: 'line items',
            dataType: 'list',
            jsonKey: 'line_items',
            required: true,
            excludeExtraction: false,
            description:
                'Extract all ordered line items from the table. Each row should correspond to a single HSN/SAC, even if other details like quantity, amount, or description are missing. Use the HSN/SAC as the anchor for each row. If other column details are present (such as quantity, amount, rate, rate ( Inclusive of tax), Per / Each goods, Discount %, SGST, CGST, description), include them appropriately; otherwise, leave them blank.',
            instruction:
                'Extract all line items from the table found in the document. Each item must be represented as a separate row, anchored by the presence of an HSN/SAC value or similar product identifier. You must extract all the following fields for each line item: `serial_no`, `description`, `hsn/sac`, `quantity`, `rate_with_tax`, `rate`, `discount`, and `amount`.\n\n**Do not skip any fields**, even if some of them are blank or missing in the source. If a value is missing, use an appropriate default:\n- Use `"0.0"` for `rate_with_tax`, `rate`, and `amount`\n- Use `"0"` for `discount`\n- Use empty string `""` for `description`, `hsn/sac`, `serial_no`, or `quantity` if not available\n\nDo not combine or split rows. Preserve the structure of each line item as shown in the document. Do not omit optional or blank fields — they must still be present in the output with their default values. All rows must contain all the specified fields, even if some fields are empty or zero.',
            isHidden: false,
            subFields: [
                {
                    name: 'S.No',
                    dataType: 'str',
                    jsonKey: 'serial_no',
                    required: false,
                    excludeExtraction: false,
                    description: 'Extract S.No',
                    instruction: 'Extract the Serial No if present. lf not list it order wise based on number of rows',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d2'
                },
                {
                    name: 'Description',
                    dataType: 'str',
                    jsonKey: 'description',
                    required: false,
                    excludeExtraction: false,
                    description: 'Item description',
                    instruction:
                        "Extract only the description and remove any SKU number, alphanumeric codes, or suffixes and prefixes like 'Vendor Catalog #:', 'Model:', 'HSN/SAC', 'MFR NO #:', or 'Item #'. Remove any text after 'Model:' or similar words if present.",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d3'
                },
                {
                    name: 'HSN/SAC',
                    dataType: 'str',
                    jsonKey: 'hsn/sac',
                    required: false,
                    excludeExtraction: false,
                    description: 'HSN/SAC',
                    instruction: "Extract the 'HSN/SAC' from the description or HSN/SAC from table or line items if present. lf not leave it as blank.",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d4'
                },
                {
                    name: 'Quantity',
                    dataType: 'str',
                    jsonKey: 'quantity',
                    required: false,
                    excludeExtraction: false,
                    description: 'Quantity',
                    instruction:
                        "Extract the quantity value from each line item. Look for columns or text labeled with terms like 'Quantity', 'Qty', 'QTY', 'QTY.', or similar variations. Extract the numerical value and convert it to an integer. Ignore any non-numeric characters or units (e.g., 'pcs', 'units', etc.). If the quantity is presented as a decimal (e.g., 2.0), round it or convert it to an integer. Only include valid positive numbers.",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d5'
                },
                {
                    name: 'Rate (Incl.of tax)',
                    dataType: 'str',
                    jsonKey: 'rate_with_tax',
                    required: false,
                    excludeExtraction: false,
                    description: 'Rate inclusive of tax',
                    instruction:
                        'Extract the Rate inclusive of tax as a float, removing any currency symbols. If value is not available give 0.0, Always include this field in the output.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d6'
                },
                {
                    name: 'Rate',
                    dataType: 'str',
                    jsonKey: 'rate',
                    required: false,
                    excludeExtraction: false,
                    description: 'Rate Exclusive of tax',
                    instruction:
                        'Extract the Rate Exclusive of tax as a float, removing any currency symbols. If value is not available give 0.0, Always include this field in the output.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d7'
                },
                {
                    name: 'Discount',
                    dataType: 'str',
                    jsonKey: 'discount',
                    required: false,
                    excludeExtraction: false,
                    description: 'Extract discount from the line items/table',
                    instruction:
                        'Extract the discount, removing percentile symbols. If value is not available give 0.0, Always include this field in the output.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d8'
                },
                {
                    name: 'Amount',
                    dataType: 'str',
                    jsonKey: 'amount',
                    required: false,
                    excludeExtraction: false,
                    description: 'Total price for the each item',
                    instruction: 'Extract the price for each line item as a float, removing any currency symbols. If value is not available give 0.0',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40d9'
                }
            ],
            _id: '68931921af5ce6bc525f40d1'
        },
        {
            name: 'Bank Details',
            dataType: 'dict',
            jsonKey: 'bank_details',
            excludeExtraction: false,
            description: 'Extract Company Bank Details from the Invoice',
            instruction: 'Extract Company Bank Details from the invoice',
            isHidden: false,
            subFields: [
                {
                    name: 'Bank Name',
                    dataType: 'str',
                    jsonKey: 'bank_name',
                    required: false,
                    excludeExtraction: false,
                    description: 'extract company bank name',
                    instruction: 'Extract company bank name. Sometimes its available before the a/c number.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40db'
                },
                {
                    name: 'Account Number',
                    dataType: 'str',
                    jsonKey: 'account_number',
                    required: false,
                    excludeExtraction: false,
                    description: "extract company's bank account number",
                    instruction: 'Extract company bank account number. Sometimes its labeled as a/c no. or a/c or A/c.',
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40dc'
                },
                {
                    name: 'Branch name',
                    dataType: 'str',
                    jsonKey: 'branch_name',
                    required: false,
                    excludeExtraction: false,
                    description: "extract company's Branch name",
                    instruction: "Extract company's Branch name if its available. If not leave it blank. Usually its available along with IFSC code",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40dd'
                },
                {
                    name: 'IFSC code',
                    dataType: 'str',
                    jsonKey: 'ifsc_code',
                    required: false,
                    excludeExtraction: false,
                    description: "Extract company's IFSC code or Branch code",
                    instruction:
                        "Extract company's IFSC code or Branch code if its available. If not leave it blank. Usually its available after the branch name",
                    isHidden: false,
                    _id: '68931921af5ce6bc525f40de'
                }
            ],
            _id: '68931921af5ce6bc525f40da'
        }
    ],
    fileName: 'A-STONE_WORLD_BILL_.pdf',
    schema: {
        basic_info: {
            type: 'dict',
            description: 'Basic Information',
            instruction: 'Extract Basic Information from the Invoice',
            fields: {
                delear_name: {
                    type: 'str',
                    description: 'Main Delear Name',
                    instruction:
                        "Extract Main Delear Name in the doc.\n Look at the top portion of the PDF. \n The dealer's name will usually be written in a prominent or uppercase format (e.g., V.R.ENTERPRISES) near the top. \n Only extract values from the top section of the document (before product or billing details begin). \n Ignore “Buyer” or “Consignee” sections – they are not the dealer."
                },
                delear_branch: {
                    type: 'str',
                    description: 'Main Delear Branch',
                    instruction:
                        'Extract Main Delear branch in the doc.\n Look at the top portion of the PDF. \n The branch is typically the city or location associated with the address directly beneath the dealer name (e.g., RAIPUR). \n Only extract values from the top section of the document (before product or billing details begin). \n Ignore “Buyer” or “Consignee” sections – they are not the dealer. \n Normalize branch casing to Title Case (e.g., Raipur, Ahmedabad).'
                },
                sub_dealer: {
                    type: 'str',
                    description: 'Name of the Sub-dealer (could be buyer, consignee, or ship-to party)',
                    instruction:
                        "Extract the name of the Sub-dealer from the document.\nThis is typically labeled as 'Buyer', 'Consignee', or 'Ship To'.\nLook below the Main Dealer section, after the top portion of the document.\nPrioritize the first 'Buyer', 'Consignee', or 'Ship To' label."
                },
                invoice: {
                    type: 'str',
                    description: 'extarct invoice',
                    instruction: 'Extract invoice in the doc'
                },
                invoice_date: {
                    type: 'str',
                    description: 'extarct invoice date',
                    instruction: 'Extract invoice date in the doc'
                },
                delivery_note: {
                    type: 'str',
                    description: 'extarct Delivery Note',
                    instruction: 'Extract Delivery Note in the doc'
                },
                delivery_note_date: {
                    type: 'str',
                    description: 'extarct Delivery Note Date',
                    instruction: 'Extract Delivery Note Date in the doc'
                },
                cgst: {
                    type: 'str',
                    description: 'Extract total CGST',
                    instruction: 'Extract the CGST if present. If not leave it as blank.'
                },
                sgst: {
                    type: 'str',
                    description: 'Extract total SGST',
                    instruction: 'Extract the SGST if present. If not leave it as blank.'
                },
                total_tax: {
                    type: 'str',
                    description: 'extarct Total tax',
                    instruction: 'Extract Total tax Amount in the doc'
                },
                total_amount: {
                    type: 'str',
                    description: 'extarct Total Amount',
                    instruction: 'Extract Total Amount in the doc'
                }
            }
        },
        line_items: {
            type: 'list',
            description:
                'Extract all ordered line items from the table. Each row should correspond to a single HSN/SAC, even if other details like quantity, amount, or description are missing. Use the HSN/SAC as the anchor for each row. If other column details are present (such as quantity, amount, rate, rate ( Inclusive of tax), Per / Each goods, Discount %, SGST, CGST, description), include them appropriately; otherwise, leave them blank.',
            instruction:
                'Extract all line items from the table found in the document. Each item must be represented as a separate row, anchored by the presence of an HSN/SAC value or similar product identifier. You must extract all the following fields for each line item: `serial_no`, `description`, `hsn/sac`, `quantity`, `rate_with_tax`, `rate`, `discount`, and `amount`.\n\n**Do not skip any fields**, even if some of them are blank or missing in the source. If a value is missing, use an appropriate default:\n- Use `"0.0"` for `rate_with_tax`, `rate`, and `amount`\n- Use `"0"` for `discount`\n- Use empty string `""` for `description`, `hsn/sac`, `serial_no`, or `quantity` if not available\n\nDo not combine or split rows. Preserve the structure of each line item as shown in the document. Do not omit optional or blank fields — they must still be present in the output with their default values. All rows must contain all the specified fields, even if some fields are empty or zero.',
            is_list: true,
            fields: {
                serial_no: {
                    type: 'str',
                    description: 'Extract S.No',
                    instruction: 'Extract the Serial No if present. lf not list it order wise based on number of rows'
                },
                description: {
                    type: 'str',
                    description: 'Item description',
                    instruction:
                        "Extract only the description and remove any SKU number, alphanumeric codes, or suffixes and prefixes like 'Vendor Catalog #:', 'Model:', 'HSN/SAC', 'MFR NO #:', or 'Item #'. Remove any text after 'Model:' or similar words if present."
                },
                'hsn/sac': {
                    type: 'str',
                    description: 'HSN/SAC',
                    instruction: "Extract the 'HSN/SAC' from the description or HSN/SAC from table or line items if present. lf not leave it as blank."
                },
                quantity: {
                    type: 'str',
                    description: 'Quantity',
                    instruction:
                        "Extract the quantity value from each line item. Look for columns or text labeled with terms like 'Quantity', 'Qty', 'QTY', 'QTY.', or similar variations. Extract the numerical value and convert it to an integer. Ignore any non-numeric characters or units (e.g., 'pcs', 'units', etc.). If the quantity is presented as a decimal (e.g., 2.0), round it or convert it to an integer. Only include valid positive numbers."
                },
                rate_with_tax: {
                    type: 'str',
                    description: 'Rate inclusive of tax',
                    instruction:
                        'Extract the Rate inclusive of tax as a float, removing any currency symbols. If value is not available give 0.0, Always include this field in the output.'
                },
                rate: {
                    type: 'str',
                    description: 'Rate Exclusive of tax',
                    instruction:
                        'Extract the Rate Exclusive of tax as a float, removing any currency symbols. If value is not available give 0.0, Always include this field in the output.'
                },
                discount: {
                    type: 'str',
                    description: 'Extract discount from the line items/table',
                    instruction:
                        'Extract the discount, removing percentile symbols. If value is not available give 0.0, Always include this field in the output.'
                },
                amount: {
                    type: 'str',
                    description: 'Total price for the each item',
                    instruction: 'Extract the price for each line item as a float, removing any currency symbols. If value is not available give 0.0'
                }
            }
        },
        bank_details: {
            type: 'dict',
            description: 'Extract Company Bank Details from the Invoice',
            instruction: 'Extract Company Bank Details from the invoice',
            fields: {
                bank_name: {
                    type: 'str',
                    description: 'extract company bank name',
                    instruction: 'Extract company bank name. Sometimes its available before the a/c number.'
                },
                account_number: {
                    type: 'str',
                    description: "extract company's bank account number",
                    instruction: 'Extract company bank account number. Sometimes its labeled as a/c no. or a/c or A/c.'
                },
                branch_name: {
                    type: 'str',
                    description: "extract company's Branch name",
                    instruction: "Extract company's Branch name if its available. If not leave it blank. Usually its available along with IFSC code"
                },
                ifsc_code: {
                    type: 'str',
                    description: "Extract company's IFSC code or Branch code",
                    instruction:
                        "Extract company's IFSC code or Branch code if its available. If not leave it blank. Usually its available after the branch name"
                }
            }
        }
    },
    recordId: '689b5187264a23989f9f365d'
};
