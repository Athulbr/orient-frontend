import { useEffect, useRef, useState } from 'react';
import { useViewRecordState, ViewRecordStateProvider } from './hooks/viewRecordContext';
import { TabViewContainer } from './components/TabViewContainer';
import DocumentBotComponent from './DocumentBotComponent';
import ExtractedDataComponent from './ExtractedDataComponent';
import { RenderArrayFields } from './render-field-components/RenderArrayFields';
import { ResizableContainer } from '../../template/update-template/components/ResizableContainer';
import { PreviewComponent } from './PreviewComponent';
import { InvoiceGenerator } from './components/InvoiceGenerator';

const initialInvoiceContent = `<div>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; ">
  <tr>
    <td style="vertical-align: top; padding: 5px; width: 60%; font-size: 12px;">
      <img src="https://img.rehabmart.com/images/rehabmart-logo.gif" alt="RehabMart Logo" style="height: 50px;" /><br />
      <br />
      www.rehabmart.com<br />
      3651 Mars Hill Rd, Bldg 2400<br />
      Watkinsville, GA 30677<br /><br />
      <span style="font-weight: bold;">Accounting Email:</span> accounting@rehabmart.com
    </td>
    <td style="vertical-align: top; padding: 5px; width: 40%; text-align: right;">
      <div style="font-size: 24px; font-weight: bold;">INVOICE</div>
      <table style="border: 1px solid #000; margin-left: auto; font-size: 12px;">
        <tr>
          <td style="border: 1px solid #000; padding: 6px 10px; text-align: center;"><b>Date</b></td>
          <td style="border: 1px solid #000; padding: 6px 10px; text-align: center;"><b>Invoice #</b></td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 6px 10px; text-align: center;">9/24/2024</td>
          <td style="border: 1px solid #000; padding: 6px 10px; text-align: center;">96948</td>
        </tr>
      </table>
      <br />
      <span style="font-weight: bold;">Order Dept:</span> order@rehabmart.com
    </td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
  <tr>
    <td style="border: 1px solid #000; padding: 8px; width: 48%; vertical-align: top;">
      <div style="font-weight: bold; margin-bottom: 5px;">Bill To</div>
      INDEPENDENT SCHOOL DISTRICT 271<br />
      ACCTS PAYABLE<br />
      1350 WEST 106TH ST<br />
      BLOOMINGTON, MN 55431
    </td>
    <td style="width: 4%;"></td>
    <td style="border: 1px solid #000; padding: 8px; width: 48%; vertical-align: top;">
      <div style="font-weight: bold; margin-bottom: 5px;">Ship To</div>
      RIDGEVIEW ELEMENTARY<br />
      ATTN: KRISTIN DELARWELLE / BRENDA NEWMAN<br />
      9400 NESBITT AVE<br />
      BLOOMINGTON, MN 55438
    </td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
  <tr>
    <th style="border: 1px solid #000; padding: 8px; text-align: center;">P.O. Number</th>
    <th style="border: 1px solid #000; padding: 8px; text-align: center;">RMID</th>
    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Terms</th>
    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Rep</th>
    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Ship Date</th>
    <th style="border: 1px solid #000; padding: 8px; text-align: center;">Ship Via</th>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px; text-align: center;">4002500110</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: center;">RMPO96948</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: center;">Net 30</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: center;">MT</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: center;">9/20/2024</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: center;">UPS</td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
  <tr>
    <th style="width: 5%; border: 1px solid #000; padding: 8px; vertical-align: top;">Qty</th>
    <th style="width: 65%; border: 1px solid #000; padding: 8px; vertical-align: top;">Item Code / $ Amount / Product Description</th>
    <th style="width: 15%; border: 1px solid #000; padding: 8px; vertical-align: top;">Price Each</th>
    <th style="width: 15%; border: 1px solid #000; padding: 8px; vertical-align: top;">Amount</th>
  </tr>
  <tr>
    <td style="text-align: center; border: 1px solid #000; padding: 8px; vertical-align: top;">1</td>
    <td style="border: 1px solid #000; padding: 8px; vertical-align: top;">
      <b style="font-weight: bold;">JHL-NA25571</b> --&gt; <b style="font-weight: bold;">$345.62</b> : Hoyer Access 6-Point Comfort Clip Style Support Sling without Head Support - Small<br />
      <b>Product URL:</b> <a href="https://www.rehabmart.com/product/34598.html" target="_blank" style="color: #0000EE; text-decoration: none;">https://www.rehabmart.com/product/34598.html</a>
      <div style="color: red; font-weight: bold; margin-top: 6px;">This product is non-returnable</div>
      <div style="border: 1px solid #000; padding: 8px; margin-top: 10px; font-size: 12px;">
        <b style="font-weight: bold;">REMIT TO ADDRESS:</b><br />
        Rehabmart eCommerce Solutions, LLC<br />
        Accounts Receivable<br />
        3651 Mars Hill Rd, Bldg 2400<br />
        Watkinsville GA 30677
      </div>
    </td>
    <td style="text-align: right; border: 1px solid #000; padding: 8px; vertical-align: top;">$345.62</td>
    <td style="text-align: right; border: 1px solid #000; padding: 8px; vertical-align: top;">$345.62</td>
  </tr>
</table>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
  <tr>
    <td colspan="2" style="border: 1px solid #000; padding: 10px; font-size: 11px; line-height: 1.4; vertical-align: top;">
      <b style="font-weight: bold;">Rehabmart Return Policy:</b> Please email your product return reason to: <a href="mailto:returns@rehabmart.com" style="color: #000; text-decoration: none;">returns@rehabmart.com</a> to obtain a return authorization number, shipping address, and return shipping instructions. Returnable products can only be returned within 30 days from the date of your email-invoice with a return authorization number. It is Rehabmart’s policy to charge a 30% re-stocking fee on most returned items. However, there are exceptions to the standard 30% restocking fee for items shipped directly from Invacare, Sunrise Medical, HealthCraft, and other vendors; in which case there may be higher restocking fees. Please refer to <a href="https://www.rehabmart.com/returns/" style="color: #000; text-decoration: none;">rehabmart.com/returns</a> to obtain the specific restocking fees for specific vendors and specific products. Products returned without a return authorization number will be refused.
      <br /><br />
      <b style="font-weight: bold;">Payment Terms:</b> Net 30 after product(s) have been received.<br />
      Thank you again for your order. Please don’t hesitate to contact us for any reason!<br />
      <br />
      Rehabmart eCommerce Solutions, LLC EIN/TIN: 93-2361111
    </td>
    <td style="border: 1px solid #000; width: 30%; vertical-align: top;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; border-right: 1px solid #000;">Subtotal:</td>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; text-align: right;">$345.62</td>
        </tr>
        <tr>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; border-right: 1px solid #000;">Sales Tax:</td>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; text-align: right;">$0.00</td>
        </tr>
        <tr>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; border-right: 1px solid #000;">Flat Rate Shipping:</td>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; text-align: right;">$0.00</td>
        </tr>
        <tr>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; border-right: 1px solid #000;">Payments/Credits:</td>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; text-align: right;">$0.00</td>
        </tr>
        <tr>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; border-right: 1px solid #000; color: red; font-weight: bold;">Balance Due:</td>
          <td style="border-bottom: 1px solid #000; padding: 8px; font-size: 12px; text-align: right; color: red; font-weight: bold;">$345.62</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<div style="text-align: center; font-size: 12px; margin-top: 20px;">
  Phone # 706-213-1144 Ext:1011 &nbsp;&nbsp;&nbsp;&nbsp;
  Fax # 888-507-7326 &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="mailto:accounting@rehabmart.com" style="color: #000; text-decoration: none;">accounting@rehabmart.com</a>
</div>

</div>`;

interface WirePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface BboxIF {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface Message {
  text: string;
  source?: string[];
  userMessage: boolean;
}
export interface ViewRecordStateIF {
  showCreateDialog: boolean;
  loadingData: boolean;
  loadingS3File: boolean;
  tabIndex: number;
  id: string;
  extractedData: Record<string, any>;
  objectFields: Record<string, Record<string, any>>;
  arrayFields: Array<Record<string, Record<string, any>>>;
  tableNames: Array<string>;
  wire: WirePoints | null;
  bbox: BboxIF | null;
  hoveredFieldId: string | null;
  pageNumber: number;
  images: any[];
  record: any;
  messages: Message[];
  chatLoading: boolean;
  tableViewDialog: boolean;
  scrollToViewField: number;
  selectedTableName: string;
  hoveredOnArrayField: boolean;
  reExtracting: boolean;
  leftWidthPercent: number;
  invoiceContent: string;
  generatingInvoice: boolean;
  requestNewFieldDialog: boolean;
}
const initialState = {
  showCreateDialog: false,
  loadingData: false,
  loadingS3File: false,
  tabIndex: 0,
  id: '',
  extractedData: {},
  objectFields: {},
  arrayFields: [],
  tableNames: [],
  wire: null,
  bbox: null,
  hoveredFieldId: null,
  pageNumber: 1,
  images: [],
  record: null,
  messages: [],
  chatLoading: false,
  tableViewDialog: false,
  leftWidthPercent: 75,
  scrollToViewField: 1,
  selectedTableName: '',
  hoveredOnArrayField: false,
  reExtracting: false,
  invoiceContent: '',
  generatingInvoice: false,
  requestNewFieldDialog: false,
};

const ViewRecordPage: React.FC = () => {
  const [state, setState] = useState<ViewRecordStateIF>(initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <ViewRecordStateProvider value={{ state, setState }}>
      <div className={`absolute top-0 left-0 flex h-[100vh] w-[100vw] gap-2 bg-white ${state.selectedTableName ? 'pb-[40vh]' : 'pb-0'}`} ref={containerRef}>
        <ResizableContainer
          left={
            <div className="flex h-[100vh] flex-1 flex-col overflow-hidden">
              <PreviewComponent fieldRefs={fieldRefs} containerRef={containerRef} />
            </div>
          }
          right={
            <div className="flex h-[100vh] flex-1 flex-col overflow-hidden">
              <TabViewContainer>
                <ExtractedDataComponent containerRef={containerRef} fieldRefs={fieldRefs} />
                <DocumentBotComponent />
                <InvoiceGenerator />
              </TabViewContainer>
            </div>
          }
          initialLeftWidthPercent={75}
          minLeftWidthPercent={30}
          maxLeftWidthPercent={80}
          onResize={(leftWidthPercent: number) => setState(prev => ({ ...prev, leftWidthPercent }))}
        />
        {state.selectedTableName && (
          <div className="absolute bottom-0 left-0 z-1 flex h-[40vh] w-full flex-col overflow-hidden border-t border-blue-200 bg-gray-50 p-2">
            <RenderArrayFields refs={{ fieldRefs, isScrollingRef: 0, containerRef }} updateWire={() => {}} />
          </div>
        )}
      </div>
    </ViewRecordStateProvider>
  );
};

export default ViewRecordPage;
