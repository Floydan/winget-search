const axios = require('axios').default,
    AlgoliaClient = require('./helpers/algolia-client.js');

require('dotenv').config();

const client = new AlgoliaClient();

//quick proof of concept of the  algolia indexing using the eminent https://winstall.app api
//this will be replaced in later versions
axios.get('https://api.winstall.app/apps').then((res) => {
    const packages = res.data.map((p) => ({
        objectID: p._id,
        _tags: p.tags,
        path: p.path,
        icon: p.icon,
        name: p.name,
        desc: p.desc,
        moniker: p.moniker,
        publisher: p.publisher,
        license: p.license,
        licenseUrl: p.licenseUrl,
        homepage: p.homepage,
        minOS: p.minOS,
        latestVersion: p.latestVersion,
        versions: p.versions,
        updatedAt: p.updatedAt
    }));

    client.addObjects(process.env.ALGOLIA_INDEX_NAME, packages, 1000);
});
