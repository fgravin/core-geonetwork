/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

package org.fao.geonet.domain.statistic;

import org.fao.geonet.domain.Constants;
import org.fao.geonet.domain.ISODate;
import org.fao.geonet.entitylistener.SearchRequestEntityListenerManager;
import org.hibernate.annotations.Type;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.AttributeOverride;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

/**
 * An entity representing a search request that was made by a user. This is part of the statistics
 * tracing.
 * <p/>
 * <p> When creating a SearchRequest and its parameters all the parameters and the search request
 * must be saved individually because a limitation of JPA means that SearchRequest can't cascade
 * operations from SearchRequest to the params. </p>
 *
 * @author Jesse
 */
@Entity
@Access(AccessType.PROPERTY)
@Table(name = "Requests")
@EntityListeners(SearchRequestEntityListenerManager.class)
@SequenceGenerator(name = SearchRequest.ID_SEQ_NAME, initialValue = 100, allocationSize = 1)
public class SearchRequest {
    static final String ID_SEQ_NAME = "search_request_id_seq";
    private int _id;
    private ISODate _requestDate;
    private String _ipAddress;
    private String _luceneQuery;
    private int _hits;
    private String _lang;
    private String _sortBy;
    private String _spatialFilter;
    private String _metadataType;
    private boolean _simple;
    private boolean _autogenerated;
    private String _service;
    private List<SearchRequestParam> _params = new ArrayList<SearchRequestParam>();

    /**
     * Get the id of the {@link SearchRequest} entity object. <p> This is autogenerated and when a
     * new {@link SearchRequest} is created the {@link SearchRequest} will be assigned a new id.
     * </p>
     *
     * @return the id of the {@link SearchRequest} entity object.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = ID_SEQ_NAME)
    public int getId() {
        return _id;
    }

    /**
     * Set the id of the {@link SearchRequest} entity object. <p> This is autogenerated and when a
     * new group is created the group will be assigned a new value. </p>
     *
     * @param id the id of the Request entity object.
     */
    public void setId(int id) {
        this._id = id;
    }

    /**
     * Get the parameters object associated with this request entity.
     *
     * @return the parameters object associated with this request entity.
     */
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "request", orphanRemoval = true)
    public List<SearchRequestParam> getParams() {
        return _params;
    }

    /**
     * Set the parameters object associated with this request entity.
     *
     * @param params the parameters object associated with this request entity.
     * @return this SearchRequest object
     */
    public SearchRequest setParams(List<SearchRequestParam> params) {
        this._params = params;
        return this;
    }

    /**
     * Get the date and time that the request was executed.
     *
     * @return the date and time that the request was executed.
     */
    @AttributeOverride(name = "dateAndTime", column = @Column(name = "requestdate", length = 30))
    public ISODate getRequestDate() {
        return _requestDate;
    }

    /**
     * Set the date and time that the request was executed.
     *
     * @param requestDate the date and time that the request was executed.
     * @return this SearchRequest object
     */
    public SearchRequest setRequestDate(ISODate requestDate) {
        this._requestDate = requestDate;
        return this;
    }

    /**
     * Get the IP address of the requester.
     *
     * @return the IP address of the requester.
     */
    @Column(name = "ip", length = Constants.IP_ADDRESS_COLUMN_LENGTH)
    public String getIpAddress() {
        return _ipAddress;
    }

    /**
     * Set the IP address of the requester.
     *
     * @param ipAddress the IP address of the requester.
     * @return this SearchRequest object
     */
    public SearchRequest setIpAddress(String ipAddress) {
        this._ipAddress = ipAddress;
        return this;
    }

    /**
     * Get the Query data sent by the user. The query should be a lucene query in string form.
     *
     * @return the Query data sent by the user. The query should be a lucene query in string form.
     */
    @Lob
    @Column(name = "query")
    @Type(type = "org.hibernate.type.StringClobType")
    // this is a work around for postgres so postgres can correctly load clobs
    public String getLuceneQuery() {
        return _luceneQuery;
    }

    /**
     * Set the search query data sent by the user. The query should be a lucene query in string
     * form.
     *
     * @param luceneQuery the query data sent by the user. The query should be a lucene query in
     *                    string form.
     * @return this SearchRequest object
     */
    public SearchRequest setLuceneQuery(String luceneQuery) {
        this._luceneQuery = luceneQuery;
        return this;
    }

    /**
     * Get the number of hits (metadata elements found by query).
     *
     * @return the number of hits (metadata elements found by query).
     */
    @Column(nullable = false)
    public int getHits() {
        return _hits;
    }

    /**
     * Set the number of hits (metadata elements found by query).
     *
     * @param hits the number of hits (metadata elements found by query).
     * @return this SearchRequest object
     */
    public SearchRequest setHits(int hits) {
        this._hits = hits;
        return this;
    }

    /**
     * Get the language the search was made in.
     *
     * @return the language the search was made in.
     */
    @Column(length = 16)
    public String getLang() {
        return _lang;
    }

    /**
     * The language the search was made in.
     *
     * @param lang the language the search was made in.
     * @return this SearchRequest object
     */
    public SearchRequest setLang(String lang) {
        this._lang = lang;
        return this;
    }

    /**
     * Get the sortby parameter used in the request.
     *
     * @return the sortby parameter used in the request.
     */
    @Column(name = "sortby")
    public String getSortBy() {
        return _sortBy;
    }

    /**
     * Set the sortby parameter used in the request.
     *
     * @param sortBy the sortby parameter used in the request.
     * @return this SearchRequest object
     */
    public SearchRequest setSortBy(String sortBy) {
        this._sortBy = sortBy;
        return this;
    }

    /**
     * Get the spatial filter used to further refine the search. The value is in OGC filter spec
     * XML.
     *
     * @return the spatial filter used to further refine the search. The value is in OGC filter spec
     * XML.
     */
    @Column(name = "spatialfilter")
    @Lob
    @Type(type = "org.hibernate.type.StringClobType")
    // this is a work around for postgres so postgres can correctly load clobs
    public String getSpatialFilter() {
        return _spatialFilter;
    }

    /**
     * Set the spatial filter used to further refine the search. The value is in OGC filter spec
     * XML.
     *
     * @param spatialFilter the spatial filter used to further refine the search. The value is in
     *                      OGC filter spec XML.
     * @return this SearchRequest object
     */
    public SearchRequest setSpatialFilter(String spatialFilter) {
        this._spatialFilter = spatialFilter;
        return this;
    }

    /**
     * Get the type of metadata requested.
     *
     * @return the type of metadata requested.
     */
    @Lob
    @Column(name = "type")
    @Type(type = "org.hibernate.type.StringClobType")
    // this is a work around for postgres so postgres can correctly load clobs
    public String getMetadataType() {
        return _metadataType;
    }

    /**
     * Set the type of metadata requested.
     *
     * @param type the type of metadata requested.
     * @return this SearchRequest object
     */
    public SearchRequest setMetadataType(String type) {
        this._metadataType = type;
        return this;
    }

    /**
     * Get the service used to make the request.
     *
     * @return the service used to make the request.
     */
    public String getService() {
        return _service;
    }

    /**
     * Set the service used to make the request.
     *
     * @param service the service used to make the request.
     * @return this SearchRequest object
     */
    public SearchRequest setService(String service) {
        this._service = service;
        return this;
    }

    /**
     * Get true if query is a simple query:
     * <p/>
     * The query and spatial filter has only Lucene +any, or +type, => if queryInfo has a field
     * different from: (any, type, _isTemplate, _locale, _owner, _op*) then its an advanced query
     *
     * @return true if query is a simple query
     */
    public boolean isSimple() {
        return _simple;
    }

    /**
     * Set true if query is a simple query:
     * <p/>
     * <p/>
     * The query and spatial filter has only Lucene +any, or +type, => if queryInfo has a field
     * different from: (any, type, _isTemplate, _locale, _owner, _op*) then its an advanced query
     *
     * @param simple true if query is a simple query
     * @return this SearchRequest object
     */
    public SearchRequest setSimple(boolean simple) {
        this._simple = simple;
        return this;
    }

    /**
     * Get true if the query was not made by a client but rather by the system itself, for example
     * by a guiservice.
     *
     * @return true if the query was not made by a client but rather by the system itself, for
     * example by a guiservice.
     */
    public boolean isAutogenerated() {
        return _autogenerated;
    }

    /**
     * Set true if the query was not made by a client but rather by the system itself, for example
     * by a guiservice.
     *
     * @param autogenerated true if the query was not made by a client but rather by the system
     *                      itself, for example by a guiservice.
     * @return this SearchRequest object
     */
    public SearchRequest setAutogenerated(boolean autogenerated) {
        this._autogenerated = autogenerated;
        return this;
    }

    /**
     * Add a parameter to the list of parameters and set the parameter's request property.
     *
     * @param searchRequestParam the param to add.
     */
    public void addParam(SearchRequestParam searchRequestParam) {
        searchRequestParam.setRequest(this);
        getParams().add(searchRequestParam);
    }

    /**
     * Add all parameters (and set the request property in each parameter to be this request).
     *
     * @param searchRequestParams the params to add
     */
    public void addAll(List<SearchRequestParam> searchRequestParams) {
        for (SearchRequestParam searchRequestParam : searchRequestParams) {
            addParam(searchRequestParam);
        }
    }
}
