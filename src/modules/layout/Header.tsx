import { CircleUser, Menu } from 'lucide-react';
import { MakezLogoHeader } from '../../assets/svg-icons/MakezLogoHeader';
import { useToastStore } from '../../components/toast/ToastStore';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from '../../components/Dropdown';
import ExtractionFloatingWindow from '../docsnap/upload-document/ExtractionFloatingWindow';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Button } from '../../components/Button';
import httpRequest from '../../global-utils/httpRequest';

interface HeaderComponentIF {
    showSidebar?: boolean;
    setShowSidebar: (state: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentIF> = ({ showSidebar, setShowSidebar }) => {
    const toast = useToastStore();
    const navigate = useNavigate();
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const user = JSON.parse(window?.sessionStorage.getItem(`${'user'}`) as string);
    const logOut = () => {
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
        await httpRequest('POST', `${import.meta.env.VITE_NODE_URL}/api/idp/project/extract`, {
            s3FileName: 'PO_VA_636a8-r4k813_2.pdf',
            schema
        });
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

const schema = {
    basic_details: {
        type: 'dict',
        description: 'Basic Details',
        instruction: 'Extract Basic details from this purchase order',
        fields: {
            po_number: {
                type: 'str',
                description: 'Purchase Order Number',
                instruction:
                    "Look for labels such as 'PO Number', 'PO #', 'Purchase Order #','Service Authorization Number' or similar. Extract the full alphanumeric identifier without any prefixes."
            },
            contact_email: {
                type: 'str',
                description: 'contact Email',
                instruction: "Extract any valid email address associated with the buyer or purchasing department. It should contain an '@' symbol and a domain."
            },
            phone_number: {
                type: 'str',
                description: 'contact Phone Number',
                instruction: "Extract the complete phone number associated, including area code if available. don't include any vendor phone number"
            },
            contract_number: {
                type: 'str',
                description: 'Locate Contract Number and extract teh contract number if present.',
                instruction: "extract Contract Number or  '16. Contract Number' from the document. if not present keep the value as null."
            },
            subtotal: {
                type: 'str',
                description: 'Subtotal of all line items',
                instruction: 'Extract the subtotal amount before tax and shipping. convert it as float'
            },
            tax: {
                type: 'str',
                description: 'Total tax amount',
                instruction: 'Extract the total tax amount if specified. get it as float'
            },
            shipping_cost: {
                type: 'str',
                description: 'Shipping cost',
                instruction: 'Extract the shipping cost if specified. get it as float'
            },
            total_amount: {
                type: 'str',
                description: 'Total order amount including tax and shipping',
                instruction: 'Extract the final total amount of the order. get it as float'
            },
            quote_id: {
                type: 'str',
                description: 'Quote ID',
                instruction: 'Extract the quote ID from the document.'
            },
            discount: {
                type: 'str',
                description: 'discount cost',
                instruction: 'Extract the discounted cost if specified. get it as float'
            }
        }
    },
    ship_to: {
        type: 'dict',
        description: 'Shipping or Delivery Address',
        instruction:
            "Extract the shipping address from 'Ship to' or 'Shipping Address' or 'Delivery Instructions' or 'Delivery Address' or similar labels.get info which refers for shipping or delivery. understand and don't include vendor address or 'To' or any vendor details like rehabmart LLC and its details.",
        fields: {
            name: {
                type: 'str',
                description: 'Name of the recipient',
                instruction: 'Extract the full name of the person or facility receiving the shipment.'
            },
            attn: {
                type: 'str',
                description: 'Attention to (if present)',
                instruction: ''
            },
            street: {
                type: 'str',
                description: 'Street address including suite/unit if available',
                instruction: 'street of shipping address. in case not provided or unable to locate or extract keep the field empty. '
            },
            city: {
                type: 'str',
                description: 'City name',
                instruction: 'city of shipping address.in case not provided or unable to locate or extract keep the field empty. '
            },
            state: {
                type: 'str',
                description: 'State (two-letter abbreviation)',
                instruction: 'in case not provided or unable to locate or extract keep the field empty. '
            },
            zip: {
                type: 'str',
                description: 'ZIP code (5 or 9 digit format)',
                instruction: 'in case not provided or unable to locate or extract keep the field empty. '
            },
            phone_number: {
                type: 'str',
                description: "Veteran's phone number. Locate and Extract the Phone number from the Ship to adress if present. ",
                instruction: 'Extract the complete phone number from the ship to adress, including area code, if provided.'
            }
        }
    },
    bill_to: {
        type: 'dict',
        description: 'Billing Address or invoice address',
        instruction:
            "Extract billing address from labels like 'Bill To:' or 'Billing Address:' or 'invoice address' or 'invoice to' or similar. Do not include vendor addresses or 'To:' or email instructions. make sure you extract address which respect to billing information",
        fields: {
            bill_to_name: {
                type: 'str',
                description: 'name of the purchase agent who is making the purchase order',
                instruction: 'extract it from purchase agent field or from Fax page who is making purchase order. or received from whom'
            },
            attn: {
                type: 'str',
                description: 'Attention to (if present)',
                instruction: ''
            },
            street: {
                type: 'str',
                description: 'Street address including suite/unit if available',
                instruction: ''
            },
            city: {
                type: 'str',
                description: 'City name',
                instruction: ''
            },
            state: {
                type: 'str',
                description: 'State (two-letter abbreviation)',
                instruction: ''
            },
            zip: {
                type: 'str',
                description: 'ZIP code (5 or 9 digit format)',
                instruction: ''
            },
            bill_to_company: {
                type: 'str',
                description: 'Name of the VA facility',
                instruction:
                    "Extract the full name of the VA facility or medical center. it represents which company or VA facility we are received order from. KEEP it as same name mentioned in 'FROM:'"
            },
            phone_number: {
                type: 'str',
                description: 'Locate and extract the phone number from the bill to adress',
                instruction: "Extract the complete phone number from the bill to adress, including area code. do not include vendor or veteran's phone number."
            }
        }
    },
    line_items: {
        type: 'list',
        description:
            'List of ordered items, (extract all the sku values, inside a table, even if there are no other column details provided. take an individual sku number as a row while keeping other column values empty, incase any column details provided pick them appropriately. )',
        instruction:
            "Extract all line items from the order. Ensure each item is complete and unique. Do not duplicate or split items. extract exact table as it is.\nNote: Locate all the occurences of SKU number. and take each sku occurence as a row. if all the olther colum details are empty. keep them empty. but make sure to pick all the sku occurences as individual row.\nPick the corresponding Description and other column details if present.\n\n'SKU' value description: locate  'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value",
        is_list: true,
        fields: {
            sku_number: {
                type: 'str',
                description: 'SKU number',
                instruction:
                    "Extract unique identifier from description like 'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value"
            },
            rehab_id: {
                type: 'str',
                description: 'Rehab ID',
                instruction:
                    "Extract the 'Rehabmart ID' or 'rehabmart number' from the description or relavant ID from description if present. lf not leave it as blank."
            },
            description: {
                type: 'str',
                description: 'Item description',
                instruction:
                    "Extract only the description and remove any SKU number, alphanumeric codes, or suffixes and prefixes like 'Vendor Catalog #:', 'Model:', 'MFR NO #:', or 'Item #'. Remove any text after 'Model:' or similar words if present."
            },
            quantity: {
                type: 'int',
                description: 'Quantity ordered',
                instruction: 'Extract the numerical quantity as an integer.'
            },
            unit_price: {
                type: 'str',
                description: 'Price per unit',
                instruction: 'Extract the price for a single unit as a float, removing any currency symbols.'
            },
            total_price: {
                type: 'str',
                description: 'Total price for the item',
                instruction: 'Extract the total price for this line item as a float, removing any currency symbols.'
            }
        }
    }
};
