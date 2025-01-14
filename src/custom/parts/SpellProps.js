import { html } from 'htm/preact';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function(element) {

  return [
    {
      id: 'connection',
      element,
      component: Connection,
      isEdited: isTextFieldEntryEdited
    },{
      id: 'sql',
      element,
      component: SQL,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Connection(props) {
    console.log("Connection ---> ",props)


  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.connection || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      connection: value
    });
  };

  return html`<${TextFieldEntry}
    id=${ id }
    element=${ element }
    description=${ translate('Set database connection') }
    label=${ translate('Connection') }
    getValue=${ getValue }
    setValue=${ setValue }
    debounce=${ debounce }
    tooltip=${ translate('Set database connection.') }
  />`;
}


function SQL(props) {

  console.log("SQL ---> ",props)

  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.sql || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      sql: value
    });
  };

  return html`<${TextFieldEntry}
    id=${ id }
    element=${ element }
    description=${ translate('Set SQL') }
    label=${ translate('SQL') }
    getValue=${ getValue }
    setValue=${ setValue }
    debounce=${ debounce }
    tooltip=${ translate('Set SQL') }
  />`;
}