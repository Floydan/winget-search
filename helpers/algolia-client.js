require('dotenv').config();

const _ = require('lodash');
const algoliasearch = require('algoliasearch');
const Bluebird = require('bluebird');

class AlgoliaClient {
    constructor() {
        if (!(this instanceof AlgoliaClient)) {
            return new AlgoliaClient();
        }

        this.algoliaSearch = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY);
    }
    /**
       * Insert/update records to Algolia
       * @param {string} indexName - The indices name where you want to insert/update data
       * @param {Array. objects - The data you want to upsert.
       * If you want to update existing record, you need to provide the same ObjectID,
       * which will be used by Algolia for reference.
       * @param {number} [batchSize] - Number of records to be sent per request.
       * @return {Promise}
       */
    addObjects(indexName, objects, batchSize) {
        const index = this.algoliaSearch.initIndex(indexName);

        const DEFAULT_BATCH_SIZE = 1000;
        batchSize = batchSize || DEFAULT_BATCH_SIZE;

        const chunkedObjects = _.chunk(objects, batchSize);

        return Bluebird.each(chunkedObjects, objectChunk => index.saveObjects(objectChunk));
    }
    /**
      *
      * @param {string} indexName - The name of indices you want to configure.
      * @param {Object} settings
      * @param {number} settings.minWordSizefor1Typo - The minimum number of characters to accept one typo (default = 3).
      * @param {number} settings.minWordSizefor2Typos - The minimum number of characters to accept two typos (default = 7).
      * @param {number} settings.hitsPerPage - The number of hits per page (default = 10)
      * @param {Array.<string>} settings.attributesToRetrieve - list of attributes to retrieve in results.
      * @param {Array.<string>} settings.attributesToHighlight - List of attributes to highlight in results.
      * @param {Array.<string>} settings.attributesToSnippet - List of attributes you want to display the snippet in results.
      * Format is attributeName:numberOfWords
      * For example ['address:8']
      * @param {Array.<string>} settings.attributesToIndex - List of attributes you want to index
      * @param {Array.<string>} settings.attributesForFaceting - List of attributes for faceting
      * @param {string} settings.attributeForDistinct - Name of attribute used for distinct
      * @param {Array.<string>} settings.ranking - Set the results order
      * Default order is ["typo", "geo", "proximity", "attribute", "exact", "custom"]
      * @param Array.<string>} settings.customRanking - Specify ranking order
      * For example `"customRanking" => ["desc(followers)", "asc(firstname)"]`
      * @param {string} settings.queryType - How the query words are interpreted. Options:
      * - prefixLast (default): only the last word is interpreted as a prefix.
      * - prefixAll: all query words are interpreted as prefixes,
      * - prefixNone: no query word is interpreted as a prefix (not recommended).
      * @param {string} settings.highlightPreTag - String inserted before highlighted parts
      * @param {string{ settings.highlightPostTag - String inserted after highlighted parts
      * @param {Array.} settings.optionalWords - List of words considered optional when found in the query.
      */
    configure(indexName, settings) {
        const index = this.algoliaSearch.initIndex(indexName);

        return index.setSettings(settings);
    }
    /**
      * Perform the search
      * @param {string} indexName - The indices name where you want to search
      * @param {string|Object} queries - The search settings
      * @param {number} queries.page - The page number to retrieve.
      * @param {number} queries.hitsPerPage - Number of results per page.
      * @param {Array.|string} queries.attributesToRetrieve - List of attributes to retrieve, either comma separated string (without space) or array of strings.
      * @param {Array.|string} queries.attributesToHighlight - List of attributes to highlight in resultse, either comma separated string (without space) or array of strings.
      * @param {Array.|string} queries.attributesToSnippet - List of attributes you want to display the snippet in resultse, either comma separated string (without space) or array of strings.
      * @param {number} queries.minWordSizefor1Typo - The minimum number of characters to accept one typo (default = 3).
      * @param {number} queries.minWordSizefor2Typos - The minimum number of characters to accept two typos (default = 7).
      * @param {number} queries.getRankingInfo - If set to 1, the result hits will contain ranking
       * information in _rankingInfo attribute.
      * @param {string} queries.aroundLatLng - Search for entries around a given latitude and longitude defined by 2 floats separated by comma
      * For example, `47.316669,5.016670`
      * At indexing, you should specify geoloc of an object with the _geoloc attribute
      *   (in the form {"_geoloc":{"lat":48.123456, "lng":2.123456}})
      * @param queries.insideBoundingBox - Search entries inside a given area defined by 4 floats separated by comma
      * For example `47.3165,4.9665,47.3424,5.0201`
      * At indexing, you should specify geoloc of an object with the _geoloc attribute
      *   (in the form {"_geoloc":{"lat":48.123456, "lng":2.123456}})
      * @param {string} queries.numericFilters - List of numeric filters you want to apply.
      * @param {Array.|string} queries.tagFilters - Filter the query by a set of tags.
      * For example, `tags=tag1,(tag2,tag3)`
      * You can also use an array `["tag1",["tag2","tag3"]]`
      * Both mean tag1 AND (tag2 OR tag3)
      * @param {Array.|string} queries.facetFilters - Filter the query by a list of facets.
      * For example: `company:xxx,firstname:John`.
      * You can also use an array `['company:xxx','firstname:John"]`.
      * @param {Array.|string} queries.facets - List of object attributes that you want to use for faceting.
      * @param {string} queries.queryType - How the query words are interpreted. Options:
      * - prefixLast (default): only the last word is interpreted as a prefix.
      * - prefixAll: all query words are interpreted as prefixes,
      * - prefixNone: no query word is interpreted as a prefix (not recommended).
      * @param {string} queries.optionalWords - List of words considered optional when found in the query.
      * @param {number} queries.distinct - If set to 1, enable the distinct feature (disabled by default)
      * @param {Array.|string} queries.restrictSearchableAttributes - List of attributes for searching either array or comma separated.
      * Must be subset of attributesToIndex.
      */
    search(indexName, queries) {
        const index = this.algoliaSearch.initIndex(indexName);

        return index.search(queries);
    }
}

module.exports = AlgoliaClient;