/**
 * DaData.ru Suggestions jQuery plugin, version 19.8.0
 *
 * DaData.ru Suggestions jQuery plugin is freely distributable under the terms of MIT-style license
 * Built on DevBridge Autocomplete for jQuery (https://github.com/devbridge/jQuery-Autocomplete)
 * For details, see https://github.com/hflabs/suggestions-jquery
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(factory(global.jQuery));
}(this, (function ($) { 'use strict';

$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

/**
 * Утилиты для работы с типами.
 */
var lang_util = {
    /**
     * Проверяет, является ли аргумент массивом.
     */
    isArray: function(array) {
        return Array.isArray(array);
    },

    /**
     * Проверяет, является ли аргумент функцией.
     */
    isFunction: function(it) {
        return Object.prototype.toString.call(it) === "[object Function]";
    },

    /**
     * Проверяет, является ли аргумент пустым объектом ({}).
     */
    isEmptyObject: function(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    },

    /**
     * Проверяет, является ли аргумент «обычным» объектом
     * (не undefiend, не null, не DOM-элемент)
     */
    isPlainObject: function(obj) {
        if (
            obj === undefined ||
            typeof obj !== "object" ||
            obj === null ||
            obj.nodeType ||
            obj === obj.window
        ) {
            return false;
        }
        if (
            obj.constructor &&
            !Object.prototype.hasOwnProperty.call(
                obj.constructor.prototype,
                "isPrototypeOf"
            )
        ) {
            return false;
        }
        return true;
    }
};

/**
 * Утилиты для работы с коллекциями.
 */
var collection_util = {
    /**
     * Возвращает массив без пустых элементов
     */
    compact: function(array) {
        return array.filter(function(el) {
            return !!el;
        });
    },

    /**
     * Итерирует по элементам массива или полям объекта.
     * Ведёт себя как $.each() - прерывает выполнение, если функция-обработчик возвращает false.
     * @param {Object|Array} obj - массив или объект
     * @param {eachCallback} callback - функция-обработчик
     */
    each: function(obj, callback) {
        if (Array.isArray(obj)) {
            obj.some(function(el, idx) {
                return callback(el, idx) === false;
            });
            return;
        }
        Object.keys(obj).some(function(key) {
            var value = obj[key];
            return callback(value, key) === false;
        });
    },

    /**
     * Пересечение массивов: ([1,2,3,4], [2,4,5,6]) => [2,4]
     * Исходные массивы не меняются.
     */
    intersect: function(array1, array2) {
        var result = [];
        if (!Array.isArray(array1) || !Array.isArray(array2)) {
            return result;
        }
        return array1.filter(function(el) {
            return array2.indexOf(el) !== -1;
        });
    },

    /**
     * Разность массивов: ([1,2,3,4], [2,4,5,6]) => [1,3]
     * Исходные массивы не меняются.
     */
    minus: function(array1, array2) {
        if (!array2 || array2.length === 0) {
            return array1;
        }
        return array1.filter(function(el) {
            return array2.indexOf(el) === -1;
        });
    },

    /**
     * Обрачивает переданный объект в массив.
     * Если передан массив, возвращает его копию.
     */
    makeArray: function(arrayLike) {
        if (lang_util.isArray(arrayLike)) {
            return Array.prototype.slice.call(arrayLike);
        } else {
            return [arrayLike];
        }
    },

    /**
     * Разность массивов с частичным совпадением элементов.
     * Если элемент второго массива включает в себя элемент первого,
     * элементы считаются равными.
     */
    minusWithPartialMatching: function(array1, array2) {
        if (!array2 || array2.length === 0) {
            return array1;
        }
        return array1.filter(function(el) {
            return !array2.some(function(el2) {
                return el2.indexOf(el) === 0;
            });
        });
    },

    /**
     * Копирует массив, начиная с указанного элемента.
     * @param obj - массив
     * @param start - индекс, начиная с которого надо скопировать
     */
    slice: function(obj, start) {
        return Array.prototype.slice.call(obj, start);
    }
};

/**
 * Утилиты для работы с функциями.
 */
var func_util = {
    /**
     * Выполняет функцию с указанной задержкой.
     * @param {Function} handler - функция
     * @param {number} delay - задержка в миллисекундах
     */
    delay: function(handler, delay) {
        return setTimeout(handler, delay || 0);
    }
};

/**
 * Утилиты для работы с объектами.
 */
var object_util = {
    /**
     * Сравнивает два объекта по полям, которые присутствуют в обоих
     * @returns {boolean} true, если поля совпадают, false в противном случае
     */
    areSame: function self(a, b) {
        var same = true;

        if (typeof a != typeof b) {
            return false;
        }

        if (typeof a == "object" && a != null && b != null) {
            collection_util.each(a, function(value, i) {
                return (same = self(value, b[i]));
            });
            return same;
        }

        return a === b;
    },

    /**
     * Копирует свойства и их значения из исходных объектов в целевой
     */
    assign: function(target, varArgs) {
        if (typeof Object.assign === "function") {
            return Object.assign.apply(null, arguments);
        }
        if (target == null) {
            // TypeError if undefined or null
            throw new TypeError("Cannot convert undefined or null to object");
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) {
                // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (
                        Object.prototype.hasOwnProperty.call(
                            nextSource,
                            nextKey
                        )
                    ) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    },

    /**
     * Клонирует объект глубоким копированием
     */
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Возвращает копию объекта без пустых полей
     * (без undefined, null и '')
     * @param obj
     */
    compact: function(obj) {
        var copy = object_util.clone(obj);

        collection_util.each(copy, function(val, key) {
            if (val === null || val === undefined || val === "") {
                delete copy[key];
            }
        });

        return copy;
    },

    /**
     * Проверяет, что указанные поля в объекте заполнены.
     * @param {Object} obj - проверяемый объект
     * @param {Array} fields - список названий полей, которые надо проверить
     * @returns {boolean}
     */
    fieldsAreNotEmpty: function(obj, fields) {
        if (!lang_util.isPlainObject(obj)) {
            return false;
        }
        var result = true;
        collection_util.each(fields, function(field, i) {
            result = !!obj[field];
            return result;
        });
        return result;
    },

    /**
     * Возвращает вложенное значение по указанному пути
     * например, 'data.address.value'
     */
    getDeepValue: function self(obj, name) {
        var path = name.split("."),
            step = path.shift();

        return (
            obj && (path.length ? self(obj[step], path.join(".")) : obj[step])
        );
    },

    /**
     * Возвращает карту объектов по их идентификаторам.
     * Принимает на вход массив объектов и идентифицирующее поле.
     * Возвращает карты, ключом в которой является значение идентифицирующего поля,
     *   а значением — исходный объект.
     * Заодно добавляет объектам поле с порядковым номером.
     * @param {Array} objectsArray - массив объектов
     * @param {string} idField - название идентифицирующего поля
     * @param {string} indexField - название поля с порядковым номером
     * @return {Object} карта объектов по их идентификаторам
     */
    indexObjectsById: function(objectsArray, idField, indexField) {
        var result = {};

        collection_util.each(objectsArray, function(obj, idx) {
            var key = obj[idField];
            var val = {};

            if (indexField) {
                val[indexField] = idx;
            }

            result[key] = object_util.assign(val, obj);
        });

        return result;
    }
};

var KEYS = {
    ENTER: 13,
    ESC: 27,
    TAB: 9,
    SPACE: 32,
    UP: 38,
    DOWN: 40
};

var CLASSES = {
    hint: "suggestions-hint",
    mobile: "suggestions-mobile",
    nowrap: "suggestions-nowrap",
    promo: "suggestions-promo",
    promo_desktop: "suggestions-promo-desktop",
    selected: "suggestions-selected",
    suggestion: "suggestions-suggestion",
    subtext: "suggestions-subtext",
    subtext_inline: "suggestions-subtext suggestions-subtext_inline",
    subtext_delimiter: "suggestions-subtext-delimiter",
    subtext_label: "suggestions-subtext suggestions-subtext_label",
    removeConstraint: "suggestions-remove",
    value: "suggestions-value"
};

var EVENT_NS = ".suggestions";
var DATA_ATTR_KEY = "suggestions";
var WORD_DELIMITERS = "\\s\"'~\\*\\.,:\\|\\[\\]\\(\\)\\{\\}<>№";
var WORD_PARTS_DELIMITERS = "\\-\\+\\\\\\?!@#$%^&";

/**
 * Утилиты для работы с текстом.
 */

var WORD_SPLITTER = new RegExp("[" + WORD_DELIMITERS + "]+", "g");
var WORD_PARTS_SPLITTER = new RegExp("[" + WORD_PARTS_DELIMITERS + "]+", "g");

var text_util = {
    /**
     * Заменяет амперсанд, угловые скобки и другие подобные символы
     * на HTML-коды
     */
    escapeHtml: function(str) {
        var map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2F;"
        };

        if (str) {
            collection_util.each(map, function(html, ch) {
                str = str.replace(new RegExp(ch, "g"), html);
            });
        }
        return str;
    },

    /**
     * Эскейпирует символы RegExp-шаблона обратным слешем
     * (для передачи в конструктор регулярных выражений)
     */
    escapeRegExChars: function(value) {
        return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    /**
     * Приводит слово к нижнему регистру и заменяет ё → е
     */
    formatToken: function(token) {
        return token && token.toLowerCase().replace(/[ёЁ]/g, "е");
    },

    /**
     * Возвращает регулярное выражение для разбивки строки на слова
     */
    getWordExtractorRegExp: function() {
        return new RegExp(
            "([^" + WORD_DELIMITERS + "]*)([" + WORD_DELIMITERS + "]*)",
            "g"
        );
    },

    /**
     * Вырезает из строки стоп-слова
     */
    normalize: function(str, stopwords) {
        return text_util.split(str, stopwords).join(" ");
    },

    /**
     * Добивает строку указанным символов справа до указанной длины
     * @param sourceString  исходная строка
     * @param targetLength  до какой длины добивать
     * @param padString  каким символом добивать
     * @returns строка указанной длины
     */
    padEnd: function(sourceString, targetLength, padString) {
        if (String.prototype.padEnd) {
            return sourceString.padEnd(targetLength, padString);
        }
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(typeof padString !== "undefined" ? padString : " ");
        if (sourceString.length > targetLength) {
            return String(sourceString);
        } else {
            targetLength = targetLength - sourceString.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return String(sourceString) + padString.slice(0, targetLength);
        }
    },

    /**
     * Нормализует строку, разбивает на слова,
     * отсеивает стоп-слова из списка.
     * Расклеивает буквы и цифры, написанные слитно.
     */
    split: function(str, stopwords) {
        var cleanStr = str
            .toLowerCase()
            .replace("ё", "е")
            .replace(/(\d+)([а-я]{2,})/g, "$1 $2")
            .replace(/([а-я]+)(\d+)/g, "$1 $2");

        var words = collection_util.compact(cleanStr.split(WORD_SPLITTER));
        if (!words.length) {
            return [];
        }
        var lastWord = words.pop();
        var goodWords = collection_util.minus(words, stopwords);
        goodWords.push(lastWord);
        return goodWords;
    },

    /**
     * Заменяет слова на составные части.
     * В отличие от withSubTokens, не сохраняет исходные слова.
     */
    splitTokens: function(tokens) {
        var result = [];
        collection_util.each(tokens, function(token, i) {
            var subtokens = token.split(WORD_PARTS_SPLITTER);
            result = result.concat(collection_util.compact(subtokens));
        });
        return result;
    },

    /**
     * Проверяет, включает ли строка 1 строку 2.
     * Если строки равны, возвращает false.
     */
    stringEncloses: function(str1, str2) {
        return (
            str1.length > str2.length &&
            str1.toLowerCase().indexOf(str2.toLowerCase()) !== -1
        );
    },

    /**
     * Возвращает список слов из строки.
     * При этом первыми по порядку идут «предпочтительные» слова
     * (те, что не входят в список «нежелательных»).
     * Составные слова тоже разбивает на части.
     * @param {string} value - строка
     * @param {Array} unformattableTokens - «нежелательные» слова
     * @return {Array} Массив атомарных слов
     */
    tokenize: function(value, unformattableTokens) {
        var tokens = collection_util.compact(
            text_util.formatToken(value).split(WORD_SPLITTER)
        );
        // Move unformattableTokens to the end.
        // This will help to apply them only if no other tokens match
        var preferredTokens = collection_util.minus(
            tokens,
            unformattableTokens
        );
        var otherTokens = collection_util.minus(tokens, preferredTokens);
        tokens = text_util.withSubTokens(preferredTokens.concat(otherTokens));
        return tokens;
    },

    /**
     * Разбивает составные слова на части
     * и дописывает их к исходному массиву.
     * @param {Array} tokens - слова
     * @return {Array} Массив атомарных слов
     */
    withSubTokens: function(tokens) {
        var result = [];
        collection_util.each(tokens, function(token, i) {
            var subtokens = token.split(WORD_PARTS_SPLITTER);
            result.push(token);
            if (subtokens.length > 1) {
                result = result.concat(collection_util.compact(subtokens));
            }
        });
        return result;
    }
};

/**
 * jQuery API.
 */
var jqapi = {
    Deferred: function() {
        return $.Deferred();
    },

    ajax: function(settings) {
        return $.ajax(settings);
    },

    extend: function() {
        return $.extend.apply(null, arguments);
    },

    isJqObject: function(obj) {
        return obj instanceof $;
    },

    param: function(obj) {
        return $.param(obj);
    },

    proxy: function(func, context) {
        return $.proxy(func, context);
    },

    select: function(selector) {
        return $(selector);
    },

    supportsCors: function() {
        return $.support.cors;
    }
};

/**
 * Утилиты для работы через AJAX
 */
var ajax = {
    /**
     * HTTP-метод, который поддерживает браузер
     */
    getDefaultType: function() {
        return jqapi.supportsCors() ? "POST" : "GET";
    },

    /**
     * Content-type, который поддерживает браузер
     */
    getDefaultContentType: function() {
        return jqapi.supportsCors()
            ? "application/json"
            : "application/x-www-form-urlencoded";
    },

    /**
     * Меняет HTTPS на протокол страницы, если браузер не поддерживает CORS
     */
    fixURLProtocol: function(url) {
        return jqapi.supportsCors()
            ? url
            : url.replace(/^https?:/, location.protocol);
    },

    /**
     * Записывает параметры в GET-строку
     */
    addUrlParams: function(url, params) {
        return url + (/\?/.test(url) ? "&" : "?") + jqapi.param(params);
    },

    /**
     * Сериализует объект для передачи по сети.
     * Либо в JSON-строку (если браузер поддерживает CORS),
     *   либо в GET-строку.
     */
    serialize: function(data) {
        if (jqapi.supportsCors()) {
            return JSON.stringify(data, function(key, value) {
                return value === null ? undefined : value;
            });
        } else {
            data = object_util.compact(data);
            return jqapi.param(data, true);
        }
    }
};

/**
 * Возвращает автоинкрементный идентификатор.
 * @param {string} prefix - префикс для идентификатора
 */
var generateId = (function() {
    var counter = 0;
    return function(prefix) {
        return (prefix || "") + ++counter;
    };
})();

/**
 * Утилиты на все случаи жизни.
 */
var utils = {
    escapeRegExChars: text_util.escapeRegExChars,
    escapeHtml: text_util.escapeHtml,
    formatToken: text_util.formatToken,
    normalize: text_util.normalize,
    reWordExtractor: text_util.getWordExtractorRegExp,
    stringEncloses: text_util.stringEncloses,

    addUrlParams: ajax.addUrlParams,
    getDefaultContentType: ajax.getDefaultContentType,
    getDefaultType: ajax.getDefaultType,
    fixURLProtocol: ajax.fixURLProtocol,
    serialize: ajax.serialize,

    arrayMinus: collection_util.minus,
    arrayMinusWithPartialMatching: collection_util.minusWithPartialMatching,
    arraysIntersection: collection_util.intersect,
    compact: collection_util.compact,
    each: collection_util.each,
    makeArray: collection_util.makeArray,
    slice: collection_util.slice,

    delay: func_util.delay,

    areSame: object_util.areSame,
    compactObject: object_util.compact,
    getDeepValue: object_util.getDeepValue,
    fieldsNotEmpty: object_util.fieldsAreNotEmpty,
    indexBy: object_util.indexObjectsById,

    isArray: lang_util.isArray,
    isEmptyObject: lang_util.isEmptyObject,
    isFunction: lang_util.isFunction,
    isPlainObject: lang_util.isPlainObject,

    uniqueId: generateId
};

var DEFAULT_OPTIONS = {
    autoSelectFirst: false,
    // основной url, может быть переопределен
    serviceUrl: "https://suggestions.dadata.ru/suggestions/api/4_1/rs",
    // url, который заменяет serviceUrl + method + type
    // то есть, если он задан, то для всех запросов будет использоваться именно он
    // если не поддерживается cors то к url будут добавлены параметры ?token=...&version=...
    // и заменен протокол на протокол текущей страницы
    url: null,
    onSearchStart: $.noop,
    onSearchComplete: $.noop,
    onSearchError: $.noop,
    onSuggestionsFetch: null,
    onSelect: null,
    onSelectNothing: null,
    onInvalidateSelection: null,
    minChars: 1,
    deferRequestBy: 100,
    enrichmentEnabled: true,
    params: {},
    paramName: "query",
    timeout: 3000,
    formatResult: null,
    formatSelected: null,
    noCache: false,
    containerClass: "suggestions-suggestions",
    tabDisabled: false,
    triggerSelectOnSpace: false,
    triggerSelectOnEnter: true,
    triggerSelectOnBlur: true,
    preventBadQueries: false,
    hint: "Выберите вариант или продолжите ввод",
    noSuggestionsHint: null,
    type: null,
    requestMode: "suggest",
    count: 5,
    $helpers: null,
    headers: null,
    scrollOnFocus: true,
    mobileWidth: 980,
    initializeInterval: 100
};

/**
 * Factory to create same parent checker function
 * @param preprocessFn called on each value before comparison
 * @returns {Function} same parent checker function
 */
function sameParentChecker(preprocessFn) {
    return function(suggestions) {
        if (suggestions.length === 0) {
            return false;
        }
        if (suggestions.length === 1) {
            return true;
        }

        var parentValue = preprocessFn(suggestions[0].value),
            aliens = suggestions.filter(function(suggestion) {
                return (
                    preprocessFn(suggestion.value).indexOf(parentValue) !== 0
                );
            });

        return aliens.length === 0;
    };
}

/**
 * Default same parent checker. Compares raw values.
 * @type {Function}
 */
var haveSameParent = sameParentChecker(function(val) {
    return val;
});

/**
 * Сравнивает запрос c подсказками, по словам.
 * Срабатывает, только если у всех подсказок общий родитель
 * (функция сверки передаётся параметром).
 * Игнорирует стоп-слова.
 * Возвращает индекс единственной подходящей подсказки
 * или -1, если подходящих нет или несколько.
 */
function _matchByWords(stopwords, parentCheckerFn) {
    return function(query, suggestions) {
        var queryTokens;
        var matches = [];

        if (parentCheckerFn(suggestions)) {
            queryTokens = text_util.splitTokens(
                text_util.split(query, stopwords)
            );

            collection_util.each(suggestions, function(suggestion, i) {
                var suggestedValue = suggestion.value;

                if (text_util.stringEncloses(query, suggestedValue)) {
                    return false;
                }

                // check if query words are a subset of suggested words
                var suggestionWords = text_util.splitTokens(
                    text_util.split(suggestedValue, stopwords)
                );

                if (
                    collection_util.minus(queryTokens, suggestionWords)
                        .length === 0
                ) {
                    matches.push(i);
                }
            });
        }

        return matches.length === 1 ? matches[0] : -1;
    };
}

/**
 * Matchers return index of suitable suggestion
 * Context inside is optionally set in types.js
 */
var matchers = {
    /**
     * Matches query against suggestions, removing all the stopwords.
     */
    matchByNormalizedQuery: function(stopwords) {
        return function(query, suggestions) {
            var normalizedQuery = text_util.normalize(query, stopwords);
            var matches = [];

            collection_util.each(suggestions, function(suggestion, i) {
                var suggestedValue = suggestion.value.toLowerCase();
                // if query encloses suggestion, than it has already been selected
                // so we should not select it anymore
                if (text_util.stringEncloses(query, suggestedValue)) {
                    return false;
                }
                // if there is suggestion that contains query as its part
                // than we should ignore all other matches, even full ones
                if (suggestedValue.indexOf(normalizedQuery) > 0) {
                    return false;
                }
                if (
                    normalizedQuery ===
                    text_util.normalize(suggestedValue, stopwords)
                ) {
                    matches.push(i);
                }
            });

            return matches.length === 1 ? matches[0] : -1;
        };
    },

    matchByWords: function(stopwords) {
        return _matchByWords(stopwords, haveSameParent);
    },

    matchByWordsAddress: function(stopwords) {
        return _matchByWords(stopwords, haveSameParent);
    },

    /**
     * Matches query against values contained in suggestion fields
     * for cases, when there is only one suggestion
     * only considers fields specified in fields map
     * uses partial matching:
     *   "0445" vs { value: "ALFA-BANK", data: { "bic": "044525593" }} is a match
     */
    matchByFields: function(fields) {
        return function(query, suggestions) {
            var tokens = text_util.splitTokens(text_util.split(query));
            var suggestionWords = [];

            if (suggestions.length === 1) {
                if (fields) {
                    collection_util.each(fields, function(stopwords, field) {
                        var fieldValue = object_util.getDeepValue(
                            suggestions[0],
                            field
                        );
                        var fieldWords =
                            fieldValue &&
                            text_util.splitTokens(
                                text_util.split(fieldValue, stopwords)
                            );

                        if (fieldWords && fieldWords.length) {
                            suggestionWords = suggestionWords.concat(
                                fieldWords
                            );
                        }
                    });
                }

                if (
                    collection_util.minusWithPartialMatching(
                        tokens,
                        suggestionWords
                    ).length === 0
                ) {
                    return 0;
                }
            }

            return -1;
        };
    }
};

var ADDRESS_STOPWORDS = [
    "ао",
    "аобл",
    "дом",
    "респ",
    "а/я",
    "аал",
    "автодорога",
    "аллея",
    "арбан",
    "аул",
    "б-р",
    "берег",
    "бугор",
    "вал",
    "вл",
    "волость",
    "въезд",
    "высел",
    "г",
    "городок",
    "гск",
    "д",
    "двлд",
    "днп",
    "дор",
    "дп",
    "ж/д_будка",
    "ж/д_казарм",
    "ж/д_оп",
    "ж/д_платф",
    "ж/д_пост",
    "ж/д_рзд",
    "ж/д_ст",
    "жилзона",
    "жилрайон",
    "жт",
    "заезд",
    "заимка",
    "зона",
    "к",
    "казарма",
    "канал",
    "кв",
    "кв-л",
    "км",
    "кольцо",
    "комн",
    "кордон",
    "коса",
    "кп",
    "край",
    "линия",
    "лпх",
    "м",
    "массив",
    "местность",
    "мкр",
    "мост",
    "н/п",
    "наб",
    "нп",
    "обл",
    "округ",
    "остров",
    "оф",
    "п",
    "п/о",
    "п/р",
    "п/ст",
    "парк",
    "пгт",
    "пер",
    "переезд",
    "пл",
    "пл-ка",
    "платф",
    "погост",
    "полустанок",
    "починок",
    "пр-кт",
    "проезд",
    "промзона",
    "просек",
    "просека",
    "проселок",
    "проток",
    "протока",
    "проулок",
    "р-н",
    "рзд",
    "россия",
    "рп",
    "ряды",
    "с",
    "с/а",
    "с/мо",
    "с/о",
    "с/п",
    "с/с",
    "сад",
    "сквер",
    "сл",
    "снт",
    "спуск",
    "ст",
    "ст-ца",
    "стр",
    "тер",
    "тракт",
    "туп",
    "у",
    "ул",
    "уч-к",
    "ф/х",
    "ферма",
    "х",
    "ш",
    "бульвар",
    "владение",
    "выселки",
    "гаражно-строительный",
    "город",
    "деревня",
    "домовладение",
    "дорога",
    "квартал",
    "километр",
    "комната",
    "корпус",
    "литер",
    "леспромхоз",
    "местечко",
    "микрорайон",
    "набережная",
    "область",
    "переулок",
    "платформа",
    "площадка",
    "площадь",
    "поселение",
    "поселок",
    "проспект",
    "разъезд",
    "район",
    "республика",
    "село",
    "сельсовет",
    "слобода",
    "сооружение",
    "станица",
    "станция",
    "строение",
    "территория",
    "тупик",
    "улица",
    "улус",
    "участок",
    "хутор",
    "шоссе"
];

/**
 * Компоненты адреса
 * @type {*[]}
 * id {String} Наименование типа
 * fields {Array of Strings}
 * forBounds {Boolean} может использоваться в ограничениях
 * forLocations {Boolean}
 * kladrFormat {Object}
 * fiasType {String} Наименование соответствующего ФИАС типа
 */
var ADDRESS_COMPONENTS = [
    {
        id: "kladr_id",
        fields: ["kladr_id"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "postal_code",
        fields: ["postal_code"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "country_iso_code",
        fields: ["country_iso_code"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "country",
        fields: ["country"],
        forBounds: true,
        forLocations: true,
        kladrFormat: { digits: 0, zeros: 13 },
        fiasType: "country_iso_code"
    },
    {
        id: "region_fias_id",
        fields: ["region_fias_id"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "region_type_full",
        fields: ["region_type_full"],
        forBounds: false,
        forLocations: true,
        kladrFormat: { digits: 2, zeros: 11 },
        fiasType: "region_fias_id"
    },
    {
        id: "region",
        fields: [
            "region",
            "region_type",
            "region_type_full",
            "region_with_type"
        ],
        forBounds: true,
        forLocations: true,
        kladrFormat: { digits: 2, zeros: 11 },
        fiasType: "region_fias_id"
    },
    {
        id: "area_fias_id",
        fields: ["area_fias_id"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "area_type_full",
        fields: ["area_type_full"],
        forBounds: false,
        forLocations: true,
        kladrFormat: { digits: 5, zeros: 8 },
        fiasType: "area_fias_id"
    },
    {
        id: "area",
        fields: ["area", "area_type", "area_type_full", "area_with_type"],
        forBounds: true,
        forLocations: true,
        kladrFormat: { digits: 5, zeros: 8 },
        fiasType: "area_fias_id"
    },
    {
        id: "city_fias_id",
        fields: ["city_fias_id"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "city_type_full",
        fields: ["city_type_full"],
        forBounds: false,
        forLocations: true,
        kladrFormat: { digits: 8, zeros: 5 },
        fiasType: "city_fias_id"
    },
    {
        id: "city",
        fields: ["city", "city_type", "city_type_full", "city_with_type"],
        forBounds: true,
        forLocations: true,
        kladrFormat: { digits: 8, zeros: 5 },
        fiasType: "city_fias_id"
    },
    {
        id: "city_district_fias_id",
        fields: ["city_district_fias_id"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "city_district_type_full",
        fields: ["city_district_type_full"],
        forBounds: false,
        forLocations: true,
        kladrFormat: { digits: 11, zeros: 2 },
        fiasType: "city_district_fias_id"
    },
    {
        id: "city_district",
        fields: [
            "city_district",
            "city_district_type",
            "city_district_type_full",
            "city_district_with_type"
        ],
        forBounds: true,
        forLocations: true,
        kladrFormat: { digits: 11, zeros: 2 },
        fiasType: "city_district_fias_id"
    },
    {
        id: "settlement_fias_id",
        fields: ["settlement_fias_id"],
        forBounds: false,
        forLocations: true
    },
    {
        id: "settlement_type_full",
        fields: ["settlement_type_full"],
        forBounds: false,
        forLocations: true,
        kladrFormat: { digits: 11, zeros: 2 },
        fiasType: "settlement_fias_id"
    },
    {
        id: "settlement",
        fields: [
            "settlement",
            "settlement_type",
            "settlement_type_full",
            "settlement_with_type"
        ],
        forBounds: true,
      