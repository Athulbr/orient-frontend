import { CircleUser, Menu } from "lucide-react";
import { MakezLogoHeader } from "../../assets/svg-icons/MakezLogoHeader";
import { useToastStore } from "../../components/toast/ToastStore";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "../../components/Dropdown";
import ExtractionFloatingWindow from "../docsnap/upload-document/ExtractionFloatingWindow";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { Button } from "../../components/Button";
import httpRequest from "../../global-utils/httpRequest";

interface HeaderComponentIF {
  showSidebar?: boolean;
  setShowSidebar: (state: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentIF> = ({
  showSidebar,
  setShowSidebar,
}) => {
  const toast = useToastStore();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const user = JSON.parse(
    window?.sessionStorage.getItem(`${"user"}`) as string
  );
  const logOut = () => {
    toast.success("Logged out successfully");
    if (isAuthenticated) {
      instance.logoutRedirect({
        postLogoutRedirectUri:
          import.meta.env.VITE_BASR_URL || "https://demo.makez.ai",
      });
      return;
    }
    setTimeout(() => {
      window.sessionStorage.clear();
      window?.location?.replace("/");
    }, 500);
  };
  const onChangeDropDown = (e: string) => {
    if (e === "Logout") logOut();
    if (e === "Account") navigate(`/user/account/${user._id}`);
  };

  const callExtractionApi = async () => {
    await httpRequest(
      "POST",
      `${import.meta.env.VITE_NODE_URL}/api/idp/project/extract`,
      {
        s3FileName: "PO_VA_636a8-r4k813_2.pdf",
        schema,
      }
    );
  };

  return (
    // <div className="flex min-h-16 justify-between bg-black">
    // <div className="flex min-h-16 justify-between bg-[#042443]">
    <div className="flex min-h-16 justify-between bg-[#012D56]">
      {!showSidebar && (
        <div
          tabIndex={0}
          className="flex h-17 w-16 items-center justify-center md:hidden"
        >
          <Menu
            onClick={() => setShowSidebar(true)}
            className="cursor-pointer"
            color="white"
            size={30}
          />
        </div>
      )}
      <div
        tabIndex={0}
        className="flex h-full cursor-pointer items-center md:pl-6"
        onClick={() => navigate("/")}
      >
        <MakezLogoHeader />
      </div>
      <div className="flex flex-1 items-center justify-end">
        <div className="hidden items-center gap-6 px-6 md:flex">
          {/* <LogIn tabIndex={0} onClick={refreshAuth} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
          {/* <CircleHelp tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" />
          <Bell tabIndex={0} size={20} className="cursor-pointer text-gray-300 hover:text-white" /> */}
          <Dropdown onChange={onChangeDropDown} options={["Account", "Logout"]}>
            <span className="flex items-center gap-2 text-sm text-gray-300 capitalize">
              <CircleUser
                size={20}
                className="cursor-pointer text-gray-300 hover:text-white"
              />
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
    type: "dict",
    description: "Basic Details",
    instruction: "Extract Basic details from this purchase order",
    fields: {
      purchase_agent: {
        type: "str",
        description: "Name of the purchase agent or purchase agent lead",
        instruction:
          "Look for labels like 'Purchase Agent', 'Purchase Agent Lead', 'Administrative support assistant', 'Ordered By', or 'Buyer' or similar words. take this from Fax page. give full name if possible. Ensure that names are extracted in the correct order, with the first name followed by the last name. Remove any suffixes such as 'Jr' or 'Sr' unless they are part of the official name. Correct any capitalization errors to ensure that names are properly capitalized. Double-check for any potential misspellings or typographical errors in the names and correct them to match the most likely intended spelling.",
      },
      contact_email: {
        type: "str",
        description:
          "Contact email address for the purchase agent or VA facility",
        instruction:
          "Extract any valid email address found in the document. It should contain an '@' symbol and a domain. If multiple email addresses are found, prioritize ones associated with the VA or purchasing department.",
      },
      po_number: {
        type: "str",
        description: "Purchase Order number",
        instruction:
          "Look for labels such as 'PO Number', 'PO #', 'Purchase Order #', 'VA PO#:', or similar. understand and Extract purchase order number   ",
      },
      from_location: {
        type: "str",
        description: "Location where the order originated",
        instruction:
          'Extract the \'From:\' location name from the Fax page or similar where order is received location. Don\'t include person name. When extracting the location name, ensure to include the full name of the facility or center if it is specified, such as "VAMC" or "VA Medical Center," and avoid abbreviations unless they are part of the official name. If the location includes a city and state, ensure to capture the full name of the facility associated with that location.',
      },
      contract_number: {
        type: "str",
        description: "Locate Contract Number and if present extract its value.",
        instruction:
          "extract Contract Number or  '16. Contract Number' from the document, if not present keep the value as null.",
      },
      quote_id: {
        type: "str",
        description: "Quote ID",
        instruction: "Extract the quote ID from the document.",
      },
      subtotal: {
        type: "str",
        description: "Locate sub total amount and extract the value",
        instruction:
          "Extract the subtotal amount before tax and shipping. convert it as float",
      },
      tax: {
        type: "str",
        description: "Locate tax  and extract the value",
        instruction: "get the tax mentioned in the document. if mentioned",
      },
      total_amount: {
        type: "str",
        description: "Total Amount",
        instruction:
          "Total Amount including tax and shipping cost if metioned.",
      },
      shipping_cost: {
        type: "str",
        description:
          "Identify Shipping cost and extrcat the shipping cost mentioned.",
        instruction: "extract shipping cost from the document if mentioned",
      },
      discount: {
        type: "str",
        description: "Discount Cost",
        instruction: "Extract thediscounted cost if specified. get it as float",
      },
    },
  },
  bill_to: {
    type: "dict",
    description: "VA Facility information",
    instruction:
      "Look for a section detailing the VA facility information. don't include vendor details or veteran details.\n",
    fields: {
      bill_to_name: {
        type: "str",
        description:
          "name of the purchase agent who is making the purchase order",
        instruction:
          "extract it from purchase agent field or from Fax page who is making purchase order. or received from whom. Ensure that names are extracted in the correct order, with the first name followed by the last name. If the name is presented in a different format, such as last name first, rearrange it to follow the first name last name format. Pay attention to middle initials or suffixes and include them only if they are part of the corrected name. If multiple names are present, identify the primary individual responsible for the purchase order.",
      },
      street: {
        type: "str",
        description: "Street address of the VA facility",
        instruction:
          "Extract the complete street address, including any suite or building numbers.",
      },
      city: {
        type: "str",
        description: "City of the VA facility",
        instruction: "Extract only the city name.",
      },
      state: {
        type: "str",
        description: "State of the VA facility",
        instruction:
          "Extract the two-letter state abbreviation. If written in full, convert to the two-letter code.",
      },
      zip: {
        type: "str",
        description: "ZIP code of the VA facility",
        instruction:
          "Extract the 5-digit or 9-digit ZIP code (if 9 digits, include the hyphen).",
      },
      phone_number: {
        type: "str",
        description: "Phone number of the VA facility",
        instruction:
          "Extract the complete phone number of VA facility only, including area code. do not include vendor or veteran's phone number",
      },
      bill_to_company: {
        type: "str",
        description:
          "Locate 'Name of the VA facility' and extract the Bill to company name",
        instruction:
          'Extract the full name of the VA facility or medical center. it represents which company or VA facility we are received order from. KEEP it as same name mentioned in \'FROM:\' Ensure that the extracted name is in the format of "[City/Name] VAMC" or "[City/Name] VA Medical Center" if applicable. If the facility is part of a larger healthcare system, use the specific VAMC name associated with the location. If the name includes additional identifiers such as city, state, or codes, focus on the main facility name followed by "VAMC". If the facility is known by a specific name or division, ensure to include that in the extracted name.',
      },
    },
  },
  ship_to: {
    type: "dict",
    description:
      "locate Ship to and extract the shipping information, if in case unable to find ship to try to locate veterans keyword and extract those details.",
    instruction:
      "Extract shipping information from the document, prioritizing dedicated shipping sections. If not found, check item descriptions, comments, and if not available extract veteran's name and address.",
    fields: {
      ship_to_company: {
        type: "str",
        description: "Name of the company where shipment or delivery goes.\n",
        instruction:
          "Try to extract the company name under 'Ship to' or 'Deliver to' fields.\nDO NOT extract vendor name.(especially RehabMart and veteran)\n",
      },
      name: {
        type: "str",
        description:
          "Locate Veteran and extract the full name of the Veteran from the document.",
        instruction:
          "Locate 'Veteran' and Extract the full name of the person or facility receiving the shipment.",
      },
      street: {
        type: "str",
        description: "Street address for shipping,",
        instruction:
          "Extract the complete street address, including any apartment or unit numbers. in case not provided or unable to locate or extract keep the field empty. . ",
      },
      city: {
        type: "str",
        description: "City name for shipping",
        instruction:
          "Extract only the city name from the shipping address.in case not provided or unable to locate or extract keep the field empty. ",
      },
      state: {
        type: "str",
        description: "State abbreviation for shipping",
        instruction:
          "Extract the two-letter state abbreviation. If written in full, convert to the two-letter code.in case not provided or unable to locate or extract keep the field empty. ",
      },
      zip: {
        type: "str",
        description: "ZIP code for shipping",
        instruction:
          "Extract the 5-digit or 9-digit ZIP code (if 9 digits, include the hyphen).in case not provided or unable to locate or extract keep the field empty. ",
      },
      phone_number: {
        type: "str",
        description: "Veteran's phone number",
        instruction:
          "Extract the complete phone number, including area code, if provided.",
      },
    },
  },
  card_info: {
    type: "dict",
    description: "Card information from Comments section",
    instruction:
      'Look for card details in the "Comments" or "Notes" or similar in document. get card info from the document if available.',
    fields: {
      name: {
        type: "str",
        description: "Name on the card",
        instruction:
          "Extract the full name associated with the card if available in the comments. If not found, leave blank.",
      },
      card_number: {
        type: "str",
        description: "Card number",
        instruction:
          'Extract the card number if available in the comments or extract order number from "21. Order Number". If not found, leave blank. Do not confuse this with the PO order number.',
      },
      expiration_date: {
        type: "str",
        description: "Card expiration date",
        instruction:
          'look for "expiration date"  or "exp" of the card if available in the comments or note section in the document. If not found, leave blank.',
      },
      cvv: {
        type: "str",
        description: "Card CVV",
        instruction:
          "Extract the CVV (Card Verification Value) if available in the comments or note or item description. If not found, leave blank",
      },
    },
  },
  line_items: {
    type: "list",
    description:
      "List of ordered items, (extract all the sku values, inside a table, even if there are no other column details provided. take an individual sku number as a row while keeping other column values empty, incase any column details provided pick them appropriately. )",
    instruction:
      "Extract all line items from the order. Ensure each item is complete and unique.Extract all line items from the order. Ensure each item is complete and unique. Do not duplicate or split items. extract exact table as it is.\nNote: Locate all the occurences of SKU number. and take each sku occurence as a row. if all the olther colum details are empty. keep them empty. but make sure to pick all the sku occurences as individual row.\nPick the corresponding Description and other column details if present.\n\n'SKU' value description: locate  'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value",
    is_list: true,
    item_fields: {
      sku_number: {
        type: "str",
        description: "SKU number",
        instruction:
          'Extract the SKU number from the item description. Look specifically for phrases like:\n- "Vendor Catalog #:"\n- "Model:"\n- "MFR NO #:"\n- "Item #"\n- "Item Number"\n- "SKU "\n\nImportant:\n- "Item Number" is the same as the SKU number.\n- Always map any value following "Item Number" to the sku_number field.\n- If multiple identifiers are found, prefer "SKU", "Item Number", or "Vendor Catalog #".',
      },
      rehab_id: {
        type: "str",
        description: "Rehabmart ID",
        instruction:
          'Extract the Rehabmart identifier (ID) from the item description. Look for patterns or labels such as:\n- "Rehabmart ID"\n- "Rehabmart Number"\n\nIf none of these are found, attempt to extract any ID that clearly refers to Rehabmart from the context of the description.\n\nImportant:\n- This field is mandatory.\n- Do not skip this field.\n- If no Rehabmart ID is found, return an empty string ("").',
      },
      description: {
        type: "str",
        description: "Item description",
        instruction:
          "Extract only the description and remove any SKU number, alphanumeric codes, or suffixes and prefixes like 'Vendor Catalog #:', 'Model:', 'MFR NO #:', or 'Item #'. Remove any text 'Model:' if present.",
      },
      quantity: {
        type: "int",
        description: "Quantity ordered",
        instruction: "Extract the numerical quantity as an integer.",
      },
      unit_price: {
        type: "str",
        description: "Price per unit",
        instruction:
          "Extract the price of item per unit, removing any currency symbols.",
      },
      total_price: {
        type: "str",
        description: "Total price for the item",
        instruction: "Extract the total price, removing any currency symbols.",
      },
    },
  },
};
