
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import english from "../../public/locales/en.json";
import turkish from "../../public/locales/tr.json";
import spanish from "../../public/locales/en.json";
import chinesse from "../../public/locales/en.json";
import japanesse from "../../public/locales/en.json";


const resources = {
    en: {
        home: english,
    },
    tr: {
        home: turkish,
    },
    es:{
        home: spanish,
    },
    cn:{
        home: chinesse,
    },
    ja:{
        home: japanesse,
    }
}

i18next
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        debug: false,
        fallbackLng: 'en',
        saveMissing: true
    });

export default i18next;