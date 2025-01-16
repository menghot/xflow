import {html} from 'htm/preact';

import {TextFieldEntry, isTextFieldEntryEdited, TextAreaEntry} from '@bpmn-io/properties-panel';
import {useService} from 'bpmn-js-properties-panel';

export default function (element) {
    return [
        {
            id: 'connection',
            element,
            component: Connection,
            isEdited: isTextFieldEntryEdited
        }, {
            id: 'sql',
            element,
            component: SQL,
            isEdited: isTextFieldEntryEdited
        }
    ];
}

function Connection(props) {

    const {element, id} = props;

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

    return html`
        <${TextFieldEntry}
                id=${id}
                element=${element}
                label=${translate('Connection Id')}
                getValue=${getValue}
                setValue=${setValue}
                debounce=${debounce}
                tooltip=${translate('Set database connection id, Support Trino/Spark/Postgresql/Oracle')}
        />`;
}


function SQL(props) {

    console.log("SQL ---> ", props)

    const {element, id} = props;

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
    //tooltip=${translate('The SQL')}
    return html`
        <${TextAreaEntry}
                id=${id}
                element=${element}
                description=${translate('')}
                label=${translate('Query')}
                getValue=${getValue}
                setValue=${setValue}
                debounce=${debounce}
        />`;
}