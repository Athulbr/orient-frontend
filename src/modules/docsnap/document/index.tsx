import { useState } from 'react';
import PageContainer from '../../../components/PageContainer';
import PageNameComponent from '../../../components/PageName';
import { DocumentStateProvider } from './hooks/documentContext';
import CreateDocumentComponent from './CreateDocumentComponent';
import { ListDocumentComponent } from './ListDocumentComponent';
import { id } from 'date-fns/locale';
import CreateDocComponent from './hooks/CreateDocComponent';
const sampleFields = [
  {
    name: 'PO number',
    dataType: 'str',
    jsonKey: 'po_number',
    excludeExtraction: true,
    description: 'Purchase Order Number',
    instruction:
      "Look for labels such as 'PO Number', 'PO #', 'Purchase Order #','Service Authorization Number' or similar. Extract the full alphanumeric identifier without any prefixes.",
    subFields: [],
  },
  {
    name: 'contact email',
    dataType: 'str',
    jsonKey: 'contact_email',
    excludeExtraction: false,
    description: 'contact Email',
    instruction: "Extract any valid email address associated with the buyer or purchasing department. It should contain an '@' symbol and a domain.",
    subFields: [],
  },
  {
    name: 'phone number',
    dataType: 'str',
    jsonKey: 'phone_number',
    required: false,
    excludeExtraction: false,
    description: 'contact Phone Number',
    instruction:
      "Extract the complete phone number associated, including area code if available. don't include any vendor phone number. If no phone number is present keep value as null.",
    subFields: [],
  },
  {
    name: 'Contract Number',
    dataType: 'str',
    jsonKey: 'contract_number',
    required: false,
    excludeExtraction: false,
    description: 'Contract Number',
    instruction: "extract Contract Number or  '16. Contract Number' from the document",
    subFields: [],
  },
  {
    name: 'ship_to',
    dataType: 'dict',
    jsonKey: 'ship_to',
    excludeExtraction: false,
    description: 'Shipping or Delivery Address',
    instruction:
      "Extract the shipping address from 'Ship to' or 'Shipping Address' or 'Delivery Instructions' or 'Delivery Address' or similar labels. understand and don't include vendor address or 'To' or any vendor details like rehabmart LLC and its details. Include all relevant information such as names, street address, city, state, and ZIP code. If multiple names are present, include them in the 'name' field separated by 'or'. The address may include additional details like suite numbers.  extract shipping information.                     ",
    subFields: [
      {
        name: 'name',
        dataType: 'str',
        jsonKey: 'name',
        required: false,
        excludeExtraction: false,
        description: 'Name of company or individual',
        instruction: 'full name individual or name of individual if available ',
      },
      {
        name: 'attn',
        dataType: 'str',
        jsonKey: 'attn',
        required: false,
        excludeExtraction: false,
        description: 'Attention to (if present)',
        instruction: '',
      },
      {
        name: 'street',
        dataType: 'str',
        jsonKey: 'street',
        required: false,
        excludeExtraction: false,
        description: 'Street address including suite/unit if available',
        instruction: 'street of shipping address',
      },
      {
        name: 'city',
        dataType: 'str',
        jsonKey: 'city',
        required: false,
        excludeExtraction: false,
        description: 'City name',
        instruction: 'city of shipping address',
      },
      {
        name: 'state',
        dataType: 'str',
        jsonKey: 'state',
        required: false,
        excludeExtraction: false,
        description: 'State (two-letter abbreviation)',
        instruction: '',
      },
      {
        name: 'zip',
        dataType: 'str',
        jsonKey: 'zip',
        required: false,
        excludeExtraction: false,
        description: 'ZIP code (5 or 9 digit format)',
        instruction: '',
      },
      {
        name: 'phone number',
        dataType: 'str',
        jsonKey: 'phone_number',
        required: false,
        excludeExtraction: false,
        description: 'Phone number of the ship to adress.',
        instruction: 'Extract the complete phone number, including area code. extract phone number from the ship to adress. if present',
      },
    ],
  },
  {
    name: 'bill to',
    dataType: 'dict',
    jsonKey: 'bill_to',
    excludeExtraction: false,
    description: 'Billing Address or invoice address',
    instruction:
      "Extract billing address from labels like 'Bill To:' or 'Billing Address:' or 'invoice address' or 'invoice to' or similar. Do not include vendor addresses or 'To:' or email instructions. make sure you extract address which respect to billing information",
    subFields: [
      {
        name: 'Bill to company ',
        dataType: 'str',
        jsonKey: 'bill_to_company',
        required: false,
        excludeExtraction: false,
        description: 'Name of the VA facility',
        instruction:
          "Extract the full name of the VA facility or medical center. it represents which company or VA facility we are received order from. KEEP it as same name mentioned in 'FROM:'",
      },
      {
        name: 'Bill to name',
        dataType: 'str',
        jsonKey: 'bill_to_name',
        required: false,
        excludeExtraction: false,
        description: 'name of the purchase agent who is making the purchase order',
        instruction: 'extract it from purchase agent field or from Fax page who is making purchase order. or received from whom',
      },
      {
        name: 'attn',
        dataType: 'str',
        jsonKey: 'attn',
        required: false,
        excludeExtraction: false,
        description: 'Attention to (if present)',
        instruction: '',
      },
      {
        name: 'street',
        dataType: 'str',
        jsonKey: 'street',
        required: false,
        excludeExtraction: false,
        description: 'Street address including suite/unit if available',
        instruction: '',
      },
      {
        name: 'city',
        dataType: 'str',
        jsonKey: 'city',
        required: false,
        excludeExtraction: false,
        description: 'City name',
        instruction: '',
      },
      {
        name: 'state',
        dataType: 'str',
        jsonKey: 'state',
        required: false,
        excludeExtraction: false,
        description: 'State (two-letter abbreviation)',
        instruction: '',
      },
      {
        name: 'zip',
        dataType: 'str',
        jsonKey: 'zip',
        required: false,
        excludeExtraction: false,
        description: 'ZIP code (5 or 9 digit format)',
        instruction: '',
      },
      {
        name: 'phone number',
        dataType: 'str',
        jsonKey: 'phone_number',
        required: false,
        excludeExtraction: false,
        description: 'Phone number of the bill to adress',
        instruction: 'Extract the complete phone number, including area code. pick the phone number from the bill to adress. if present.',
      },
    ],
  },
  {
    name: 'line items',
    dataType: 'list',
    jsonKey: 'line_items',
    required: true,
    excludeExtraction: false,
    description:
      'List of ordered items, (extract all the sku values, inside a table, even if there are no other column details provided. take an individual sku number as a row while keeping other column values empty, incase any column details provided pick them appropriately. )',
    instruction:
      "Extract all line items from the order. Ensure each item is complete and unique. Do not duplicate or split items. extract exact table as it is.\nNote: Locate all the occurences of SKU number. and take each sku occurence as a row. if all the olther colum details are empty. keep them empty. but make sure to pick all the sku occurences as individual row.\nPick the corresponding Description and other column details if present.\n\n'SKU' value description: locate  'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value",
    subFields: [
      {
        name: 'sku_number',
        dataType: 'str',
        jsonKey: 'sku_number',
        required: false,
        excludeExtraction: false,
        description: 'SKU number',
        instruction:
          "Extract unique identifier from description like 'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value",
      },
      {
        name: 'rehab_id',
        dataType: 'str',
        jsonKey: 'rehab_id',
        required: false,
        excludeExtraction: false,
        description: 'Rehab ID',
        instruction:
          "Extract the 'Rehabmart ID' or 'rehabmart number' from the description or relavant ID from description if present. lf not leave it as blank.",
      },
      {
        name: 'Description',
        dataType: 'str',
        jsonKey: 'description',
        required: false,
        excludeExtraction: false,
        description: 'Item description',
        instruction:
          "Extract only the description and remove any SKU number, alphanumeric codes, or suffixes and prefixes like 'Vendor Catalog #:', 'Model:', 'MFR NO #:', or 'Item #'. Remove any text after 'Model:' or similar words if present.",
      },
      {
        name: 'Quantity',
        dataType: 'int',
        jsonKey: 'quantity',
        required: false,
        excludeExtraction: false,
        description: 'Quantity ordered',
        instruction: 'Extract the numerical quantity as an integer.',
      },
      {
        name: 'Unit Price',
        dataType: 'str',
        jsonKey: 'unit_price',
        required: false,
        excludeExtraction: false,
        description: 'Price per unit',
        instruction: 'Extract the price for a single unit as a float, removing any currency symbols.',
      },
      {
        name: 'Total Price',
        dataType: 'str',
        jsonKey: 'total_price',
        required: false,
        excludeExtraction: false,
        description: 'Total price for the item',
        instruction: 'Extract the total price for this line item as a float, removing any currency symbols.',
      },
    ],
  },
  {
    name: 'subtotal',
    dataType: 'str',
    jsonKey: 'subtotal',
    excludeExtraction: false,
    description: 'Subtotal of all line items',
    instruction: 'Extract the subtotal amount before tax and shipping. convert it as float',
    subFields: [],
  },
  {
    name: 'tax',
    dataType: 'str',
    jsonKey: 'tax',
    excludeExtraction: false,
    description: 'Total tax amount',
    instruction: 'Extract the total tax amount if specified. get it as float',
    subFields: [],
  },
  {
    name: 'shipping cost',
    dataType: 'str',
    jsonKey: 'shipping_cost',
    required: true,
    excludeExtraction: false,
    description: 'Shipping cost',
    instruction: 'Extract the shipping cost if specified. get it as float',
    subFields: [],
  },
  {
    name: 'Discount',
    dataType: 'str',
    jsonKey: 'discount',
    required: true,
    excludeExtraction: false,
    description: 'Discount Cost',
    instruction: 'Extract thediscounted cost if specified. get it as float',
    subFields: [],
  },
  {
    name: 'total amount',
    dataType: 'str',
    jsonKey: 'total_amount',
    excludeExtraction: false,
    description: 'Total order amount including tax and shipping',
    instruction: 'Extract the final total amount of the order. get it as float',
    subFields: [],
  },
  {
    name: 'Cart ID',
    dataType: 'dict',
    jsonKey: 'cart_id',
    excludeExtraction: true,
    description: 'Cart ID',
    instruction: 'Cart ID',
    subFields: [
      {
        name: 'Cart ID',
        dataType: 'str',
        jsonKey: 'cart_id',
        required: false,
        excludeExtraction: true,
        description: 'Cart ID',
        instruction: 'Cart ID',
      },
    ],
  },
  {
    name: 'Notes ',
    dataType: 'dict',
    jsonKey: 'notes',
    excludeExtraction: true,
    description: 'Notes ',
    instruction: 'Notes ',
    subFields: [
      {
        name: 'Notes ',
        dataType: 'str',
        jsonKey: 'notes',
        required: false,
        excludeExtraction: true,
        description: 'Notes ',
        instruction: 'Notes ',
      },
    ],
  },
  {
    name: 'Quote ID',
    dataType: 'str',
    jsonKey: 'quote_id',
    excludeExtraction: false,
    description: 'Quote ID',
    instruction: 'Extract the quote ID or quote # or which starts with "QT" from the document. don\'t add any po number or any other to here',
    subFields: [],
  },
];

export interface PromptFieldIF {
  name: string;
  dataType: string;
  jsonKey: string;
  excludeExtraction: boolean;
  description: string;
  instruction: string;
  subFields?: {
    name: string;
    dataType: string;
    jsonKey: string;
    excludeExtraction: boolean;
    description: string;
    instruction: string;
  }[];
}

export interface DocumentStateIF {
  showCreatePage: boolean;
  showCreateDialog: boolean;
  loading: boolean;
  id: string;
  document: any | null;
  projectId: string;
  showAddFieldDialog: boolean;
  showAddSubFieldDialog: boolean;
  fields: PromptFieldIF[];
  editFieldData: Record<string, any> | null;
  editFieldIndex: number | null;
  refresh: number;
}
const initialState = {
  showCreatePage: false,
  loading: false,
  id: '',
  projectId: '',
  showAddFieldDialog: false,
  showAddSubFieldDialog: false,
  fields: [],
  editFieldData: null,
  editFieldIndex: null,
};

const ListDocumentPage: React.FC = () => {
  const [state, setState] = useState<DocumentStateIF>(initialState);

  return (
    <DocumentStateProvider value={{ state, setState }}>
      {state.showCreatePage ? (
        <>
          <CreateDocumentComponent />
          <CreateDocComponent />
        </>
      ) : (
        <PageContainer className="gap-2">
          <PageNameComponent name="Document List" showBackButton />
          <ListDocumentComponent />
        </PageContainer>
      )}
    </DocumentStateProvider>
  );
};

export default ListDocumentPage;

const sampleDocument = {
  _id: '673d75b63a758babe78baf0b',
  name: 'PO_Private',
  description: 'Desc',
  fields: [
    {
      name: 'PO number',
      dataType: 'str',
      jsonKey: 'po_number',
      excludeExtraction: false,
      description: 'Purchase Order Number',
      instruction:
        "Look for labels such as 'PO Number', 'PO #', 'Purchase Order #','Service Authorization Number' or similar. Extract the full alphanumeric identifier without any prefixes.",
      subFields: [],
    },
    {
      name: 'contact email',
      dataType: 'str',
      jsonKey: 'contact_email',
      excludeExtraction: false,
      description: 'contact Email',
      instruction: "Extract any valid email address associated with the buyer or purchasing department. It should contain an '@' symbol and a domain.",
      subFields: [],
    },
    {
      name: 'phone number',
      dataType: 'str',
      jsonKey: 'phone_number',
      required: false,
      excludeExtraction: false,
      description: 'contact Phone Number',
      instruction:
        "Extract the complete phone number associated, including area code if available. don't include any vendor phone number. If no phone number is present keep value as null.",
      subFields: [],
    },
    {
      name: 'Contract Number',
      dataType: 'str',
      jsonKey: 'contract_number',
      required: false,
      excludeExtraction: false,
      description: 'Contract Number',
      instruction: "extract Contract Number or  '16. Contract Number' from the document",
      subFields: [],
    },
    {
      name: 'ship_to',
      dataType: 'dict',
      jsonKey: 'ship_to',
      excludeExtraction: false,
      description: 'Shipping or Delivery Address',
      instruction:
        "Extract the shipping address from 'Ship to' or 'Shipping Address' or 'Delivery Instructions' or 'Delivery Address' or similar labels. understand and don't include vendor address or 'To' or any vendor details like rehabmart LLC and its details. Include all relevant information such as names, street address, city, state, and ZIP code. If multiple names are present, include them in the 'name' field separated by 'or'. The address may include additional details like suite numbers.  extract shipping information.                     ",
      subFields: [
        {
          name: 'name',
          dataType: 'str',
          jsonKey: 'name',
          required: false,
          excludeExtraction: false,
          description: 'Name of company or individual',
          instruction: 'full name individual or name of individual if available ',
        },
        {
          name: 'attn',
          dataType: 'str',
          jsonKey: 'attn',
          required: false,
          excludeExtraction: false,
          description: 'Attention to (if present)',
          instruction: '',
        },
        {
          name: 'street',
          dataType: 'str',
          jsonKey: 'street',
          required: false,
          excludeExtraction: false,
          description: 'Street address including suite/unit if available',
          instruction: 'street of shipping address',
        },
        {
          name: 'city',
          dataType: 'str',
          jsonKey: 'city',
          required: false,
          excludeExtraction: false,
          description: 'City name',
          instruction: 'city of shipping address',
        },
        {
          name: 'state',
          dataType: 'str',
          jsonKey: 'state',
          required: false,
          excludeExtraction: false,
          description: 'State (two-letter abbreviation)',
          instruction: '',
        },
        {
          name: 'zip',
          dataType: 'str',
          jsonKey: 'zip',
          required: false,
          excludeExtraction: false,
          description: 'ZIP code (5 or 9 digit format)',
          instruction: '',
        },
        {
          name: 'phone number',
          dataType: 'str',
          jsonKey: 'phone_number',
          required: false,
          excludeExtraction: false,
          description: 'Phone number of the ship to adress.',
          instruction: 'Extract the complete phone number, including area code. extract phone number from the ship to adress. if present',
        },
      ],
    },
    {
      name: 'bill to',
      dataType: 'dict',
      jsonKey: 'bill_to',
      excludeExtraction: false,
      description: 'Billing Address or invoice address',
      instruction:
        "Extract billing address from labels like 'Bill To:' or 'Billing Address:' or 'invoice address' or 'invoice to' or similar. Do not include vendor addresses or 'To:' or email instructions. make sure you extract address which respect to billing information",
      subFields: [
        {
          name: 'Bill to company ',
          dataType: 'str',
          jsonKey: 'bill_to_company',
          required: false,
          excludeExtraction: false,
          description: 'Name of the VA facility',
          instruction:
            "Extract the full name of the VA facility or medical center. it represents which company or VA facility we are received order from. KEEP it as same name mentioned in 'FROM:'",
        },
        {
          name: 'Bill to name',
          dataType: 'str',
          jsonKey: 'bill_to_name',
          required: false,
          excludeExtraction: false,
          description: 'name of the purchase agent who is making the purchase order',
          instruction: 'extract it from purchase agent field or from Fax page who is making purchase order. or received from whom',
        },
        {
          name: 'attn',
          dataType: 'str',
          jsonKey: 'attn',
          required: false,
          excludeExtraction: false,
          description: 'Attention to (if present)',
          instruction: '',
        },
        {
          name: 'street',
          dataType: 'str',
          jsonKey: 'street',
          required: false,
          excludeExtraction: false,
          description: 'Street address including suite/unit if available',
          instruction: '',
        },
        {
          name: 'city',
          dataType: 'str',
          jsonKey: 'city',
          required: false,
          excludeExtraction: false,
          description: 'City name',
          instruction: '',
        },
        {
          name: 'state',
          dataType: 'str',
          jsonKey: 'state',
          required: false,
          excludeExtraction: false,
          description: 'State (two-letter abbreviation)',
          instruction: '',
        },
        {
          name: 'zip',
          dataType: 'str',
          jsonKey: 'zip',
          required: false,
          excludeExtraction: false,
          description: 'ZIP code (5 or 9 digit format)',
          instruction: '',
        },
        {
          name: 'phone number',
          dataType: 'str',
          jsonKey: 'phone_number',
          required: false,
          excludeExtraction: false,
          description: 'Phone number of the bill to adress',
          instruction: 'Extract the complete phone number, including area code. pick the phone number from the bill to adress. if present.',
        },
      ],
    },
    {
      name: 'line items',
      dataType: 'list',
      jsonKey: 'line_items',
      required: true,
      excludeExtraction: false,
      description:
        'List of ordered items, (extract all the sku values, inside a table, even if there are no other column details provided. take an individual sku number as a row while keeping other column values empty, incase any column details provided pick them appropriately. )',
      instruction:
        "Extract all line items from the order. Ensure each item is complete and unique. Do not duplicate or split items. extract exact table as it is.\nNote: Locate all the occurences of SKU number. and take each sku occurence as a row. if all the olther colum details are empty. keep them empty. but make sure to pick all the sku occurences as individual row.\nPick the corresponding Description and other column details if present.\n\n'SKU' value description: locate  'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value",
      subFields: [
        {
          name: 'sku_number',
          dataType: 'str',
          jsonKey: 'sku_number',
          required: false,
          excludeExtraction: false,
          description: 'SKU number',
          instruction:
            "Extract unique identifier from description like 'Vendor Catalog #:', 'Model: ', 'MFR NO #:', or 'Item #' or 'SKU ' or similar keys which can represent sku value",
        },
        {
          name: 'rehab_id',
          dataType: 'str',
          jsonKey: 'rehab_id',
          required: false,
          excludeExtraction: false,
          description: 'Rehab ID',
          instruction:
            "Extract the 'Rehabmart ID' or 'rehabmart number' from the description or relavant ID from description if present. lf not leave it as blank.",
        },
        {
          name: 'Description',
          dataType: 'str',
          jsonKey: 'description',
          required: false,
          excludeExtraction: false,
          description: 'Item description',
          instruction:
            "Extract only the description and remove any SKU number, alphanumeric codes, or suffixes and prefixes like 'Vendor Catalog #:', 'Model:', 'MFR NO #:', or 'Item #'. Remove any text after 'Model:' or similar words if present.",
        },
        {
          name: 'Quantity',
          dataType: 'int',
          jsonKey: 'quantity',
          required: false,
          excludeExtraction: false,
          description: 'Quantity ordered',
          instruction: 'Extract the numerical quantity as an integer.',
        },
        {
          name: 'Unit Price',
          dataType: 'str',
          jsonKey: 'unit_price',
          required: false,
          excludeExtraction: false,
          description: 'Price per unit',
          instruction: 'Extract the price for a single unit as a float, removing any currency symbols.',
        },
        {
          name: 'Total Price',
          dataType: 'str',
          jsonKey: 'total_price',
          required: false,
          excludeExtraction: false,
          description: 'Total price for the item',
          instruction: 'Extract the total price for this line item as a float, removing any currency symbols.',
        },
      ],
    },
    {
      name: 'subtotal',
      dataType: 'str',
      jsonKey: 'subtotal',
      excludeExtraction: false,
      description: 'Subtotal of all line items',
      instruction: 'Extract the subtotal amount before tax and shipping. convert it as float',
      subFields: [],
    },
    {
      name: 'tax',
      dataType: 'str',
      jsonKey: 'tax',
      excludeExtraction: false,
      description: 'Total tax amount',
      instruction: 'Extract the total tax amount if specified. get it as float',
      subFields: [],
    },
    {
      name: 'shipping cost',
      dataType: 'str',
      jsonKey: 'shipping_cost',
      required: true,
      excludeExtraction: false,
      description: 'Shipping cost',
      instruction: 'Extract the shipping cost if specified. get it as float',
      subFields: [],
    },
    {
      name: 'Discount',
      dataType: 'str',
      jsonKey: 'discount',
      required: true,
      excludeExtraction: false,
      description: 'Discount Cost',
      instruction: 'Extract thediscounted cost if specified. get it as float',
      subFields: [],
    },
    {
      name: 'total amount',
      dataType: 'str',
      jsonKey: 'total_amount',
      excludeExtraction: false,
      description: 'Total order amount including tax and shipping',
      instruction: 'Extract the final total amount of the order. get it as float',
      subFields: [],
    },
    {
      name: 'Cart ID',
      dataType: 'dict',
      jsonKey: 'cart_id',
      excludeExtraction: true,
      description: 'Cart ID',
      instruction: 'Cart ID',
      subFields: [
        {
          name: 'Cart ID',
          dataType: 'str',
          jsonKey: 'cart_id',
          required: false,
          excludeExtraction: true,
          description: 'Cart ID',
          instruction: 'Cart ID',
        },
      ],
    },
    {
      name: 'Notes ',
      dataType: 'dict',
      jsonKey: 'notes',
      excludeExtraction: true,
      description: 'Notes ',
      instruction: 'Notes ',
      subFields: [
        {
          name: 'Notes ',
          dataType: 'str',
          jsonKey: 'notes',
          required: false,
          excludeExtraction: true,
          description: 'Notes ',
          instruction: 'Notes ',
        },
      ],
    },
    {
      name: 'Quote ID',
      dataType: 'str',
      jsonKey: 'quote_id',
      excludeExtraction: false,
      description: 'Quote ID',
      instruction: 'Extract the quote ID or quote # or which starts with "QT" from the document. don\'t add any po number or any other to here',
      subFields: [],
    },
  ],
  projectId: '66fe65247b080a9677bd5709',
  s3FileName: 'PO_Private_4504979822.pdf',
  docType: 'purchase_order',
  active: false,
  deleted: false,
  createdAt: '2024-11-20T05:37:58.101Z',
  updatedAt: '2025-05-26T16:49:45.712Z',
  __v: 0,
  primaryModel: 'openai',
  secondaryModel: 'gemini',
  tenantId: '673ee4031091754575288de9',
  verify: true,
  automationID: 'gFJgu64MwdSX8WVy',
  enableOcr: true,
  enableChat: true,
};
