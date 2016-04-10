"use strict"

const ENDPOINTS_BY_LOCALE = {
    BR: 'webservices.amazon.com.br',
    CA: 'webservices.amazon.ca',
    CN: 'webservices.amazon.cn',
    FR: 'webservices.amazon.fr',
    DE: 'webservices.amazon.de',
    IN: 'webservices.amazon.in',
    IT: 'webservices.amazon.it',
    JP: 'webservices.amazon.co.jp',
    MX: 'webservices.amazon.com.mx',
    ES: 'webservices.amazon.es',
    UK: 'webservices.amazon.co.uk',
    US: 'webservices.amazon.com'
}

const DEFAULT_ENDPOINT = ENDPOINTS_BY_LOCALE['US']

exports.getEndpointForLocale = (locale) => {
    return ENDPOINTS_BY_LOCALE[locale] || DEFAULT_ENDPOINT
}

exports.DEFAULT_ENDPOINT = DEFAULT_ENDPOINT