const {empty} = require('./helpers.js')

class StorageBuilder {
    /**
     * @type {string}
     */
    _endpoint;

    /**
     * @type {string}
     */
    _extension = 'json';

    /**
     * @type {string}
     */
    _locale = 'en';

    /**
     * @type {number}
     */
    _id;

    /**
     * @type {number}
     */
    _websiteId;

    /**
     * @type {number}
     */
    _marketplaceId;

    /**
     * @type {number}
     */
    _listingId;

    /**
     * Storage url.
     *
     * @type {string}
     */
    _storageUrl;

    constructor(storageUrl) {
        this._storageUrl = storageUrl || process.env.MONTHLY_CLOUD_STORAGE_URL;
    }

    /**
     * Set endpoint.
     *
     * Ex.: endpoint("menus"), endpoint("contents/").
     *
     * If endpoint starts with "/" it will skip auto-inserted website id.
     *
     * Ex. endpoint("/marketplaces")
     *
     * @param string endpoint
     *
     * @return self
     */
    endpoint(endpoint) {
        this.flush();
        this._endpoint = endpoint;

        return this;
    }

    /**
     * Get routes for locale. Locale is auto-detected by default.
     *
     * @param string|null locale
     *
     * @return object
     */
    getRoutes(locale)
    {
        this.endpoint('routes');

        if (!empty(locale)) {
            this.locale(locale);
        }

        return this.get();
    }

    /**
     * Find content by id.
     *
     * @param int contentId
     *
     * @return object
     */
    findContent(contentId)
    {
        return this.endpoint('contents').find(contentId);
    }

    /**
     * Get listing item.
     *
     * @param int id
     *
     * @return object
     */
    getListingItem(id)
    {
        var listingId = this.getListing();

        if (empty(listingId)) {
            throw new Error('Please set listing id.');
        }

        return this.endpoint('listings/'+listingId+'/items').find(id);
    }

    /**
     * Get location using cloud geocode.
     *
     * @param int geocode
     *
     * @return object
     */
    getLocation(geocode)
    {
        var listingId = this.getListing();

        if (empty(listingId)) {
            throw new Error('Please set listing id.');
        }

        return this.endpoint('listings/'+listingId+'/locations').find(geocode);
    }

    /**
     * Set listing id.
     *
     * @param int listingId
     *
     * @return self
     */
    listing(listingId)
    {
        this._listingId = listingId;

        return this;
    }

    /**
     * Get current listing id.
     *
     * @return int
     */
    getListing()
    {
        return this._listingId;
    }

    /**
     * Find profile by id.
     *
     * @param int|string profileId
     *
     * @return object
     */
    findProfile(profileId)
    {
        var marketplaceId = this.getMarketplace();

        if (empty(marketplaceId)) {
            throw new Error('Missing marketplace id.');
        }

        return this.endpoint("/marketplaces/"+marketplaceId+"/profiles").find(profileId);
    }

    /**
     * Check if endpoint should access root path.
     *
     * @return bool
     */
    hasRootPathEndpoint()
    {
        return this.getEndpoint().indexOf('/') == 0;
    }

    /**
     * Build url.
     *
     * @return string
     */
    buildUrl()
    {
        var url = '';
        var websiteId;
        var endpoint;
        var id;

        if (!this.hasRootPathEndpoint()) {
            if (websiteId = this.getWebsite()) {
                url += '/websites/'+websiteId;
            }
        }

        if (endpoint = this.getEndpoint()) {
            url += (this.hasRootPathEndpoint() ? '' : '/') + endpoint;
        }

        if (id = this.getId()) {
            url += '/'+id;
        } else {
            url += '/'+this.getLocale();
        }

        url += '.'+this.getExtension();

        url = url.replace('//', '/');

        return this.getStorageUrl()+url;
    }

    /**
     * Get headers used in curl calls.
     *
     * @return object
     */
    getHeaders()
    {
        return {
            'Accept': 'application/json',
        };
    }

    /**
     * Make a GET request and respond with json or array.
     *
     * @param string url
     *
     * @return Promise
     */
    httpGetRequest(url)
    {
        return fetch(url, {'headers': this.getHeaders()}).then(response => response.json());
    }

    /**
     * Find entitiy.
     *
     * @param int id
     *
     * @return object
     */
    find(id)
    {
        this.id(id);

        return this.httpGetRequest(this.buildUrl());
    }

    /**
     * Call get request.
     *
     * @return Promise
     */
    get()
    {
        return this.httpGetRequest(this.buildUrl());
    }

    /**
     * Throw 404 exception.
     *
     * @return void
     */
    resourceNotFound()
    {
        throw new Error('Resource not found');
    }

    /**
     * @return string
     */
    getEndpoint()
    {
        return this._endpoint;
    }

    /**
     * @return int
     */
    getId()
    {
        return this._id;
    }

    /**
     * Set locale.
     *
     * @param string locale
     *
     * @return self
     */
    locale(locale)
    {
        this._locale = locale;

        return this;
    }

    /**
     * Get current locale.
     *
     * @return string
     */
    getLocale()
    {
        return this._locale;
    }

    /**
     * Set website id.
     *
     * @param int websiteId
     *
     * @return self
     */
    website(websiteId)
    {
        this._websiteId = websiteId;

        return this;
    }

    /**
     * Get current website id.
     *
     * @return string
     */
    getWebsite()
    {
        return this._websiteId;
    }

    /**
     * Set marketplace id.
     *
     * @param int marketplaceId
     *
     * @return self
     */
    marketplace(marketplaceId)
    {
        this._marketplaceId = marketplaceId;

        return this;
    }

    /**
     * Get current marketplace id.
     *
     * @return string|int
     */
    getMarketplace()
    {
        return this._marketplaceId;
    }

    /**
     * Get extension.
     *
     * @return string
     */
    getExtension()
    {
        return this._extension;
    }

    /**
     * @param int id
     *
     * @return self
     */
    id(id)
    {
        this._id = id;

        return this;
    }

    /**
     * Return storage url without '/' at the end.
     *
     * @return string
     */
    getStorageUrl()
    {
        if (empty(this._storageUrl)) {
            return '';
        }

        return this._storageUrl.replace(new RegExp("[/]+$"), "");
    }

    /**
     * Set storage url.
     *
     * @param string storageUrl
     *
     * @return self
     */
    setStorageUrl(storageUrl)
    {
        this._storageUrl = storageUrl;

        return this;
    }

    /**
     * Unset all call parameters.
     *
     * @return void
     */
    flush()
    {
        this._id = null;
        this._endpoint = null;
    }
}


const storage = (url) => {
  return new StorageBuilder(url);
}

module.exports = {
    storage
}
