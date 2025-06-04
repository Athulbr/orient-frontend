import { FC } from 'react';
import { InputField } from '../components/InputField';
import { useViewRecordState } from '../hooks/viewRecordContext';
import { formatFieldLabel } from '../utils';
import { RenderTopLevelFieldsIF } from './RenderTopLevelFields';

export const RenderObjectFields: FC<RenderTopLevelFieldsIF> = ({ updateWire, refs }) => {
  const { state, setState } = useViewRecordState();
  const { fieldRefs, isScrollingRef, lastHoveredFieldRef } = refs;
  return (
    <>
      {Object.entries(state.objectFields).map(([key, valueMain], mainIndex) => {
        return (
          <div key={key} className="flex flex-col rounded-lg border bg-white hover:border-amber-400">
            <label className="p-4 text-lg font-bold capitalize">{formatFieldLabel(key)}</label>
            <div className="flex flex-wrap gap-y-1">
              {Object.entries(valueMain).map(([subKey, value], i) => {
                const fieldId = `${valueMain.value}_${mainIndex}_${i}`;
                const onChange = (e: any) => {
                  setState(prev => {
                    const updated = prev.objectFields;
                    updated[key][subKey] = { ...updated[key][subKey], value: e.target.value };
                    return { ...prev, objectFields: updated };
                  });
                };
                return (
                  <InputField
                    key={fieldId}
                    label={formatFieldLabel(subKey)}
                    value={value.value}
                    confidence={`${value.confidence * 100}`}
                    // @ts-ignore
                    ref={el => (fieldRefs.current[fieldId] = el)}
                    onMouseAction={() => {
                      fieldRefs.current[fieldId].focus();

                      if (value.bbox) {
                        lastHoveredFieldRef.current = [fieldId, value.bbox];
                        setState(prev => ({ ...prev, pageNumber: value.page ? value.page : prev.pageNumber }));
                      }
                      if (!isScrollingRef.current) {
                        setState(prev => ({ ...prev, hoveredFieldId: fieldId, pageNumber: value.page ? value.page : prev.pageNumber }));
                        updateWire(fieldId, value.bbox);
                      }
                    }}
                    onChange={onChange}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

const newResponse = {
  contact_email: null,
  ship_to: {
    name: {
      value: 'WPACHL or UPMC CONSOLIDATED SERVICE CENTER',
      confidence: 0.9776695867379507,
      bbox: {
        x_min: '0.05893841911764708',
        y_min: '0.1826171875',
        x_max: '0.6516544117647058',
        y_max: '0.197265625',
      },
      page: 1,
      similarity: 0.84,
    },
    street: {
      value: '405 KEYSTONE DR DOCK DOOR 15',
    },
    city: {
      value: 'WARRENDALE',
      confidence: 0.9987377524375916,
      bbox: {
        x_min: '0.05893841911764708',
        y_min: '0.21875',
        x_max: '0.15372242647058826',
        y_max: '0.2294921875',
      },
      page: 1,
      similarity: 1,
    },
    state: {
      value: 'PA',
      confidence: 0.9989094734191895,
      bbox: {
        x_min: '0.15372242647058826',
        y_min: '0.21875',
        x_max: '0.17394301470588236',
        y_max: '0.2294921875',
      },
      page: 1,
      similarity: 1,
    },
    zip: {
      value: '15086',
      confidence: 0.999643087387085,
      bbox: {
        x_min: '0.17394301470588236',
        y_min: '0.21875',
        x_max: '0.21312040441176472',
        y_max: '0.2294921875',
      },
      page: 1,
      similarity: 1,
    },
  },
  bill_to: {
    bill_to_company: {
      value: 'UPMC',
      confidence: 0.9940938353538513,
      bbox: {
        x_min: '0.6276424632352942',
        y_min: '0.1953125',
        x_max: '0.6706112132352942',
        y_max: '0.20703125',
      },
      page: 1,
      similarity: 1,
    },
    street: {
      value: 'PO BOX 4099 ATTN INVOICE AUDIT',
      confidence: 0.9571740031242371,
      bbox: {
        x_min: '0.5518152573529411',
        y_min: '0.2060546875',
        x_max: '0.779296875',
        y_max: '0.21875',
      },
      page: 1,
      similarity: 0.97,
    },
    city: {
      value: 'PORTLAND',
      confidence: 0.8151256442070007,
      bbox: {
        x_min: '0.5543428308823529',
        y_min: '0.21875',
        x_max: '0.6276424632352942',
        y_max: '0.2294921875',
      },
      page: 1,
      similarity: 1,
    },
    state: {
      value: 'OR',
      confidence: 0.9998225569725037,
      bbox: {
        x_min: '0.5530790441176471',
        y_min: '0.1953125',
        x_max: '0.5770909926470589',
        y_max: '0.20703125',
      },
      page: 1,
      similarity: 1,
    },
    zip: {
      value: '97208',
      confidence: 0.9977794289588928,
      bbox: {
        x_min: '0.650390625',
        y_min: '0.2177734375',
        x_max: '0.6908318014705882',
        y_max: '0.2294921875',
      },
      page: 1,
      similarity: 1,
    },
  },
  subtotal: null,
  total_amount: null,
};

const oldResponse = {
  bill_to: {
    bill_to_company: {
      value: 'ST. CLOUD VAMC (656/121)',
      confidence: 0.9352356791496277,
      bbox: {
        x_min: '0.061864433913934425',
        y_min: '0.08984375',
        x_max: '0.36157066470286886',
        y_max: '0.1083984375',
      },
      page: 2,
      similarity: 1,
    },
    bill_to_name: {
      value: 'GOULET,SAMANTHA R',
      confidence: 0.9927593171596527,
      bbox: {
        x_min: '0.056488537397541005',
        y_min: '0.720703125',
        x_max: '0.2244853035348361',
        y_max: '0.7353515625',
      },
      page: 3,
      similarity: 1,
    },
    street: {
      value: '4801 VETERANS DR, 4801 VETERANS DRIVE',
    },
    city: {
      value: 'ST CLOUD',
      confidence: 0.9997901320457458,
      bbox: {
        x_min: '0.061864433913934425',
        y_min: '0.08984375',
        x_max: '0.18551005379098362',
        y_max: '0.1064453125',
      },
      page: 2,
      similarity: 0.94,
    },
    state: {
      value: 'MN',
      confidence: 0.998717188835144,
      bbox: {
        x_min: '0.16938236424180325',
        y_min: '0.1328125',
        x_max: '0.20432569159836067',
        y_max: '0.1484375',
      },
      page: 2,
      similarity: 1,
    },
    zip: {
      value: '56303-2099',
      confidence: 0.5569145083427429,
      bbox: {
        x_min: '0.2137335105020492',
        y_min: '0.134765625',
        x_max: '0.3158755443135246',
        y_max: '0.146484375',
      },
      page: 2,
      similarity: 1,
    },
    phone_number: {
      value: '320.255.6480 x7592',
      confidence: 0.8482857644557953,
      bbox: {
        x_min: '0.2762167008196721',
        y_min: '0.2939453125',
        x_max: '0.45601946721311476',
        y_max: '0.3076171875',
      },
      page: 1,
      similarity: 1,
    },
  },
  ship_to: {
    name: {
      value: 'SCVA BLDG 116 ATTN JEFF W9045',
      confidence: 0.9887363413969675,
      bbox: {
        x_min: '0.15728659707991804',
        y_min: '0.4921875',
        x_max: '0.4690885950307377',
        y_max: '0.50390625',
      },
      page: 3,
      similarity: 1,
    },
    street: {
      value: 'OTHER LOCATION AT THIS FACILITY',
      confidence: 0.9985701560974121,
      bbox: {
        x_min: '0.21910940701844261',
        y_min: '0.47265625',
        x_max: '0.5873583183913934',
        y_max: '0.48828125',
      },
      page: 3,
      similarity: 1,
    },
    city: {
      value: 'not specified',
      confidence: 0.9622314870357513,
      bbox: {
        x_min: '0.19491787269467215',
        y_min: '0.8271484375',
        x_max: '0.6249895940061475',
        y_max: '0.85546875',
      },
      page: 3,
      similarity: 0.88,
    },
    state: {
      value: 'not specified',
      confidence: 0.9622314870357513,
      bbox: {
        x_min: '0.19491787269467215',
        y_min: '0.8271484375',
        x_max: '0.6249895940061475',
        y_max: '0.85546875',
      },
      page: 3,
      similarity: 0.88,
    },
    zip: {
      value: 'not specified',
      confidence: 0.9622314870357513,
      bbox: {
        x_min: '0.19491787269467215',
        y_min: '0.8271484375',
        x_max: '0.6249895940061475',
        y_max: '0.85546875',
      },
      page: 3,
      similarity: 0.88,
    },
    phone_number: {
      value: '(612) 812-4327',
      confidence: 0.9988152384757996,
      bbox: {
        x_min: '0.5201596119364754',
        y_min: '0.3740234375',
        x_max: '0.6518690765881148',
        y_max: '0.388671875',
      },
      page: 2,
      similarity: 1,
    },
  },
  card_info: {
    name: {
      value: null,
    },
    card_number: {
      value: '4716401000513595',
      confidence: 0.9997393488883972,
      bbox: {
        x_min: '0.0524566150102459',
        y_min: '0.7958984375',
        x_max: '0.20566966572745904',
        y_max: '0.8095703125',
      },
      page: 3,
      similarity: 1,
    },
    expiration_date: {
      value: null,
    },
    cvv: {
      value: null,
    },
  },
};
