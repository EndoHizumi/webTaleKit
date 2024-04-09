const { getOptions } = require('loader-utils');
const { HTMLToJSON } = require('html-to-json-parser');

module.exports = function (source) {
    const options = getOptions(this);
    const jsonData = HTMLToJSON(source);

    // contentプロパティを処理する関数
    function processContent(item) {
        const processedItem = { ...item };

        // attributesプロパティを処理
        if (processedItem.attributes) {
            Object.entries(processedItem.attributes).forEach(([key, value]) => {
                processedItem[key] = value;
            });
            delete processedItem.attributes;
        }

        // contentsプロパティをitemsに改名して処理
        if (processedItem.contents) {
            // contentプロパティを再帰的に処理
            processedItem.items = processContent(processedItem.contents);
            delete processedItem.contents;
        }

        return processedItem;
    }

    // JSONオブジェクトの処理ルール
    function processJson(json) {
        // 一番上のオブジェクトがScenarioであることを確認
        if (json.type.toLowerCase() !== 'scenario') {
            throw new Error('The root element must be <scenario>');
        }

        // contentプロパティを取得
        const content = json.content;
        // contentプロパティを処理
        return processContent(content);
    }

    try {
        const processedJson = processJson(jsonData);
        return `export default ${JSON.stringify(processedJson)}`;
    } catch (error) {
        this.emitError(error);
        return '';
    }
};